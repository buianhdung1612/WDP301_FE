import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    MenuItem,
    Typography,
    Box,
    IconButton,
    Divider
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useCreateUser } from "../../account-user/hooks/useAccountUser";
import { useCreatePet } from "../../account-user/hooks/usePet";
import { toast } from "react-toastify";
import { COLORS } from "../../role/configs/constants";
import { useAuthStore } from "../../../../stores/useAuthStore";

interface QuickCustomerDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (userId: string, petIds: string[]) => void;
}

export const QuickCustomerDialog = ({ open, onClose, onSuccess }: QuickCustomerDialogProps) => {
    const { user } = useAuthStore();
    const { mutate: createUser, isPending: isCreatingUser } = useCreateUser();
    const { mutate: createPet, isPending: isCreatingPet } = useCreatePet();

    const [customerData, setCustomerData] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: "password123"
    });

    const [pets, setPets] = useState([{
        name: "",
        type: "dog" as "dog" | "cat",
        breed: "",
        weight: "",
        gender: "male" as "male" | "female",
        birthDate: ""
    }]);

    const handleAddPet = () => {
        setPets([...pets, {
            name: "",
            type: "dog",
            breed: "",
            weight: "",
            gender: "male",
            birthDate: ""
        }]);
    };

    const handleRemovePet = (index: number) => {
        setPets(pets.filter((_, i) => i !== index));
    };

    const handlePetChange = (index: number, field: string, value: any) => {
        const newPets = [...pets];
        newPets[index] = { ...newPets[index], [field]: value };
        setPets(newPets);
    };

    const handleSubmit = async () => {
        if (!customerData.fullName || !customerData.phone) {
            toast.error("Vui lòng nhập họ tên và số điện thoại");
            return;
        }

        if (pets.some(p => !p.name || !p.weight)) {
            toast.error("Vui lòng nhập tên và cân nặng cho tất cả thú cưng");
            return;
        }

        // Create user first
        createUser({ ...customerData, createdBy: user?.id }, {
            onSuccess: (userRes: any) => {
                const userId = userRes.data._id;
                const createdPetIds: string[] = [];
                let petsCreated = 0;

                // Create all pets
                pets.forEach((pet) => {
                    createPet({
                        ...pet,
                        weight: parseFloat(pet.weight),
                        userId
                    }, {
                        onSuccess: (petRes: any) => {
                            createdPetIds.push(petRes.data._id);
                            petsCreated++;

                            if (petsCreated === pets.length) {
                                toast.success("Tạo khách hàng và thú cưng thành công!");
                                onSuccess(userId, createdPetIds);
                                handleClose();
                            }
                        },
                        onError: () => {
                            toast.error(`Lỗi khi tạo thú cưng ${pet.name}`);
                        }
                    });
                });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Lỗi khi tạo khách hàng");
            }
        });
    };

    const handleClose = () => {
        setCustomerData({
            fullName: "",
            phone: "",
            email: "",
            password: "password123"
        });
        setPets([{
            name: "",
            type: "dog",
            breed: "",
            weight: "",
            gender: "male",
            birthDate: ""
        }]);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "var(--shape-borderRadius-lg)",
                    boxShadow: "var(--customShadows-card)"
                }
            }}
        >
            <DialogTitle sx={{
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px dashed rgba(145, 158, 171, 0.2)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Icon icon="solar:user-plus-bold-duotone" width={28} color={COLORS.primary} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Tạo khách hàng mới
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <Icon icon="eva:close-fill" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={3}>
                    {/* Customer Info */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: COLORS.primary }}>
                            Thông tin khách hàng
                        </Typography>
                        <Stack spacing={2}>
                            <TextField
                                label="Họ và tên *"
                                fullWidth
                                value={customerData.fullName}
                                onChange={(e) => setCustomerData({ ...customerData, fullName: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: "var(--shape-borderRadius)" } }}
                            />
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Số điện thoại *"
                                    fullWidth
                                    value={customerData.phone}
                                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: "var(--shape-borderRadius)" } }}
                                />
                                <TextField
                                    label="Email (tùy chọn)"
                                    fullWidth
                                    value={customerData.email}
                                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: "var(--shape-borderRadius)" } }}
                                />
                            </Stack>
                        </Stack>
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* Pets Info */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.primary }}>
                                Thú cưng
                            </Typography>
                            <Button
                                size="small"
                                startIcon={<Icon icon="eva:plus-fill" />}
                                onClick={handleAddPet}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: "var(--shape-borderRadius)",
                                    fontWeight: 600
                                }}
                            >
                                Thêm thú cưng
                            </Button>
                        </Box>

                        <Stack spacing={2}>
                            {pets.map((pet, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'rgba(145, 158, 171, 0.04)',
                                        borderRadius: "var(--shape-borderRadius-md)",
                                        border: '1px solid rgba(145, 158, 171, 0.12)'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--palette-text-secondary)' }}>
                                            Thú cưng #{index + 1}
                                        </Typography>
                                        {pets.length > 1 && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemovePet(index)}
                                                sx={{ color: 'error.main' }}
                                            >
                                                <Icon icon="eva:trash-2-fill" width={18} />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Stack spacing={2}>
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                label="Tên *"
                                                fullWidth
                                                value={pet.name}
                                                onChange={(e) => handlePetChange(index, 'name', e.target.value)}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: "var(--shape-borderRadius)", bgcolor: "var(--palette-background-paper)" } }}
                                            />
                                            <TextField
                                                label="Loại"
                                                select
                                                fullWidth
                                                value={pet.type}
                                                onChange={(e) => handlePetChange(index, 'type', e.target.value)}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: "var(--shape-borderRadius)", bgcolor: "var(--palette-background-paper)" } }}
                                            >
                                                <MenuItem value="dog">Chó</MenuItem>
                                                <MenuItem value="cat">Mèo</MenuItem>
                                            </TextField>
                                        </Stack>
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                label="Giống"
                                                fullWidth
                                                value={pet.breed}
                                                onChange={(e) => handlePetChange(index, 'breed', e.target.value)}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: "var(--shape-borderRadius)", bgcolor: "var(--palette-background-paper)" } }}
                                            />
                                            <TextField
                                                label="Cân nặng (kg) *"
                                                fullWidth
                                                type="number"
                                                value={pet.weight}
                                                onChange={(e) => handlePetChange(index, 'weight', e.target.value)}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: "var(--shape-borderRadius)", bgcolor: "var(--palette-background-paper)" } }}
                                            />
                                            <TextField
                                                label="Giới tính"
                                                select
                                                fullWidth
                                                value={pet.gender}
                                                onChange={(e) => handlePetChange(index, 'gender', e.target.value)}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: "var(--shape-borderRadius)", bgcolor: "var(--palette-background-paper)" } }}
                                            >
                                                <MenuItem value="male">Đực</MenuItem>
                                                <MenuItem value="female">Cái</MenuItem>
                                            </TextField>
                                        </Stack>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                <Button
                    onClick={handleClose}
                    sx={{
                        borderRadius: "var(--shape-borderRadius)",
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'var(--palette-text-secondary)'
                    }}
                >
                    Hủy
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isCreatingUser || isCreatingPet}
                    sx={{
                        bgcolor: COLORS.primary,
                        borderRadius: "var(--shape-borderRadius)",
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        '&:hover': { bgcolor: "var(--palette-grey-700)" }
                    }}
                >
                    {isCreatingUser || isCreatingPet ? "Đang tạo..." : "Tạo khách hàng"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};




