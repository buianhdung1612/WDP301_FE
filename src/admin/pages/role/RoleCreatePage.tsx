import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { useCreateRole } from "./hooks/useRole";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { roleSchema } from "../../schemas/role.schema";
import { prefixAdmin } from "../../constants/routes";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { PERMISSIONS, SKILLS } from "../../constants/roles";
import { useState, useMemo, Dispatch, SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { SwitchButton } from "../../components/ui/SwitchButton";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    FormControl,
    Select,
    Checkbox,
    FormControlLabel,
    Typography,
    Paper,
    Switch,
    Stack,
    ThemeProvider,
    createTheme,
    useTheme
} from "@mui/material";

export const RoleCreatePage = () => {
    const navigate = useNavigate();
    const { mutate: create, isPending } = useCreateRole();

    const [expandedInfo, setExpandedInfo] = useState(true);
    const [expandedPermissions, setExpandedPermissions] = useState(true);

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
        watch,
    } = useForm<any>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: "",
            description: "",
            isStaff: false,
            skillSet: [],
            permissions: [],
            status: "active",
        },
    });

    const isStaff = watch("isStaff");

    const onSubmit = (data: any) => {
        create(data, {
            onSuccess: () => {
                toast.success("Tạo nhóm quyền thành công!");
                navigate(`/${prefixAdmin}/role/list`);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Tạo thất bại");
            }
        });
    };

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Tạo nhóm quyền" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Nhóm quyền", to: `/${prefixAdmin}/role/list` },
                            { label: "Tạo mới" }
                        ]}
                    />
                </div>
            </div>

            <ThemeProvider theme={localTheme}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack sx={{ margin: "0px 120px", gap: "40px" }}>
                        <CollapsibleCard
                            title="Thông tin chung"
                            subheader="Thông tin cơ bản của nhóm quyền"
                            expanded={expandedInfo}
                            onToggle={toggle(setExpandedInfo)}
                        >
                            <Stack p="24px" gap="24px">
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px 16px" }}>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label="Tên nhóm quyền *"
                                                placeholder="Nhập tên nhóm quyền..."
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Mô tả"
                                                placeholder="Nhập mô tả..."
                                            />
                                        )}
                                    />
                                </Box>
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title="Phân quyền & Kỹ năng"
                            subheader="Thiết lập quyền hạn và kỹ năng cho nhân viên"
                            expanded={expandedPermissions}
                            onToggle={toggle(setExpandedPermissions)}
                        >
                            <Stack p="24px" gap="24px">
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: "32px" }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, mb: 1 }}>Danh sách quyền hạn</Typography>
                                        <Paper variant="outlined" sx={{
                                            height: 300,
                                            overflow: 'auto',
                                            p: 1,
                                            borderRadius: '8px',
                                            '&::-webkit-scrollbar': { width: '6px' },
                                            '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '10px' }
                                        }}>
                                            <Controller
                                                name="permissions"
                                                control={control}
                                                render={({ field }) => (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        {PERMISSIONS.map((perm) => (
                                                            <FormControlLabel
                                                                key={perm.id}
                                                                control={
                                                                    <Checkbox
                                                                        checked={field.value.indexOf(perm.id) > -1}
                                                                        onChange={(e) => {
                                                                            const newValue = e.target.checked
                                                                                ? [...field.value, perm.id]
                                                                                : field.value.filter((id: string) => id !== perm.id);
                                                                            field.onChange(newValue);
                                                                        }}
                                                                    />
                                                                }
                                                                label={<Typography sx={{ fontSize: '1.4rem' }}>{perm.name}</Typography>}
                                                                sx={{ ml: 0 }}
                                                            />
                                                        ))}
                                                    </Box>
                                                )}
                                            />
                                        </Paper>
                                    </Box>

                                    <Box>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, mb: 1 }}>Loại nhóm quyền</Typography>
                                            <Controller
                                                name="isStaff"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        sx={{ ml: 0 }}
                                                        control={
                                                            <Switch
                                                                {...field}
                                                                checked={field.value}
                                                                sx={{
                                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                                        color: '#00A76F',
                                                                        '& + .MuiSwitch-track': {
                                                                            backgroundColor: '#00A76F',
                                                                            opacity: 1,
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        }
                                                        label={<Typography sx={{ fontSize: '1.4rem' }}>Nhân viên kỹ thuật</Typography>}
                                                    />
                                                )}
                                            />
                                        </Box>

                                        {isStaff && (
                                            <Box>
                                                <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, mb: 1 }}>Kỹ năng chuyên môn</Typography>
                                                <Controller
                                                    name="skillSet"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <FormControl fullWidth>
                                                            <Select
                                                                {...field}
                                                                multiple
                                                                renderValue={(selected: any) => (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        {selected.map((val: string) => (
                                                                            <Box key={val} sx={{
                                                                                px: 1,
                                                                                py: 0.2,
                                                                                fontSize: '1.2rem',
                                                                                bgcolor: 'rgba(0, 167, 111, 0.16)',
                                                                                color: 'rgb(0, 120, 103)',
                                                                                borderRadius: '6px',
                                                                                fontWeight: 700
                                                                            }}>
                                                                                {SKILLS.find(s => s.id === val)?.name || val}
                                                                            </Box>
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                                sx={{ fontSize: '1.4rem' }}
                                                            >
                                                                {SKILLS.map((skill) => (
                                                                    <MenuItem key={skill.id} value={skill.id} sx={{ fontSize: '1.4rem' }}>
                                                                        <Checkbox checked={field.value.indexOf(skill.id) > -1} />
                                                                        {skill.name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    )}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
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
                                {isPending ? "Đang tạo..." : "Tạo nhóm quyền"}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    );
};
