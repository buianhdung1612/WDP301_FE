import { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Card,
    Grid,
    Avatar,
    Button,
    IconButton,
    CircularProgress,
    Stack,
    Chip,
    alpha,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    Divider
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { getBoardingBookings } from "../../../api/boarding-booking.api";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { prefixAdmin } from "../../../constants/routes";

export const StaffMyCustomerList = ({ staffId }: { staffId?: string }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    // Fetch all boarding bookings for this staff to debug
    const { data: res, isLoading } = useQuery({
        queryKey: ["staff-customers-today", staffId],
        queryFn: () => getBoardingBookings({
            limit: 100
        }),
        enabled: !!staffId
    });

    const bookings = useMemo(() => {
        const list = res?.data?.recordList || [];
        const today = dayjs().startOf('day');

        const filtered = list.filter((b: any) => {
            const checkInDate = dayjs(b.actualCheckInDate || b.checkInDate).startOf('day');
            const dayIndex = today.diff(checkInDate, 'day');
            const totalDays = b.numberOfDays || 1;

            // Only show if today is within the stay period [0, totalDays-1]
            return dayIndex >= 0 && dayIndex < totalDays;
        });

        if (!search) return filtered;
        const lowSearch = search.toLowerCase();
        return filtered.filter((b: any) =>
            (b.userId?.fullName || "").toLowerCase().includes(lowSearch) ||
            (b.userId?.phone || "").includes(lowSearch) ||
            (b.petIds?.[0]?.name || "").toLowerCase().includes(lowSearch)
        );
    }, [res, search]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (bookings.length === 0) {
        return (
            <Box sx={{
                py: 12,
                textAlign: 'center',
                bgcolor: 'white',
                borderRadius: '32px',
                border: '2px dashed #f1f5f9'
            }}>
                <Box sx={{
                    width: 100,
                    height: 100,
                    bgcolor: '#f8fafc',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                }}>
                    <Icon icon="solar:users-group-two-rounded-bold-duotone" width={60} style={{ color: '#cbd5e1' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>Chưa có khách hàng hôm nay</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Bạn không có nhiệm vụ chăm sóc nào được gán trong ngày này.</Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Search Bar */}
            <Box sx={{
                mb: 4,
                p: 1.5,
                bgcolor: 'white',
                borderRadius: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <Box sx={{
                    pl: 2.5,
                    pr: 1.5,
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Icon icon="solar:magnifer-bold" width={22} />
                </Box>
                <input
                    type="text"
                    placeholder="Tìm tên khách hàng, thú cưng hoặc số điện thoại..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#1e293b',
                        width: '100%',
                        background: 'transparent'
                    }}
                />
            </Box>

            <Box sx={{ overflowX: 'hidden', width: '100%', px: 0.5 }}>
                <Grid container spacing={3}>
                    {bookings.map((booking: any) => {
                        const user = booking.userId;
                        const pets = booking.petIds || [];
                        const cage = booking.cageId;
                        const checkIn = dayjs(booking.actualCheckInDate || booking.checkInDate);
                        const checkOut = dayjs(booking.checkOutDate);
                        const daysTotal = booking.numberOfDays || 1;
                        const currentDay = dayjs().diff(checkIn, 'day') + 1;

                        return (
                            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={booking._id}>
                                <Card sx={{
                                    borderRadius: '32px',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                                        borderColor: alpha('#3b82f6', 0.1)
                                    }
                                }}>
                                    {/* Header: Owner Info */}
                                    <Box sx={{ p: 3, borderBottom: '1px solid #f8fafc' }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar
                                                src={user?.avatar}
                                                sx={{
                                                    width: 54,
                                                    height: 54,
                                                    border: '3px solid white',
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                    bgcolor: '#f1f5f9'
                                                }}
                                            >
                                                {user?.fullName?.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.2 }}>
                                                    {user?.fullName || "Khách vãng lai"}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                        {user?.phone || booking.phone}
                                                    </Typography>
                                                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                                                    <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 800 }}>
                                                        #{booking.code?.slice(-6).toUpperCase()}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Body: Pets Info */}
                                    <Box sx={{ p: 3, bgcolor: '#fbfcfd' }}>
                                        <Typography variant="overline" sx={{ fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>THÚ CƯNG ĐANG CHĂM SÓC</Typography>
                                        <Stack spacing={2} sx={{ mt: 1.5 }}>
                                            {pets.map((pet: any, idx: number) => (
                                                <Stack key={idx} direction="row" spacing={2} alignItems="center">
                                                    <Avatar
                                                        src={pet.avatar}
                                                        variant="rounded"
                                                        sx={{ width: 44, height: 44, borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                    />
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>{pet.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                            {pet.type === 'dog' ? 'Chó' : 'Mèo'} • {pet.breed || "Chưa rõ"}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={pet.weight ? `${pet.weight}kg` : '? kg'}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '10px',
                                                            fontWeight: 800,
                                                            bgcolor: '#eff6ff',
                                                            color: '#3b82f6',
                                                            border: '1px solid #dbeafe'
                                                        }}
                                                    />
                                                </Stack>
                                            ))}
                                        </Stack>

                                        {/* Stay Details */}
                                        <Box sx={{
                                            mt: 3,
                                            p: 2,
                                            bgcolor: 'white',
                                            borderRadius: '20px',
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>Phòng/Chuồng</Typography>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Icon icon="solar:home-bold" width={16} style={{ color: '#3b82f6' }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{cage?.cageCode || "N/A"}</Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>Ngày đi</Typography>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{checkOut.format("DD/MM")}</Typography>
                                                </Grid>
                                            </Grid>

                                            {/* Progress Bar */}
                                            <Box sx={{ mt: 2 }}>
                                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#3b82f6' }}>Ngày {currentDay}/{daysTotal}</Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8' }}>{Math.round((currentDay / daysTotal) * 100)}%</Typography>
                                                </Stack>
                                                <Box sx={{ width: '100%', height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                                    <Box sx={{
                                                        width: `${Math.min(100, (currentDay / daysTotal) * 100)}%`,
                                                        height: '100%',
                                                        bgcolor: '#3b82f6',
                                                        borderRadius: 3
                                                    }} />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Footer: Actions */}
                                    <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1.5 }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => navigate(`/${prefixAdmin}/boarding/care-schedule?search=${booking.code}`)}
                                            sx={{
                                                borderRadius: '14px',
                                                py: 1.2,
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                borderColor: '#e2e8f0',
                                                color: '#1e293b',
                                                '&:hover': { borderColor: '#3b82f6', bgcolor: '#f0f7ff' }
                                            }}
                                            startIcon={<Icon icon="solar:calendar-mark-bold" />}
                                        >
                                            Lịch chăm
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => setSelectedBooking(booking)}
                                            sx={{
                                                borderRadius: '14px',
                                                py: 1.2,
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                bgcolor: '#1e293b',
                                                '&:hover': { bgcolor: '#334155' }
                                            }}
                                            startIcon={<Icon icon="solar:eye-bold" />}
                                        >
                                            Chi tiết
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            {/* Detail Dialog */}
            <Dialog
                open={Boolean(selectedBooking)}
                onClose={() => setSelectedBooking(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '32px', p: 1, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }
                }}
            >
                {selectedBooking && (
                    <>
                        <DialogTitle sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>Chi tiết lưu trú</Typography>
                            <IconButton onClick={() => setSelectedBooking(null)}>
                                <Icon icon="solar:close-circle-bold" />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ p: 3, pt: 1 }}>
                            <Stack spacing={4}>
                                {/* Booking Overview */}
                                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: '24px' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#3b82f6' }}>#{selectedBooking.code}</Typography>
                                        <Chip
                                            label={selectedBooking.boardingStatus?.toUpperCase()}
                                            size="small"
                                            sx={{ fontWeight: 800, bgcolor: selectedBooking.boardingStatus === 'checked-in' ? '#e7f5ef' : '#fff7cd', color: selectedBooking.boardingStatus === 'checked-in' ? '#007b55' : '#b78103' }}
                                        />
                                    </Stack>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>Ngày đến</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{dayjs(selectedBooking.checkInDate).format("DD/MM/YYYY")}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>Ngày đi dự kiến</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{dayjs(selectedBooking.checkOutDate).format("DD/MM/YYYY")}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Pets Section */}
                                <Box>
                                    <Typography variant="overline" sx={{ fontWeight: 800, color: '#94a3b8', mb: 2, display: 'block' }}>HỒ SƠ THÚ CƯNG</Typography>
                                    <Stack spacing={2}>
                                        {selectedBooking.petIds?.map((pet: any, i: number) => (
                                            <Card key={i} sx={{ p: 2, borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: 'none' }}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar src={pet.avatar} sx={{ width: 64, height: 64, borderRadius: '16px' }} />
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{pet.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                            {pet.breed || "Không rõ giống"} • {pet.age ? `${pet.age} tuổi` : "Chưa rõ tuổi"}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                            <Chip label={`${pet.weight || 0}kg`} size="small" variant="outlined" sx={{ height: 20, fontSize: '10px' }} />
                                                            {pet.type === 'dog' && <Chip label="Chó" size="small" color="primary" sx={{ height: 20, fontSize: '10px' }} />}
                                                            {pet.type === 'cat' && <Chip label="Mèo" size="small" color="secondary" sx={{ height: 20, fontSize: '10px' }} />}
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </Card>
                                        ))}
                                    </Stack>
                                </Box>

                                <Divider sx={{ borderStyle: 'dashed' }} />

                                {/* Owner Info */}
                                <Box>
                                    <Typography variant="overline" sx={{ fontWeight: 800, color: '#94a3b8', mb: 2, display: 'block' }}>THÔNG TIN CHỦ NUÔI</Typography>
                                    <Stack spacing={1.5}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Icon icon="solar:user-bold" style={{ color: '#94a3b8' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedBooking.userId?.fullName || selectedBooking.fullName}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Icon icon="solar:phone-bold" style={{ color: '#3b82f6' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedBooking.userId?.phone || selectedBooking.phone}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Icon icon="solar:letter-bold" style={{ color: '#94a3b8' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedBooking.userId?.email || selectedBooking.email || "N/A"}</Typography>
                                        </Stack>
                                    </Stack>
                                </Box>

                                {/* Cage & Other */}
                                <Box sx={{ p: 2.5, bgcolor: '#eff6ff', borderRadius: '24px', color: '#1e40af' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Icon icon="solar:home-bold" width={24} />
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.8 }}>CHUỒNG / PHÒNG</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 900 }}>{selectedBooking.cageId?.cageCode || "N/A"}</Typography>
                                        </Box>
                                    </Stack>
                                    {selectedBooking.notes && (
                                        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800 }}>Ghi chú:</Typography>
                                            <Typography variant="body2">{selectedBooking.notes}</Typography>
                                        </Box>
                                    )}
                                </Box>


                            </Stack>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
};
