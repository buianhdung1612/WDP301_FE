import { Box, Card, Grid, TextField, Typography, Stack, alpha, Switch, FormControlLabel, Button, Divider, InputAdornment } from "@mui/material";
import { Icon } from "@iconify/react";
import { useForm, Controller } from "react-hook-form";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { useEffect, useState, useMemo } from "react";
import { prefixAdmin } from "../../constants/routes";
import { useBookingConfig, useUpdateBookingConfig } from "./hooks/useBookingConfig";
import { LoadingButton } from "../../components/ui/LoadingButton";
import { useQuery } from "@tanstack/react-query";
import { getShifts } from "../../api/shift.api";
import { getRoles } from "../../api/role.api";
import { getDepartments } from "../../api/department.api";

const BRAND_COLORS = {
    primary: "#00a76f", 
    border: alpha("#919EAB", 0.16)
};

export const BookingConfigPage = () => {
    const { data: config, isLoading } = useBookingConfig();
    const { mutate: updateConfig, isPending } = useUpdateBookingConfig();
    const [spaDepartmentId, setSpaDepartmentId] = useState<string | null>(null);

    const { data: deptsRes } = useQuery({ queryKey: ["departments-all"], queryFn: () => getDepartments({ noLimit: true }) });

    useEffect(() => {
        if (deptsRes?.data?.recordList) {
            const spaDept = deptsRes.data.recordList.find((d: any) => 
                d.name.toLowerCase().includes("spa") || d.name.toLowerCase().includes("chăm sóc")
            );
            if (spaDept) setSpaDepartmentId(spaDept._id);
        }
    }, [deptsRes]);

    const { data: shiftsRes } = useQuery({ 
        queryKey: ["shifts-spa", spaDepartmentId], 
        queryFn: () => getShifts({ departmentId: spaDepartmentId, noLimit: true }),
        enabled: !!spaDepartmentId 
    });

    const { data: rolesRes } = useQuery({ 
        queryKey: ["roles-spa", spaDepartmentId], 
        queryFn: () => getRoles({ departmentId: spaDepartmentId, isStaff: true, status: "active", noLimit: true }),
        enabled: !!spaDepartmentId
    });

    const shifts = useMemo(() => shiftsRes?.data?.recordList || [], [shiftsRes]);
    const roles = useMemo(() => rolesRes?.data?.recordList || [], [rolesRes]);

    const { control, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm({
        defaultValues: {
            bookingGracePeriod: 15,
            depositPercentage: 0,
            serviceRoomCount: 1,
            allowEarlyStartMinutes: 0,
            staffingRules: [], 
            autoCancelEnabled: false,
            autoConfirmEnabled: false
        },
    });

    useEffect(() => {
        if (shifts.length > 0 && roles.length > 0 && config) {
            const existingRules = config.staffingRules || [];
            const fullRules = shifts.map((shift: any) => {
                const existingShiftRule = existingRules.find((r: any) => r.shiftId === shift._id);
                const roleRequirements = roles.map((role: any) => {
                    const existingRoleReq = existingShiftRule?.roleRequirements?.find((rr: any) => rr.roleId === role._id);
                    return {
                        roleId: role._id,
                        roleName: role.name,
                        minStaff: existingRoleReq ? existingRoleReq.minStaff : 0
                    };
                });
                return { shiftId: shift._id, shiftName: shift.name, shiftTime: `${shift.startTime} - ${shift.endTime}`, roleRequirements };
            });
            setValue("staffingRules", fullRules);
        }
    }, [shifts, roles, config, setValue]);

    useEffect(() => { if (config) reset(config); }, [config, reset]);

    const onSubmit = (data: any) => {
        const cleanData = {
            ...data,
            staffingRules: data.staffingRules.map((rule: any) => ({
                shiftId: rule.shiftId,
                roleRequirements: rule.roleRequirements.map((rr: any) => ({
                    roleId: rr.roleId,
                    minStaff: rr.minStaff
                }))
            }))
        };
        updateConfig(cleanData);
    };

    const staffingRules = watch("staffingRules");

    if (isLoading) return <Typography sx={{ p: 4 }}>Đang tải...</Typography>;

    return (
        <Box sx={{ maxWidth: '1000px', mx: 'auto', p: 3 }}>
            <Box sx={{ mb: 5 }}>
                <Title title="Cấu hình hệ thống" />
                <Breadcrumb items={[{ label: "Dashboard", to: `/${prefixAdmin}` }, { label: "Cấu hình" }]} />
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                    {/* Quy tắc chung */}
                    <Card sx={{ p: 4, borderRadius: '20px', boxShadow: "0 0 20px rgba(0,0,0,0.05)", border: `1px solid ${BRAND_COLORS.border}` }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                            <Icon icon="solar:settings-bold-duotone" width={24} color={BRAND_COLORS.primary} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Quy tắc chung</Typography>
                        </Stack>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Controller name="serviceRoomCount" control={control} render={({ field }) => ( 
                                    <TextField {...field} label="Số phòng dịch vụ" fullWidth type="number" size="small" onChange={(e) => field.onChange(Number(e.target.value))} /> 
                                )} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Controller name="depositPercentage" control={control} render={({ field }) => ( 
                                    <TextField {...field} label="Đặt cọc đơn hàng (%)" fullWidth type="number" size="small" onChange={(e) => field.onChange(Number(e.target.value))} /> 
                                )} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Controller name="bookingGracePeriod" control={control} render={({ field }) => ( 
                                    <TextField {...field} label="Thời gian trễ tối đa (phút)" fullWidth type="number" size="small" placeholder="Khách có thể đến trễ bao nhiêu phút" onChange={(e) => field.onChange(Number(e.target.value))} /> 
                                )} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Controller name="allowEarlyStartMinutes" control={control} render={({ field }) => ( 
                                    <TextField {...field} label="Thời gian bắt đầu sớm (phút)" fullWidth type="number" size="small" placeholder="Cho phép làm trước bao nhiêu phút" onChange={(e) => field.onChange(Number(e.target.value))} /> 
                                )} />
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Tự động hóa */}
                    <Card sx={{ p: 4, borderRadius: '20px', boxShadow: "0 0 20px rgba(0,0,0,0.05)", border: `1px solid ${BRAND_COLORS.border}` }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                            <Icon icon="solar:bolt-bold-duotone" width={24} color={BRAND_COLORS.primary} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Tự động hóa</Typography>
                        </Stack>
                        <Stack spacing={1}>
                            <Controller name="autoConfirmEnabled" control={control} render={({ field }) => ( <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} color="success" size="small" />} label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Tự động xác nhận đơn mới</Typography>} /> )} />
                            <Controller name="autoCancelEnabled" control={control} render={({ field }) => ( <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} color="success" size="small" />} label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Tự động hủy đơn khi trễ hạn</Typography>} /> )} />
                        </Stack>
                    </Card>

                    {/* Định mức nhân sự */}
                    <Card sx={{ p: 4, borderRadius: '20px', boxShadow: "0 0 20px rgba(0,0,0,0.05)", border: `1px solid ${BRAND_COLORS.border}` }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                            <Icon icon="solar:users-group-rounded-bold-duotone" width={24} color={BRAND_COLORS.primary} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Định mức nhân sự Spa & Chăm sóc</Typography>
                        </Stack>
                        
                        <Stack spacing={4}>
                            {staffingRules.map((rule: any, sIdx: number) => (
                                <Box key={rule.shiftId} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                        <Icon icon="solar:calendar-bold-duotone" width={20} color={BRAND_COLORS.primary} />
                                        <Typography variant="subtitle1" sx={{ color: BRAND_COLORS.primary, fontWeight: 700 }}>{rule.shiftName}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', bgcolor: alpha(BRAND_COLORS.primary, 0.08), px: 1, py: 0.5, borderRadius: 1 }}>{rule.shiftTime}</Typography>
                                    </Stack>

                                    <Grid container spacing={2}>
                                        {rule.roleRequirements.map((roleReq: any, rIdx: number) => (
                                            <Grid item xs={12} key={roleReq.roleId}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Box sx={{ 
                                                        minWidth: '250px', 
                                                        p: '8.5px 14px', 
                                                        border: '1px solid', 
                                                        borderColor: 'divider', 
                                                        borderRadius: '8px', 
                                                        bgcolor: alpha('#919EAB', 0.04) 
                                                    }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {roleReq.roleName}
                                                        </Typography>
                                                    </Box>
                                                    <Controller
                                                        name={`staffingRules.${sIdx}.roleRequirements.${rIdx}.minStaff`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                size="small"
                                                                type="number"
                                                                sx={{ width: '150px' }}
                                                                inputProps={{ min: 0 }}
                                                                InputProps={{
                                                                    endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: 'text.secondary' }}>nhân viên</Typography></InputAdornment>,
                                                                    sx: { borderRadius: '8px' }
                                                                }}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        )}
                                                    />
                                                </Stack>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            ))}
                        </Stack>
                    </Card>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 5 }}>
                        <LoadingButton 
                            type="submit" 
                            loading={isPending || isSubmitting} 
                            label="Lưu cấu hình" 
                            sx={{ px: 8, py: 1.2, borderRadius: '12px', bgcolor: '#1c252e', '&:hover': { bgcolor: '#000' } }} 
                        />
                    </Box>
                </Stack>
            </form>
        </Box>
    );
};
