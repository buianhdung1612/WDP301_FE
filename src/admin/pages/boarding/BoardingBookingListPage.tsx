
import { ChangeEvent, Fragment, MouseEvent, SyntheticEvent, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Checkbox,
    Collapse,
    CircularProgress,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    styled,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tabs,
    Typography,
} from "@mui/material";
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

const TabBadge = styled("span")(() => ({
    height: "24px",
    minWidth: "24px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "8px",
    padding: "0px 6px",
    borderRadius: "var(--shape-borderRadius-sm)",
    fontSize: "0.75rem",
    fontWeight: 700,
    transition: "all 0.2s",
}));

const boardingStatusOptions = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "held", label: "Đang giữ chỗ" },
    { value: "confirmed", label: "Xác nhận" },
    { value: "checked-in", label: "Nhận chuồng" },
    { value: "checked-out", label: "Trả chuồng" },
    { value: "cancelled", label: "Hủy" },
];

const paymentStatusOptions = [
    { value: "unpaid", label: "Chưa thanh toán" },
    { value: "partial", label: "Đặt cọc 20%" },
    { value: "paid", label: "Thanh toán" },
    { value: "refunded", label: "Hoàn tiền" },
];

const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
const getPetSlotItems = (row: any) => {
    const pets = Array.isArray(row?.petIds) ? row.petIds.filter(Boolean) : [];
    const quantity = Math.max(1, Number(row?.quantity || 0) || pets.length || 1);
    const slotCount = Math.max(quantity, pets.length || 0, 1);

    return Array.from({ length: slotCount }).map((_, index) => ({
        key: String(pets[index]?._id || pets[index]?.id || `${row?._id || "booking"}-${index}`),
        petName: String(pets[index]?.name || `Th� cung ${index + 1}`),
        cageLabel: [row?.cageId?.cageCode || "-", slotCount > 1 ? `Ph�ng ${index + 1}` : ""].filter(Boolean).join(" � "),
    }));
};

