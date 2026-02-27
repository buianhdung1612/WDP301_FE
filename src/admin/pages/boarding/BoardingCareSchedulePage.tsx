import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { Search } from "../../components/ui/Search";
import {
    BoardingExerciseItem,
    BoardingFeedingItem,
    BoardingShiftChecklistItem,
    getBoardingBookingDetail,
    getBoardingBookings,
    getBoardingHotelStaffs,
    updateBoardingCareSchedule,
} from "../../api/boarding-booking.api";

const caTrucOptions: Array<{ value: "morning" | "afternoon" | "night"; label: string }> = [
    { value: "morning", label: "Ca sáng" },
    { value: "afternoon", label: "Ca chiều" },
    { value: "night", label: "Ca tối" },
];

const trangThaiChamSocOptions: Array<{ value: "pending" | "done" | "skipped"; label: string }> = [
    { value: "pending", label: "Chưa thực hiện" },
    { value: "done", label: "Đã hoàn thành" },
    { value: "skipped", label: "Bỏ qua" },
];

const taoDongLichAn = (): BoardingFeedingItem => ({
    time: "",
    food: "",
    amount: "",
    note: "",
    staffId: "",
    staffName: "",
    status: "pending",
});

const taoDongVanDong = (): BoardingExerciseItem => ({
    time: "",
    activity: "",
    durationMinutes: 0,
    note: "",
    status: "pending",
});

const taoDongChecklist = (): BoardingShiftChecklistItem => ({
    shift: "morning",
    title: "",
    note: "",
    checked: false,
});

