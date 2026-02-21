import { Box, Card, Button, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Tabs, Tab, styled } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCell, GridActionsCellItem } from "@mui/x-data-grid";
import { Icon } from "@iconify/react";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { useState, useMemo } from "react";
import { useBreeds, useCreateBreed, useUpdateBreed, useDeleteBreed } from "../account-user/hooks/useBreed";
import { toast } from "react-toastify";
import { prefixAdmin } from "../../constants/routes";
import { Search } from "../../components/ui/Search";
import { SortAscendingIcon, SortDescendingIcon, UnsortedIcon } from "../../assets/icons";
import { DATA_GRID_LOCALE_VN } from "../account-user/configs/localeText.config";
import { dataGridStyles, dataGridContainerStyles } from "../role/configs/styles.config";
import { ExportImport } from "../../components/ui/ExportImport";

const TabBadge = styled('span')(() => ({
    height: "24px",
    minWidth: "24px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: '8px',
    padding: '0px 6px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    transition: 'all 0.2s',
}));

export const BreedListPage = () => {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const { data: breedsRaw = [], isLoading } = useBreeds();
    const { mutate: createBreed } = useCreateBreed();
    const { mutate: updateBreed } = useUpdateBreed();
    const { mutate: deleteBreed } = useDeleteBreed();

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBreed, setSelectedBreed] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        type: "dog",
        description: ""
    });

    const breeds = useMemo(() => {
        const list = Array.isArray(breedsRaw) ? breedsRaw : [];
        return list.filter((b: any) => {
            const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
            const matchesType = typeFilter === "all" || b.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [breedsRaw, search, typeFilter]);

    const counts = useMemo(() => {
        const list = Array.isArray(breedsRaw) ? breedsRaw : [];
        return {
            all: list.length,
            dog: list.filter((b: any) => b.type === "dog").length,
            cat: list.filter((b: any) => b.type === "cat").length,
        };
    }, [breedsRaw]);

    const handleOpenDialog = (breed: any = null) => {
        if (breed) {
            setSelectedBreed(breed);
            setFormData({
                name: breed.name,
                type: breed.type,
                description: breed.description || ""
            });
        } else {
            setSelectedBreed(null);
            setFormData({
                name: "",
                type: "dog",
                description: ""
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSubmit = () => {
        if (!formData.name) {
            toast.error("Vui lòng nhập tên giống");
            return;
        }

        if (selectedBreed) {
            updateBreed({ id: selectedBreed._id, data: formData }, {
                onSuccess: () => {
                    toast.success("Cập nhật thành công");
                    handleCloseDialog();
                }
            });
        } else {
            createBreed(formData as any, {
                onSuccess: () => {
                    toast.success("Thêm mới thành công");
                    handleCloseDialog();
                }
            });
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn giống này?")) {
            deleteBreed(id, {
                onSuccess: () => {
                    toast.success("Xóa thành công");
                }
            });
        }
    };

    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Tên giống",
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: "type",
            headerName: "Loài",
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{
                        height: '26px',
                        px: 2,
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '8px',
                        bgcolor: params.value === "dog" ? 'rgba(0, 167, 111, 0.16)' : 'rgba(255, 171, 0, 0.16)',
                        color: params.value === "dog" ? 'rgb(0, 120, 103)' : 'rgb(183, 110, 0)',
                        fontSize: '1rem',
                        fontWeight: 700,
                    }}>
                        {params.value === "dog" ? "Chó" : "Mèo"}
                    </Box>
                </Box>
            )
        },
        {
            field: "actions",
            type: "actions",
            headerName: "",
            width: 80,
            sortable: false,
            filterable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GridActionsCell {...params}>
                        <GridActionsCellItem
                            icon={<Icon icon="solar:pen-bold" width={20} />}
                            label="Chỉnh sửa"
                            onClick={() => handleOpenDialog(params.row)}
                            showInMenu
                            {...({
                                sx: {
                                    '& .MuiTypography-root': {
                                        fontSize: '0.8125rem',
                                        fontWeight: "600"
                                    },
                                },
                            } as any)}
                        />
                        <GridActionsCellItem
                            icon={<Icon icon="solar:trash-bin-trash-bold" width={20} style={{ color: '#FF5630' }} />}
                            label="Xóa"
                            onClick={() => handleDelete(params.row._id)}
                            showInMenu
                            {...({
                                sx: {
                                    '& .MuiTypography-root': {
                                        fontSize: '0.8125rem',
                                        fontWeight: "600",
                                        color: "#FF5630"
                                    },
                                },
                            } as any)}
                        />
                    </GridActionsCell>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Title title="Quản lý giống thú cưng" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Cài đặt", to: `/${prefixAdmin}/dashboard/setting-general` },
                            { label: "Giống thú cưng" }
                        ]}
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Icon icon="mingcute:add-line" />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        bgcolor: '#1C252E',
                        color: 'white',
                        '&:hover': { bgcolor: '#454F5B' },
                        borderRadius: '8px',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        fontSize: '0.875rem',
                        fontWeight: 700
                    }}
                >
                    Thêm giống mới
                </Button>
            </Box>

            <Card elevation={0} sx={{
                borderRadius: '16px',
                bgcolor: 'background.paper',
                boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
            }}>
                <Tabs
                    value={typeFilter}
                    onChange={(_e, val) => setTypeFilter(val)}
                    sx={{
                        px: 3,
                        minHeight: "42px",
                        borderBottom: '1px solid rgba(145, 158, 171, 0.2)',
                        overflow: 'visible',
                        '& .MuiTabs-scroller': {
                            overflow: 'visible !important',
                        },
                        '& .MuiTabs-flexContainer': {
                            gap: "40px"
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#1C252E',
                            height: 2,
                            bottom: -1,
                        },
                    }}
                >
                    <Tab
                        value="all"
                        disableRipple
                        label="Tất cả"
                        icon={<TabBadge sx={{ bgcolor: typeFilter === 'all' ? '#1C252E' : 'rgba(145, 158, 171, 0.16)', color: typeFilter === 'all' ? '#fff' : '#637381' }}>{counts.all}</TabBadge>}
                        iconPosition="end"
                        sx={{ minWidth: 0, padding: 0, minHeight: '42px', textTransform: 'none', fontSize: '0.875rem', fontWeight: 500, color: '#637381', flexDirection: 'row', '&.Mui-selected': { color: '#1C252E', fontWeight: 600 } }}
                    />
                    <Tab
                        value="dog"
                        disableRipple
                        label="Chó"
                        icon={<TabBadge sx={{ bgcolor: typeFilter === 'dog' ? '#00A76F' : 'rgba(34, 197, 94, 0.16)', color: typeFilter === 'dog' ? '#fff' : '#118D57' }}>{counts.dog}</TabBadge>}
                        iconPosition="end"
                        sx={{ minWidth: 0, padding: 0, minHeight: '42px', textTransform: 'none', fontSize: '0.875rem', fontWeight: 500, color: '#637381', flexDirection: 'row', '&.Mui-selected': { color: '#1C252E', fontWeight: 600 } }}
                    />
                    <Tab
                        value="cat"
                        disableRipple
                        label="Mèo"
                        icon={<TabBadge sx={{ bgcolor: typeFilter === 'cat' ? '#FFAB00' : 'rgba(255, 171, 0, 0.16)', color: typeFilter === 'cat' ? '#fff' : '#B76E00' }}>{counts.cat}</TabBadge>}
                        iconPosition="end"
                        sx={{ minWidth: 0, padding: 0, minHeight: '42px', textTransform: 'none', fontSize: '0.875rem', fontWeight: 500, color: '#637381', flexDirection: 'row', '&.Mui-selected': { color: '#1C252E', fontWeight: 600 } }}
                    />
                </Tabs>

                <Box sx={{ p: '16px', display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px dashed #919eab33' }}>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Search
                            maxWidth="100%"
                            placeholder="Tìm kiếm theo tên giống..."
                            value={search}
                            onChange={setSearch}
                        />
                        <ExportImport />
                    </Box>
                </Box>

                <Box sx={{ ...dataGridContainerStyles, minHeight: '500px' }}>
                    <DataGrid
                        getRowHeight={() => 'auto'}
                        checkboxSelection
                        disableRowSelectionOnClick
                        rows={breeds}
                        columns={columns}
                        getRowId={(row) => row._id}
                        loading={isLoading}
                        slots={{
                            columnSortedAscendingIcon: SortAscendingIcon,
                            columnSortedDescendingIcon: SortDescendingIcon,
                            columnUnsortedIcon: UnsortedIcon,
                            noRowsOverlay: () => (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Typography sx={{ fontSize: '1rem', color: '#637381' }}>Không có dữ liệu để hiển thị</Typography>
                                </Box>
                            )
                        }}
                        localeText={DATA_GRID_LOCALE_VN}
                        pagination
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 },
                            },
                        }}
                        sx={{
                            ...dataGridStyles,
                            border: 'none',
                            '& .MuiDataGrid-columnHeader': {
                                bgcolor: 'rgba(145, 158, 171, 0.12)',
                                color: '#637381',
                                fontSize: '1rem',
                                fontWeight: 600,
                                paddingX: '24px',
                            },
                            '& .MuiDataGrid-columnHeaderTitleContainer': {
                                paddingX: '16px',
                            },
                            '& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer': {
                                padding: 0,
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px dashed rgba(145, 158, 171, 0.2)',
                                paddingX: '8px',
                            },
                            '& .MuiDataGrid-row:hover': {
                                bgcolor: 'rgba(145, 158, 171, 0.04)'
                            },
                            '& .MuiDataGrid-columnHeader--moving': {
                                bgcolor: 'rgba(145, 158, 171, 0.12)',
                            },
                        }}
                    />
                </Box>
            </Card>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', p: '1.5rem 1.5rem 1rem' }}>
                    {selectedBreed ? "Chỉnh sửa giống" : "Thêm giống mới"}
                </DialogTitle>
                <DialogContent sx={{ p: '0 1.5rem 1.5rem' }}>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Tên giống"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiInputBase-input': { fontSize: '1rem' } }}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Loài"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiInputBase-input': { fontSize: '1rem' } }}
                        >
                            <MenuItem value="dog" sx={{ fontSize: '1rem' }}>Chó</MenuItem>
                            <MenuItem value="cat" sx={{ fontSize: '1rem' }}>Mèo</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Mô tả"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiInputBase-input': { fontSize: '1rem' } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '1rem 1.5rem 1.5rem', borderTop: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                    <Button onClick={handleCloseDialog} sx={{ fontSize: '0.875rem', textTransform: 'none', color: '#637381', fontWeight: 700 }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            bgcolor: '#1C252E',
                            color: 'white',
                            '&:hover': { bgcolor: '#454F5B' },
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            px: 3
                        }}
                    >
                        {selectedBreed ? "Lưu thay đổi" : "Thêm mới"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
