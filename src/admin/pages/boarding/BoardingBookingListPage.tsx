import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
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
    Tabs,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { ChangeEvent, Fragment, MouseEvent, SyntheticEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getBoardingBookings, updateBoardingBookingStatus } from "../../api/boarding-booking.api";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Search } from "../../components/ui/Search";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { confirmAction } from "../../utils/swal";

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

const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

const getPetSlotItems = (row: any) => {
    const pets = Array.isArray(row?.petIds) ? row.petIds.filter(Boolean) : [];
    const quantity = Math.max(1, Number(row?.quantity || 0) || pets.length || 1);
    const slotCount = Math.max(quantity, pets.length || 0, 1);

    return Array.from({ length: slotCount }).map((_, index) => ({
        key: String(pets[index]?._id || pets[index]?.id || `${row?._id || "booking"}-${index}`),
        petName: String(pets[index]?.name || `Thú cưng ${index + 1}`),
        cageLabel: [row?.cageId?.cageCode || "-", slotCount > 1 ? `Phòng ${index + 1}` : ""].filter(Boolean).join(" - "),
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
            toast.success("Cập nhật trạng thái thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái");
        },
    });

    const handleStatusUpdate = (id: string, status: string, label: string) => {
        confirmAction(
            `Xác nhận ${label}?`,
            `Bạn có chắc chắn muốn chuyển đơn sang trạng thái "${label}" không?`,
            () => updateStatusMut.mutate({ id, status }),
            "info"
        );
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

    const statusCounts = res?.data?.statusCounts || { all: 0 };

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                    <Title title="Quản lý khách sạn (Boarding)" />
                    <Breadcrumb
                        items={[
                            { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                            { label: "Quản lý khách sạn" },
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
                    position: "relative",
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
                        { value: "all", label: "Tất cả", bg: "var(--palette-grey-800)", color: "var(--palette-common-white)" },
                        { value: "pending", label: "Chờ xử lý", bg: "var(--palette-warning-lighter)", color: "var(--palette-warning-dark)" },
                        { value: "held", label: "Giữ chỗ", bg: "var(--palette-info-lighter)", color: "var(--palette-info-dark)" },
                        { value: "confirmed", label: "Xác nhận", bg: "var(--palette-info-lighter)", color: "var(--palette-info-dark)" },
                        { value: "checked-in", label: "Đã nhận", bg: "var(--palette-success-lighter)", color: "var(--palette-success-dark)" },
                        { value: "checked-out", label: "Đã trả", bg: "var(--palette-secondary-lighter)", color: "var(--palette-secondary-dark)" },
                        { value: "cancelled", label: "Đã hủy", bg: "var(--palette-error-lighter)", color: "var(--palette-error-dark)" },
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
                                            bgcolor: tabStatus === tab.value ? "var(--palette-text-primary)" : tab.bg,
                                            color: tabStatus === tab.value ? "var(--palette-common-white)" : tab.color,
                                        }}
                                    >
                                        {statusCounts[tab.value as keyof typeof statusCounts] || 0}
                                    </TabBadge>
                                </Box>
                            )}
                            sx={{
                                minWidth: 0,
                                padding: "0",
                                minHeight: "48px",
                                textTransform: "none",
                                color: "var(--palette-text-secondary)",
                                "&.Mui-selected": { color: "var(--palette-text-primary)" },
                            }}
                        />
                    ))}
                </Tabs>

                <Box sx={{ p: "20px", display: "flex", alignItems: "center", gap: 2, borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                    <Search
                        placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        maxWidth="26rem"
                    />
                </Box>

                <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                    <Table sx={{ minWidth: 1000 }}>
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
                                <TableCell sx={{ borderBottom: "none", width: 80 }} align="right" />
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : bookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                        <Typography sx={{ color: "var(--palette-text-secondary)" }}>Không có dữ liệu</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookings.map((row: any) => {
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
                                                        onClick={() => navigate(`/${prefixAdmin}/boarding/detail/${row._id}`)}
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: "0.875rem",
                                                            color: "var(--palette-text-primary)",
                                                            textDecoration: "underline",
                                                            cursor: "pointer",
                                                            "&:hover": { color: "var(--palette-primary-main)" }
                                                        }}
                                                    >
                                                        #{row.code?.slice(-6).toUpperCase() || "N/A"}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar src={row.userId?.avatar} sx={{ width: 40, height: 40, borderRadius: "var(--shape-borderRadius-sm)" }}>
                                                            <Icon icon="eva:person-fill" width={22} />
                                                        </Avatar>
                                                        <Stack spacing={0.25}>
                                                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                                {row.fullName || row.userId?.fullName || "Khách vãng lai"}
                                                            </Typography>
                                                            <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.75rem" }}>
                                                                {row.phone || row.userId?.phone || "N/A"}
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
                                                            {Number(row.numberOfDays || 0)} ngày lưu trú
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                        {formatCurrency(Number(row.total || 0))}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    {(() => {
                                                        const statusMap: any = {
                                                            pending: { label: "Chờ xử lý", color: "var(--palette-warning-main)", bg: "var(--palette-warning-lighter)" },
                                                            confirmed: { label: "Xác nhận", color: "var(--palette-info-main)", bg: "var(--palette-info-lighter)" },
                                                            "checked-in": { label: "Đã nhận", color: "var(--palette-success-main)", bg: "var(--palette-success-lighter)" },
                                                            "checked-out": { label: "Đã trả", color: "var(--palette-secondary-main)", bg: "var(--palette-secondary-lighter)" },
                                                            cancelled: { label: "Đã hủy", color: "var(--palette-error-main)", bg: "var(--palette-error-lighter)" },
                                                        };
                                                        const status = statusMap[row.boardingStatus] || { label: row.boardingStatus, color: "var(--palette-text-disabled)", bg: "var(--palette-background-neutral)" };
                                                        return (
                                                            <Chip
                                                                label={status.label}
                                                                size="small"
                                                                sx={{
                                                                    borderRadius: "var(--shape-borderRadius-sm)",
                                                                    fontWeight: 700,
                                                                    fontSize: "0.6875rem",
                                                                    color: status.color,
                                                                    bgcolor: status.bg,
                                                                    height: "24px",
                                                                }}
                                                            />
                                                        );
                                                    })()}
                                                </TableCell>

                                                <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)", width: 80 }}>
                                                    <Stack direction="row" spacing={0} justifyContent="flex-end">
                                                        <IconButton onClick={() => toggleRow(row._id)}>
                                                            <Icon icon={isOpen ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"} width={20} />
                                                        </IconButton>
                                                        <IconButton onClick={(event) => handleOpenMenu(event, row._id)}>
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
                                                                    width: 180,
                                                                    boxShadow: "var(--customShadows-z20)",
                                                                    borderRadius: "var(--shape-borderRadius-md)",
                                                                    p: 0.5,
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem onClick={() => { handleCloseMenu(row._id); navigate(`/${prefixAdmin}/boarding/detail/${row._id}`); }}>
                                                            <Icon icon="eva:eye-fill" width={18} style={{ marginRight: 8 }} />
                                                            Chi tiết
                                                        </MenuItem>
                                                        <MenuItem onClick={() => { handleCloseMenu(row._id); navigate(`/${prefixAdmin}/boarding/edit/${row._id}`); }}>
                                                            <Icon icon="solar:pen-bold" width={18} style={{ marginRight: 8 }} />
                                                            Sửa
                                                        </MenuItem>
                                                        <MenuItem onClick={() => { handleCloseMenu(row._id); navigate(`/${prefixAdmin}/boarding/care-schedule`); }}>
                                                            <Icon icon="solar:calendar-mark-bold" width={18} style={{ marginRight: 8 }} />
                                                            Lịch chăm sóc
                                                        </MenuItem>

                                                        {["pending", "held"].includes(row.boardingStatus) && (
                                                            <MenuItem
                                                                onClick={() => { handleCloseMenu(row._id); handleStatusUpdate(row._id, "confirmed", "Xác nhận"); }}
                                                                sx={{ color: "var(--palette-success-main)" }}
                                                            >
                                                                <Icon icon="eva:checkmark-circle-2-fill" width={18} style={{ marginRight: 8 }} />
                                                                Xác nhận khách
                                                            </MenuItem>
                                                        )}

                                                        {row.boardingStatus === "confirmed" && (
                                                            <MenuItem
                                                                onClick={() => { handleCloseMenu(row._id); handleStatusUpdate(row._id, "checked-in", "Nhận chuồng"); }}
                                                                sx={{ color: "var(--palette-info-main)" }}
                                                            >
                                                                <Icon icon="solar:user-check-bold" width={18} style={{ marginRight: 8 }} />
                                                                Nhận chuồng
                                                            </MenuItem>
                                                        )}

                                                        {row.boardingStatus === "checked-in" && (
                                                            <MenuItem
                                                                onClick={() => { handleCloseMenu(row._id); handleStatusUpdate(row._id, "checked-out", "Trả chuồng"); }}
                                                                sx={{ color: "var(--palette-warning-main)" }}
                                                            >
                                                                <Icon icon="solar:card-send-bold" width={18} style={{ marginRight: 8 }} />
                                                                Trả chuồng (Hết)
                                                            </MenuItem>
                                                        )}
                                                    </Menu>
                                                </TableCell>
                                            </TableRow>

                                            <TableRow>
                                                <TableCell colSpan={7} sx={{ p: 0, bgcolor: "var(--palette-background-neutral)", borderBottom: isOpen ? "1px dashed var(--palette-divider)" : "none" }}>
                                                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                        <Box sx={{ bgcolor: "var(--palette-background-paper)", borderRadius: "8px", m: "calc(1.5 * var(--spacing))", overflow: "hidden" }}>
                                                            {petSlotItems.map((item) => (
                                                                <Stack
                                                                    key={`${row._id}-${item.key}`}
                                                                    direction="row"
                                                                    alignItems="center"
                                                                    spacing={2}
                                                                    sx={{ px: 2, py: 1.5, "&:not(:last-of-type)": { borderBottom: "solid 2px var(--palette-background-neutral)" } }}
                                                                >
                                                                    <Avatar
                                                                        src={(row.petIds || []).find((pet: any) => String(pet?._id || pet?.id) === item.key)?.avatar}
                                                                        variant="rounded"
                                                                        sx={{ width: 48, height: 48, borderRadius: "var(--shape-borderRadius-sm)" }}
                                                                    >
                                                                        <Icon icon="solar:dog-bold" width={22} />
                                                                    </Avatar>
                                                                    <Box sx={{ flexGrow: 1 }}>
                                                                        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>{item.petName}</Typography>
                                                                        <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.75rem", mt: 0.25 }}>{item.cageLabel}</Typography>
                                                                    </Box>
                                                                    <Box sx={{ textAlign: "right", minWidth: 120 }}>
                                                                        <Typography sx={{ fontWeight: 700, fontSize: "0.8125rem", color: "var(--palette-text-primary)" }}>
                                                                            {formatCurrency(Number(row.pricePerDay || row.total / (row.numberOfDays || 1)))}/ngày
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
