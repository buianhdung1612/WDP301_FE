import { useState } from "react";
import {
    Box,
    Card,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
    Autocomplete,
    createFilterOptions
} from "@mui/material";
import { Icon } from "@iconify/react";
import { usePets, useCreatePet, useUpdatePet, useDeletePet } from "../hooks/usePet";
import { useBreeds, useCreateBreed } from "../hooks/useBreed";
import { CircularProgress } from "@mui/material";
import { uploadImagesToCloudinary } from "../../../api/uploadCloudinary.api";
import { toast } from "react-toastify";
import { useRef } from "react";

const filter = createFilterOptions<any>();

interface UserPetListProps {
    userId: string;
}

export const UserPetList = ({ userId }: UserPetListProps) => {
    const { data: resPets, isLoading } = usePets({ userId });
    const pets = resPets?.data?.recordList || [];
    const { mutate: createPet } = useCreatePet();
    const { mutate: updatePet } = useUpdatePet();
    const { mutate: deletePet } = useDeletePet();

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPet, setSelectedPet] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        type: "dog",
        breed: "",
        weight: "",
        age: "",
        gender: "male",
        notes: "",
        avatar: ""
    });

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: resBreeds } = useBreeds({ type: formData.type });
    const breeds = resBreeds?.data?.recordList || [];
    const { mutate: createBreedMutate } = useCreateBreed();

    interface BreedOption {
        inputValue?: string;
        name: string;
        _id?: string;
    }

    const handleOpenDialog = (pet: any = null) => {
        if (pet) {
            setSelectedPet(pet);
            setFormData({
                name: pet.name || "",
                type: pet.type || "dog",
                breed: pet.breed || "",
                weight: pet.weight || "",
                age: pet.age || "",
                gender: pet.gender || "male",
                notes: pet.notes || "",
                avatar: pet.avatar || ""
            });
        } else {
            setSelectedPet(null);
            setFormData({
                name: "",
                type: "dog",
                breed: "",
                weight: "",
                age: "",
                gender: "male",
                notes: "",
                avatar: ""
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const [url] = await uploadImagesToCloudinary([file]);
            setFormData(prev => ({ ...prev, avatar: url }));
            toast.success("Tải ảnh lên thành công");
        } catch (error) {
            toast.error("Tải ảnh lên thất bại");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = () => {
        if (!formData.name) {
            toast.error("Vui lòng nhập tên thú cưng");
            return;
        }

        const data = {
            ...formData,
            userId,
            weight: formData.weight ? parseFloat(formData.weight) : undefined,
            age: formData.age ? parseInt(formData.age) : undefined
        };

        if (selectedPet) {
            updatePet({ id: selectedPet._id, data }, {
                onSuccess: () => {
                    toast.success("Cập nhật thú cưng thành công");
                    handleCloseDialog();
                }
            });
        } else {
            createPet(data, {
                onSuccess: () => {
                    toast.success("Thêm thú cưng mới thành công");
                    handleCloseDialog();
                }
            });
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thú cưng này?")) {
            deletePet(id, {
                onSuccess: () => {
                    toast.success("Xóa thú cưng thành công");
                }
            });
        }
    };

    return (
        <Card sx={{ mt: 3, borderRadius: "var(--shape-borderRadius-lg)", border: '1px solid rgba(145, 158, 171, 0.2)', boxShadow: 'none' }}>
            <Box sx={{ p: "calc(3 * var(--spacing))", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: 'var(--palette-text-primary)' }}>
                    Danh sách thú cưng
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Icon icon="eva:plus-fill" />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        bgcolor: 'var(--palette-text-primary)',
                        color: "var(--palette-common-white)",
                        minHeight: "2.25rem",
                        minWidth: "4rem",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        padding: "6px 12px",
                        borderRadius: "var(--shape-borderRadius)",
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                            bgcolor: "var(--palette-grey-700)",
                            boxShadow: "var(--customShadows-z8)"
                        }
                    }}
                >
                    Thêm thú cưng
                </Button>
            </Box>

            <TableContainer>
                <Table size="medium">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'var(--palette-background-neutral)' }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--palette-text-secondary)', borderBottom: 'none' }}>Tên</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--palette-text-secondary)', borderBottom: 'none' }}>Loại</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--palette-text-secondary)', borderBottom: 'none' }}>Giống</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--palette-text-secondary)', borderBottom: 'none' }}>Cân nặng</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--palette-text-secondary)', borderBottom: 'none' }}>Tuổi</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--palette-text-secondary)', borderBottom: 'none' }}>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pets.map((pet: any) => (
                            <TableRow key={pet._id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                <TableCell sx={{ borderBottom: '1px dashed var(--palette-text-disabled)33' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            src={pet.avatar}
                                            alt={pet.name}
                                            sx={{
                                                width: '2.5rem',
                                                height: '2.5rem',
                                                borderRadius: "var(--shape-borderRadius)",
                                                bgcolor: pet.type === 'dog' ? 'rgba(0, 167, 111, 0.08)' : 'rgba(142, 51, 255, 0.08)'
                                            }}
                                        >
                                            <Icon
                                                icon={pet.type === 'dog' ? 'mdi:dog' : 'mdi:cat'}
                                                style={{ fontSize: '1.5rem', color: pet.type === 'dog' ? 'var(--palette-primary-main)' : '#8E33FF' }}
                                            />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--palette-text-primary)' }}>{pet.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--palette-text-secondary)', fontSize: '0.75rem' }}>
                                                {pet.gender === 'male' ? 'Đực' : 'Cái'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px dashed var(--palette-text-disabled)33', fontSize: '0.875rem' }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Icon
                                            icon={pet.type === 'dog' ? 'mdi:dog' : 'mdi:cat'}
                                            style={{ color: 'var(--palette-text-secondary)', fontSize: '1.25rem' }}
                                        />
                                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                            {pet.type === 'dog' ? 'Chó' : 'Mèo'}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px dashed var(--palette-text-disabled)33', fontSize: '0.875rem' }}>{pet.breed || '-'}</TableCell>
                                <TableCell sx={{ borderBottom: '1px dashed var(--palette-text-disabled)33', fontSize: '0.875rem' }}>{pet.weight ? `${pet.weight} kg` : '-'}</TableCell>
                                <TableCell sx={{ borderBottom: '1px dashed var(--palette-text-disabled)33', fontSize: '0.875rem' }}>{pet.age ? `${pet.age} tuổi` : '-'}</TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px dashed var(--palette-text-disabled)33' }}>
                                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                        <IconButton onClick={() => handleOpenDialog(pet)} sx={{ color: 'var(--palette-text-secondary)', '&:hover': { bgcolor: 'rgba(145, 158, 171, 0.08)' } }}>
                                            <Icon icon="eva:edit-fill" width={22} />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(pet._id)} sx={{ color: 'var(--palette-error-main)', '&:hover': { bgcolor: 'rgba(255, 86, 48, 0.08)' } }}>
                                            <Icon icon="eva:trash-2-fill" width={22} />
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {pets.length === 0 && !isLoading && (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Icon icon="mdi:paw-off" style={{ width: '4rem', height: '4rem', color: 'var(--palette-text-disabled)', opacity: 0.24, marginBottom: '1rem' }} />
                        <Typography variant="body2" sx={{ color: 'var(--palette-text-disabled)', fontSize: '0.875rem', fontWeight: 500 }}>
                            Khách hàng này chưa có thú cưng nào
                        </Typography>
                    </Box>
                )}
            </TableContainer>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: "var(--shape-borderRadius-lg)",
                        backgroundImage: 'none',
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', p: '1.5rem 1.5rem 1rem' }}>
                    {selectedPet ? 'Chỉnh sửa thú cưng' : 'Thêm thú cưng mới'}
                </DialogTitle>
                <DialogContent sx={{ p: '0 1.5rem 1.5rem' }}>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <Box sx={{ mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={formData.avatar}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        cursor: 'pointer',
                                        border: '2px dashed var(--palette-text-disabled)33',
                                        bgcolor: 'rgba(145, 158, 171, 0.08)',
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {isUploading ? (
                                        <CircularProgress size={24} sx={{ color: 'var(--palette-text-primary)' }} />
                                    ) : (
                                        <Icon icon="solar:camera-add-bold" width={32} color="var(--palette-text-secondary)" />
                                    )}
                                </Avatar>
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'var(--palette-text-primary)',
                                        color: "var(--palette-common-white)",
                                        border: '2px solid #fff',
                                        '&:hover': { bgcolor: "var(--palette-grey-700)" }
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Icon icon="solar:pen-bold" width={14} />
                                </IconButton>
                            </Box>
                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <Typography variant="caption" sx={{ mt: 1.5, color: 'var(--palette-text-secondary)', fontWeight: 500 }}>
                                Nhấp để tải ảnh thú cưng
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            label="Tên thú cưng"
                            placeholder="Ví dụ: Bông, Lu, ..."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                select
                                fullWidth
                                label="Loại"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                            >
                                <MenuItem value="dog" sx={{ fontSize: '0.875rem' }}>Chó</MenuItem>
                                <MenuItem value="cat" sx={{ fontSize: '0.875rem' }}>Mèo</MenuItem>
                            </TextField>
                            <TextField
                                select
                                fullWidth
                                label="Giới tính"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                            >
                                <MenuItem value="male" sx={{ fontSize: '0.875rem' }}>Đực</MenuItem>
                                <MenuItem value="female" sx={{ fontSize: '0.875rem' }}>Cái</MenuItem>
                            </TextField>
                        </Stack>

                        <Autocomplete
                            value={formData.breed}
                            onChange={async (_, newValue) => {
                                if (typeof newValue === 'string') {
                                    setFormData({ ...formData, breed: newValue });
                                } else if (newValue && (newValue as BreedOption).inputValue) {
                                    const breedName = (newValue as BreedOption).inputValue || "";
                                    setFormData({ ...formData, breed: breedName });
                                    createBreedMutate({ name: breedName, type: formData.type });
                                } else {
                                    setFormData({ ...formData, breed: (newValue as BreedOption)?.name || "" });
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = filter(options, params);
                                const { inputValue } = params;
                                const isExisting = options.some((option) => inputValue === (option as BreedOption).name);
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        inputValue: inputValue,
                                        name: `Thêm "${inputValue}"`,
                                    });
                                }
                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            options={breeds as BreedOption[]}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }
                                if ((option as BreedOption).inputValue) {
                                    return (option as BreedOption).inputValue || "";
                                }
                                return (option as BreedOption).name;
                            }}
                            renderOption={(props, option) => (
                                <li {...props} key={(option as BreedOption)._id || (option as BreedOption).name} style={{ fontSize: '0.875rem' }}>
                                    {(option as BreedOption).name}
                                </li>
                            )}
                            freeSolo
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Giống"
                                    placeholder="Ví dụ: Poodle, Golden Retriever, ..."
                                    InputLabelProps={{ shrink: true }}
                                />
                            )}
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                        />

                        <Stack direction="row" spacing={2}>
                            <TextField
                                fullWidth
                                label="Cân nặng (kg)"
                                type="number"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                            />
                            <TextField
                                fullWidth
                                label="Tuổi"
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                            />
                        </Stack>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Ghi chú sức khỏe/thói quen"
                            placeholder="Nhập thông tin quan trọng cần lưu ý..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '1rem 1.5rem 1.5rem', borderTop: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{
                            color: 'var(--palette-text-secondary)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'rgba(145, 158, 171, 0.08)' }
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            bgcolor: 'var(--palette-text-primary)',
                            color: "var(--palette-common-white)",
                            minHeight: "2.25rem",
                            px: 3,
                            borderRadius: "var(--shape-borderRadius)",
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: "var(--palette-grey-700)",
                                boxShadow: "var(--customShadows-z8)"
                            }
                        }}
                    >
                        {selectedPet ? 'Cập nhật' : 'Lưu lại'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};




