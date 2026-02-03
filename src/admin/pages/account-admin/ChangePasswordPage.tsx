import { Box, Stack, TextField, Button, Typography, Paper, CircularProgress } from "@mui/material";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { useChangeAccountPassword, useAccountDetail } from "./hooks/useAccountAdmin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { changePasswordSchema, ChangePasswordFormValues } from "../../schemas/account-admin.schema";
import { prefixAdmin } from "../../constants/routes";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

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

    if (isLoading) return <CircularProgress />;

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title={`Đổi mật khẩu: ${account?.fullName}`} />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Tài khoản", to: `/${prefixAdmin}/account-admin/list` },
                            { label: "Đổi mật khẩu" }
                        ]}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3} sx={{ maxWidth: 500, mx: "auto" }}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Stack spacing={3}>
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
                                    />
                                )}
                            />
                        </Stack>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" onClick={() => navigate(`/${prefixAdmin}/account-admin/list`)}>Hủy</Button>
                        <Button type="submit" variant="contained" disabled={isPending} sx={{ background: "#1C252E" }}>
                            {isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
                        </Button>
                    </Box>
                </Stack>
            </form>
        </>
    );
};
