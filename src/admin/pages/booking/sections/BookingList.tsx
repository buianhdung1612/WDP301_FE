import { useState, SyntheticEvent, useMemo } from "react";
import {
    Box,
    Card,
    Tabs,
    Tab,
    styled,
    CircularProgress,
    Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useBookings, useUpdateBookingStatus } from "../hooks/useBookingManagement";
import { toast } from "react-toastify";
import { DATA_GRID_LOCALE_VN } from "../../account-user/configs/localeText.config";
import { Search } from "../../../components/ui/Search";
import { getBookingColumns, bookingColumnsInitialState } from "../configs/booking.config";
import { COLORS } from "../../role/configs/constants";
import { dataGridContainerStyles, dataGridStyles } from "../../role/configs/styles.config";
import { SortAscendingIcon, SortDescendingIcon, UnsortedIcon } from "../../../assets/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { prefixAdmin } from "../../../constants/routes";
import { useAuthStore } from "../../../../stores/useAuthStore";

const TabBadge = styled('span')(() => ({
    height: "24px",
    minWidth: "24px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: '8px',
    padding: '0px 6px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    transition: 'all 0.2s',
}));

export const BookingList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isStaff = user?.roles?.some((role: any) => role.isStaff);
    const [tabStatus, setTabStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: bookingsRes, isLoading } = useBookings(
        isStaff ? { staffId: user?.id } : {}
    );
    const allRows = bookingsRes?.data || [];

    const { mutate: updateStatus } = useUpdateBookingStatus();

    const handleStatusUpdate = (id: string, status: string) => {
        updateStatus({ id, status }, {
            onSuccess: () => toast.success(t("admin.validation.update_success"))
        });
    };

    const handleViewDetail = (id: string) => {
        navigate(`/${prefixAdmin}/booking/detail/${id}`);
    };

    const handleEdit = (booking: any) => {
        navigate(`/${prefixAdmin}/booking/edit/${booking._id}`);
    };

    const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
        setTabStatus(newValue);
    };

    const rows = useMemo(() => {
        let filtered = allRows;
        if (tabStatus !== 'all') {
            filtered = filtered.filter((row: any) => row.bookingStatus === tabStatus);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((row: any) =>
                row.code?.toLowerCase().includes(query) ||
                row.userId?.fullName?.toLowerCase().includes(query) ||
                row.userId?.phone?.includes(query)
            );
        }
        return filtered;
    }, [allRows, tabStatus, searchQuery]);

    const statusCounts = {
        all: allRows.length,
        pending: allRows.filter((r: any) => r.bookingStatus === 'pending').length,
        confirmed: allRows.filter((r: any) => r.bookingStatus === 'confirmed').length,
        "in-progress": allRows.filter((r: any) => r.bookingStatus === 'in-progress').length,
        completed: allRows.filter((r: any) => r.bookingStatus === 'completed').length,
        cancelled: allRows.filter((r: any) => r.bookingStatus === 'cancelled').length,
    };

    const columns = getBookingColumns(handleStatusUpdate, handleViewDetail, handleEdit, t);

    return (
        <Card sx={{
            borderRadius: '16px',
            bgcolor: COLORS.background,
            boxShadow: COLORS.shadow,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Tabs
                value={tabStatus}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons={false}
                sx={{
                    px: 3,
                    minHeight: "48px",
                    borderBottom: `1px solid ${COLORS.border}`,
                    '& .MuiTabs-flexContainer': { gap: "40px" },
                    '& .MuiTabs-indicator': { backgroundColor: COLORS.primary, height: 2 },
                }}
            >
                {[
                    { value: 'all', label: t("admin.common.tabs.all") },
                    { value: 'pending', label: t("admin.booking.status.pending") },
                    { value: 'confirmed', label: t("admin.booking.status.confirmed") },
                    { value: 'in-progress', label: t("admin.booking.status.in_progress") },
                    { value: 'completed', label: t("admin.booking.status.completed") },
                    { value: 'cancelled', label: t("admin.booking.status.cancelled") },
                ].map((tab) => (
                    <Tab
                        key={tab.value}
                        value={tab.value}
                        disableRipple
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: tabStatus === tab.value ? 600 : 500 }}>
                                    {tab.label}
                                </Typography>
                                <TabBadge
                                    sx={{
                                        bgcolor: tabStatus === tab.value ? COLORS.primary : 'rgba(145, 158, 171, 0.16)',
                                        color: tabStatus === tab.value ? '#fff' : COLORS.secondary,
                                    }}
                                >
                                    {statusCounts[tab.value as keyof typeof statusCounts]}
                                </TabBadge>
                            </Box>
                        }
                        sx={{
                            minWidth: 0,
                            padding: '0',
                            minHeight: '48px',
                            textTransform: 'none',
                            color: tabStatus === tab.value ? COLORS.primary : COLORS.secondary,
                            '&.Mui-selected': { color: COLORS.primary },
                        }}
                    />
                ))}
            </Tabs>

            <Box sx={{ p: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: 2, borderBottom: `1px dashed ${COLORS.border}` }}>
                <Search
                    placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    maxWidth="25rem"
                />
            </Box>

            <Box sx={dataGridContainerStyles}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={isLoading}
                    rowHeight={80}
                    localeText={DATA_GRID_LOCALE_VN}
                    checkboxSelection
                    disableRowSelectionOnClick
                    pagination
                    pageSizeOptions={[5, 10, 20]}
                    initialState={bookingColumnsInitialState}
                    slots={{
                        columnSortedAscendingIcon: SortAscendingIcon,
                        columnSortedDescendingIcon: SortDescendingIcon,
                        columnUnsortedIcon: UnsortedIcon,
                        noRowsOverlay: () => (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                {isLoading ? <CircularProgress size={32} /> : <Typography sx={{ fontSize: '0.875rem', color: COLORS.secondary }}>{t("admin.common.no_data")}</Typography>}
                            </Box>
                        )
                    }}
                    sx={{
                        ...dataGridStyles,
                        '& .MuiDataGrid-columnHeader': {
                            bgcolor: 'rgba(145, 158, 171, 0.12)',
                            color: '#637381',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px dashed rgba(145, 158, 171, 0.2)',
                            fontSize: '0.8125rem',
                        },
                        '& .MuiDataGrid-row:hover': {
                            bgcolor: 'rgba(145, 158, 171, 0.04)'
                        }
                    }}
                />
            </Box>
        </Card>
    );
};
