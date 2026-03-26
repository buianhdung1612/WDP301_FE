import { ChangeEvent, MouseEvent, SyntheticEvent, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
    TextField,
    Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { Search } from "../../components/ui/Search";
import { createBoardingCage, deleteBoardingCage, getBoardingCages, updateBoardingCage } from "../../api/boarding-cage.api";
import { confirmDelete } from "../../utils/swal";

const trangThaiChuongOptions = [
    { value: "available", label: "Sẵn sàng" },
    { value: "occupied", label: "Đang sử dụng" },
    { value: "maintenance", label: "Bảo trì" },
    { value: "under-cleaning", label: "Đang dọn dẹp" },
];

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

const getCageStatusMeta = (status?: string) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
        available: { label: "Sẵn sàng", color: "var(--palette-success-dark)", bg: "var(--palette-success-lighter)" },
        occupied: { label: "Đang sử dụng", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)" },
        maintenance: { label: "Bảo trì", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)" },
        "under-cleaning": { label: "Đang dọn dẹp", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)" },
    };
    return map[String(status || "")] || { label: status || "-", color: "var(--palette-text-disabled)", bg: "var(--palette-background-neutral)" };
};

const kichThuocChuongOptions = [
    {
        value: "S",
        label: "Size S (Nhỏ)",
        dimensions: "50 x 35 x 35 cm hoặc 60 x 42 x 50 cm",
        weightRange: "Chỉ dành cho thú cưng dưới 8kg",
    },
    {
        value: "M",
        label: "Size M (Trung)",
        dimensions: "63 x 43 x 53 cm hoặc 74 x 49 x 56 cm",
        weightRange: "Chỉ dành cho thú cưng từ 8-15kg",
    },
    {
        value: "L",
        label: "Size L (Lớn)",
        dimensions: "83 x 63 x 63 cm hoặc 96 x 65 x 82 cm",
        weightRange: "Chỉ dành cho thú cưng từ 15-20kg",
    },
    {
        value: "XL_XXL",
        label: "Size XL/XXL (Đại)",
        dimensions: "105 x 85 x 100 cm đến 170 x 125 x 130 cm",
        weightRange: "Chỉ dành cho thú cưng trên 20kg",
    },
];

const legacySizeMap: Record<string, string> = {
    C: "S",
    B: "M",
    A: "L",
    XL: "XL_XXL",
    XXL: "XL_XXL",
};

const normalizeCageSize = (value?: string) => {
    const raw = String(value || "").trim().toUpperCase();
    if (!raw) return "M";
    return legacySizeMap[raw] || raw;
};

const getSizeConfig = (value?: string) => {
    const normalized = normalizeCageSize(value);
    return kichThuocChuongOptions.find((item) => item.value === normalized);
};

const getSizeLabel = (value?: string) => {
    const config = getSizeConfig(value);
    return config ? config.label : String(value || "-");
};

const parseAmenities = (value: string) => {
    const parts = String(value || "")
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    return Array.from(new Set(parts));
};

const parseGalleryUrls = (value: string) => {
    const parts = (String(value || "").match(/https?:\/\/\S+/gi) || [])
        .map((item) => item.trim().replace(/[),;]+$/g, ""))
        .filter((item) => /^https?:\/\//i.test(item));
    return Array.from(new Set(parts));
};

const initForm = {
    cageCode: "",
    type: "standard",
    size: "M",
    dailyPrice: 0,
    maxWeightCapacity: 0,
    status: "available",
    avatar: "",
    galleryText: "",
    description: "",
    amenitiesText: "",
};

