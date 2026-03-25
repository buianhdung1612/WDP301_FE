import { useState, useMemo, ChangeEvent } from "react";
import {
    Box, Button, Card, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, IconButton, InputLabel, MenuItem,
    Select, Stack, Tab, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, Tabs, TextField,
    Typography, CircularProgress, styled, Menu,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import { MouseEvent } from "react";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { Search } from "../../components/ui/Search";
import {
    FoodTemplate, ExerciseTemplate,
    getFoodTemplates, createFoodTemplate, updateFoodTemplate, deleteFoodTemplate,
    getExerciseTemplates, createExerciseTemplate, updateExerciseTemplate, deleteExerciseTemplate,
    seedPetCareTemplates,
} from "../../api/pet-care-template.api";
import { confirmDelete } from "../../utils/swal";

// ─── Constants ────────────────────────────────────────────────────────────────

const PET_TYPE_OPTIONS = [
    { value: "dog", label: "Chó", icon: "🐶" },
    { value: "cat", label: "Mèo", icon: "🐱" },
    { value: "all", label: "Tất cả", icon: "🐾" },
];

const AGE_GROUP_OPTIONS = [
    { value: "puppy", label: "Con non (Puppy/Kitten)" },
    { value: "adult", label: "Trưởng thành (Adult)" },
    { value: "senior", label: "Cao tuổi (Senior)" },
    { value: "all", label: "Tất cả độ tuổi" },
];

const INTENSITY_OPTIONS = [
    { value: "low", label: "Nhẹ nhàng" },
    { value: "medium", label: "Vừa phải" },
    { value: "high", label: "Cường độ cao" },
];

const FOOD_GROUP_OPTIONS = ["Hạt khô", "Pate / Ướt", "Thức ăn tươi", "Snack", "Đặc biệt", "Tự cung cấp"];

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

const getPetTypeConfig = (type: string) => {
    if (type === "dog") return { label: "Chó", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)" };
    if (type === "cat") return { label: "Mèo", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)" };
    return { label: "Tất cả", color: "var(--palette-grey-800)", bg: "var(--palette-grey-200)" };
};

const intensityColor = (v: string) => {
    if (v === "high") return { color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)" };
    if (v === "medium") return { color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)" };
    return { color: "var(--palette-success-dark)", bg: "var(--palette-success-lighter)" };
};

const petTypeLabel = (v: string) =>
    v === "dog" ? "🐶 Chó" : v === "cat" ? "🐱 Mèo" : "🐾 Tất cả";

// ─── FoodTab ─────────────────────────────────────────────────────────────────

const emptyFood = (): Partial<FoodTemplate> => ({
    name: "", group: "Hạt khô", petType: "dog", brand: "", ageGroup: "all", description: "", isActive: true,
});

function FoodTab() {
    const queryClient = useQueryClient();
    const [filterPet, setFilterPet] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [form, setForm] = useState<Partial<FoodTemplate>>(emptyFood());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

    const handleOpenMenu = (event: MouseEvent<HTMLElement>, id: string) => {
        setAnchorEl((prev) => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleCloseMenu = (id: string) => {
        setAnchorEl((prev) => ({ ...prev, [id]: null }));
    };

    const { data, isLoading } = useQuery({
        queryKey: ["food-templates"],
        queryFn: () => getFoodTemplates(),
    });

    const allItems: FoodTemplate[] = useMemo(() => (data as any)?.data || [], [data]);

    const items = useMemo(() => {
        return allItems.filter((item) => {
            const matchPet = filterPet === "all" || item.petType === filterPet;
            const q = search.trim().toLowerCase();
            const matchQ = !q || item.name.toLowerCase().includes(q) || (item.group || "").toLowerCase().includes(q) || (item.brand || "").toLowerCase().includes(q);
            return matchPet && matchQ;
        });
    }, [allItems, filterPet, search]);

    const counts = useMemo(() => ({
        all: allItems.length,
        dog: allItems.filter(i => i.petType === "dog").length,
        cat: allItems.filter(i => i.petType === "cat").length,
    }), [allItems]);

    const saveMut = useMutation({
        mutationFn: editId
            ? (body: Partial<FoodTemplate>) => updateFoodTemplate(editId, body)
            : (body: Partial<FoodTemplate>) => createFoodTemplate(body),
        onSuccess: () => {
            toast.success(editId ? "Đã cập nhật" : "Đã thêm mới");
            queryClient.invalidateQueries({ queryKey: ["food-templates"] });
            setDialogOpen(false);
        },
        onError: (e: any) => toast.error(e?.response?.data?.message || "Lỗi"),
    });

    const deleteMut = useMutation({
        mutationFn: deleteFoodTemplate,
        onSuccess: () => {
            toast.success("Đã xóa");
            queryClient.invalidateQueries({ queryKey: ["food-templates"] });
        },
        onError: (e: any) => toast.error(e?.response?.data?.message || "Lỗi"),
    });

    const paged = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            {/* Filter Tabs */}
            <Tabs
                value={filterPet}
                onChange={(_e, v) => { setFilterPet(v); setPage(0); }}
                sx={{
                    px: "20px",
                    minHeight: "48px",
                    borderBottom: "1px solid var(--palette-background-neutral)",
                    "& .MuiTabs-flexContainer": { gap: "calc(4 * var(--spacing))" },
                    "& .MuiTabs-indicator": { backgroundColor: "var(--palette-text-primary)", height: 2 },
                }}
            >
                {PET_TYPE_OPTIONS.map((opt) => {
                    const cfg = getPetTypeConfig(opt.value);
                    const isActive = filterPet === opt.value;
                    return (
                        <Tab
                            key={opt.value}
                            value={opt.value}
                            disableRipple
                            label={(
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: isActive ? 700 : 500 }}>
                                        {opt.icon} {opt.label}
                                    </Typography>
                                    <TabBadge sx={{ bgcolor: isActive ? "var(--palette-text-primary)" : cfg.bg, color: isActive ? "var(--palette-common-white)" : cfg.color }}>
                                        {counts[opt.value as keyof typeof counts]}
                                    </TabBadge>
                                </Box>
                            )}
                            sx={{ minWidth: 0, padding: 0, minHeight: "48px", textTransform: "none" }}
                        />
                    );
                })}
            </Tabs>

            <Box sx={{ p: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                <Search placeholder="Tìm theo tên, nhóm, thương hiệu..." value={search} onChange={(v) => { setSearch(v); setPage(0); }} maxWidth="24rem" />
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setForm(emptyFood()); setDialogOpen(true); }}
                    sx={{ bgcolor: "var(--palette-text-primary)", fontWeight: 700, borderRadius: "var(--shape-borderRadius)" }}>
                    Thêm thức ăn
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: "var(--palette-background-neutral)" }}>
                        <TableRow>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Tên thức ăn</TableCell>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Nhóm</TableCell>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Dành cho</TableCell>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Thương hiệu</TableCell>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Tuổi</TableCell>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Trạng thái</TableCell>
                            <TableCell sx={{ width: 80 }} align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                        ) : paged.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>Không có dữ liệu</TableCell></TableRow>
                        ) : paged.map((item) => (
                            <TableRow key={item._id} hover>
                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.name}</Typography>
                                    {item.description && <Typography variant="caption" sx={{ color: "text.secondary" }}>{item.description}</Typography>}
                                </TableCell>
                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                    <Chip label={item.group} size="small" sx={{ bgcolor: "var(--palette-background-neutral)", color: "var(--palette-text-secondary)", fontWeight: 600 }} />
                                </TableCell>
                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>{petTypeLabel(item.petType)}</TableCell>
                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>{item.brand || <span style={{ color: "#aaa" }}>—</span>}</TableCell>
                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>{AGE_GROUP_OPTIONS.find(a => a.value === item.ageGroup)?.label || item.ageGroup}</TableCell>
                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                    <Box component="span" sx={{
                                        px: 1, py: 0.5, borderRadius: 0.75, fontSize: "0.75rem", fontWeight: 700,
                                        bgcolor: item.isActive ? "var(--palette-success-lighter)" : "var(--palette-grey-200)",
                                        color: item.isActive ? "var(--palette-success-dark)" : "var(--palette-grey-600)"
                                    }}>
                                        {item.isActive ? "Hiển thị" : "Ẩn"}
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)", width: 80 }}>
                                    <IconButton
                                        onClick={(e) => handleOpenMenu(e, item._id)}
                                        sx={{ color: "var(--palette-text-primary)" }}
                                    >
                                        <Icon icon="eva:more-vertical-fill" width={20} />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl[item._id]}
                                        open={Boolean(anchorEl[item._id])}
                                        onClose={() => handleCloseMenu(item._id)}
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
                                        <MenuItem onClick={() => { handleCloseMenu(item._id); setEditId(item._id); setForm({ ...item }); setDialogOpen(true); }}>
                                            <Icon icon="solar:pen-bold" width={18} style={{ marginRight: 8 }} />
                                            Sửa
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => {
                                                handleCloseMenu(item._id);
                                                confirmDelete(`Xóa "${item.name}"?`, () => deleteMut.mutate(item._id));
                                            }}
                                            sx={{ color: "var(--palette-error-main)" }}
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold" width={18} style={{ marginRight: 8 }} />
                                            Xóa
                                        </MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[15, 30, 50]} component="div" count={items.length}
                rowsPerPage={rowsPerPage} page={page} onPageChange={(_e, p) => setPage(p)}
                onRowsPerPageChange={(e: ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />

            {/* Dialog - Giữ nguyên logic cũ */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Cập nhật thức ăn" : "Thêm thức ăn mới"}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="Tên thức ăn *" value={form.name || ""} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} fullWidth />
                        <FormControl fullWidth size="small">
                            <InputLabel>Nhóm *</InputLabel>
                            <Select label="Nhóm *" value={form.group || "Hạt khô"} onChange={(e) => setForm(f => ({ ...f, group: e.target.value }))}>
                                {FOOD_GROUP_OPTIONS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Dành cho loài</InputLabel>
                            <Select label="Dành cho loài" value={form.petType || "all"} onChange={(e) => setForm(f => ({ ...f, petType: e.target.value as any }))}>
                                {PET_TYPE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Độ tuổi phù hợp</InputLabel>
                            <Select label="Độ tuổi phù hợp" value={form.ageGroup || "all"} onChange={(e) => setForm(f => ({ ...f, ageGroup: e.target.value as any }))}>
                                {AGE_GROUP_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField label="Thương hiệu" value={form.brand || ""} onChange={(e) => setForm(f => ({ ...f, brand: e.target.value }))} fullWidth />
                        <TextField label="Ghi chú / Mô tả" value={form.description || ""} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
                        <FormControl fullWidth size="small">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select label="Trạng thái" value={form.isActive === false ? "false" : "true"} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.value === "true" }))}>
                                <MenuItem value="true">Hiển thị</MenuItem>
                                <MenuItem value="false">Ẩn</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
                    <Button variant="contained" disabled={saveMut.isPending || !form.name} onClick={() => saveMut.mutate(form)}>
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// ─── ExerciseTab ──────────────────────────────────────────────────────────────

const emptyExercise = (): Partial<ExerciseTemplate> => ({
    name: "", petType: "dog", durationMinutes: 20, intensity: "low", description: "", isActive: true,
});

function ExerciseTab() {
    const queryClient = useQueryClient();
    const [filterPet, setFilterPet] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [form, setForm] = useState<Partial<ExerciseTemplate>>(emptyExercise());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

    const handleOpenMenu = (event: MouseEvent<HTMLElement>, id: string) => {
        setAnchorEl((prev) => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleCloseMenu = (id: string) => {
        setAnchorEl((prev) => ({ ...prev, [id]: null }));
    };

    const { data, isLoading } = useQuery({ queryKey: ["exercise-templates"], queryFn: () => getExerciseTemplates() });

    const allItems: ExerciseTemplate[] = useMemo(() => (data as any)?.data || [], [data]);

    const items = useMemo(() => {
        return allItems.filter((item) => {
            const matchPet = filterPet === "all" || item.petType === filterPet;
            const q = search.trim().toLowerCase();
            return matchPet && (!q || item.name.toLowerCase().includes(q));
        });
    }, [allItems, filterPet, search]);

    const counts = useMemo(() => ({
        all: allItems.length,
        dog: allItems.filter(i => i.petType === "dog").length,
        cat: allItems.filter(i => i.petType === "cat").length,
    }), [allItems]);

    const saveMut = useMutation({
        mutationFn: editId ? (body: Partial<ExerciseTemplate>) => updateExerciseTemplate(editId, body) : (body: Partial<ExerciseTemplate>) => createExerciseTemplate(body),
        onSuccess: () => {
            toast.success(editId ? "Đã cập nhật" : "Đã thêm mới");
            queryClient.invalidateQueries({ queryKey: ["exercise-templates"] });
            setDialogOpen(false);
        },
    });

    const deleteMut = useMutation({
        mutationFn: deleteExerciseTemplate,
        onSuccess: () => {
            toast.success("Đã xóa");
            queryClient.invalidateQueries({ queryKey: ["exercise-templates"] });
        },
    });

    const paged = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            <Tabs
                value={filterPet}
                onChange={(_e, v) => { setFilterPet(v); setPage(0); }}
                sx={{
                    px: "20px",
                    minHeight: "48px",
                    borderBottom: "1px solid var(--palette-background-neutral)",
                    "& .MuiTabs-flexContainer": { gap: "calc(4 * var(--spacing))" },
                    "& .MuiTabs-indicator": { backgroundColor: "var(--palette-text-primary)", height: 2 },
                }}
            >
                {PET_TYPE_OPTIONS.map((opt) => {
                    const cfg = getPetTypeConfig(opt.value);
                    const isActive = filterPet === opt.value;
                    return (
                        <Tab
                            key={opt.value}
                            value={opt.value}
                            disableRipple
                            label={(
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: isActive ? 700 : 500 }}>
                                        {opt.icon} {opt.label}
                                    </Typography>
                                    <TabBadge sx={{ bgcolor: isActive ? "var(--palette-text-primary)" : cfg.bg, color: isActive ? "var(--palette-common-white)" : cfg.color }}>
                                        {counts[opt.value as keyof typeof counts]}
                                    </TabBadge>
                                </Box>
                            )}
                            sx={{ minWidth: 0, padding: 0, minHeight: "48px", textTransform: "none" }}
                        />
                    );
                })}
            </Tabs>

            <Box sx={{ p: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                <Search placeholder="Tìm theo tên hoạt động..." value={search} onChange={(v) => { setSearch(v); setPage(0); }} maxWidth="24rem" />
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setForm(emptyExercise()); setDialogOpen(true); }}
                    sx={{ bgcolor: "var(--palette-text-primary)", fontWeight: 700, borderRadius: "var(--shape-borderRadius)" }}>
                    Thêm hoạt động
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: "var(--palette-background-neutral)" }}>
                        <TableRow>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Tên hoạt động</TableCell>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Dành cho</TableCell>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Thời gian</TableCell>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Cường độ</TableCell>
                            <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Trạng thái</TableCell>
                            <TableCell sx={{ width: 80 }} align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                        ) : paged.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>Không có dữ liệu</TableCell></TableRow>
                        ) : paged.map((item) => {
                            const intens = intensityColor(item.intensity);
                            return (
                                <TableRow key={item._id} hover>
                                    <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.name}</Typography>
                                        {item.description && <Typography variant="caption" sx={{ color: "text.secondary" }}>{item.description}</Typography>}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>{petTypeLabel(item.petType)}</TableCell>
                                    <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>{item.durationMinutes > 0 ? `${item.durationMinutes} phút` : <span style={{ color: "#aaa" }}>—</span>}</TableCell>
                                    <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                        <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 0.75, fontSize: "0.6875rem", fontWeight: 700, bgcolor: intens.bg, color: intens.color }}>
                                            {INTENSITY_OPTIONS.find(o => o.value === item.intensity)?.label || item.intensity}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                        <Box component="span" sx={{
                                            px: 1, py: 0.5, borderRadius: 0.75, fontSize: "0.75rem", fontWeight: 700,
                                            bgcolor: item.isActive ? "var(--palette-success-lighter)" : "var(--palette-grey-200)",
                                            color: item.isActive ? "var(--palette-success-dark)" : "var(--palette-grey-600)"
                                        }}>
                                            {item.isActive ? "Hiển thị" : "Ẩn"}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)", width: 80 }}>
                                        <IconButton
                                            onClick={(e) => handleOpenMenu(e, item._id)}
                                            sx={{ color: "var(--palette-text-primary)" }}
                                        >
                                            <Icon icon="eva:more-vertical-fill" width={20} />
                                        </IconButton>
                                        <Menu
                                            anchorEl={anchorEl[item._id]}
                                            open={Boolean(anchorEl[item._id])}
                                            onClose={() => handleCloseMenu(item._id)}
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
                                            <MenuItem onClick={() => { handleCloseMenu(item._id); setEditId(item._id); setForm({ ...item }); setDialogOpen(true); }}>
                                                <Icon icon="solar:pen-bold" width={18} style={{ marginRight: 8 }} />
                                                Sửa
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {
                                                    handleCloseMenu(item._id);
                                                    confirmDelete(`Xóa "${item.name}"?`, () => deleteMut.mutate(item._id));
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
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[15, 30, 50]} component="div" count={items.length}
                rowsPerPage={rowsPerPage} page={page} onPageChange={(_e, p) => setPage(p)}
                onRowsPerPageChange={(e: ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Cập nhật hoạt động" : "Thêm hoạt động mới"}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="Tên hoạt động *" value={form.name || ""} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} fullWidth />
                        <FormControl fullWidth size="small">
                            <InputLabel>Dành cho loài</InputLabel>
                            <Select label="Dành cho loài" value={form.petType || "all"} onChange={(e) => setForm(f => ({ ...f, petType: e.target.value as any }))}>
                                {PET_TYPE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField label="Thời gian (phút)" type="number" value={form.durationMinutes ?? 20} onChange={(e) => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} fullWidth />
                        <FormControl fullWidth size="small">
                            <InputLabel>Cường độ</InputLabel>
                            <Select label="Cường độ" value={form.intensity || "low"} onChange={(e) => setForm(f => ({ ...f, intensity: e.target.value as any }))}>
                                {INTENSITY_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField label="Ghi chú / Mô tả" value={form.description || ""} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
                        <FormControl fullWidth size="small">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select label="Trạng thái" value={form.isActive === false ? "false" : "true"} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.value === "true" }))}>
                                <MenuItem value="true">Hiển thị</MenuItem>
                                <MenuItem value="false">Ẩn</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
                    <Button variant="contained" disabled={saveMut.isPending || !form.name} onClick={() => saveMut.mutate(form)}>Lưu</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const PetCareTemplatePage = () => {
    const queryClient = useQueryClient();
    const [tab, setTab] = useState(0);

    const seedMut = useMutation({
        mutationFn: seedPetCareTemplates,
        onSuccess: (data: any) => {
            toast.success(data?.message || "Đã seed dữ liệu mẫu");
            queryClient.invalidateQueries({ queryKey: ["food-templates"] });
            queryClient.invalidateQueries({ queryKey: ["exercise-templates"] });
        },
    });

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                    <Title title="Danh mục Thức ăn & Vận động" />
                    <Breadcrumb items={[
                        { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                        { label: "Khách sạn thú cưng", to: `/${prefixAdmin}/boarding` },
                        { label: "Danh mục Thức ăn & Vận động" },
                    ]} />
                </Box>
                <Button
                    variant="outlined"
                    startIcon={seedMut.isPending ? <CircularProgress size={16} /> : <CloudSyncIcon />}
                    onClick={() => seedMut.mutate()}
                    disabled={seedMut.isPending}
                    sx={{ fontWeight: 700, borderRadius: "var(--shape-borderRadius)" }}
                >
                    {seedMut.isPending ? "Đang seed..." : "Seed dữ liệu mẫu VN"}
                </Button>
            </Box>

            <Card sx={{ borderRadius: "var(--shape-borderRadius-lg)", bgcolor: "var(--palette-background-paper)", boxShadow: "var(--customShadows-card)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: "20px", minHeight: "48px", borderBottom: "1px solid var(--palette-background-neutral)", "& .MuiTabs-flexContainer": { gap: "calc(4 * var(--spacing))" }, "& .MuiTabs-indicator": { backgroundColor: "var(--palette-text-primary)", height: 2 } }}>
                    <Tab label="🥣 Thức ăn" sx={{ textTransform: "none", fontWeight: tab === 0 ? 700 : 500, fontSize: "0.875rem" }} />
                    <Tab label="🏃 Vận động" sx={{ textTransform: "none", fontWeight: tab === 1 ? 700 : 500, fontSize: "0.875rem" }} />
                </Tabs>

                <Box sx={{ flexGrow: 1 }}>
                    {tab === 0 && <FoodTab />}
                    {tab === 1 && <ExerciseTab />}
                </Box>
            </Card>
        </Box>
    );
};
