import {
    Box,
    Stack,
    TextField,
    Typography,
    Avatar,
    InputAdornment,
    List,
    ListItemButton,
    Badge,
    CircularProgress,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useState, useMemo } from 'react';
import { useUsers } from '../../account-user/hooks/useAccountUser';

interface ChatSidebarProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export const ChatSidebar = ({ selectedId, onSelect }: ChatSidebarProps) => {
    const [search, setSearch] = useState('');
    const { data: usersData, isLoading } = useUsers({ limit: 100 });
    const users: any[] = (usersData as any)?.recordList || [];

    const filtered = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter((u: any) =>
            u.fullName?.toLowerCase().includes(q) ||
            u.phone?.includes(q) ||
            u.email?.toLowerCase().includes(q)
        );
    }, [users, search]);

    return (
        <Box
            sx={{
                width: 320,
                borderRight: '1px solid var(--palette-divider)',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'white',
                flexShrink: 0,
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2.5, pb: 1.5, borderBottom: '1px solid var(--palette-divider)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Tin nhắn
                </Typography>

                {/* Search */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Tìm kiếm khách hàng..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icon icon="eva:search-fill" color="var(--palette-text-disabled)" width={18} />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 1.5,
                            bgcolor: 'var(--palette-background-neutral)',
                            '& fieldset': { border: 'none' },
                        },
                    }}
                />
            </Box>

            {/* Customer List */}
            <List sx={{ flexGrow: 1, overflowY: 'auto', px: 1, py: 1 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                            Không tìm thấy khách hàng
                        </Typography>
                    </Box>
                ) : (
                    filtered.map((user: any) => (
                        <ListItemButton
                            key={user._id}
                            selected={selectedId === user._id}
                            onClick={() => onSelect(user._id)}
                            sx={{
                                borderRadius: 1,
                                mb: 0.5,
                                p: 1.5,
                                '&.Mui-selected': {
                                    bgcolor: 'var(--palette-background-neutral)',
                                    '&:hover': { bgcolor: 'rgba(145,158,171,0.12)' },
                                },
                                '&:hover': { bgcolor: 'rgba(145,158,171,0.08)' },
                            }}
                        >
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                    <Box
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            bgcolor: user.status === 'active' ? '#44b700' : '#919EAB',
                                            border: '2px solid white',
                                            borderRadius: '50%',
                                        }}
                                    />
                                }
                            >
                                <Avatar
                                    src={user.avatar}
                                    sx={{ width: 48, height: 48, bgcolor: 'var(--palette-primary-light)', color: 'var(--palette-primary-dark)', fontWeight: 700 }}
                                >
                                    {user.fullName?.[0]?.toUpperCase()}
                                </Avatar>
                            </Badge>

                            <Box sx={{ ml: 2, flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                                    {user.fullName || 'Ẩn danh'}
                                </Typography>
                                <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                                    {user.phone || user.email || '—'}
                                </Typography>
                            </Box>
                        </ListItemButton>
                    ))
                )}
            </List>
        </Box>
    );
};
