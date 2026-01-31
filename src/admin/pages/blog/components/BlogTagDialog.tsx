import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    CircularProgress,
    Typography,
    Tooltip
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Delete as DeleteIcon, Close as CloseIcon } from "@mui/icons-material";
import { useBlogTags, useCreateBlogTag, useDeleteBlogTag } from "../hooks/useBlog";
import { toast } from "react-toastify";

interface BlogTagDialogProps {
    open: boolean;
    onClose: () => void;
}

export const BlogTagDialog = ({ open, onClose }: BlogTagDialogProps) => {
    const { t } = useTranslation();
    const [tagName, setTagName] = useState("");

    // Hooks
    const { data: tags = [], isLoading } = useBlogTags();
    const { mutate: createTag, isPending: isCreating } = useCreateBlogTag();
    const { mutate: deleteTag } = useDeleteBlogTag();

    const handleCreate = () => {
        if (!tagName.trim()) return;

        createTag({ name: tagName }, {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success(t("admin.product.tags.create_success"));
                    setTagName("");
                } else {
                    toast.error(res.message || t("admin.product.tags.create_error"));
                }
            },
            onError: () => {
                toast.error(t("admin.common.error"));
            }
        });
    };

    const handleDelete = (id: number | string) => {
        if (confirm(t("admin.product.tags.delete_confirm"))) {
            deleteTag(id, {
                onSuccess: (res) => {
                    if (res.success) {
                        toast.success(t("admin.product.tags.delete_success"));
                    } else {
                        toast.error(res.message || t("admin.product.tags.delete_error"));
                    }
                }
            });
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    padding: "16px",
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.8rem',
                fontWeight: 700,
                padding: "8px 8px 16px 8px"
            }}>
                {t("admin.blog.tags.title")}
                <Tooltip title={t("admin.common.close")}>
                    <IconButton onClick={onClose} size="small" sx={{ '&:hover': { backgroundColor: '#f4f6f8' } }}>
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </DialogTitle>

            <DialogContent sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '500px', p: 0 }}>

                {/* Input Area */}
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        placeholder={t("admin.product.tags.add_placeholder")}
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreate();
                        }}
                        size="small"
                        InputProps={{
                            sx: {
                                borderRadius: '8px',
                                fontSize: '1.4rem'
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={!tagName.trim() || isCreating}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '1.4rem',
                            minWidth: '80px',
                            background: '#1C252E',
                            boxShadow: "none",
                            '&:hover': {
                                background: '#454F5B',
                                boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                            }
                        }}
                    >
                        {isCreating ? <CircularProgress size={24} color="inherit" /> : (t("admin.common.add") || "Thêm")}
                    </Button>
                </Box>

                {/* List Tags */}
                <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : tags.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', color: '#919EAB', py: 4, fontSize: '1.4rem' }}>
                            {t("admin.blog.tags.no_tags")}
                        </Typography>
                    ) : (
                        <List>
                            {tags.map((tag: any) => (
                                <ListItem
                                    key={tag.id || tag.tagId}
                                    secondaryAction={
                                        <Tooltip title={t("admin.common.delete")}>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={() => handleDelete(tag.id || tag.tagId)}
                                                sx={{ '&:hover': { backgroundColor: 'rgba(255, 86, 48, 0.08)' } }}
                                            >
                                                <DeleteIcon sx={{ fontSize: '1.8rem', color: '#FF5630' }} />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                    sx={{
                                        borderRadius: '8px',
                                        mb: 1,
                                        '&:hover': {
                                            backgroundColor: '#919EAB14'
                                        }
                                    }}
                                >
                                    <ListItemText
                                        primary={tag.name}
                                        primaryTypographyProps={{ fontSize: '1.5rem', fontWeight: 600 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

            </DialogContent>
        </Dialog>
    );
};
