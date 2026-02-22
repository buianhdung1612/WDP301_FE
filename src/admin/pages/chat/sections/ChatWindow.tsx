import {
    Box,
    Stack,
    Typography,
    Avatar,
    Badge,
    IconButton,
    InputBase,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useUsers } from '../../account-user/hooks/useAccountUser';

interface ChatWindowProps {
    conversationId: string | null;
}

// Dữ liệu tin nhắn giả cho preview giao diện
const MOCK_MESSAGES: Record<string, { from: 'admin' | 'user'; text: string; time: string }[]> = {};

export const ChatWindow = ({ conversationId }: ChatWindowProps) => {
    const [message, setMessage] = useState('');
    const { data: usersData } = useUsers({ limit: 100 });
    const users: any[] = (usersData as any)?.recordList || [];
    const contact = users.find((u: any) => u._id === conversationId);
    const messages = conversationId ? (MOCK_MESSAGES[conversationId] || []) : [];

    const handleSend = () => {
        if (!message.trim()) return;
        // TODO: gọi API gửi tin nhắn
        setMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Empty state
    if (!conversationId) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'white',
                }}
            >
                <Box
                    sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        bgcolor: 'var(--palette-background-neutral)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                    }}
                >
                    <Icon icon="solar:chat-round-dots-bold" width={56} color="var(--palette-primary-main)" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Barlow, sans-serif' }}>
                    Chào buổi sáng!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Chọn một khách hàng để bắt đầu trò chuyện
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                sx={{
                    px: 2.5,
                    py: 1.5,
                    borderBottom: '1px solid var(--palette-divider)',
                    minHeight: 72,
                    flexShrink: 0,
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
                                bgcolor: contact?.status === 'active' ? '#44b700' : '#919EAB',
                                border: '2px solid white',
                                borderRadius: '50%',
                            }}
                        />
                    }
                >
                    <Avatar
                        src={contact?.avatar}
                        sx={{
                            width: 44,
                            height: 44,
                            bgcolor: 'var(--palette-primary-light)',
                            color: 'var(--palette-primary-dark)',
                            fontWeight: 700,
                        }}
                    >
                        {contact?.fullName?.[0]?.toUpperCase()}
                    </Avatar>
                </Badge>

                <Box sx={{ ml: 1.5, flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {contact?.fullName || 'Khách hàng'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {contact?.phone || contact?.email || ''}
                    </Typography>
                </Box>
            </Stack>

            {/* Messages */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    bgcolor: 'var(--palette-background-default)',
                }}
            >
                {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                            Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!
                        </Typography>
                    </Box>
                ) : (
                    messages.map((msg, idx) => (
                        <Stack
                            key={idx}
                            direction="row"
                            justifyContent={msg.from === 'admin' ? 'flex-end' : 'flex-start'}
                        >
                            <Box
                                sx={{
                                    maxWidth: '65%',
                                    px: 2,
                                    py: 1,
                                    borderRadius: msg.from === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    bgcolor: msg.from === 'admin' ? 'var(--palette-grey-800)' : 'white',
                                    color: msg.from === 'admin' ? 'white' : 'var(--palette-text-primary)',
                                    boxShadow: msg.from === 'user' ? 'var(--customShadows-card)' : 'none',
                                }}
                            >
                                <Typography variant="body2">{msg.text}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mt: 0.5, textAlign: 'right' }}>
                                    {msg.time}
                                </Typography>
                            </Box>
                        </Stack>
                    ))
                )}
            </Box>

            {/* Input bar */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: 'white',
                    borderTop: '1px solid var(--palette-divider)',
                    flexShrink: 0,
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        px: 2,
                        py: 0.75,
                        borderRadius: 2,
                        border: '1px solid var(--palette-divider)',
                        '&:focus-within': { borderColor: 'var(--palette-text-primary)' },
                        transition: 'border-color 0.2s',
                    }}
                >
                    <InputBase
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Nhập tin nhắn..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        sx={{ fontSize: '0.875rem' }}
                    />
                    <IconButton
                        size="small"
                        onClick={handleSend}
                        disabled={!message.trim()}
                        sx={{
                            bgcolor: message.trim() ? 'var(--palette-grey-800)' : 'transparent',
                            color: message.trim() ? 'white' : 'var(--palette-text-disabled)',
                            '&:hover': { bgcolor: message.trim() ? 'var(--palette-grey-700)' : 'transparent' },
                            transition: 'all 0.2s',
                            flexShrink: 0,
                        }}
                    >
                        <Icon icon="solar:send-bold" width={20} />
                    </IconButton>
                </Stack>
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                    Nhấn Enter để gửi · Shift+Enter để xuống dòng
                </Typography>
            </Box>
        </Box>
    );
};