export const BoardingCareSchedulePage = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

    const [careDialogOpen, setCareDialogOpen] = useState(false);
    const [careLoading, setCareLoading] = useState(false);
    const [editingBooking, setEditingBooking] = useState<any>(null);

    const [feedingDraft, setFeedingDraft] = useState<BoardingFeedingItem[]>([]);
    const [exerciseDraft, setExerciseDraft] = useState<BoardingExerciseItem[]>([]);
    const [checklistDraft, setChecklistDraft] = useState<BoardingShiftChecklistItem[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-boarding-bookings"],
        queryFn: () => getBoardingBookings(),
    });

    const { data: hotelStaffRes } = useQuery({
        queryKey: ["admin-boarding-hotel-staffs"],
        queryFn: () => getBoardingHotelStaffs(),
    });

    const hotelStaffOptions = useMemo(() => {
        const list = Array.isArray(hotelStaffRes?.data) ? hotelStaffRes.data : [];
        return list.map((staff: any) => ({
            value: staff._id,
            label: `${staff.fullName || "Nhân viên"}${staff.employeeCode ? ` - ${staff.employeeCode}` : ""}`,
        }));
    }, [hotelStaffRes]);

    const getStaffId = (value: any) => {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (typeof value === "object") return String(value._id || "");
        return "";
    };

    const getStaffName = (staffId: string, fallback?: string) => {
        const found = hotelStaffOptions.find((item) => item.value === staffId);
        if (found) return found.label;
        return String(fallback || "");
    };

    const updateCareMut = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: {
                feedingSchedule: BoardingFeedingItem[];
                exerciseSchedule: BoardingExerciseItem[];
                shiftChecklist: BoardingShiftChecklistItem[];
            };
        }) => updateBoardingCareSchedule(id, payload),
        onSuccess: () => {
            toast.success("Đã cập nhật lịch chăm sóc");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
            setCareDialogOpen(false);
            setEditingBooking(null);
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
        const total = list.length;
        const totalFeeding = list.reduce((sum: number, item: any) => sum + (Array.isArray(item.feedingSchedule) ? item.feedingSchedule.length : 0), 0);
        const assignedFeeding = list.reduce((sum: number, item: any) => {
            if (!Array.isArray(item.feedingSchedule)) return sum;
            return sum + item.feedingSchedule.filter((feed: any) => Boolean(feed?.staffId)).length;
        }, 0);
        return { total, totalFeeding, assignedFeeding };
    }, [data]);

    const moDialogChamSoc = async (bookingId: string) => {
        try {
            setCareLoading(true);
            const res = await getBoardingBookingDetail(bookingId);
            const booking = res?.data || res;
            if (!booking?._id) {
                toast.error("Không tải được chi tiết booking");
                return;
            }

            setEditingBooking(booking);
            setFeedingDraft(
                Array.isArray(booking.feedingSchedule) && booking.feedingSchedule.length > 0
                    ? booking.feedingSchedule.map((item: any) => ({
                        ...item,
                        staffId: getStaffId(item?.staffId),
                        staffName: item?.staffName || item?.staffId?.fullName || "",
                    }))
                    : [taoDongLichAn()]
            );
            setExerciseDraft(
                Array.isArray(booking.exerciseSchedule) && booking.exerciseSchedule.length > 0
                    ? booking.exerciseSchedule
                    : [taoDongVanDong()]
            );
            setChecklistDraft(
                Array.isArray(booking.shiftChecklist) && booking.shiftChecklist.length > 0
                    ? booking.shiftChecklist
                    : [taoDongChecklist()]
            );
            setCareDialogOpen(true);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi tải dữ liệu lịch chăm sóc");
        } finally {
            setCareLoading(false);
        }
    };

    const dongDialogChamSoc = () => {
        setCareDialogOpen(false);
        setEditingBooking(null);
        setFeedingDraft([]);
        setExerciseDraft([]);
        setChecklistDraft([]);
    };

    const luuLichChamSoc = () => {
        if (!editingBooking?._id) return;

        const feedingSchedule = feedingDraft
            .map((item) => ({
                time: String(item.time || "").trim(),
                food: String(item.food || "").trim(),
                amount: String(item.amount || "").trim(),
                note: String(item.note || "").trim(),
                staffId: String(getStaffId(item.staffId) || "").trim(),
                staffName: getStaffName(String(getStaffId(item.staffId) || "").trim(), item.staffName),
                status: (item.status || "pending") as "pending" | "done" | "skipped",
            }))
            .filter((item) => item.time || item.food || item.amount || item.note || item.staffId);

        const exerciseSchedule = exerciseDraft
            .map((item) => ({
                time: String(item.time || "").trim(),
                activity: String(item.activity || "").trim(),
                durationMinutes: Number(item.durationMinutes || 0),
                note: String(item.note || "").trim(),
                status: (item.status || "pending") as "pending" | "done" | "skipped",
            }))
            .filter((item) => item.time || item.activity || item.durationMinutes > 0 || item.note);

        const shiftChecklist = checklistDraft
            .map((item) => ({
                shift: (item.shift || "morning") as "morning" | "afternoon" | "night",
                title: String(item.title || "").trim(),
                note: String(item.note || "").trim(),
                checked: Boolean(item.checked),
            }))
            .filter((item) => item.title);

        updateCareMut.mutate({
            id: editingBooking._id,
            payload: {
                feedingSchedule,
                exerciseSchedule,
                shiftChecklist,
            },
        });
    };

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
            field: "cageId",
            headerName: "Chuồng",
            minWidth: 140,
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
            field: "summary",
            headerName: "Tổng quan lịch",
            minWidth: 230,
            renderCell: (params) => {
                const soLichAn = Array.isArray(params.row.feedingSchedule) ? params.row.feedingSchedule.length : 0;
                const soVanDong = Array.isArray(params.row.exerciseSchedule) ? params.row.exerciseSchedule.length : 0;
                const soChecklist = Array.isArray(params.row.shiftChecklist) ? params.row.shiftChecklist.length : 0;
                const soDaGanNhanVien = Array.isArray(params.row.feedingSchedule)
                    ? params.row.feedingSchedule.filter((item: any) => item?.staffId).length
                    : 0;
                return (
                    <Typography variant="body2" color="text.secondary">
                        Ăn: {soLichAn} (gán NVKS: {soDaGanNhanVien}) | Vận động: {soVanDong} | Ca trực: {soChecklist}
                    </Typography>
                );
            }
        },
        {
            field: "actions",
            headerName: "Thao tác",
            minWidth: 160,
            renderCell: (params) => (
                <Button variant="outlined" size="small" onClick={() => moDialogChamSoc(params.row._id)} disabled={careLoading}>
                    Quản lý lịch
                </Button>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid #bae6fd",
                        background: "linear-gradient(120deg, #eff6ff 0%, #ecfeff 45%, #fff7ed 100%)",
                    }}
                >
                    <Title title="Lịch chăm sóc khách sạn" />
                    <Breadcrumb
                        items={[
                            { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                            { label: "Khách sạn" },
                            { label: "Lịch chăm sóc" },
                        ]}
                    />
                </Box>
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                <Chip color="primary" label={`Tổng đơn có lịch: ${summary.total}`} />
                <Chip color="warning" label={`Tổng lịch ăn: ${summary.totalFeeding}`} />
                <Chip color="success" label={`Đã gán NVKS: ${summary.assignedFeeding}`} />
            </Stack>

            <Alert sx={{ mb: 2 }} severity="info">
                Mỗi dòng lịch ăn có thể gán trực tiếp cho một nhân viên khách sạn (NVKS).
            </Alert>

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

            <Dialog open={careDialogOpen} onClose={dongDialogChamSoc} fullWidth maxWidth="lg">
                <DialogTitle>
                    Quản lý lịch chăm sóc: {editingBooking?.code || "-"}
                </DialogTitle>
                <DialogContent dividers>
                    {careLoading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                            <CircularProgress />
                        </Stack>
                    ) : (
                        <Stack spacing={3}>
                            <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6">Lịch ăn</Typography>
                                    <Button startIcon={<AddIcon />} onClick={() => setFeedingDraft((prev) => [...prev, taoDongLichAn()])}>
                                        Thêm dòng
                                    </Button>
                                </Stack>
                                <Stack spacing={1}>
                                    {feedingDraft.map((item, idx) => (
                                        <Stack key={`feeding-${idx}`} direction="row" spacing={1} alignItems="center">
                                            <TextField
                                                label="Giờ"
                                                type="time"
                                                size="small"
                                                value={item.time || ""}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) => i === idx ? { ...x, time: e.target.value } : x))}
                                                sx={{ width: 130 }}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                label="Thức ăn"
                                                size="small"
                                                value={item.food || ""}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) => i === idx ? { ...x, food: e.target.value } : x))}
                                                sx={{ minWidth: 170 }}
                                            />
                                            <TextField
                                                label="Khẩu phần"
                                                size="small"
                                                value={item.amount || ""}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) => i === idx ? { ...x, amount: e.target.value } : x))}
                                                sx={{ minWidth: 150 }}
                                            />
                                            <TextField
                                                label="NVKS phụ trách"
                                                select
                                                size="small"
                                                value={String(getStaffId(item.staffId) || "")}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) =>
                                                    i === idx
                                                        ? {
                                                            ...x,
                                                            staffId: e.target.value,
                                                            staffName: getStaffName(e.target.value),
                                                        }
                                                        : x
                                                ))}
                                                sx={{ minWidth: 220 }}
                                            >
                                                <MenuItem value="">Chưa gán</MenuItem>
                                                {hotelStaffOptions.map((staff) => (
                                                    <MenuItem key={staff.value} value={staff.value}>{staff.label}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                label="Trạng thái"
                                                select
                                                size="small"
                                                value={item.status || "pending"}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) => i === idx ? { ...x, status: e.target.value as any } : x))}
                                                sx={{ width: 170 }}
                                            >
                                                {trangThaiChamSocOptions.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                label="Ghi chú"
                                                size="small"
                                                value={item.note || ""}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) => i === idx ? { ...x, note: e.target.value } : x))}
                                                sx={{ flex: 1 }}
                                            />
                                            <IconButton color="error" onClick={() => setFeedingDraft((prev) => prev.filter((_, i) => i !== idx))}>
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>

                            <Divider />

                            <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6">Lịch vận động</Typography>
                                    <Button startIcon={<AddIcon />} onClick={() => setExerciseDraft((prev) => [...prev, taoDongVanDong()])}>
                                        Thêm dòng
                                    </Button>
                                </Stack>
                                <Stack spacing={1}>
                                    {exerciseDraft.map((item, idx) => (
                                        <Stack key={`exercise-${idx}`} direction="row" spacing={1} alignItems="center">
                                            <TextField
                                                label="Giờ"
                                                type="time"
                                                size="small"
                                                value={item.time || ""}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) => i === idx ? { ...x, time: e.target.value } : x))}
                                                sx={{ width: 130 }}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                label="Hoạt động"
                                                size="small"
                                                value={item.activity || ""}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) => i === idx ? { ...x, activity: e.target.value } : x))}
                                                sx={{ minWidth: 180 }}
                                            />
                                            <TextField
                                                label="Số phút"
                                                type="number"
                                                size="small"
                                                value={item.durationMinutes || 0}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) => i === idx ? { ...x, durationMinutes: Number(e.target.value || 0) } : x))}
                                                sx={{ width: 120 }}
                                            />
                                            <TextField
                                                label="Trạng thái"
                                                select
                                                size="small"
                                                value={item.status || "pending"}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) => i === idx ? { ...x, status: e.target.value as any } : x))}
                                                sx={{ width: 170 }}
                                            >
                                                {trangThaiChamSocOptions.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                label="Ghi chú"
                                                size="small"
                                                value={item.note || ""}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) => i === idx ? { ...x, note: e.target.value } : x))}
                                                sx={{ flex: 1 }}
                                            />
                                            <IconButton color="error" onClick={() => setExerciseDraft((prev) => prev.filter((_, i) => i !== idx))}>
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>

                            <Divider />

                            <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6">Checklist ca trực</Typography>
                                    <Button startIcon={<AddIcon />} onClick={() => setChecklistDraft((prev) => [...prev, taoDongChecklist()])}>
                                        Thêm dòng
                                    </Button>
                                </Stack>
                                <Stack spacing={1}>
                                    {checklistDraft.map((item, idx) => (
                                        <Stack key={`checklist-${idx}`} direction="row" spacing={1} alignItems="center">
                                            <TextField
                                                label="Ca trực"
                                                select
                                                size="small"
                                                value={item.shift || "morning"}
                                                onChange={(e) => setChecklistDraft((prev) => prev.map((x, i) => i === idx ? { ...x, shift: e.target.value as any } : x))}
                                                sx={{ width: 160 }}
                                            >
                                                {caTrucOptions.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                label="Nội dung"
                                                size="small"
                                                value={item.title || ""}
                                                onChange={(e) => setChecklistDraft((prev) => prev.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))}
                                                sx={{ minWidth: 220 }}
                                            />
                                            <TextField
                                                label="Ghi chú"
                                                size="small"
                                                value={item.note || ""}
                                                onChange={(e) => setChecklistDraft((prev) => prev.map((x, i) => i === idx ? { ...x, note: e.target.value } : x))}
                                                sx={{ flex: 1 }}
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={Boolean(item.checked)}
                                                        onChange={(e) => setChecklistDraft((prev) => prev.map((x, i) => i === idx ? { ...x, checked: e.target.checked } : x))}
                                                    />
                                                }
                                                label="Đã xong"
                                                sx={{ minWidth: 110 }}
                                            />
                                            <IconButton color="error" onClick={() => setChecklistDraft((prev) => prev.filter((_, i) => i !== idx))}>
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={dongDialogChamSoc} disabled={updateCareMut.isPending}>Đóng</Button>
                    <Button variant="contained" onClick={luuLichChamSoc} disabled={updateCareMut.isPending || !editingBooking?._id}>
                        {updateCareMut.isPending ? "Đang lưu..." : "Lưu lịch chăm sóc"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