export const BoardingBookingListPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [tabStatus, setTabStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState<string[]>([]);
    const [openRows, setOpenRows] = useState<string[]>([]);
    const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

    const filters = useMemo(() => ({
        page: page + 1,
        limit: rowsPerPage,
        status: tabStatus === "all" ? undefined : tabStatus,
        search: searchQuery || undefined,
    }), [page, rowsPerPage, tabStatus, searchQuery]);

    const { data: res, isLoading } = useQuery({
        queryKey: ["admin-boarding-bookings", filters],
        queryFn: () => getBoardingBookings(filters),
    });

    const bookings = useMemo(() => {
        if (!res) return [];
        const data = res as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [res]);
    const pagination = res?.data?.pagination || { totalRecords: 0 };

    const updateStatusMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateBoardingBookingStatus(id, status),
        onSuccess: () => {
            toast.success("Cập nhật trạng thái lưu trú thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái lưu trú");
        },
    });

    const updatePaymentMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateBoardingPaymentStatus(id, status),
        onSuccess: () => {
            toast.success("Cập nhật trạng thái thanh toán thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái thanh toán");
        },
    });

    const statusCounts = res?.data?.statusCounts || {
        all: 0,
        pending: 0,
        held: 0,
        confirmed: 0,
        "checked-in": 0,
        "checked-out": 0,
        cancelled: 0,
    };

    const handleOpenMenu = (event: MouseEvent<HTMLElement>, id: string) => {
        setAnchorEl((prev) => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleCloseMenu = (id: string) => {
        setAnchorEl((prev) => ({ ...prev, [id]: null }));
    };

    const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
        setTabStatus(newValue);
        setPage(0);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(0);
    };

    const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelected(bookings.map((row: any) => row._id));
            return;
        }
        setSelected([]);
    };

    const handleSelectRow = (id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];
        if (selectedIndex === -1) {
            newSelected = [...selected, id];
        } else if (selectedIndex === 0) {
            newSelected = selected.slice(1);
        } else if (selectedIndex === selected.length - 1) {
            newSelected = selected.slice(0, -1);
        } else if (selectedIndex > 0) {
            newSelected = [...selected.slice(0, selectedIndex), ...selected.slice(selectedIndex + 1)];
        }
        setSelected(newSelected);
    };

    const toggleRow = (id: string) => {
        setOpenRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
    };

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                    <Title title="Quản lý đơn khách sạn" />
                    <Breadcrumb
                        items={[
                            { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                            { label: "Quản lý đơn khách sạn" },
                        ]}
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Icon icon="eva:plus-fill" />}
                    onClick={() => navigate(`/${prefixAdmin}/boarding/create`)}
                    sx={{
                        bgcolor: "var(--palette-text-primary)",
                        color: "var(--palette-common-white)",
                        minHeight: "2.5rem",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        padding: "0 calc(2 * var(--spacing))",
                        borderRadius: "var(--shape-borderRadius)",
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                            bgcolor: "var(--palette-grey-700)",
                            boxShadow: "var(--customShadows-z8)",
                        },
                    }}
                >
                    Tạo đơn mới
                </Button>
            </Box>

            <Card
                sx={{
                    borderRadius: "var(--shape-borderRadius-lg)",
                    bgcolor: "var(--palette-background-paper)",
                    boxShadow: "var(--customShadows-card)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Tabs
                    value={tabStatus}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons={false}
                    sx={{
                        px: "20px",
                        minHeight: "48px",
                        borderBottom: "1px solid var(--palette-background-neutral)",
                        "& .MuiTabs-flexContainer": { gap: "calc(4 * var(--spacing))" },
                        "& .MuiTabs-indicator": { backgroundColor: "var(--palette-text-primary)", height: 2 },
                    }}
                >
                    {[
                        { value: "all", label: "Tất cả", color: "var(--palette-common-white)", bg: "var(--palette-grey-800)", activeColor: "var(--palette-common-white)", activeBg: "var(--palette-grey-800)" },
                        { value: "pending", label: "Chờ xử lý", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)", activeColor: "var(--palette-warning-contrastText)", activeBg: "var(--palette-warning-main)" },
                        { value: "held", label: "Giữ chỗ", color: "var(--palette-primary-dark)", bg: "var(--palette-primary-lighter)", activeColor: "var(--palette-primary-contrastText)", activeBg: "var(--palette-primary-main)" },
                        { value: "confirmed", label: "Đã xác nhận", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)", activeColor: "var(--palette-info-contrastText)", activeBg: "var(--palette-info-main)" },
                        { value: "checked-in", label: "Đã nhận chuồng", color: "var(--palette-success-dark)", bg: "var(--palette-success-lighter)", activeColor: "var(--palette-success-contrastText)", activeBg: "var(--palette-success-main)" },
                        { value: "checked-out", label: "Đã trả chuồng", color: "var(--palette-secondary-dark)", bg: "var(--palette-secondary-lighter)", activeColor: "var(--palette-secondary-contrastText)", activeBg: "var(--palette-secondary-main)" },
                        { value: "cancelled", label: "Đã hủy", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)", activeColor: "var(--palette-error-contrastText)", activeBg: "var(--palette-error-main)" },
                    ].map((tab) => (
                        <Tab
                            key={tab.value}
                            value={tab.value}
                            disableRipple
                            label={(
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography
                                        sx={{
                                            fontSize: "0.875rem",
                                            fontWeight: tabStatus === tab.value ? 700 : 500,
                                            color: tabStatus === tab.value ? "var(--palette-text-primary)" : "inherit",
                                        }}
                                    >
                                        {tab.label}
                                    </Typography>
                                    <TabBadge
                                        sx={{
                                            bgcolor: tabStatus === tab.value ? tab.activeBg : tab.bg,
                                            color: tabStatus === tab.value ? tab.activeColor : tab.color,
                                        }}
                                    >
                                        {statusCounts[tab.value as keyof typeof statusCounts]}
                                    </TabBadge>
                                </Box>
                            )}
                            sx={{
                                minWidth: 0,
                                padding: "0",
                                minHeight: "48px",
                                textTransform: "none",
                                color: "var(--palette-text-secondary)",
                                "&.Mui-selected": {
                                    color: "var(--palette-text-primary)",
                                },
                            }}
                        />
                    ))}
                </Tabs>

                <Box sx={{ p: "20px", display: "flex", alignItems: "center", gap: 2, borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                    <Search
                        placeholder="Tìm theo mã đơn, khách hàng, số điện thoại, mã chuồng..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        maxWidth="26rem"
                    />
                </Box>

                <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                    <Table sx={{ minWidth: 1120 }}>
                        <TableHead sx={{ bgcolor: "var(--palette-background-neutral)" }}>
                            <TableRow>
                                <TableCell padding="checkbox" sx={{ borderBottom: "none", textAlign: "center" }}>
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < bookings.length}
                                        checked={bookings.length > 0 && selected.length === bookings.length}
                                        onChange={handleSelectAllClick}
                                        sx={{ color: "var(--palette-text-disabled)", p: 0 }}
                                    />
                                </TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Mã đơn</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Khách hàng</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Thời gian</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Tổng tiền</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }} align="right">Trạng thái</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }} align="right">Thanh toán</TableCell>
                                <TableCell sx={{ borderBottom: "none", width: 80 }} align="right" />
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : bookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                                        <Typography sx={{ color: "var(--palette-text-secondary)" }}>
                                            Không có dữ liệu
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookings
                                    .map((row: any) => {
                                        const isItemSelected = selected.indexOf(row._id) !== -1;
                                        const isOpen = openRows.includes(row._id);
                                        const petSlotItems = getPetSlotItems(row);

                                        return (
                                            <Fragment key={row._id}>
                                                <TableRow
                                                    hover
                                                    selected={isItemSelected}
                                                    sx={{
                                                        "&:hover": { bgcolor: "var(--palette-action-hover)" },
                                                        ...(isOpen && { bgcolor: "transparent" }),
                                                        transition: "background-color 0.2s",
                                                    }}
                                                >
                                                    <TableCell padding="checkbox" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)", textAlign: "center" }}>
                                                        <Checkbox
                                                            checked={isItemSelected}
                                                            onClick={() => handleSelectRow(row._id)}
                                                            sx={{ color: "var(--palette-text-disabled)", p: 0 }}
                                                        />
                                                    </TableCell>

                                                    <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: "0.875rem",
                                                                color: "var(--palette-text-primary)",
                                                                textDecoration: "underline",
                                                            }}
                                                        >
                                                            #{row.code?.slice(-6).toUpperCase() || "N/A"}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar
                                                                src={row.userId?.avatar}
                                                                sx={{ width: 40, height: 40, borderRadius: "var(--shape-borderRadius-sm)" }}
                                                            >
                                                                <Icon icon="eva:person-fill" width={22} />
                                                            </Avatar>
                                                            <Stack spacing={0.25}>
                                                                <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                                    {row.fullName || row.userId?.fullName || "Khách vãng lai"}
                                                                </Typography>
                                                                <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.75rem" }}>
                                                                    {row.phone || row.userId?.phone || row.userId?.email || "Không có thông tin"}
                                                                </Typography>
                                                            </Stack>
                                                        </Stack>
                                                    </TableCell>


                                                    <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                        <Stack spacing={0.25}>
                                                            <Typography sx={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                                {dayjs(row.checkInDate).format("DD/MM/YYYY")} - {dayjs(row.checkOutDate).format("DD/MM/YYYY")}
                                                            </Typography>
                                                            <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.75rem" }}>
                                                                {Number(row.numberOfDays || 0)} đêm
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>

                                                    <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                            {formatCurrency(Number(row.total || 0))}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                        <TextField
                                                            select
                                                            size="small"
                                                            value={String(row.boardingStatus || "")}
                                                            onChange={(event) => {
                                                                const nextStatus = String(event.target.value || "");
                                                                if (!nextStatus || nextStatus === String(row.boardingStatus || "")) return;
                                                                updateStatusMut.mutate({ id: row._id, status: nextStatus });
                                                            }}
                                                            disabled={updateStatusMut.isPending}
                                                            sx={{
                                                                minWidth: 170,
                                                                "& .MuiInputBase-input": { py: "6px", fontSize: "0.8125rem", fontWeight: 600 },
                                                            }}
                                                        >
                                                            {boardingStatusOptions.map((option) => (
                                                                <MenuItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    </TableCell>

                                                    <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                        <TextField
                                                            select
                                                            size="small"
                                                            value={String(row.paymentStatus || "")}
                                                            onChange={(event) => {
                                                                const nextStatus = String(event.target.value || "");
                                                                if (!nextStatus || nextStatus === String(row.paymentStatus || "")) return;
                                                                updatePaymentMut.mutate({ id: row._id, status: nextStatus });
                                                            }}
                                                            disabled={updatePaymentMut.isPending}
                                                            sx={{
                                                                minWidth: 160,
                                                                "& .MuiInputBase-input": { py: "6px", fontSize: "0.8125rem", fontWeight: 600 },
                                                            }}
                                                        >
                                                            {paymentStatusOptions.map((option) => (
                                                                <MenuItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    </TableCell>

                                                    <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)", width: 96 }}>
                                                        <Stack direction="row" spacing={0} justifyContent="flex-end">
                                                            <IconButton
                                                                onClick={() => toggleRow(row._id)}
                                                                sx={{
                                                                    color: "var(--palette-text-primary)",
                                                                    bgcolor: isOpen ? "var(--palette-action-hover)" : "transparent",
                                                                    "&:hover": {
                                                                        bgcolor: "rgba(var(--palette-action-activeChannel) / var(--palette-action-hoverOpacity))",
                                                                    },
                                                                }}
                                                            >
                                                                <Icon icon={isOpen ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"} width={20} />
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={(event) => handleOpenMenu(event, row._id)}
                                                                sx={{
                                                                    color: "var(--palette-text-primary)",
                                                                    bgcolor: Boolean(anchorEl[row._id]) ? "var(--palette-action-hover)" : "transparent",
                                                                    "&:hover": {
                                                                        bgcolor: "rgba(var(--palette-action-activeChannel) / var(--palette-action-hoverOpacity))",
                                                                    },
                                                                }}
                                                            >
                                                                <Icon icon="eva:more-vertical-fill" width={20} />
                                                            </IconButton>
                                                        </Stack>
                                                        <Menu
                                                            anchorEl={anchorEl[row._id]}
                                                            open={Boolean(anchorEl[row._id])}
                                                            onClose={() => handleCloseMenu(row._id)}
                                                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                                                            slotProps={{
                                                                paper: {
                                                                    sx: {
                                                                        width: 240,
                                                                        boxShadow: "var(--customShadows-z20)",
                                                                        borderRadius: "var(--shape-borderRadius-md)",
                                                                        p: 0.5,
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            <MenuItem
                                                                onClick={() => {
                                                                    handleCloseMenu(row._id);
                                                                    navigate(`/${prefixAdmin}/boarding/care-schedule`);
                                                                }}
                                                            >
                                                                <Icon icon="solar:calendar-mark-bold" width={18} style={{ marginRight: 8 }} />
                                                                L?ch cham s�c
                                                            </MenuItem>
                                                        </Menu>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={9}
                                                        sx={{
                                                            p: 0,
                                                            bgcolor: "var(--palette-background-neutral)",
                                                            borderBottom: isOpen ? "1px dashed var(--palette-divider)" : "none",
                                                        }}
                                                    >
                                                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                            <Box
                                                                sx={{
                                                                    bgcolor: "var(--palette-background-paper)",
                                                                    borderRadius: "8px",
                                                                    m: "calc(1.5 * var(--spacing))",
                                                                    overflow: "hidden",
                                                                }}
                                                            >
                                                                {petSlotItems.map((item) => (
                                                                    <Stack
                                                                        key={`${row._id}-${item.key}`}
                                                                        direction="row"
                                                                        alignItems="center"
                                                                        spacing={2}
                                                                        sx={{
                                                                            px: "calc(2 * var(--spacing))",
                                                                            py: "calc(1.5 * var(--spacing))",
                                                                            "&:not(:last-of-type)": {
                                                                                borderBottom: "solid 2px var(--palette-background-neutral)",
                                                                            },
                                                                        }}
                                                                    >
                                                                        <Avatar
                                                                            src={(row.petIds || []).find((pet: any) => String(pet?._id || pet?.id) === item.key)?.avatar}
                                                                            variant="rounded"
                                                                            sx={{ width: 48, height: 48, borderRadius: "var(--shape-borderRadius-sm)" }}
                                                                        >
                                                                            <Icon icon="solar:dog-bold" width={22} />
                                                                        </Avatar>
                                                                        <Box sx={{ flexGrow: 1 }}>
                                                                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                                                {item.petName}
                                                                            </Typography>
                                                                            <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.75rem", mt: 0.25 }}>
                                                                                {item.cageLabel}
                                                                            </Typography>
                                                                            {row.specialCare || row.notes ? (
                                                                                <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.75rem", mt: 0.5 }}>
                                                                                    {row.specialCare || row.notes}
                                                                                </Typography>
                                                                            ) : null}
                                                                        </Box>
                                                                        <Box sx={{ textAlign: "right", minWidth: 132 }}>
                                                                            <Typography sx={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--palette-text-primary)" }}>
                                                                                {formatCurrency(Number(row.pricePerDay || 0))}/d�m
                                                                            </Typography>
                                                                            <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.75rem", mt: 0.25 }}>
                                                                                {Number(row.numberOfDays || 0)} d�m
                                                                            </Typography>
                                                                        </Box>
                                                                    </Stack>
                                                                ))}
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            </Fragment>
                                        );
                                    })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 20, 50]}
                    component="div"
                    count={pagination.totalRecords || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>
        </Box>
    );
};
