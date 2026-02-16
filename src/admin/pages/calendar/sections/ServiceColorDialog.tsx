import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Stack,
} from '@mui/material';
import { CloseIcon, CheckIcon } from '../../../assets/icons';

interface Service {
    _id: string;
    name: string;
    id?: string;
}

interface ServiceColorDialogProps {
    open: boolean;
    onClose: () => void;
    services: Service[];
    serviceColors: Record<string, string>;
    onChangeColor: (serviceId: string, color: string) => void;
    colors: string[];
}

export const ServiceColorDialog: React.FC<ServiceColorDialogProps> = ({
    open,
    onClose,
    services,
    serviceColors,
    onChangeColor,
    colors,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '430px',
                    bgcolor: 'background.paper',
                    boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.16)',
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '16px 20px',
                borderBottom: '1px dashed rgba(145, 158, 171, 0.2)'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#1C252E' }}>
                    Cấu hình màu sắc dịch vụ
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: '#637381' }}>
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{
                p: '24px 20px !important',
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(145, 158, 171, 0.2)', borderRadius: '10px' }
            }}>
                <Stack spacing={4}>
                    {services.map((service) => {
                        const id = service._id || service.id;
                        if (!id) return null;
                        const currentColor = serviceColors[id] || colors[0];
                        return (
                            <Box key={id}>
                                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, fontSize: '0.875rem', color: '#1C252E' }}>
                                    {service.name}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                    {colors.map((color) => (
                                        <Box
                                            key={color}
                                            onClick={() => onChangeColor(id, color)}
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: '50%',
                                                bgcolor: color,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '2px solid transparent',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'scale(1.15)',
                                                    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.12)',
                                                },
                                            }}
                                        >
                                            {currentColor === color && (
                                                <CheckIcon sx={{ color: '#fff', fontSize: 20 }} />
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>
            </DialogContent>
        </Dialog>
    );
};
