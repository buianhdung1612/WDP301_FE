import { useMemo, useState } from "react";
import {
    Chip,
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { DataGrid, GridActionsCell, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { Search } from "../../components/ui/Search";
import { createBoardingCage, deleteBoardingCage, getBoardingCages, updateBoardingCage } from "../../api/boarding-cage.api";

const trangThaiChuongOptions = [
    { value: "available", label: "Sẵn sàng" },
    { value: "occupied", label: "Đang sử dụng" },
    { value: "maintenance", label: "Bảo trì" },
];

const kichThuocChuongOptions = [
    {
        value: "S",
        label: "Size S (Nhỏ)",
        dimensions: "50 x 35 x 35 cm hoặc 60 x 42 x 50 cm",
        weightRange: "Chó mèo dưới 8kg",
    },
    {
        value: "M",
        label: "Size M (Trung)",
        dimensions: "63 x 43 x 53 cm hoặc 74 x 49 x 56 cm",
        weightRange: "Chó mèo 8-15kg",
    },
    {
        value: "L",
        label: "Size L (Lớn)",
        dimensions: "83 x 63 x 63 cm hoặc 96 x 65 x 82 cm",
        weightRange: "Chó mèo 15-20kg",
    },
    {
        value: "XL_XXL",
        label: "Size XL/XXL (Đại)",
        dimensions: "105 x 85 x 100 cm đến 170 x 125 x 130 cm",
        weightRange: "Chó mèo trên 20kg",
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

const initForm = {
    cageCode: "",
    type: "standard",
    size: "M",
    dailyPrice: 0,
    maxWeightCapacity: 0,
    status: "available",
    avatar: "",
    description: "",
    amenitiesText: "",
};

export const BoardingCageListPage = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(initForm);
    const selectedSizeConfig = useMemo(() => getSizeConfig(form.size) || kichThuocChuongOptions[1], [form.size]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-boarding-cages"],
        queryFn: () => getBoardingCages(),
    });

    const rows = useMemo(() => {
        const list = Array.isArray(data?.data) ? data.data : [];
        if (!search) return list;
        const q = search.toLowerCase();
        return list.filter((item: any) =>
            String(item.cageCode || "").toLowerCase().includes(q) ||
            String(item.description || "").toLowerCase().includes(q)
        );
    }, [data, search]);

    const summary = useMemo(() => {
        const list = Array.isArray(data?.data) ? data.data : [];
        return {
            total: list.length,
            available: list.filter((item: any) => item.status === "available").length,
            occupied: list.filter((item: any) => item.status === "occupied").length,
            maintenance: list.filter((item: any) => item.status === "maintenance").length,
        };
    }, [data]);

    const createMut = useMutation({
        mutationFn: createBoardingCage,
        onSuccess: () => {
            toast.success("Tạo chuồng thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-cages"] });
            setOpen(false);
            setForm(initForm);
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => updateBoardingCage(id, payload),
        onSuccess: () => {
            toast.success("Cập nhật chuồng thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-cages"] });
            setOpen(false);
            setEditing(null);
            setForm(initForm);
        },
    });

    const deleteMut = useMutation({
        mutationFn: deleteBoardingCage,
        onSuccess: () => {
            toast.success("Xóa chuồng thành công");
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
            description: row.description || "",
            amenitiesText: Array.isArray(row.amenities) ? row.amenities.join(", ") : "",
        });
        setOpen(true);
    };

    const handleSave = () => {
        if (!form.cageCode) return toast.error("Vui lòng nhập mã chuồng");
        const payload = {
            ...form,
            size: normalizeCageSize(form.size),
            amenities: parseAmenities(form.amenitiesText),
        };
        delete payload.amenitiesText;

        if (editing?._id) {
            updateMut.mutate({ id: editing._id, payload });
        } else {
            createMut.mutate(payload);
        }
    };

    const columns: GridColDef[] = [
        { field: "cageCode", headerName: "Mã chuồng", flex: 1, minWidth: 130 },
        { field: "type", headerName: "Loại", width: 120 },
        {
            field: "size",
            headerName: "Kích thước",
            width: 220,
            renderCell: (params) => <Typography>{getSizeLabel(params.value)}</Typography>,
        },
        {
            field: "dailyPrice",
            headerName: "Giá/ngày",
            width: 140,
            renderCell: (params) => (
                <Typography>{Number(params.value || 0).toLocaleString("vi-VN")}đ</Typography>
            )
        },
        {
            field: "amenities",
            headerName: "Tiện nghi",
            flex: 1,
            minWidth: 220,
            renderCell: (params) => {
                const list = Array.isArray(params.row?.amenities) ? params.row.amenities : [];
                if (!list.length) return <Typography>Chưa cập nhật</Typography>;
                const shortText = list.slice(0, 3).join(", ");
                return <Typography title={list.join(", ")}>{shortText}</Typography>;
            }
        },
        {
            field: "status",
            headerName: "Trạng thái",
            width: 160,
            renderCell: (params) => {
                const label = trangThaiChuongOptions.find((item) => item.value === params.value)?.label || params.value;
                return <Typography>{label}</Typography>;
            }
        },
        {
            field: "actions",
            type: "actions",
            headerName: "",
            width: 80,
            renderCell: (params) => (
                <GridActionsCell {...params}>
                    <GridActionsCellItem
                        icon={<Icon icon="solar:pen-bold" width={18} />}
                        label="Sửa"
                        onClick={() => handleOpenEdit(params.row)}
                        showInMenu
                    />
                    <GridActionsCellItem
                        icon={<Icon icon="solar:trash-bin-trash-bold" width={18} />}
                        label="Xóa"
                        onClick={() => {
                            if (window.confirm("Bạn có chắc muốn xóa chuồng này?")) deleteMut.mutate(params.row._id);
                        }}
                        showInMenu
                    />
                </GridActionsCell>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ width: "100%" }}>
                    <Box
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: "1px solid #fde68a",
                            background: "linear-gradient(120deg, #fffbeb 0%, #fff7ed 50%, #eff6ff 100%)",
                        }}
                    >
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                            <Box>
                                <Title title="Quản lý chuồng khách sạn" />
                                <Breadcrumb items={[
                                    { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                                    { label: "Khách sạn" },
                                    { label: "Quản lý chuồng" },
                                ]} />
                            </Box>
                            <Button variant="contained" onClick={handleOpenCreate} startIcon={<Icon icon="mingcute:add-line" />}>
                                Tạo chuồng
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                <Chip color="primary" label={`Tổng chuồng: ${summary.total}`} />
                <Chip color="success" label={`Sẵn sàng: ${summary.available}`} />
                <Chip color="warning" label={`Đang sử dụng: ${summary.occupied}`} />
                <Chip color="default" label={`Bảo trì: ${summary.maintenance}`} />
            </Stack>

            <Card sx={{ p: 2 }}>
                <Search placeholder="Tìm theo mã chuồng hoặc mô tả..." value={search} onChange={setSearch} />
                <Box sx={{ mt: 2, height: 560 }}>
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
                                Lưu ý: chiều dài chuồng nên lớn hơn chiều dài thân thú cưng 10-15cm để bé thoải mái.
                            </Typography>
                        </Box>
                        <TextField type="number" label="Giá/ngày" value={form.dailyPrice} onChange={(e) => setForm({ ...form, dailyPrice: Number(e.target.value) || 0 })} />
                        <TextField type="number" label="Tải trọng tối đa (kg)" value={form.maxWeightCapacity} onChange={(e) => setForm({ ...form, maxWeightCapacity: Number(e.target.value) || 0 })} />
                        <TextField select label="Trạng thái" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                            {trangThaiChuongOptions.map((item) => (
                                <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Ảnh (URL)" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
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
