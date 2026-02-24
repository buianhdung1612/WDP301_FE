import { useState } from 'react';
import {
    Box,
    Card,
} from '@mui/material';
import { Title } from '../../components/ui/Title';
import { ChatSidebar, ChatWindow } from './sections';

export const ChatPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <Box sx={{ p: 'calc(3 * var(--spacing))', height: '100%' }}>
            <Box sx={{ mb: 4 }}>
                <Title title="Chat" />
            </Box>

            <Card
                sx={{
                    height: 'calc(100vh - 200px)',
                    display: 'flex',
                    borderRadius: 'var(--shape-borderRadius-lg)',
                    boxShadow: 'var(--customShadows-card)',
                    overflow: 'hidden'
                }}
            >
                <ChatSidebar
                    selectedId={selectedId}
                    onSelect={(id) => setSelectedId(id)}
                />

                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: 'var(--palette-background-default)' }}>
                    <ChatWindow conversationId={selectedId} />
                </Box>
            </Card>
        </Box>
    );
};
