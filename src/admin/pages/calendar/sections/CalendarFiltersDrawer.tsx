import React from 'react';
import {
    Box,
    Drawer,
    Typography,
    IconButton,
    Divider,
    Badge,
    Stack,
    ListItemButton,
    ListItemText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ReloadIcon, CloseIcon, CheckIcon, CalendarIcon } from '../../../assets/icons';
import { ServiceColorDialog } from './ServiceColorDialog';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

import { getServices } from '../../../api/service.api';
import { useSettingGeneral, useUpdateSettingGeneral } from '../../settings/hooks/useSettings';

interface Event {
    id: string;
    title: string;
    start: string;
    color: string;
    textColor?: string;
    backgroundColor?: string;
}

interface Service {
    _id: string;
    id?: string;
    name: string;
    color?: string;
}

interface CalendarFiltersDrawerProps {
    open: boolean;
    onClose: () => void;
    events: Event[];
}

const COLORS = [
    'var(--palette-primary-main)',
    '#8e33ff',
    '#00b8d9',
    '#003768',
    '#22c55e',
    '#ffab00',
    'var(--palette-error-main)',
    '#7a0916',
];

export const CalendarFiltersDrawer: React.FC<CalendarFiltersDrawerProps> = ({
    open,
    onClose,
    events,
}) => {
    const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
    const [services, setServices] = React.useState<Service[]>([]);

    // Fetch settings to get service colors
    const { data: settingGeneralData } = useSettingGeneral();
    const { mutate: updateSettingGeneral } = useUpdateSettingGeneral();

    // Convert array from settings to Record for easy lookup
    const serviceColors = React.useMemo(() => {
        const colors: Record<string, string> = {};
        settingGeneralData?.serviceColors?.forEach((sc: any) => {
            colors[sc.serviceId] = sc.color;
        });
        return colors;
    }, [settingGeneralData]);

    const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
    const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [openColorDialog, setOpenColorDialog] = React.useState(false);

    React.useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const response = await getServices();
                if (response.success || (response as any).code === 200) {
                    const data = response.data;
                    let fetchedServices: Service[] = [];

                    if (data && typeof data === 'object' && 'recordList' in data) {
                        fetchedServices = data.recordList;
                    } else if (Array.isArray(data)) {
                        fetchedServices = data;
                    } else if (data && typeof data === 'object') {
                        fetchedServices = [data as any];
                    }

                    setServices(fetchedServices);

                    // Check if there are any new services that don't have colors assigned in settings
                    const existingColorServiceIds = settingGeneralData?.serviceColors?.map((sc: any) => sc.serviceId) || [];
                    const newServiceColors = [...(settingGeneralData?.serviceColors || [])];
                    let hasNew = false;

                    fetchedServices.forEach((service: any) => {
                        const id = service._id || service.id;
                        if (id && !existingColorServiceIds.includes(id)) {
                            const usedColors = newServiceColors.map((sc: any) => sc.color);
                            const availableColor = COLORS.find(c => !usedColors.includes(c)) || COLORS[0];
                            newServiceColors.push({ serviceId: id, color: availableColor });
                            hasNew = true;
                        }
                    });

                    if (hasNew && updateSettingGeneral) {
                        updateSettingGeneral({ serviceColors: newServiceColors });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch services:', error);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchServices();
        }
    }, [open, settingGeneralData, updateSettingGeneral]);

    const handleToggleService = (serviceId: string) => {
        const index = selectedServices.indexOf(serviceId);
        if (index === -1) {
            setSelectedServices([...selectedServices, serviceId]);
        } else {
            setSelectedServices(selectedServices.filter((id) => id !== serviceId));
        }
    };

    const handleChangeColor = (serviceId: string, color: string) => {
        if (!updateSettingGeneral) return;

        const currentColors = settingGeneralData?.serviceColors || [];
        const index = currentColors.findIndex((sc: any) => sc.serviceId === serviceId);

        let newServiceColors;
        if (index > -1) {
            newServiceColors = [...currentColors];
            newServiceColors[index] = { ...newServiceColors[index], color };
        } else {
            newServiceColors = [...currentColors, { serviceId, color }];
        }

        updateSettingGeneral({ serviceColors: newServiceColors });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                slotProps={{
                    backdrop: {
                        sx: {
                            backgroundColor: 'transparent',
                        },
                    },
                }}
                PaperProps={{
                    sx: {
                        p: "0px",
                        borderRadius: "0",
                        width: 320,
                        bgcolor: 'background.paper',
                        boxShadow: '-24px 12px 32px -4px rgba(145, 158, 171, 0.16)',
                    },
                }}
            >
                {/* Header */}
                <Box sx={{ py: "calc(2 * var(--spacing))", pl: "20px", pr: "8px", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
                        Bộ lọc
                    </Typography>
                    <Box>
                        <IconButton size="medium">
                            <Badge variant="dot" sx={{ '& .MuiBadge-badge': { bgcolor: 'var(--palette-error-main)' } }}>
                                <ReloadIcon sx={{ fontSize: 20, color: 'var(--palette-text-secondary)' }} />
                            </Badge>
                        </IconButton>
                        <IconButton size="medium" onClick={onClose}>
                            <CloseIcon sx={{ fontSize: 20, color: 'var(--palette-text-secondary)' }} />
                        </IconButton>
                    </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(145, 158, 171, 0.2)' }} />

                {/* Content */}
                <Box sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: 'rgba(145, 158, 171, 0.2)',
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-track': {
                        bgcolor: 'transparent',
                    },
                }}>
                    <Box sx={{ p: '24px 20px 0px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '16px' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--palette-text-primary)' }}>
                                Dịch vụ & Màu sắc
                            </Typography>
                        </Box>
                        <Stack spacing={1}>
                            {loading ? (
                                <Box sx={{ py: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'var(--palette-text-secondary)' }}>
                                        Đang tải dịch vụ...
                                    </Typography>
                                </Box>
                            ) : services.length === 0 ? (
                                <Box sx={{ py: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'var(--palette-text-secondary)' }}>
                                        Không tìm thấy dịch vụ nào
                                    </Typography>
                                </Box>
                            ) : (
                                services.map((service) => {
                                    const id = service._id || service.id;
                                    const isSelected = id ? selectedServices.includes(id) : false;
                                    const currentColor = (id ? serviceColors[id] : null) || COLORS[0];
                                    return (
                                        <Box key={id} sx={{ mb: 1 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: '8px 12px',
                                                    borderRadius: "var(--shape-borderRadius)",
                                                    cursor: 'pointer',
                                                    bgcolor: isSelected ? 'rgba(145, 158, 171, 0.08)' : 'transparent',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(145, 158, 171, 0.12)',
                                                    },
                                                }}
                                                onClick={() => id && handleToggleService(id)}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box
                                                        sx={{
                                                            width: 16,
                                                            height: 16,
                                                            borderRadius: '50%',
                                                            bgcolor: currentColor,
                                                            flexShrink: 0,
                                                            border: '2px solid #fff',
                                                            boxShadow: '0 0 0 1px rgba(145, 158, 171, 0.24)',
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'var(--palette-text-primary)', fontWeight: 500 }}>
                                                        {service.name}
                                                    </Typography>
                                                </Box>
                                                {isSelected && <CheckIcon sx={{ fontSize: 16, color: 'var(--palette-primary-main)' }} />}
                                            </Box>
                                        </Box>
                                    );
                                })
                            )}
                        </Stack>
                    </Box>

                    {/* Range Section */}
                    <Box sx={{ p: '24px 20px' }}>
                        <Typography variant="subtitle2" sx={{ mb: '12px', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--palette-text-primary)' }}>
                            Phạm vi
                        </Typography>
                        <Stack
                            spacing={3}
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--palette-text-disabled)33 !important',
                                },
                                '& .Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--palette-text-primary) !important',
                                    borderWidth: '2px !important',
                                }
                            }}
                        >
                            <DatePicker
                                label="Ngày bắt đầu"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                format="DD/MM/YYYY"
                                dayOfWeekFormatter={(day) => {
                                    const map = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                                    return map[dayjs(day).day()];
                                }}
                                slots={{
                                    openPickerIcon: (props) => <CalendarIcon {...props} sx={{ fontSize: 24, color: 'var(--palette-text-secondary)' }} />,
                                    switchViewIcon: (props) => (
                                        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 15.5a1 1 0 0 1-.71-.29l-4-4a1 1 0 1 1 1.42-1.42L12 13.1l3.3-3.18a1 1 0 1 1 1.38 1.44l-4 3.86a1 1 0 0 1-.68.28" fill="currentColor" />
                                        </svg>
                                    ),
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        InputLabelProps: {
                                            shrink: true,
                                            sx: { color: 'var(--palette-text-secondary)', fontSize: '1rem', fontWeight: 600 }
                                        },
                                        sx: {
                                            '& .MuiPickersOutlinedInput-root': {
                                                fontSize: '0.9375rem',
                                                borderRadius: "var(--shape-borderRadius)",
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderWidth: '1px',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderWidth: '2px !important',
                                                    borderColor: 'var(--palette-text-primary) !important',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '0.9375rem',
                                                padding: '12px 14px',
                                            },
                                        }
                                    },
                                    popper: {
                                        sx: {
                                            '& .MuiPaper-root': {
                                                borderRadius: "var(--shape-borderRadius-lg)",
                                                boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                                                border: '1px solid rgba(145, 158, 171, 0.12)',
                                                mt: 0,
                                                padding: 0,
                                                bgcolor: "var(--palette-background-paper)",
                                                backgroundImage: 'none',
                                            },
                                            '& .MuiPickersLayout-root': {
                                                padding: 0,
                                            },
                                            '& .MuiPickersLayout-contentWrapper': {
                                                padding: 0,
                                            },
                                            '& .MuiPickersLayout-actionBar': {
                                                padding: 0,
                                            },
                                            '& .MuiPickersLayout-header': {
                                                padding: 0,
                                            },
                                            '& .MuiPickersDay-root': {
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                '&:hover': {
                                                    bgcolor: 'var(--palette-primary-main)14 !important',
                                                }
                                            },
                                            '& .MuiPickersDay-root.Mui-selected': {
                                                bgcolor: 'var(--palette-primary-main) !important',
                                                color: '#fff !important',
                                                fontWeight: 500,
                                            },
                                            '& .MuiPickersDay-root.MuiPickersDay-today': {
                                                bgcolor: startDate ? 'transparent !important' : 'var(--palette-primary-main)14 !important',
                                            },
                                            '& .MuiDayCalendar-weekDayLabel': {
                                                color: 'var(--palette-text-secondary)',
                                                fontSize: '0.75rem',
                                            },
                                            '& .MuiPickersCalendarHeader-label': {
                                                fontSize: '1rem',
                                                fontWeight: 500,
                                            },
                                            '& .MuiPickersCalendarHeader-switchViewIcon': {
                                                fontSize: '24px',
                                                color: 'var(--palette-text-secondary)',
                                            },
                                            '& .MuiPickersArrowSwitcher-button .MuiSvgIcon-root': {
                                                fontSize: '24px',
                                            },
                                            '& .MuiYearCalendar-root .MuiYearCalendar-button': {
                                                fontSize: '1rem !important',
                                                fontWeight: '600 !important',
                                            },
                                            '& .MuiYearCalendar-root .MuiYearCalendar-button.Mui-selected': {
                                                bgcolor: 'var(--palette-primary-main) !important',
                                                color: '#fff !important',
                                                fontWeight: 500,
                                            },
                                        }
                                    },
                                }}
                            />
                            <DatePicker
                                label="Ngày kết thúc"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                format="DD/MM/YYYY"
                                dayOfWeekFormatter={(day) => {
                                    const map = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                                    return map[dayjs(day).day()];
                                }}
                                slots={{
                                    openPickerIcon: (props) => <CalendarIcon {...props} sx={{ fontSize: 24, color: 'var(--palette-text-secondary)' }} />,
                                    switchViewIcon: (props) => (
                                        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 15.5a1 1 0 0 1-.71-.29l-4-4a1 1 0 1 1 1.42-1.42L12 13.1l3.3-3.18a1 1 0 1 1 1.38 1.44l-4 3.86a1 1 0 0 1-.68.28" fill="currentColor" />
                                        </svg>
                                    ),
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        InputLabelProps: {
                                            shrink: true,
                                            sx: { color: 'var(--palette-text-secondary)', fontSize: '1rem', fontWeight: 600 }
                                        },
                                        sx: {
                                            '& .MuiPickersOutlinedInput-root': {
                                                fontSize: '0.9375rem',
                                                borderRadius: "var(--shape-borderRadius)",
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderWidth: '1px',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderWidth: '2px !important',
                                                    borderColor: 'var(--palette-text-primary) !important',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '0.9375rem',
                                                padding: '12px 14px',
                                            },
                                        }
                                    },
                                    popper: {
                                        sx: {
                                            '& .MuiPaper-root': {
                                                borderRadius: "var(--shape-borderRadius-lg)",
                                                boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                                                border: '1px solid rgba(145, 158, 171, 0.12)',
                                                mt: 0,
                                                padding: 0,
                                                bgcolor: "var(--palette-background-paper)",
                                                backgroundImage: 'none',
                                            },
                                            '& .MuiPickersLayout-root': {
                                                padding: 0,
                                            },
                                            '& .MuiPickersLayout-contentWrapper': {
                                                padding: 0,
                                            },
                                            '& .MuiPickersLayout-actionBar': {
                                                padding: 0,
                                            },
                                            '& .MuiPickersLayout-header': {
                                                padding: 0,
                                            },
                                            '& .MuiPickersDay-root': {
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                '&:hover': {
                                                    bgcolor: 'var(--palette-primary-main)14 !important',
                                                }
                                            },
                                            '& .MuiPickersDay-root.Mui-selected': {
                                                bgcolor: 'var(--palette-primary-main) !important',
                                                color: '#fff !important',
                                                fontWeight: 500,
                                            },
                                            '& .MuiPickersDay-root.MuiPickersDay-today': {
                                                borderColor: endDate ? 'transparent !important' : 'var(--palette-text-primary) !important',
                                                bgcolor: endDate ? 'transparent !important' : 'var(--palette-primary-main)14 !important',
                                            },
                                            '& .MuiDayCalendar-weekDayLabel': {
                                                color: 'var(--palette-text-secondary)',
                                                fontSize: '0.75rem',
                                            },
                                            '& .MuiPickersCalendarHeader-label': {
                                                fontSize: '1rem',
                                                fontWeight: 500,
                                            },
                                            '& .MuiPickersCalendarHeader-switchViewIcon': {
                                                fontSize: '24px',
                                                color: 'var(--palette-text-secondary)',
                                            },
                                            '& .MuiPickersArrowSwitcher-button .MuiSvgIcon-root': {
                                                fontSize: '24px',
                                            },
                                            '& .MuiYearCalendar-root .MuiYearCalendar-button': {
                                                fontSize: '1rem !important',
                                                fontWeight: '600 !important',
                                            },
                                            '& .MuiYearCalendar-root .MuiYearCalendar-button.Mui-selected': {
                                                bgcolor: 'var(--palette-primary-main) !important',
                                                color: '#fff !important',
                                                fontWeight: 500,
                                            },
                                        }
                                    },
                                }}
                            />
                        </Stack>
                    </Box>

                    {/* Events Section */}
                    <Box sx={{ pt: '24px' }}>
                        <Typography variant="subtitle2" sx={{ px: '20px', mb: '8px', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--palette-text-primary)' }}>
                            Sự kiện ({events.length})
                        </Typography>
                        <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                            {events.map((event) => (
                                <li key={event.id}>
                                    <ListItemButton
                                        sx={{
                                            p: '12px 16px',
                                            borderRadius: 0,
                                            position: 'relative',
                                            margin: "0",
                                            borderBottom: '1px dashed rgba(145, 158, 171, 0.2)',
                                            '&:hover': {
                                                bgcolor: 'rgba(145, 158, 171, 0.08)',
                                            }
                                        }}
                                    >
                                        {/* Triangle Flag */}
                                        <Box
                                            sx={{
                                                top: "calc(2 * var(--spacing))",
                                                left: 0,
                                                width: 0,
                                                height: 0,
                                                position: 'absolute',
                                                borderRight: '10px solid transparent',
                                                borderTop: `10px solid ${event.color}`,
                                            }}
                                        />
                                        <ListItemText
                                            disableTypography
                                            sx={{ margin: "0" }}
                                            primary={
                                                <Typography variant="caption" sx={{ color: 'var(--palette-text-disabled)', fontSize: '0.75rem', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                                    {dayjs(event.start).format('DD MMM YYYY HH:mm')}
                                                    {event.start.includes('T') && ` - ${dayjs(event.start).add(1, 'hour').format('DD MMM YYYY HH:mm')}`}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="subtitle2" sx={{ color: 'var(--palette-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                                                    {event.title}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                </li>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Drawer>
            <ServiceColorDialog
                open={openColorDialog}
                onClose={() => setOpenColorDialog(false)}
                services={services}
                serviceColors={serviceColors}
                onChangeColor={handleChangeColor}
                colors={COLORS}
            />
        </LocalizationProvider>
    );
};




