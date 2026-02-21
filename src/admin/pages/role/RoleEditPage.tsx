import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { useEffect, useState, useMemo, Dispatch, SetStateAction } from "react";
import { useUpdateRole, useRoleDetail } from "./hooks/useRole";
import { useDepartments } from "../hr/hooks/useDepartments";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { roleSchema } from "../../schemas/role.schema";
import { prefixAdmin } from "../../constants/routes";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { PERMISSIONS_GROUPED } from "../../constants/roles";
import { useServices } from "../service/hooks/useService";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { SwitchButton } from "../../components/ui/SwitchButton";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LoadingButton } from "../../components/ui/LoadingButton";
import {
    Box,
    TextField,
    MenuItem,
    FormControl,
    Select,
    Checkbox,
    FormControlLabel,
    Typography,
    CircularProgress,
    Switch,
    Stack,
    ThemeProvider,
    createTheme,
    useTheme
} from "@mui/material";

export const RoleEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: role, isLoading } = useRoleDetail(id);
    const { mutate: update, isPending } = useUpdateRole();
    const { data: services = [] } = useServices();
    const { data: departments = [] } = useDepartments();

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
        reset,
        setValue,
    } = useForm<any>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: "",
            description: "",
            isStaff: false,
            serviceIds: [],
            permissions: [],
            departmentId: "",
            commissionRate: 0,
            status: "active",
        },
    });

    useEffect(() => {
        if (role) {
            reset({
                name: role.name,
                description: role.description,
                isStaff: role.isStaff,
                serviceIds: role.serviceIds || [],
                permissions: role.permissions || [],
                departmentId: role.departmentId || "",
                commissionRate: role.commissionRate || 0,
                status: role.status,
            });
        }
    }, [role, reset]);

    const isStaff = watch("isStaff");
    const currentPermissions = watch("permissions") || [];

    const handleSelectGroup = (groupPermissions: string[], isChecked: boolean) => {
        let newPermissions = [...currentPermissions];
        if (isChecked) {
            groupPermissions.forEach(id => {
                if (!newPermissions.includes(id)) newPermissions.push(id);
            });
        } else {
            newPermissions = newPermissions.filter(id => !groupPermissions.includes(id));
        }
        setValue("permissions", newPermissions, { shouldValidate: true });
    };

    const onSubmit = (data: any) => {
        update({ id: id!, data }, {
            onSuccess: () => {
                toast.success("Cập nhật nhóm quyền thành công!");
                navigate(`/${prefixAdmin}/role/list`);
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
                    <Title title="Chỉnh sửa nhóm quyền" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Nhóm quyền", to: `/${prefixAdmin}/role/list` },
                            { label: "Cập nhật" }
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
                                    <Controller
                                        name="departmentId"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                select
                                                label="Phòng ban"
                                                error={!!control.getFieldState("departmentId").error}
                                                helperText={control.getFieldState("departmentId").error?.message}
                                            >
                                                <MenuItem value="">-- Chọn phòng ban --</MenuItem>
                                                {departments.map((dept: any) => (
                                                    <MenuItem key={dept._id} value={dept._id}>
                                                        {dept.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                    <Controller
                                        name="commissionRate"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="% Hoa hồng mặc định"
                                                placeholder="0"
                                                InputProps={{ inputProps: { min: 0, max: 100 } }}
                                                error={!!control.getFieldState("commissionRate").error}
                                                helperText={control.getFieldState("commissionRate").error?.message}
                                            />
                                        )}
                                    />
                                </Box>
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title="Phân quyền chi tiết"
                            subheader="Thiết lập các hành động cụ thể cho từng module"
                            expanded={expandedPermissions}
                            onToggle={toggle(setExpandedPermissions)}
                        >
                            <Stack p="24px" gap="24px">
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: "32px" }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 2 }}>Danh sách phân quyền</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {PERMISSIONS_GROUPED.map((group) => {
                                                const groupIds = group.permissions.map(p => p.id);
                                                const isAllChecked = groupIds.every(id => currentPermissions.includes(id));
                                                const isSomeChecked = groupIds.some(id => currentPermissions.includes(id)) && !isAllChecked;

                                                return (
                                                    <Accordion
                                                        key={group.module}
                                                        disableGutters
                                                        sx={{
                                                            boxShadow: 'none',
                                                            '&:before': { display: 'none' },
                                                            border: '1px solid #919eab3d',
                                                            borderRadius: '8px !important',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon fontSize="small" />}
                                                            sx={{
                                                                bgcolor: '#f4f6f8',
                                                                minHeight: '48px !important',
                                                                '& .MuiAccordionSummary-content': { m: '0 !important', alignItems: 'center' }
                                                            }}
                                                        >
                                                            <Checkbox
                                                                size="small"
                                                                checked={isAllChecked}
                                                                indeterminate={isSomeChecked}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => handleSelectGroup(groupIds, e.target.checked)}
                                                                sx={{ mr: 1, p: 0.5 }}
                                                            />
                                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
                                                                {group.module}
                                                            </Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
                                                            <Controller
                                                                name="permissions"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <>
                                                                        {group.permissions.map((perm) => (
                                                                            <FormControlLabel
                                                                                key={perm.id}
                                                                                control={
                                                                                    <Checkbox
                                                                                        size="small"
                                                                                        checked={field.value.indexOf(perm.id) > -1}
                                                                                        onChange={(e) => {
                                                                                            const newValue = e.target.checked
                                                                                                ? [...field.value, perm.id]
                                                                                                : field.value.filter((id: string) => id !== perm.id);
                                                                                            field.onChange(newValue);
                                                                                        }}
                                                                                    />
                                                                                }
                                                                                label={<Typography sx={{ fontSize: '0.8125rem' }}>{perm.name}</Typography>}
                                                                                sx={{ ml: 0 }}
                                                                            />
                                                                        ))}
                                                                    </>
                                                                )}
                                                            />
                                                        </AccordionDetails>
                                                    </Accordion>
                                                );
                                            })}
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1 }}>Loại nhóm quyền</Typography>
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
                                                        label={<Typography sx={{ fontSize: '0.875rem' }}>Nhân viên kỹ thuật</Typography>}
                                                    />
                                                )}
                                            />
                                        </Box>

                                        {isStaff && (
                                            <Box>
                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1 }}>Kỹ năng chuyên môn</Typography>
                                                <Controller
                                                    name="serviceIds"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <FormControl fullWidth>
                                                            <Select
                                                                {...field}
                                                                multiple
                                                                renderValue={(selected: any) => (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        {selected.map((serviceId: string) => {
                                                                            const service = services.find((s: any) => s._id === serviceId);
                                                                            return (
                                                                                <Box key={serviceId} sx={{
                                                                                    px: 1,
                                                                                    py: 0.2,
                                                                                    fontSize: '0.75rem',
                                                                                    bgcolor: 'rgba(0, 167, 111, 0.16)',
                                                                                    color: 'rgb(0, 120, 103)',
                                                                                    borderRadius: '6px',
                                                                                    fontWeight: 700
                                                                                }}>
                                                                                    {service?.name || serviceId}
                                                                                </Box>
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                )}
                                                                sx={{ fontSize: '0.875rem' }}
                                                            >
                                                                {services.map((service: any) => (
                                                                    <MenuItem key={service._id} value={service._id} sx={{ fontSize: '0.875rem' }}>
                                                                        <Checkbox checked={field.value.indexOf(service._id) > -1} />
                                                                        {service.name}
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
                            <LoadingButton
                                type="submit"
                                loading={isPending}
                                label="Cập nhật nhóm quyền"
                                loadingLabel="Đang xử lý..."
                                sx={{ minHeight: "3rem", minWidth: "7.5rem" }}
                            />
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    );
};
