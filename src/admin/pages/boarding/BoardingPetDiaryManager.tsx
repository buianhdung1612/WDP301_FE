import { useState, useEffect } from "react";
import { Box, Typography, Stack, Avatar, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert } from "@mui/material";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { getBoardingPetDiaries, upsertBoardingPetDiary } from "../../api/boarding-pet-diary.api";

export const BoardingPetDiaryManager = ({ bookingId, pets, date }: { bookingId: string, pets: any[], date: string }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedPet, setSelectedPet] = useState<string>(pets?.[0]?._id);

    const MEALS = ["Sáng", "Trưa", "Tối"];

    const EATING_STATUS = ["Hết", "Ăn Ít", "Bỏ Ăn"];
    const DIGESTION_STATUS = ["Bình Thường", "Tiêu Chảy", "Táo Bón", "Nôn Mửa"];
    const MOOD_STATUS = ["Vui Vẻ", "Bình Thường", "Căng Thẳng", "Ủ Rũ", "Sợ Hãi"];

    const [formState, setFormState] = useState<Record<string, any>>({});

    const fetchDiaries = async () => {
        if (!bookingId || !selectedPet || !date) return;
        setLoading(true);
        try {
            const res = await getBoardingPetDiaries({ bookingId, petId: selectedPet, date });

            const newFormState: Record<string, any> = {};
            MEALS.forEach(meal => {
                const existing = (res?.data?.data || []).find((d: any) => d.meal === meal);
                newFormState[meal] = {
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
                proofMedia: [] // Could be an array of objects
            };
            await upsertBoardingPetDiary(payload);
            toast.success(`Cập nhật nhật ký bữa ${meal} thành công!`);
            fetchDiaries();
        } catch (error) {
            toast.error(`Cập nhật nhật ký bữa ${meal} thất bại!`);
        } finally {
            setSaving(false);
        }
    };

    if (!pets || pets.length === 0) return <Alert severity="warning">Không tìm thấy thông tin thú cưng!</Alert>;

    return (
        <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: "auto", pb: 1 }}>
                {pets.map(pet => (
                    <Button
                        key={pet._id}
                        variant={selectedPet === pet._id ? "contained" : "outlined"}
                        color={pet.type === 'dog' ? 'info' : 'secondary'}
                        onClick={() => setSelectedPet(pet._id)}
                        sx={{ borderRadius: 8, minWidth: 'max-content', py: 1 }}
                        startIcon={<Avatar src={pet.avatar} sx={{ width: 24, height: 24 }} />}
                    >
                        {pet.name}
                    </Button>
                ))}
            </Stack>

            {loading ? <CircularProgress /> : (
                <Stack spacing={4}>
                    {MEALS.map(meal => (
                        <Box key={meal} sx={{ p: 3, borderRadius: 2, border: "1px solid var(--palette-divider)", bgcolor: "var(--palette-background-paper)" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icon icon="solar:history-bold" /> Mốc thời gian: {meal}
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                                <Box>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Tình trạng ăn</InputLabel>
                                        <Select
                                            value={formState[meal]?.eatingStatus || "Hết"}
                                            label="Tình trạng ăn"
                                            onChange={(e) => setFormState(prev => ({ ...prev, [meal]: { ...prev[meal], eatingStatus: e.target.value } }))}
                                        >
                                            {EATING_STATUS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Tiêu hóa</InputLabel>
                                        <Select
                                            value={formState[meal]?.digestionStatus || "Bình Thường"}
                                            label="Tiêu hóa"
                                            onChange={(e) => setFormState(prev => ({ ...prev, [meal]: { ...prev[meal], digestionStatus: e.target.value } }))}
                                        >
                                            {DIGESTION_STATUS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Tâm trạng</InputLabel>
                                        <Select
                                            value={formState[meal]?.moodStatus || "Vui Vẻ"}
                                            label="Tâm trạng"
                                            onChange={(e) => setFormState(prev => ({ ...prev, [meal]: { ...prev[meal], moodStatus: e.target.value } }))}
                                        >
                                            {MOOD_STATUS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        multiline
                                        rows={2}
                                        label={`Ghi chú thêm (Bữa ${meal})`}
                                        value={formState[meal]?.note || ""}
                                        onChange={(e) => setFormState(prev => ({ ...prev, [meal]: { ...prev[meal], note: e.target.value } }))}
                                        placeholder="Nhập nhận xét chi tiết..."
                                    />
                                </Box>
                                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' }, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button variant="contained" size="small" onClick={() => handleSave(meal)} disabled={saving}>
                                        Lưu Nhật Ký {meal}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
};
