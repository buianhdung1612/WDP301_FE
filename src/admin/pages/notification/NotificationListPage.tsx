import { useState } from "react";
import {
    Box,
    Card,
    Typography,
    Stack,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    IconButton,
    Tooltip,
    Button,
    Container
} from "@mui/material";
import { Icon } from "@iconify/react";
import {
    useNotifications,
    useMarkAsRead,
    useArchiveNotification,
    useDeleteNotification,
    useMarkAllAsRead,
    useArchiveAllNotifications
} from "../../hooks/useNotification";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const NotificationListPage = () => {
    const [tab, setTab] = useState("all");
    const { data: res, isLoading } = useNotifications();
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: archiveNotification } = useArchiveNotification();
    const { mutate: deleteNotification } = useDeleteNotification();
    const { mutate: markAllAsRead } = useMarkAllAsRead();
    const { mutate: archiveAllNotifications } = useArchiveAllNotifications();

    const notifications = res?.data || [];

    const activeNotifications = notifications.filter((n: any) => n.status !== 'archived');
    const unreadNotifications = notifications.filter((n: any) => n.status === 'unread');
    const archivedNotifications = notifications.filter((n: any) => n.status === 'archived');

    let displayNotifications = [];
    if (tab === "all") displayNotifications = activeNotifications;
    else if (tab === "unread") displayNotifications = unreadNotifications;
    else displayNotifications = archivedNotifications;

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Thông báo</Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        color="inherit"
                        startIcon={<Icon icon="eva:done-all-fill" />}
                        onClick={() => markAllAsRead()}
                    >
                        Đánh dấu tất cả là đã đọc
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<Icon icon="solar:archive-bold-duotone" />}
                        onClick={() => archiveAllNotifications()}
                    >
                        Lưu trữ tất cả
                    </Button>
                </Stack>
            </Stack>

            <Card sx={{ p: 0 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        px: 2,
                        bgcolor: 'background.neutral',
                        borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                    }}
                >
                    <Tab label={`Tất cả (${activeNotifications.length})`} value="all" />
                    <Tab label={`Chưa đọc (${unreadNotifications.length})`} value="unread" />
                    <Tab label={`Lưu trữ (${archivedNotifications.length})`} value="archived" />
                </Tabs>

                {isLoading ? (
                    <Box sx={{ py: 10, textAlign: 'center' }}>Loading...</Box>
                ) : displayNotifications.length === 0 ? (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Icon icon="solar:bell-off-bold-duotone" width={64} style={{ opacity: 0.24, marginBottom: 16 }} />
                        <Typography variant="body2" color="text.disabled">Không có thông báo nào</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {displayNotifications.map((item: any) => (
                            <ListItem
                                key={item._id}
                                sx={{
                                    py: 2.5,
                                    px: 3,
                                    borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                                    bgcolor: item.status === 'unread' ? 'rgba(0, 184, 217, 0.04)' : 'transparent',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                        '& .item-actions': { opacity: 1 }
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            bgcolor: item.type === 'overrun' ? 'rgba(255, 86, 48, 0.12)' : 'rgba(0, 184, 217, 0.12)'
                                        }}
                                    >
                                        <Icon
                                            icon={item.type === 'overrun' ? "solar:danger-bold-duotone" : "solar:bell-bold-duotone"}
                                            width={24}
                                            color={item.type === 'overrun' ? "#FF5630" : "#00B8D9"}
                                        />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" sx={{ fontWeight: item.status === 'unread' ? 700 : 500 }}>
                                            {item.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                                                {item.content}
                                            </Typography>
                                            <Stack direction="row" spacing={2}>
                                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.disabled' }}>
                                                    <Icon icon="solar:clock-circle-outline" width={14} />
                                                    <Typography variant="caption">{dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}</Typography>
                                                </Stack>
                                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                    • {item.type === 'overrun' ? 'Hệ thống' : 'Đơn hàng'}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    }
                                />
                                <Stack direction="row" spacing={1} className="item-actions" sx={{ transition: 'opacity 0.2s' }}>
                                    {item.status === 'unread' && (
                                        <Tooltip title="Đánh dấu đã đọc">
                                            <IconButton color="primary" onClick={() => markAsRead(item._id)}>
                                                <Icon icon="eva:checkmark-fill" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {item.status !== 'archived' && (
                                        <Tooltip title="Lưu trữ">
                                            <IconButton color="inherit" onClick={() => archiveNotification(item._id)}>
                                                <Icon icon="solar:archive-bold-duotone" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Xóa">
                                        <IconButton color="error" onClick={() => deleteNotification(item._id)}>
                                            <Icon icon="solar:trash-bin-trash-bold" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Card>
        </Container>
    );
};
