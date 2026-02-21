import { prefixAdmin } from "./routes";
import DataExplorationIcon from '@mui/icons-material/DataExploration';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import ExtensionIcon from '@mui/icons-material/Extension';
import ArticleIcon from '@mui/icons-material/Article';
import DiscountIcon from '@mui/icons-material/Discount';
import PetsIcon from '@mui/icons-material/Pets';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import BadgeIcon from '@mui/icons-material/Badge';

export const menuOverviewData = [
    {
        id: "analytics",
        Icon: DataExplorationIcon,
        label: "Phân tích",
        tKey: "admin.sidebar.analytics",
        path: `/${prefixAdmin}/dashboard/analytics`,
        permission: "dashboard_view"
    },
];

export const menuStaffData = [
    {
        id: "staff-tasks",
        label: "Công việc của tôi",
        Icon: ScheduleSendIcon,
        path: `/${prefixAdmin}/staff/tasks`,
    },
    {
        id: "staff-schedule",
        label: "Lịch làm việc",
        Icon: CalendarMonthIcon,
        path: `/${prefixAdmin}/staff/schedule`,
    },
    {
        id: "staff-customers",
        label: "Khách hàng của tôi",
        Icon: PeopleIcon,
        path: `/${prefixAdmin}/staff/customers`,
    },
];