export const BoardingCageListPage = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [tabStatus, setTabStatus] = useState("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState<string[]>([]);
    const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(initForm);
    const selectedSizeConfig = useMemo(() => getSizeConfig(form.size) || kichThuocChuongOptions[1], [form.size]);

    const filters = useMemo(() => ({
        page: page + 1,
        limit: rowsPerPage,
        status: tabStatus === "all" ? undefined : tabStatus,
        search: searchQuery || undefined,
    }), [page, rowsPerPage, tabStatus, searchQuery]);

    const { data: res, isLoading } = useQuery({
        queryKey: ["admin-boarding-cages", filters],
        queryFn: () => getBoardingCages(filters),
    });

    const cages = useMemo(() => (Array.isArray(res?.data?.recordList) ? res.data.recordList : []), [res]);
    const pagination = res?.data?.pagination || { totalRecords: 0 };

    const statusCounts = useMemo(() => {
        const total = pagination.totalRecords || 0;
        return {
            all: tabStatus === "all" ? total : 0,
            available: tabStatus === "available" ? total : 0,
            occupied: tabStatus === "occupied" ? total : 0,
            maintenance: tabStatus === "maintenance" ? total : 0,
            "under-cleaning": tabStatus === "under-cleaning" ? total : 0,
        };
    }, [pagination.totalRecords, tabStatus]);

    const createMut = useMutation({
        mutationFn: createBoardingCage,
        onSuccess: () => {
            toast.success("T?o chu?ng th�nh c�ng");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-cages"] });
            setOpen(false);
            setForm(initForm);
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => updateBoardingCage(id, payload),
        onSuccess: () => {
            toast.success("C?p nh?t chu?ng th�nh c�ng");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-cages"] });
            setOpen(false);
            setEditing(null);
            setForm(initForm);
        },
    });

    const deleteMut = useMutation({
        mutationFn: deleteBoardingCage,
        onSuccess: () => {
            toast.success("X�a chu?ng th�nh c�ng");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-cages"] });
        },
    });

    const handleOpenCreate = () => {
        setEditing(null);
        setForm(initForm);
        setOpen(true);
    };

    const handleOpenEdit = (row: any) => {
        setEditing(row);
        setForm({
            cageCode: row.cageCode || "",
            type: row.type || "standard",
            size: normalizeCageSize(row.size),
            dailyPrice: row.dailyPrice || 0,
            maxWeightCapacity: row.maxWeightCapacity || 0,
            status: row.status || "available",
            avatar: row.avatar || "",
            galleryText: Array.isArray(row.gallery) ? row.gallery.join("\n") : "",
            description: row.description || "",
            amenitiesText: Array.isArray(row.amenities) ? row.amenities.join(", ") : "",
        });
        setOpen(true);
    };

    const handleSave = () => {
        if (!form.cageCode) return toast.error("Vui l�ng nh?p m� chu?ng");
        const payload = {
            ...form,
            size: normalizeCageSize(form.size),
            amenities: parseAmenities(form.amenitiesText),
            gallery: parseGalleryUrls(form.galleryText),
        };
        delete payload.amenitiesText;
        delete payload.galleryText;

        if (editing?._id) {
            updateMut.mutate({ id: editing._id, payload });
        } else {
            createMut.mutate(payload);
        }
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
            setSelected(cages.map((row: any) => row._id));
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

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                    <Title title="Quản lý chuồng khách sạn" />
                    <Breadcrumb items={[
                        { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                        { label: "Quản lý chuồng khách sạn" },
                    ]} />
                </Box>
                <Button
                    variant="contained"
                    onClick={handleOpenCreate}
                    startIcon={<Icon icon="eva:plus-fill" />}
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
                    Tạo chuồng mới
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
                        { value: "available", label: "Sẵn sàng", color: "var(--palette-success-dark)", bg: "var(--palette-success-lighter)", activeColor: "var(--palette-success-contrastText)", activeBg: "var(--palette-success-main)" },
                        { value: "occupied", label: "Đang sử dụng", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)", activeColor: "var(--palette-warning-contrastText)", activeBg: "var(--palette-warning-main)" },
                        { value: "maintenance", label: "Bảo trì", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)", activeColor: "var(--palette-error-contrastText)", activeBg: "var(--palette-error-main)" },
                        { value: "under-cleaning", label: "Đang dọn dẹp", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)", activeColor: "var(--palette-info-contrastText)", activeBg: "var(--palette-info-main)" },
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
                                "&.Mui-selected": { color: "var(--palette-text-primary)" },
                            }}
                        />
                    ))}
                </Tabs>

                <Box sx={{ p: "20px", display: "flex", alignItems: "center", gap: 2, borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                    <Search placeholder="Tìm theo mã chuồng hoặc mã t..." value={searchQuery} onChange={handleSearchChange} maxWidth="24rem" />
                </Box>

                <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                    <Table sx={{ minWidth: 1080 }}>
                        <TableHead sx={{ bgcolor: "var(--palette-background-neutral)" }}>
                            <TableRow>
                                <TableCell padding="checkbox" sx={{ borderBottom: "none", textAlign: "center" }}>
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < cages.length}
                                        checked={cages.length > 0 && selected.length === cages.length}
                                        onChange={handleSelectAllClick}
                                        sx={{ color: "var(--palette-text-disabled)", p: 0 }}
                                    />
                                </TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Mã chuồng</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Loại</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Kích thước</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Giá/ngày</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Tiện nghi</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }} align="right">Trạng thái</TableCell>
                                <TableCell sx={{ borderBottom: "none", width: 80 }} align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                        <Typography sx={{ color: "var(--palette-text-secondary)" }}>Đang tải dữ liệu...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : cages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                        <Typography sx={{ color: "var(--palette-text-secondary)" }}>Không có dữ liệu</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cages
                                    .map((row: any) => {
                                        const isItemSelected = selected.indexOf(row._id) !== -1;
                                        const statusMeta = getCageStatusMeta(row.status);
                                        const amenities = Array.isArray(row.amenities) ? row.amenities : [];
                                        return (
                                            <TableRow
                                                key={row._id}
                                                hover
                                                selected={isItemSelected}
                                                sx={{ "&:hover": { bgcolor: "var(--palette-action-hover)" }, transition: "background-color 0.2s" }}
                                            >
                                                <TableCell padding="checkbox" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)", textAlign: "center" }}>
                                                    <Checkbox
                                                        checked={isItemSelected}
                                                        onClick={() => handleSelectRow(row._id)}
                                                        sx={{ color: "var(--palette-text-disabled)", p: 0 }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Avatar src={row.avatar || (Array.isArray(row.gallery) ? row.gallery[0] : "")} variant="rounded" sx={{ width: 38, height: 38 }}>
                                                            <Icon icon="mdi:dog-side" width={18} />
                                                        </Avatar>
                                                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                            {row.cageCode || "-"}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                        {String(row.type || "standard").toUpperCase()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                        {getSizeLabel(row.size)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                        {Number(row.dailyPrice || 0).toLocaleString("vi-VN")}d
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.8125rem" }}>
                                                        {amenities.length ? amenities.slice(0, 3).join(", ") : "Chưa cập nhật"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            px: 1,
                                                            height: "24px",
                                                            borderRadius: "var(--shape-borderRadius-sm)",
                                                            fontWeight: 700,
                                                            fontSize: "0.6875rem",
                                                            color: statusMeta.color,
                                                            bgcolor: statusMeta.bg,
                                                        }}
                                                    >
                                                        {statusMeta.label}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)", width: 80 }}>
                                                    <IconButton
                                                        onClick={(event) => handleOpenMenu(event, row._id)}
                                                        sx={{
                                                            color: "var(--palette-text-primary)",
                                                            "&:hover": {
                                                                bgcolor: "rgba(var(--palette-action-activeChannel) / var(--palette-action-hoverOpacity))",
                                                            },
                                                        }}
                                                    >
                                                        <Icon icon="eva:more-vertical-fill" width={20} />
                                                    </IconButton>
                                                    <Menu
                                                        anchorEl={anchorEl[row._id]}
                                                        open={Boolean(anchorEl[row._id])}
                                                        onClose={() => handleCloseMenu(row._id)}
                                                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                                                        slotProps={{
                                                            paper: {
                                                                sx: {
                                                                    width: 160,
                                                                    boxShadow: "var(--customShadows-z20)",
                                                                    borderRadius: "var(--shape-borderRadius-md)",
                                                                    p: 0.5,
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem onClick={() => { handleCloseMenu(row._id); handleOpenEdit(row); }}>
                                                            <Icon icon="solar:pen-bold" width={18} style={{ marginRight: 8 }} />
                                                            Sửa
                                                        </MenuItem>

                                                        {row.status === "under-cleaning" && (
                                                            <MenuItem
                                                                onClick={() => {
                                                                    handleCloseMenu(row._id);
                                                                    updateMut.mutate({ id: row._id, payload: { status: "available" } });
                                                                }}
                                                                sx={{ color: "var(--palette-success-main)" }}
                                                            >
                                                                <Icon icon="solar:washing-machine-minimalistic-bold" width={18} style={{ marginRight: 8 }} />
                                                                Hoàn tất dọn dẹp
                                                            </MenuItem>
                                                        )}
                                                        <MenuItem
                                                            onClick={() => {
                                                                handleCloseMenu(row._id);
                                                                confirmDelete("Bạn có chắc muốn xóa chuồng này?", () => deleteMut.mutate(row._id));
                                                            }}
                                                            sx={{ color: "var(--palette-error-main)" }}
                                                        >
                                                            <Icon icon="solar:trash-bin-trash-bold" width={18} style={{ marginRight: 8 }} />
                                                            Xóa
                                                        </MenuItem>
                                                    </Menu>
                                                </TableCell>
                                            </TableRow>
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

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? "Sửa thông tin chuồng" : "Tạo chuồng mới"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Mã chuồng" value={form.cageCode} onChange={(e) => setForm({ ...form, cageCode: e.target.value })} />
                        <TextField select label="Loại chuồng" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                            <MenuItem value="standard">Tiêu chuẩn</MenuItem>
                            <MenuItem value="vip">VIP</MenuItem>
                        </TextField>
                        <TextField select label="Kích thước" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
                            {kichThuocChuongOptions.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Box sx={{ mt: -1, px: 1.5, py: 1.25, borderRadius: 1.5, backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#9a3412", mb: 0.5 }}>
                                Công thức size gợi ý ({selectedSizeConfig.label})
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: "#9a3412" }}>
                                Dài x Rộng x Cao: {selectedSizeConfig.dimensions}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: "#9a3412" }}>
                                Cân nặng phù hợp: {selectedSizeConfig.weightRange}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#9a3412", mt: 0.5 }}>
                                Lưu ý: chiều dài chuồng nên lớn hơn chiều dài thân thú cưng 10-15cm để thú thoải mái.
                            </Typography>
                        </Box>
                        <TextField type="number" label="Giá/ngày" value={form.dailyPrice} onChange={(e) => setForm({ ...form, dailyPrice: Number(e.target.value) || 0 })} />
                        <TextField type="number" label="Tối đa (kg)" value={form.maxWeightCapacity} onChange={(e) => setForm({ ...form, maxWeightCapacity: Number(e.target.value) || 0 })} />
                        <TextField select label="Trạng thái" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                            {trangThaiChuongOptions.map((item) => (
                                <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Ảnh (URL)" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
                        <TextField
                            label="Bộ ảnh chuồng (nhiều URL)"
                            multiline
                            rows={3}
                            value={form.galleryText}
                            onChange={(e) => setForm({ ...form, galleryText: e.target.value })}
                            placeholder="Mỗi dòng 1 URL ảnh chuồng cho mỗi hoặc ngăn cách bằng dấu phẩy"
                            helperText="Ảnh trong bộ này sẽ hiện thị ở trang chi tiết chuồng."
                        />
                        <TextField label="Mô tả" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        <TextField
                            label="Tiện nghi trong chuồng"
                            multiline
                            rows={2}
                            value={form.amenitiesText}
                            onChange={(e) => setForm({ ...form, amenitiesText: e.target.value })}
                            placeholder="Ví dụ: Nệm, bát ăn, bát nước, camera, đồ chơi..."
                            helperText="Nhập nhiều tiện nghi, cách nhau bởi dấu phẩy hoặc xuống dòng."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Hủy</Button>
                    <Button onClick={handleSave} variant="contained" disabled={createMut.isPending || updateMut.isPending}>
                        {editing ? "Lưu" : "Tạo"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};






