import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { useChangeAccountPassword, useAccountDetail } from "./hooks/useAccountAdmin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { changePasswordSchema, ChangePasswordFormValues } from "../../schemas/account-admin.schema";
import { prefixAdmin } from "../../constants/routes";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    Typography,
    Card,
    CircularProgress
} from "@mui/material";

export const ChangePasswordPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: account, isLoading } = useAccountDetail(id);
    const { mutate: changePassword, isPending } = useChangeAccountPassword();

    const {
        control,
        handleSubmit,
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (data: ChangePasswordFormValues) => {
        changePassword({ id: id!, data }, {
            onSuccess: () => {
                toast.success("Đổi mật khẩu thành công!");
                navigate(`/${prefixAdmin}/account-admin/list`);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
            }
        });
    };

    if (isLoading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
            <Box sx={{ mb: 5 }}>
                <Title title="Đổi mật khẩu" />
                <Breadcrumb
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: "Quản trị viên", to: `/${prefixAdmin}/account-admin/list` },
                        { label: "Đổi mật khẩu" }
                    ]}
                />
            </Box>

            <Card sx={{ p: 4, borderRadius: '16px' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: '1rem' }}>
                    Đổi mật khẩu cho: {account?.fullName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary', fontSize: '0.8125rem' }}>
                    Email: {account?.email}
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Mật khẩu mới"
                                    type="password"
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.875rem' } }}
                                />
                            )}
                        />

                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Xác nhận mật khẩu mới"
                                    type="password"
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.875rem' } }}
                                />
                            )}
                        />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(-1)}
                                sx={{
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    borderColor: 'rgba(145, 158, 171, 0.3)',
                                    color: '#1C252E',
                                    '&:hover': {
                                        borderColor: '#1C252E',
                                        bgcolor: 'rgba(28, 37, 46, 0.04)'
                                    }
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isPending}
                                sx={{
                                    bgcolor: '#1C252E',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    px: 4,
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#454F5B', boxShadow: 'none' }
                                }}
                            >
                                {isPending ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Card>
        </Box>
    );
};
