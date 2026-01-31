import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    CircularProgress,
    Typography,
    Stack,
    Tooltip
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon } from "@mui/icons-material";
import { useDeleteProductAgeRange, useProductAgeRanges } from "../hooks/useProduct";
import { toast } from "react-toastify";
import { AgeRangeFormDialog } from "./AgeRangeFormDialog";

interface AgeRangeListDialogProps {
    open: boolean;
    onClose: () => void;
}

export const AgeRangeListDialog = ({ open, onClose }: AgeRangeListDialogProps) => {
    const { t } = useTranslation();
    const [formOpen, setFormOpen] = useState(false);
    const [editId, setEditId] = useState<string | number | null>(null);

    const { data: ageRanges = [], isLoading } = useProductAgeRanges();
    const { mutate: deleteAgeRange } = useDeleteProductAgeRange();

    const handleCreate = () => {
        setEditId(null);
        setFormOpen(true);
    };

    const handleEdit = (id: string | number) => {
        setEditId(id);
        setFormOpen(true);
    };

    const handleDelete = (id: string | number) => {
        if (confirm(t("admin.common.confirm_delete"))) {
            deleteAgeRange(id, {
                onSuccess: (res) => {
                    if (res.success) {
                        toast.success(t("admin.product.age_range.delete_success"));
                    } else {
                        toast.error(res.message || t("admin.common.error"));
                    }
                }
            });
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: { borderRadius: "16px", padding: "16px", minHeight: "400px" }
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
                    {t("admin.product.age_range.title")}
                    <Tooltip title={t("admin.common.close")}>
                        <IconButton onClick={onClose} size="small" sx={{ '&:hover': { backgroundColor: '#f4f6f8' } }}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </DialogTitle>

                <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleCreate}
                            sx={{
                                background: '#1C252E',
                                minHeight: "3.6rem",
                                fontWeight: 700,
                                fontSize: "1.4rem",
                                padding: "6px 16px",
                                borderRadius: "8px",
                                textTransform: "none",
                                boxShadow: "none",
                                "&:hover": {
                                    background: "#454F5B",
                                    boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                                }
                            }}
                        >
                            {t("admin.common.add") || "Thêm"}
                        </Button>
                    </Box>

                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : ageRanges.length === 0 ? (
                            <Typography sx={{ textAlign: 'center', color: '#919EAB', py: 4, fontSize: '1.4rem' }}>
                                {t("admin.product.age_range.no_data")}
                            </Typography>
                        ) : (
                            <List>
                                {ageRanges.map((item: any) => (
                                    <ListItem
                                        key={item.ageRangeId}
                                        sx={{
                                            borderBottom: '1px solid #919eab29',
                                            borderRadius: '8px',
                                            '&:hover': { backgroundColor: '#919eab29' }
                                        }}
                                        secondaryAction={
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title={t("admin.common.edit")}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(item.ageRangeId)}
                                                        sx={{
                                                            '&:hover': { backgroundColor: 'rgba(99, 115, 129, 0.08)' }
                                                        }}
                                                    >
                                                        <EditIcon sx={{ fontSize: '1.8rem', color: '#637381' }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t("admin.common.delete")}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(item.ageRangeId)}
                                                        sx={{
                                                            '&:hover': { backgroundColor: 'rgba(255, 86, 48, 0.08)' }
                                                        }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: '1.8rem', color: '#FF5630' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        }
                                    >
                                        <ListItemText
                                            primary={item.name}
                                            secondary={item.description}
                                            primaryTypographyProps={{ fontSize: '1.5rem', fontWeight: 600, color: '#212B36' }}
                                            secondaryTypographyProps={{ fontSize: '1.3rem' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {formOpen && (
                <AgeRangeFormDialog
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    editId={editId}
                />
            )}
        </>
    );
};
