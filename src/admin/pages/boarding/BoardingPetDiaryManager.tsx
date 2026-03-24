import { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Stack,
    Avatar,
    TextField,
    Button,
    MenuItem,
    CircularProgress,
    Alert,
    alpha,
    Paper,
    Menu
} from "@mui/material";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { getBoardingPetDiaries, upsertBoardingPetDiary } from "../../api/boarding-pet-diary.api";

// --- Custom Components ---

const StatusCard = ({ label, value, icon, bgColor, textColor, options, onChange }: any) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    return (
        <Box sx={{ flex: 1, minWidth: 100 }}>
            <Paper
                onClick={(e) => setAnchorEl(e.currentTarget)}
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: bgColor,
                    color: textColor,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(textColor, 0.1)}`
                    }
                }}
            >
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>
                    {label}
                </Typography>
                <Box sx={{ p: 1, bgcolor: alpha('#fff', 0.5), borderRadius: '12px', display: 'flex' }}>
                    <Icon icon={icon} width={28} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>
                    {value || "---"}
                </Typography>
            </Paper>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    sx: { borderRadius: '12px', mt: 1, minWidth: 120, boxShadow: 'var(--customShadows-z20)' }
                }}
            >
                {options.map((opt: string) => (
                    <MenuItem
                        key={opt}
                        selected={opt === value}
                        onClick={() => {
                            onChange(opt);
                            setAnchorEl(null);
                        }}
                        sx={{ fontWeight: opt === value ? 800 : 500, borderRadius: '8px', mx: 0.5 }}
                    >
                        {opt}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export const BoardingPetDiaryManager = ({ bookingId, pets, date }: { bookingId: string, pets: any[], date: string }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedPet, setSelectedPet] = useState<string>(pets?.[0]?._id);

    const MEALS = [
        { name: "Sáng", icon: "fluent:weather-sunny-24-filled", color: "#2E7D32", bg: "#E8F5E9", label: "BỮA SÁNG" },
        { name: "Trưa", icon: "fluent:weather-sunny-high-24-filled", color: "#006097", bg: "#E3F2FD", label: "BỮA TRƯA" },
        { name: "Tối", icon: "fluent:weather-moon-24-filled", color: "#EF6C00", bg: "#FFF3E0", label: "BỮA TỐI" }
    ];

    const STATUS_CONFIGS = {
        eating: { label: "ĂN", icon: "fluent:food-24-filled", bgColor: "#E8F5E9", textColor: "#2E7D32", options: ["Hết", "Ăn Ít", "Bỏ Ăn"] },
        digestion: { label: "TIÊU HÓA", icon: "fluent:drop-24-filled", bgColor: "#E3F2FD", textColor: "#1565C0", options: ["Bình Thường", "Tiêu Chảy", "Táo Bón", "Nôn Mửa"] },
        mood: { label: "TÂM TRẠNG", icon: "fluent:emoji-24-filled", bgColor: "#FFF3E0", textColor: "#EF6C00", options: ["Vui Vẻ", "Bình Thường", "Căng Thẳng", "Ủ Rũ", "Sợ Hãi"] }
    };

    const [formState, setFormState] = useState<Record<string, any>>({});

    const selectedPetObj = useMemo(() => pets.find(p => p._id === selectedPet), [pets, selectedPet]);

    const fetchDiaries = async () => {
        if (!bookingId || !selectedPet || !date) return;
        setLoading(true);
        try {
            const res = await getBoardingPetDiaries({ bookingId, petId: selectedPet, date });
            const newFormState: Record<string, any> = {};
            MEALS.forEach(meal => {
                const existing = (res?.data?.data || []).find((d: any) => d.meal === meal.name);
                newFormState[meal.name] = {
                    eatingStatus: existing?.eatingStatus || "Hết",
                    digestionStatus: existing?.digestionStatus || "Bình Thường",
                    moodStatus: existing?.moodStatus || "Vui Vẻ",
                    note: existing?.note || "",
                };
            });
            setFormState(newFormState);
        } catch (error) {
            toast.error("Không tải được dữ liệu nhật ký.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiaries();
    }, [bookingId, selectedPet, date]);

    const handleSave = async (meal: string) => {
        setSaving(true);
        try {
            const payload = {
                bookingId,
                petId: selectedPet,
                date,
                meal,
                ...formState[meal],
                proofMedia: []
            };
            await upsertBoardingPetDiary(payload);
            toast.success(`Đã cập nhật nhật ký ${meal}`);
            fetchDiaries();
        } catch (error) {
            toast.error(`Lỗi cập nhật nhật ký ${meal}`);
        } finally {
            setSaving(false);
        }
    };

    if (!pets || pets.length === 0) return <Alert severity="warning">Không tìm thấy thông tin thú cưng!</Alert>;

    return (
        <Box sx={{ p: 1 }}>
            {/* Pet Selection Tabs */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 4, overflowX: "auto", pb: 1 }}>
                {pets.map(pet => (
                    <Button
                        key={pet._id}
                        variant={selectedPet === pet._id ? "contained" : "outlined"}
                        onClick={() => setSelectedPet(pet._id)}
                        sx={{
                            borderRadius: '20px',
                            minWidth: 'max-content',
                            px: 2,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 700,
                            boxShadow: selectedPet === pet._id ? '0 8px 16px rgba(0, 167, 111, 0.24)' : 'none',
                        }}
                        startIcon={<Avatar src={pet.avatar} sx={{ width: 28, height: 28 }} />}
                    >
                        {pet.name}
                    </Button>
                ))}
            </Stack>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={32} /></Box>
            ) : (
                <Stack spacing={4}>
                    {MEALS.map((meal) => (
                        <Box key={meal.name}>
                            {/* Meal Header */}
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                                <Box sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    bgcolor: meal.bg,
                                    color: meal.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon icon={meal.icon} width={20} />
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: meal.color, letterSpacing: 0.5 }}>
                                    {meal.label}
                                </Typography>
                                <Box flexGrow={1} />
                                <Button
                                    size="small"
                                    onClick={() => handleSave(meal.name)}
                                    disabled={saving}
                                    sx={{ fontWeight: 700, borderRadius: '8px' }}
                                >
                                    Lưu ngay
                                </Button>
                            </Stack>

                            {/* Diary Card */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '24px',
                                    bgcolor: 'var(--palette-background-neutral)',
                                    border: '1px solid var(--palette-divider)',
                                    position: 'relative'
                                }}
                            >
                                <Stack spacing={2.5}>
                                    {/* Pet Info */}
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar src={selectedPetObj?.avatar} sx={{ width: 44, height: 44, border: '2px solid #fff' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            {selectedPetObj?.name}
                                        </Typography>
                                    </Stack>

                                    {/* Status Ratios */}
                                    <Stack direction="row" spacing={2}>
                                        <StatusCard
                                            {...STATUS_CONFIGS.eating}
                                            value={formState[meal.name]?.eatingStatus}
                                            onChange={(v: string) => setFormState(p => ({ ...p, [meal.name]: { ...p[meal.name], eatingStatus: v } }))}
                                        />
                                        <StatusCard
                                            {...STATUS_CONFIGS.digestion}
                                            value={formState[meal.name]?.digestionStatus}
                                            onChange={(v: string) => setFormState(p => ({ ...p, [meal.name]: { ...p[meal.name], digestionStatus: v } }))}
                                        />
                                        <StatusCard
                                            {...STATUS_CONFIGS.mood}
                                            value={formState[meal.name]?.moodStatus}
                                            onChange={(v: string) => setFormState(p => ({ ...p, [meal.name]: { ...p[meal.name], moodStatus: v } }))}
                                        />
                                    </Stack>

                                    {/* Note Input */}
                                    <TextField
                                        fullWidth
                                        size="small"
                                        multiline
                                        rows={1}
                                        label="Ghi chú nhanh"
                                        value={formState[meal.name]?.note || ""}
                                        onChange={(e) => setFormState(prev => ({ ...prev, [meal.name]: { ...prev[meal.name], note: e.target.value } }))}
                                        placeholder="Trạng thái thú cưng hôm nay thế nào?"
                                        sx={{
                                            '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' }
                                        }}
                                    />
                                </Stack>
                            </Paper>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
};
