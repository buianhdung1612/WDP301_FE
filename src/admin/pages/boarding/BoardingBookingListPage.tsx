import { useState, useMemo, Fragment, SyntheticEvent, ChangeEvent, MouseEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Checkbox,
    Chip,
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
    Tabs,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getBoardingBookings, updateBoardingBookingStatus } from "../../api/boarding-booking.api";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Search } from "../../components/ui/Search";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";

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
    { value: "pending", label: "Chờ xử lý", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)" },
    { value: "held", label: "Giữ chỗ", color: "var(--palette-primary-dark)", bg: "var(--palette-primary-lighter)" },
    { value: "confirmed", label: "Đã xác nhận", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)" },
    { value: "checked-in", label: "Nhận chuồng", color: "var(--palette-success-dark)", bg: "var(--palette-success-lighter)" },
    { value: "checked-out", label: "Trả chuồng", color: "var(--palette-secondary-dark)", bg: "var(--palette-secondary-lighter)" },
    { value: "cancelled", label: "Hủy", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)" },
];

const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

const getPetSlotItems = (row: any) => {
    // New logic: Use row.items if it exists (consolidated order)
    if (Array.isArray(row?.items) && row.items.length > 0) {
        return row.items.flatMap((item: any, itemIndex: number) => {
            const itemPets = Array.isArray(item.petIds) ? item.petIds.filter(Boolean) : [];
            const cageCode = item.cageId?.cageCode || row.cageId?.cageCode || "-";
            const price = Number(item.cageId?.dailyPrice || item.pricePerDay || row.pricePerDay || (row.total / Math.max(typeof row.numberOfDays === 'number' ? row.numberOfDays : 1, 1)));
            
            // If no pets in item (shouldn't happen with new logic but for safety)
            if (itemPets.length === 0) {
                return [{
                    key: `item-${itemIndex}`,
                    petName: "Thú cưng",
                    cageLabel: cageCode,
                    petAvatar: null,
                    price
                }];
            }

            return itemPets.map((pet: any, petIndex: number) => ({
                key: String(pet._id || pet.id || `item-${itemIndex}-pet-${petIndex}`),
                petName: String(pet.name || `Thú cưng`),
                cageLabel: cageCode,
                petAvatar: pet.avatar,
                price
            }));
        });
    }

    // Old logic: Backward compatibility
    const pets = Array.isArray(row?.petIds) ? row.petIds.filter(Boolean) : [];
    const quantity = Math.max(1, Number(row?.quantity || 0) || pets.length || 1);
    const slotCount = Math.max(quantity, pets.length || 0, 1);
    const price = Number(row?.pricePerDay || row?.total / Math.max(typeof row.numberOfDays === 'number' ? row.numberOfDays : 1, 1));

    return Array.from({ length: slotCount }).map((_, index) => ({
        key: String(pets[index]?._id || pets[index]?.id || `${row?._id || "booking"}-${index}`),
        petName: String(pets[index]?.name || `Thú cưng ${index + 1}`),
        cageLabel: [row?.cageId?.cageCode || "-", slotCount > 1 ? `Phòng ${index + 1}` : ""].filter(Boolean).join(" - "),
        petAvatar: pets[index]?.avatar,
        price
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

    const updateStatusMutation = useMutation({
        mutationFn: (data: { id: string; boardingStatus: string }) => updateBoardingBookingStatus(data.id, data.boardingStatus),
        onSuccess: () => {
            toast.success("Cập nhật trạng thái thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        }
    });

    const handleStatusUpdate = (id: string, status: string, label: string) => {
        if (window.confirm(`Xác nhận chuyển đơn sang trạng thái ${label}?`)) {
            updateStatusMutation.mutate({ id, boardingStatus: status });
        }
    };




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
                        { value: "all", label: "Tất cả", color: "var(--palette-common-white)", bg: "var(--palette-grey-800)" },
                        { value: "pending", label: "Chờ xử lý", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)" },
                        { value: "held", label: "Giữ chỗ", color: "var(--palette-primary-dark)", bg: "var(--palette-primary-lighter)" },
                        { value: "confirmed", label: "Đã xác nhận", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)" },
                        { value: "checked-in", label: "Nhận chuồng", color: "var(--palette-success-dark)", bg: "var(--palette-success-lighter)" },
                        { value: "checked-out", label: "Trả chuồng", color: "var(--palette-secondary-dark)", bg: "var(--palette-secondary-lighter)" },
                        { value: "cancelled", label: "Đã hủy", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)" },
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
                                <TableCell sx={{ borderBottom: "none", width: 120 }} align="right" />
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
                                                    <Stack spacing={1} sx={{ mt: 1 }}>
                                                        {row.items?.length > 0
                                                            ? row.items.slice(0, 3).map((item: any, idx: number) => {
                                                                const pet = Array.isArray(item.petIds) && item.petIds.length > 0
                                                                    ? item.petIds[0]
                                                                    : (item.petId || row.petIds?.[idx]);
                                                                if (!pet) return null;
                                                                return (
                                                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Avatar src={pet.avatar} sx={{ width: 20, height: 20 }} />
                                                                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>{pet.name}</Typography>
                                                                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                                                                            • {item.cageId?.cageCode || row.cageId?.cageCode || "N/A"}
                                                                        </Typography>
                                                                    </Box>
                                                                );
                                                            })
                                                            : row.petIds?.slice(0, 3).map((pet: any, idx: number) => (
                                                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Avatar src={pet.avatar} sx={{ width: 20, height: 20 }} />
                                                                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>{pet.name}</Typography>
                                                                    <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                                                                        • {row.cageId?.cageCode || "N/A"}
                                                                    </Typography>
                                                                </Box>
                                                            ))
                                                        }
                                                    </Stack>
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
                                                        {row.surcharge > 0 && (
                                                            <Typography sx={{ color: "var(--palette-warning-main)", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>
                                                                + Phụ thu trễ
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                        {formatCurrency(row.total)}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    {(() => {
                                                        const status = boardingStatusOptions.find(opt => opt.value === row.boardingStatus) || { label: row.boardingStatus, color: 'inherit', bg: 'transparent' };
                                                        return (
                                                            <Chip
                                                                label={status.label}
                                                                size="small"
                                                                sx={{
                                                                    borderRadius: "var(--shape-borderRadius-sm)",
                                                                    fontWeight: 700,
                                                                    fontSize: '0.6875rem',
                                                                    color: status.color,
                                                                    bgcolor: status.bg,
                                                                    height: '24px'
                                                                }}
                                                            />
                                                        );
                                                    })()}
                                                </TableCell>

                                                <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)", width: 120 }}>
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <IconButton
                                                            onClick={(event) => handleOpenMenu(event, row._id)}
                                                            sx={{
                                                                color: "var(--palette-text-primary)",
                                                                bgcolor: Boolean(anchorEl[row._id]) ? "var(--palette-action-hover)" : "transparent",
                                                            }}
                                                        >
                                                            <Icon icon="eva:more-vertical-fill" width={20} />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => toggleRow(row._id)}
                                                            sx={{
                                                                color: "var(--palette-text-primary)",
                                                                bgcolor: isOpen ? "var(--palette-action-hover)" : "transparent",
                                                            }}
                                                        >
                                                            <Icon icon={isOpen ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"} width={20} />
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
                                                                Trả chuồng
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
                                                                        src={item.petAvatar}
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
                                                                            {formatCurrency(item.price)}/ngày
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
