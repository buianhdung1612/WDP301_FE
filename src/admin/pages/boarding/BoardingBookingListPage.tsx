import { useMemo, useState } from "react";
import { Box, Button, Card, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { Search } from "../../components/ui/Search";
import { getBoardingBookings, updateBoardingBookingStatus, updateBoardingPaymentStatus } from "../../api/boarding-booking.api";

const boardingStatusOptions = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "held", label: "Đang giữ chỗ" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "checked-in", label: "Đã nhận chuồng" },
    { value: "checked-out", label: "Đã trả chuồng" },
    { value: "cancelled", label: "Đã hủy" },
];

const paymentStatusOptions = [
    { value: "unpaid", label: "Chưa thanh toán" },
    { value: "paid", label: "Đã thanh toán" },
    { value: "refunded", label: "Đã hoàn tiền" },
];

const getBoardingStatusLabel = (status?: string) =>
    boardingStatusOptions.find((item) => item.value === status)?.label || status || "-";

const getPaymentStatusLabel = (status?: string) =>
    paymentStatusOptions.find((item) => item.value === status)?.label || status || "-";

export const BoardingBookingListPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-boarding-bookings"],
        queryFn: () => getBoardingBookings(),
    });

    const updateStatusMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateBoardingBookingStatus(id, status),
        onSuccess: () => {
            toast.success("Đã cập nhật trạng thái lưu trú");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
        },
    });

    const updatePaymentMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateBoardingPaymentStatus(id, status),
        onSuccess: () => {
            toast.success("Đã cập nhật trạng thái thanh toán");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
        },
    });

    const rows = useMemo(() => {
        const list = Array.isArray(data?.data) ? data.data : [];
        if (!search) return list;
        const q = search.toLowerCase();
        return list.filter((item: any) =>
            String(item.code || "").toLowerCase().includes(q) ||
            String(item.fullName || "").toLowerCase().includes(q) ||
            String(item.phone || "").toLowerCase().includes(q) ||
            String(item.cageId?.cageCode || "").toLowerCase().includes(q)
        );
    }, [data, search]);

    const summary = useMemo(() => {
        const list = Array.isArray(data?.data) ? data.data : [];
        return {
            total: list.length,
            paid: list.filter((item: any) => item.paymentStatus === "paid").length,
            checkedIn: list.filter((item: any) => item.boardingStatus === "checked-in").length,
            revenue: list.reduce((sum: number, item: any) => sum + Number(item.total || 0), 0),
        };
    }, [data]);

    const columns: GridColDef[] = [
        { field: "code", headerName: "Mã đơn", minWidth: 170, flex: 1 },
        {
            field: "fullName",
            headerName: "Khách hàng",
            minWidth: 220,
            flex: 1,
            renderCell: (params) => (
                <Stack>
                    <Typography fontWeight={600}>{params.row.fullName || params.row.userId?.fullName || "-"}</Typography>
                    <Typography variant="caption">{params.row.phone || params.row.userId?.phone || "-"}</Typography>
                </Stack>
            )
        },
        {
            field: "pets",
            headerName: "Thú cưng",
            minWidth: 180,
            renderCell: (params) => {
                const petNames = Array.isArray(params.row.petIds)
                    ? params.row.petIds.map((pet: any) => pet?.name).filter(Boolean).join(", ")
                    : "";
                return <Typography>{petNames || "-"}</Typography>;
            }
        },
        {
            field: "cageId",
            headerName: "Chuồng",
            minWidth: 150,
            renderCell: (params) => <Typography>{params.row.cageId?.cageCode || "-"}</Typography>
        },
        {
            field: "dates",
            headerName: "Ngày lưu trú",
            minWidth: 220,
            renderCell: (params) => (
                <Typography>
                    {dayjs(params.row.checkInDate).format("DD/MM/YYYY")} - {dayjs(params.row.checkOutDate).format("DD/MM/YYYY")}
                </Typography>
            )
        },
        {
            field: "total",
            headerName: "Tổng tiền",
            minWidth: 140,
            renderCell: (params) => (
                <Typography fontWeight={600}>{Number(params.row.total || 0).toLocaleString("vi-VN")}đ</Typography>
            )
        },
        {
            field: "boardingStatus",
            headerName: "Trạng thái lưu trú",
            minWidth: 240,
            renderCell: (params) => (
                <TextField
                    select
                    size="small"
                    value={params.row.boardingStatus || "pending"}
                    onChange={(e) => updateStatusMut.mutate({ id: params.row._id, status: e.target.value })}
                    sx={{ minWidth: 210 }}
                >
                    {boardingStatusOptions.map((item) => (
                        <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                    ))}
                </TextField>
            )
        },
        {
            field: "paymentStatus",
            headerName: "Thanh toán",
            minWidth: 260,
            renderCell: (params) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                        size="small"
                        label={getPaymentStatusLabel(params.row.paymentStatus)}
                        color={params.row.paymentStatus === "paid" ? "success" : "warning"}
                    />
                    <TextField
                        select
                        size="small"
                        value={params.row.paymentStatus || "unpaid"}
                        onChange={(e) => updatePaymentMut.mutate({ id: params.row._id, status: e.target.value })}
                        sx={{ minWidth: 150 }}
                    >
                        {paymentStatusOptions.map((item) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </TextField>
                </Stack>
            )
        },
        {
            field: "statusText",
            headerName: "Hiển thị nhanh",
            minWidth: 180,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {getBoardingStatusLabel(params.row.boardingStatus)}
                </Typography>
            )
        },
    ];

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid #fed7aa",
                        background: "linear-gradient(120deg, #fff7ed 0%, #fff1f2 50%, #eef6ff 100%)",
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                        <Box>
                            <Title title="Quản lý đơn khách sạn" />
                            <Breadcrumb
                                items={[
                                    { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                                    { label: "Khách sạn" },
                                    { label: "Danh sách đơn" },
                                ]}
                            />
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<Icon icon="solar:add-circle-bold-duotone" />}
                            onClick={() => navigate(`/${prefixAdmin}/boarding/create`)}
                        >
                            Tạo đơn khách sạn
                        </Button>
                    </Stack>
                </Box>
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                <Chip color="primary" label={`Tổng đơn: ${summary.total}`} />
                <Chip color="success" label={`Đã thanh toán: ${summary.paid}`} />
                <Chip color="info" label={`Đang nhận chuồng: ${summary.checkedIn}`} />
                <Chip color="warning" label={`Doanh thu dự kiến: ${summary.revenue.toLocaleString("vi-VN")}đ`} />
            </Stack>

            <Card sx={{ p: 2 }}>
                <Search
                    placeholder="Tìm theo mã đơn / khách hàng / số điện thoại / mã chuồng..."
                    value={search}
                    onChange={setSearch}
                />
                <Box sx={{ mt: 2, height: 640 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        getRowId={(row) => row._id}
                        loading={isLoading}
                        pageSizeOptions={[10, 20, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    />
                </Box>
            </Card>
        </Box>
    );
};