export const menuManagementData = [
    {
        id: "products",
        label: "Sản phẩm",
        tKey: "admin.sidebar.products",
        Icon: ExtensionIcon,
        permission: "product_view",
        children: [
            { id: "list", label: "Danh sách", tKey: "admin.sidebar.list", path: `/${prefixAdmin}/product/list`, permission: "product_view" },
            { id: "brand", label: "Thương hiệu", tKey: "admin.sidebar.brand", path: `/${prefixAdmin}/brand/list`, permission: "brand_view" },
            { id: "category", label: "Danh mục", tKey: "admin.sidebar.category", path: `/${prefixAdmin}/product-category/list`, permission: "product_category_view" },
            { id: "attribute", label: "Thuộc tính", tKey: "admin.sidebar.attribute", path: `/${prefixAdmin}/product/attribute/list`, permission: "product_attribute_view" },
        ]
    },
    {
        id: "services",
        label: "Dịch vụ",
        Icon: PetsIcon,
        permission: "service_view",
        children: [
            { id: "list", label: "Danh sách dịch vụ", path: `/${prefixAdmin}/service/list`, permission: "service_view" },
            { id: "category", label: "Danh mục dịch vụ", path: `/${prefixAdmin}/service/categories`, permission: "service_category_view" },
        ]
    },
    {
        id: "blogs",
        label: "Bài viết",
        tKey: "admin.sidebar.blogs",
        Icon: ArticleIcon,
        permission: "blog_view",
        children: [
            { id: "list", label: "Danh sách bài viết", tKey: "admin.sidebar.blog_list", path: `/${prefixAdmin}/blog/list`, permission: "blog_view" },
            { id: "category", label: "Danh mục bài viết", tKey: "admin.sidebar.blog_category", path: `/${prefixAdmin}/blog-category/list`, permission: "blog_category_view" },
            { id: "tags", label: "Tags", tKey: "admin.sidebar.tags", path: `/${prefixAdmin}/blog/list?modal=tags`, permission: "blog_tag_view" },
        ]
    },
    {
        id: "roles",
        label: "Nhóm quyền",
        tKey: "admin.sidebar.roles",
        Icon: SecurityIcon,
        permission: "role_view",
        children: [
            { id: "list", label: "Danh sách", tKey: "admin.sidebar.role_list", path: `/${prefixAdmin}/role/list`, permission: "role_view" },
            { id: "create", label: "Tạo mới", tKey: "admin.sidebar.role_create", path: `/${prefixAdmin}/role/create`, permission: "role_create" },
        ]
    },
    {
        id: "accounts",
        label: "Quản trị viên",
        tKey: "admin.sidebar.accounts",
        Icon: PeopleIcon,
        permission: "account_admin_view",
        hideIfStaff: true,
        children: [
            { id: "list", label: "Danh sách", tKey: "admin.sidebar.account_list", path: `/${prefixAdmin}/account-admin/list`, permission: "account_admin_view" },
            { id: "create", label: "Tạo mới", tKey: "admin.sidebar.account_create", path: `/${prefixAdmin}/account-admin/create`, permission: "account_admin_create" },
        ]
    },
    {
        id: "users",
        label: "Khách hàng",
        tKey: "admin.sidebar.users",
        Icon: PeopleIcon,
        permission: "account_user_view",
        hideIfStaff: true,
        children: [
            { id: "list", label: "Danh sách", tKey: "admin.sidebar.user_list", path: `/${prefixAdmin}/account-user/list`, permission: "account_user_view" },
            { id: "create", label: "Tạo mới", tKey: "admin.sidebar.user_create", path: `/${prefixAdmin}/account-user/create`, permission: "account_user_create" },
        ]
    },
    {
        id: "bookings",
        label: "Đơn dịch vụ",
        tKey: "admin.sidebar.bookings",
        Icon: ScheduleSendIcon,
        permission: "booking_view",
        children: [
            { id: "list", label: "Danh sách đơn", tKey: "admin.sidebar.booking_list", path: `/${prefixAdmin}/booking/list`, permission: "booking_view" },
            { id: "create", label: "Tạo đơn dịch vụ", path: `/${prefixAdmin}/booking/create`, permission: "booking_create" },
            { id: "config", label: "Cấu hình đơn", path: `/${prefixAdmin}/booking/config`, permission: "booking_view" },
        ]
    },
    {
        id: "coupons",
        label: "Mã giảm giá",
        tKey: "admin.sidebar.coupons",
        Icon: DiscountIcon,
        permission: "coupon_view",
        children: [
            { id: "list", label: "Danh sách mã giảm giá", tKey: "admin.sidebar.coupon_list", path: `/${prefixAdmin}/coupon/list`, permission: "coupon_view" },
        ]
    },
    {
        id: "hr",
        label: "Nhân sự",
        Icon: BadgeIcon,
        permission: "hr_view",
        children: [
            { id: "departments", label: "Phòng ban", path: `/${prefixAdmin}/departments`, permission: "department_view" },
            { id: "schedule-calendar", label: "Lịch làm việc", path: `/${prefixAdmin}/schedule-calendar`, permission: "schedule_view" },
            { id: "shifts", label: "Ca làm việc", path: `/${prefixAdmin}/shifts`, permission: "shift_view" },
            { id: "attendance", label: "Chấm công & Lương", path: `/${prefixAdmin}/attendance`, permission: "attendance_view" },
            { id: "work-history", label: "Lịch sử công việc", path: `/${prefixAdmin}/hr/work-history`, permission: "hr_view" },
        ]
    },
    {
        id: "calendar",
        label: "Lịch",
        tKey: "admin.sidebar.calendar",
        Icon: CalendarMonthIcon,
        path: `/${prefixAdmin}/calendar`,
        permission: "calendar_view"
    },
    {
        id: "settings",
        label: "Cài đặt",
        tKey: "admin.sidebar.settings",
        Icon: SettingsIcon,
        permission: "settings_view",
        children: [
            { id: "general", label: "Cài đặt chung", tKey: "admin.sidebar.setting_general", path: `/${prefixAdmin}/dashboard/setting-general`, permission: "settings_view" },
            { id: "breed", label: "Giống thú cưng", path: `/${prefixAdmin}/settings/breed/list`, permission: "breed_view" },
            { id: "attendance-config", label: "Cấu hình chấm công", path: `/${prefixAdmin}/settings/attendance-config`, permission: "attendance_edit" },
        ]
    }
];
