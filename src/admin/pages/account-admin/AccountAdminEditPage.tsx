import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { useUpdateAccount, useAccountDetail } from "./hooks/useAccountAdmin";
import { useRoles } from "../role/hooks/useRole";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { accountAdminSchema } from "../../schemas/account-admin.schema";
import { prefixAdmin } from "../../constants/routes";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useMemo, Dispatch, SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { SwitchButton } from "../../components/ui/SwitchButton";
import { FormUploadSingleFile } from "../../components/upload/FormUploadSingleFile";
import {
    Box,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Typography,
    Paper,
    CircularProgress,
    Stack,
    ThemeProvider,
    createTheme,
    useTheme
} from "@mui/material";

export const AccountAdminEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: account, isLoading } = useAccountDetail(id);
    const { mutate: update, isPending } = useUpdateAccount();
    const { data: roles = [] } = useRoles();

    const [expandedInfo, setExpandedInfo] = useState(true);
    const [expandedRoles, setExpandedRoles] = useState(true);

    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();
    const localTheme = useMemo(() => createTheme(outerTheme, {
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none !important",
                        backdropFilter: "none !important",
                        backgroundColor: "#fff !important",
                        boxShadow: "0 0 2px 0 #919eab33, 0 12px 24px -4px #919eab1f",
                        borderRadius: "16px",
                        color: "#1C252E",
                    },
                }
            },
        }
    }), [outerTheme]);

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<any>({
        resolver: zodResolver(accountAdminSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
            roles: [],
            status: "active",
            avatar: "",
        },
    });

    useEffect(() => {
        if (account) {
            reset({
                fullName: account.fullName,
                email: account.email,
                phoneNumber: account.phoneNumber || "",
                roles: account.roles || [],
                status: account.status,
                avatar: account.avatar || "",
            });
        }
    }, [account, reset]);

    const onSubmit = (data: any) => {
        update({ id: id!, data }, {
            onSuccess: () => {
                toast.success("Cập nhật tài khoản thành công!");
                navigate(`/${prefixAdmin}/account-admin/list`);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Cập nhật thất bại");
            }
        });
    };

    if (isLoading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Chỉnh sửa tài khoản quản trị" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Tài khoản", to: `/${prefixAdmin}/account-admin/list` },
                            { label: "Cập nhật" }
                        ]}
                    />
                </div>
            </div>

            <ThemeProvider theme={localTheme}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack sx={{ margin: "0px 120px", gap: "40px" }}>
                        <CollapsibleCard
                            title="Thông tin cá nhân"
                            subheader="Thông tin cơ bản của tài khoản"
                            expanded={expandedInfo}
                            onToggle={toggle(setExpandedInfo)}
                        >
                            <Stack p="24px" gap="24px">
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px 16px" }}>
                                    <Controller
                                        name="fullName"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label="Họ tên *"
                                                placeholder="Nhập họ tên..."
                                                fullWidth
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label="Email *"
                                                placeholder="Nhập email..."
                                                fullWidth
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="phoneNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Số điện thoại"
                                                placeholder="Nhập số điện thoại..."
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Box>

                                <Box>
                                    <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, mb: 1 }}>Ảnh đại diện</Typography>
                                    <FormUploadSingleFile
                                        name="avatar"
                                        control={control}
                                    />
                                </Box>
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title="Phân quyền"
                            subheader="Thiết lập vai trò cho tài khoản"
                            expanded={expandedRoles}
                            onToggle={toggle(setExpandedRoles)}
                        >
                            <Stack p="24px" gap="24px">
                                <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, mb: -1 }}>Nhóm quyền *</Typography>
                                <Paper variant="outlined" sx={{
                                    height: 200,
                                    overflow: 'auto',
                                    p: 1,
                                    borderRadius: '8px',
                                    '&::-webkit-scrollbar': { width: '6px' },
                                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '10px' }
                                }}>
                                    <Controller
                                        name="roles"
                                        control={control}
                                        render={({ field }) => (
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                {roles.map((role: any) => (
                                                    <FormControlLabel
                                                        key={role._id}
                                                        control={
                                                            <Checkbox
                                                                checked={field.value.indexOf(role._id) > -1}
                                                                onChange={(e) => {
                                                                    const newValue = e.target.checked
                                                                        ? [...field.value, role._id]
                                                                        : field.value.filter((id: string) => id !== role._id);
                                                                    field.onChange(newValue);
                                                                }}
                                                            />
                                                        }
                                                        label={<Typography sx={{ fontSize: '1.4rem' }}>{role.name}</Typography>}
                                                        sx={{ ml: 0 }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    />
                                </Paper>
                            </Stack>
                        </CollapsibleCard>

                        <Box gap="24px" sx={{ display: "flex", alignItems: "center" }}>
                            <SwitchButton
                                control={control}
                                name="status"
                                checkedValue="active"
                                uncheckedValue="inactive"
                            />
                            <Button
                                type="submit"
                                disabled={isPending}
                                sx={{
                                    background: '#1C252E',
                                    minHeight: "4.8rem",
                                    minWidth: "12rem",
                                    fontWeight: 700,
                                    fontSize: "1.4rem",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    boxShadow: "none",
                                    "&:hover": {
                                        background: "#454F5B",
                                        boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                                    }
                                }}
                                variant="contained"
                            >
                                {isPending ? "Đang xử lý..." : "Cập nhật tài khoản"}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    );
};
