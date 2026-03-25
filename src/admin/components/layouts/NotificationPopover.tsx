import { useState } from "react";
import {
    Box,
    Badge,
    IconButton,
    Typography,
    Divider,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Button,
    Drawer,
    Stack,
    Tabs,
    Tab,
    Tooltip
} from "@mui/material";
import { Icon } from "@iconify/react";
import {
    useNotifications,
    useMarkAsRead,
    useMarkAllAsRead,
    useArchiveAllNotifications,
} from "../../hooks/useNotification";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/vi';
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const NotificationPopover = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState("all");

    const { data: res } = useNotifications();
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: markAllAsRead } = useMarkAllAsRead();
    const { mutate: archiveAllNotifications } = useArchiveAllNotifications();

    const allNotifications = res?.data || [];
    // Only show non-archived notifications in All/Unread
    const activeNotifications = allNotifications.filter((n: any) => n.status !== 'archived');
    const unreadNotifications = allNotifications.filter((n: any) => n.status === 'unread');
    const archivedNotifications = allNotifications.filter((n: any) => n.status === 'archived');

    let displayNotifications = [];
    if (tab === "all") displayNotifications = activeNotifications;
    else if (tab === "unread") displayNotifications = unreadNotifications;
    else displayNotifications = archivedNotifications;

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleClickItem = (item: any) => {
        if (item.status === 'unread') {
            markAsRead(item._id);
        }
        if (item.link) {
            navigate(item.link);
            handleClose();
        }
    };

    return (
        <>
            <IconButton
                onClick={handleOpen}
                sx={{
                    width: 40,
                    height: 40,
                    color: isOpen ? 'primary.main' : 'var(--palette-action-active)',
                    bgcolor: isOpen ? 'rgba(145, 158, 171, 0.08)' : 'transparent',
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                        bgcolor: 'rgba(145, 158, 171, 0.08)',
                        transform: 'scale(1.04)'
                    }
                }}
            >
                <Badge badgeContent={unreadNotifications.length} color="error">
                    <Icon icon="solar:bell-bing-bold-duotone" width={24} />
                </Badge>
            </IconButton>

            <Drawer
                anchor="right"
                open={isOpen}
                onClose={handleClose}
                slotProps={{
                    backdrop: {
                        sx: {
                            backgroundColor: 'transparent',
                        }
                    },
                    paper: {
                        className: 'background-popup',
                        sx: {
                            width: { xs: 1, sm: 420 },
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 0,
                        }
                    }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: 68,
                        py: 2,
                        px: 2.5
                    }}
                >
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: 'var(--palette-text-primary)'
                            }}
                        >
                            Thông báo
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Đánh dấu tất cả là đã đọc">
                            <IconButton
                                sx={{ color: 'var(--palette-primary-main)' }}
                                onClick={() => markAllAsRead()}
                            >
                                <Icon icon="eva:done-all-fill" width={20} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Lưu trữ tất cả">
                            <IconButton
                                sx={{ color: 'text.secondary' }}
                                onClick={() => archiveAllNotifications()}
                            >
                                <Icon icon="solar:archive-bold-duotone" width={20} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Đóng">
                            <IconButton onClick={handleClose}>
                                <Icon icon="mingcute:close-line" width={20} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                <Tabs
                    value={tab}
                    onChange={(_, newValue) => setTab(newValue)}
                    sx={{
                        minHeight: 48,
                        display: 'flex',
                        overflow: 'hidden',
                        bgcolor: 'var(--palette-background-neutral)',
                        '& .MuiTabs-indicator': { display: 'none' },
                        '& .MuiTabs-flexContainer': {
                            gap: 1,
                            height: '100%',
                            alignItems: 'center',
                            px: '8px'
                        }
                    }}
                >
                    <Tab
                        disableRipple
                        label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Tất cả</Typography>
                                <Box sx={{
                                    bgcolor: tab === 'all' ? '#212B36' : 'rgba(145, 158, 171, 0.16)',
                                    color: tab === 'all' ? 'white' : '#637381',
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}>
                                    {activeNotifications.length}
                                </Box>
                            </Stack>
                        }
                        value="all"
                        sx={{
                            height: 34,
                            minHeight: 34,
                            px: '16px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            lineHeight: 1.57143,
                            color: 'var(--palette-text-secondary)',
                            flex: '1 1 0px',
                            opacity: 1,
                            '&.Mui-selected': {
                                bgcolor: 'var(--palette-common-white)',
                                color: 'var(--palette-text-primary)',
                                fontWeight: 600,
                                boxShadow: 'var(--customShadows-z1)'
                            }
                        }}
                    />
                    <Tab
                        disableRipple
                        label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle2" sx={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Chưa đọc</Typography>
                                <Box sx={{
                                    bgcolor: tab === 'unread' ? '#00B8D9' : 'rgba(0, 184, 217, 0.16)',
                                    color: tab === 'unread' ? 'white' : '#006C9C',
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}>
                                    {unreadNotifications.length}
                                </Box>
                            </Stack>
                        }
                        value="unread"
                        sx={{
                            height: 34,
                            minHeight: 34,
                            px: '16px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            lineHeight: 1.57143,
                            color: 'var(--palette-text-secondary)',
                            flex: '1 1 0px',
                            opacity: 1,
                            '&.Mui-selected': {
                                bgcolor: 'var(--palette-common-white)',
                                color: 'var(--palette-text-primary)',
                                fontWeight: 600,
                                boxShadow: 'var(--customShadows-z1)'
                            }
                        }}
                    />
                    <Tab
                        disableRipple
                        label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Lưu trữ</Typography>
                                <Box sx={{
                                    bgcolor: tab === 'archived' ? '#22C55E' : 'rgba(34, 197, 94, 0.16)',
                                    color: tab === 'archived' ? 'white' : '#118D57',
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}>
                                    {archivedNotifications.length}
                                </Box>
                            </Stack>
                        }
                        value="archived"
                        sx={{
                            height: 34,
                            minHeight: 34,
                            px: '16px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            lineHeight: 1.57143,
                            color: 'var(--palette-text-secondary)',
                            flex: '1 1 0px',
                            opacity: 1,
                            '&.Mui-selected': {
                                bgcolor: 'var(--palette-common-white)',
                                color: 'var(--palette-text-primary)',
                                fontWeight: 600,
                                boxShadow: 'var(--customShadows-z1)'
                            }
                        }}
                    />
                </Tabs>

                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {displayNotifications.length === 0 ? (
                        <Box sx={{ py: 10, textAlign: 'center' }}>
                            <Icon icon="solar:bell-off-bold-duotone" width={64} style={{ opacity: 0.24, marginBottom: 16 }} />
                            <Typography variant="body2" color="text.disabled">Không có thông báo nào</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {displayNotifications.map((item: any) => (
                                <ListItemButton
                                    key={item._id}
                                    onClick={() => handleClickItem(item)}
                                    sx={{
                                        p: '20px',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        borderBottom: 'dashed 1px var(--palette-divider)',
                                        bgcolor: item.status === 'unread' ? 'rgba(145, 158, 171, 0.04)' : 'transparent',
                                        transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': { bgcolor: 'rgba(145, 158, 171, 0.08)' }
                                    }}
                                >
                                    {item.status === 'unread' && (
                                        <Box
                                            className="unread-dot"
                                            sx={{
                                                top: 26,
                                                width: 8,
                                                height: 8,
                                                right: 20,
                                                borderRadius: '50%',
                                                bgcolor: 'var(--palette-info-main)',
                                                position: 'absolute',
                                            }}
                                        />
                                    )}

                                    <ListItemAvatar
                                        sx={{
                                            flexShrink: 0,
                                            minWidth: 'auto',
                                            mr: 2
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                display: 'flex',
                                                borderRadius: '50%',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'var(--palette-background-neutral)',
                                            }}
                                        >
                                            <Icon
                                                icon={
                                                    item.type === 'overrun' ? "solar:danger-bold-duotone" :
                                                        item.type === 'booking' ? "solar:calendar-mark-bold-duotone" :
                                                            item.type === 'boarding' ? "solar:home-bold-duotone" :
                                                                "solar:bell-bold-duotone"
                                                }
                                                width={24}
                                                color={item.type === 'overrun' ? "#FF5630" :
                                                    item.type === 'boarding' ? "#FFAB00" : "#00B8D9"}
                                            />
                                        </Box>
                                    </ListItemAvatar>
                                    <ListItemText
                                        sx={{ m: 0 }}
                                        primary={
                                            <Box sx={{
                                                fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                                fontWeight: 400,
                                                fontSize: '0.875rem',
                                                lineHeight: 1.57143,
                                                mb: 0.5,
                                                pr: 2
                                            }}>
                                                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{item.title}</Box>
                                                {" "}
                                                <Box component="span" sx={{ color: 'text.secondary' }}>{item.content}</Box>
                                            </Box>
                                        }
                                        secondary={
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                    {dayjs(item.createdAt).fromNow()}
                                                </Typography>
                                                <Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                    {item.type === 'order' ? 'Đơn hàng' :
                                                        item.type === 'booking' ? 'Dịch vụ' :
                                                            item.type === 'boarding' ? 'Khách sạn' :
                                                                item.type === 'overrun' ? 'Hệ thống' : 'Thông báo'}
                                                </Typography>
                                            </Stack>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Box>

                <Divider />

                <Box sx={{ p: 1 }}>
                    <Button
                        fullWidth
                        size="large"
                        color="inherit"
                        onClick={() => {
                            navigate('/admin/notifications');
                            handleClose();
                        }}
                        sx={{
                            fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: '8px',
                            minHeight: 48,
                        }}
                    >
                        Xem tất cả
                    </Button>
                </Box>
            </Drawer>
        </>
    );
};
