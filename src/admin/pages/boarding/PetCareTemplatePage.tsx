import { useState, useMemo, ChangeEvent } from "react";
import {
    Box, Button, Card, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, IconButton, InputLabel, MenuItem,
    Select, Stack, Tab, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, Tabs, TextField, Tooltip,
    Typography, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import {
    FoodTemplate, ExerciseTemplate,
    getFoodTemplates, createFoodTemplate, updateFoodTemplate, deleteFoodTemplate,
    getExerciseTemplates, createExerciseTemplate, updateExerciseTemplate, deleteExerciseTemplate,
    seedPetCareTemplates,
} from "../../api/pet-care-template.api";

// ─── Constants ────────────────────────────────────────────────────────────────

const PET_TYPE_OPTIONS = [
    { value: "dog", label: "🐶 Chó" },
    { value: "cat", label: "🐱 Mèo" },
    { value: "all", label: "🐾 Tất cả" },
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

const intensityColor = (v: string) =>
    v === "high" ? "error" : v === "medium" ? "warning" : "success";

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

    const { data, isLoading } = useQuery({
        queryKey: ["food-templates"],
        queryFn: () => getFoodTemplates(),
    });

    const items: FoodTemplate[] = useMemo(() => {
        const list: FoodTemplate[] = (data as any)?.data || [];
        return list.filter((item) => {
            const matchPet = filterPet === "all" || item.petType === filterPet || item.petType === "all";
            const q = search.trim().toLowerCase();
            const matchQ = !q || item.name.toLowerCase().includes(q) || (item.group || "").toLowerCase().includes(q) || (item.brand || "").toLowerCase().includes(q);
            return matchPet && matchQ;
        });
    }, [data, filterPet, search]);

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

    const openCreate = () => { setEditId(null); setForm(emptyFood()); setDialogOpen(true); };
    const openEdit = (item: FoodTemplate) => { setEditId(item._id); setForm({ ...item }); setDialogOpen(true); };

    const paged = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            {/* Filter bar */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <TextField
                    size="small" placeholder="Tìm theo tên, nhóm, thương hiệu..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    sx={{ minWidth: 260 }}
                />
                <Tabs value={filterPet} onChange={(_e, v) => { setFilterPet(v); setPage(0); }} sx={{ "& .MuiTab-root": { minHeight: 38, py: 0.5 } }}>
                    <Tab value="all" label="Tất cả" />
                    <Tab value="dog" label="🐶 Chó" />
                    <Tab value="cat" label="🐱 Mèo" />
                </Tabs>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Thêm thức ăn</Button>
            </Stack>

            <TableContainer>
                <Table size="small">
                    <TableHead sx={{ bgcolor: "var(--palette-background-neutral)" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Tên thức ăn</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Nhóm</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Dành cho</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Thương hiệu</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Tuổi</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                        ) : paged.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>Không có dữ liệu</TableCell></TableRow>
                        ) : paged.map((item) => (
                            <TableRow key={item._id} hover>
                                <TableCell>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.name}</Typography>
                                    {item.description && <Typography variant="caption" sx={{ color: "text.secondary" }}>{item.description}</Typography>}
                                </TableCell>
                                <TableCell><Chip label={item.group} size="small" /></TableCell>
                                <TableCell>{petTypeLabel(item.petType)}</TableCell>
                                <TableCell>{item.brand || <span style={{ color: "#aaa" }}>—</span>}</TableCell>
                                <TableCell>{AGE_GROUP_OPTIONS.find(a => a.value === item.ageGroup)?.label || item.ageGroup}</TableCell>
                                <TableCell>
                                    <Chip label={item.isActive ? "Hiển thị" : "Ẩn"} color={item.isActive ? "success" : "default"} size="small" />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Sửa"><IconButton size="small" onClick={() => openEdit(item)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                                    <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => { if (confirm(`Xóa "${item.name}"?`)) deleteMut.mutate(item._id); }}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[15, 30, 50]} component="div" count={items.length}
                rowsPerPage={rowsPerPage} page={page}
                onPageChange={(_e, p) => setPage(p)}
                onRowsPerPageChange={(e: ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />

            {/* Create / Edit Dialog */}
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
                        {saveMut.isPending ? "Đang lưu..." : "Lưu"}
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

    const { data, isLoading } = useQuery({
        queryKey: ["exercise-templates"],
        queryFn: () => getExerciseTemplates(),
    });

    const items: ExerciseTemplate[] = useMemo(() => {
        const list: ExerciseTemplate[] = (data as any)?.data || [];
        return list.filter((item) => {
            const matchPet = filterPet === "all" || item.petType === filterPet || item.petType === "all";
            const q = search.trim().toLowerCase();
            return matchPet && (!q || item.name.toLowerCase().includes(q));
        });
    }, [data, filterPet, search]);

    const saveMut = useMutation({
        mutationFn: editId
            ? (body: Partial<ExerciseTemplate>) => updateExerciseTemplate(editId, body)
            : (body: Partial<ExerciseTemplate>) => createExerciseTemplate(body),
        onSuccess: () => {
            toast.success(editId ? "Đã cập nhật" : "Đã thêm mới");
            queryClient.invalidateQueries({ queryKey: ["exercise-templates"] });
            setDialogOpen(false);
        },
        onError: (e: any) => toast.error(e?.response?.data?.message || "Lỗi"),
    });

    const deleteMut = useMutation({
        mutationFn: deleteExerciseTemplate,
        onSuccess: () => {
            toast.success("Đã xóa");
            queryClient.invalidateQueries({ queryKey: ["exercise-templates"] });
        },
        onError: (e: any) => toast.error(e?.response?.data?.message || "Lỗi"),
    });

    const openCreate = () => { setEditId(null); setForm(emptyExercise()); setDialogOpen(true); };
    const openEdit = (item: ExerciseTemplate) => { setEditId(item._id); setForm({ ...item }); setDialogOpen(true); };

    const paged = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <TextField
                    size="small" placeholder="Tìm theo tên hoạt động..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    sx={{ minWidth: 260 }}
                />
                <Tabs value={filterPet} onChange={(_e, v) => { setFilterPet(v); setPage(0); }} sx={{ "& .MuiTab-root": { minHeight: 38, py: 0.5 } }}>
                    <Tab value="all" label="Tất cả" />
                    <Tab value="dog" label="🐶 Chó" />
                    <Tab value="cat" label="🐱 Mèo" />
                </Tabs>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Thêm hoạt động</Button>
            </Stack>

            <TableContainer>
                <Table size="small">
                    <TableHead sx={{ bgcolor: "var(--palette-background-neutral)" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Tên hoạt động</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Dành cho</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Cường độ</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                        ) : paged.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>Không có dữ liệu</TableCell></TableRow>
                        ) : paged.map((item) => (
                            <TableRow key={item._id} hover>
                                <TableCell>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.name}</Typography>
                                    {item.description && <Typography variant="caption" sx={{ color: "text.secondary" }}>{item.description}</Typography>}
                                </TableCell>
                                <TableCell>{petTypeLabel(item.petType)}</TableCell>
                                <TableCell>{item.durationMinutes > 0 ? `${item.durationMinutes} phút` : <span style={{ color: "#aaa" }}>—</span>}</TableCell>
                                <TableCell>
                                    <Chip label={INTENSITY_OPTIONS.find(o => o.value === item.intensity)?.label || item.intensity}
                                        color={intensityColor(item.intensity) as any} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip label={item.isActive ? "Hiển thị" : "Ẩn"} color={item.isActive ? "success" : "default"} size="small" />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Sửa"><IconButton size="small" onClick={() => openEdit(item)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                                    <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => { if (confirm(`Xóa "${item.name}"?`)) deleteMut.mutate(item._id); }}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[15, 30, 50]} component="div" count={items.length}
                rowsPerPage={rowsPerPage} page={page}
                onPageChange={(_e, p) => setPage(p)}
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
                        <TextField label="Thời gian (phút)" type="number" value={form.durationMinutes ?? 20}
                            onChange={(e) => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} fullWidth />
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
                    <Button variant="contained" disabled={saveMut.isPending || !form.name} onClick={() => saveMut.mutate(form)}>
                        {saveMut.isPending ? "Đang lưu..." : "Lưu"}
                    </Button>
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
        onError: (e: any) => toast.error(e?.response?.data?.message || "Lỗi seed"),
    });

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                <Box>
                    <Title title="Danh mục Thức ăn & Vận động" />
                    <Breadcrumb items={[
                        { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                        { label: "Khách sạn thú cưng", to: `/${prefixAdmin}/boarding` },
                        { label: "Danh mục Thức ăn & Vận động" },
                    ]} />
                </Box>
                <Tooltip title="Tự động thêm dữ liệu mẫu Việt Nam (chỉ thêm, không ghi đè)">
                    <Button
                        variant="outlined"
                        startIcon={seedMut.isPending ? <CircularProgress size={16} /> : <CloudSyncIcon />}
                        onClick={() => seedMut.mutate()}
                        disabled={seedMut.isPending}
                    >
                        {seedMut.isPending ? "Đang seed..." : "Seed dữ liệu mẫu VN"}
                    </Button>
                </Tooltip>
            </Box>

            <Card sx={{ borderRadius: "var(--shape-borderRadius-lg)", boxShadow: "var(--customShadows-card)", overflow: "hidden" }}>
                <Box sx={{ px: 3, pt: 2, borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Icon icon="solar:bowl-spoon-bold" width={24} color="var(--palette-primary-main)" />
                        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ "& .MuiTab-root": { fontWeight: 700 } }}>
                            <Tab label="🥣 Thức ăn" />
                            <Tab label="🏃 Vận động" />
                        </Tabs>
                    </Stack>
                </Box>
                <Box sx={{ p: 3 }}>
                    {tab === 0 && <FoodTab />}
                    {tab === 1 && <ExerciseTab />}
                </Box>
            </Card>
        </Box>
    );
};
