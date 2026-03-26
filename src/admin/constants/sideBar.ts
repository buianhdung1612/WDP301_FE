import { prefixAdmin } from "./routes";
import DataExplorationIcon from "@mui/icons-material/DataExploration";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import ExtensionIcon from "@mui/icons-material/Extension";
import ArticleIcon from "@mui/icons-material/Article";
import DiscountIcon from "@mui/icons-material/Discount";
import PetsIcon from "@mui/icons-material/Pets";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import BadgeIcon from "@mui/icons-material/Badge";
import ChatIcon from "@mui/icons-material/Chat";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AssignmentIcon from "@mui/icons-material/Assignment";

export const menuOverviewData = [
    {
        id: "ecommerce",
        Icon: ShoppingCartIcon,
        label: "Bán hàng",
        path: `/${prefixAdmin}/dashboard/ecommerce`,
        permission: "dashboard_view"
    },
    {
        id: "analytics",
        Icon: DataExplorationIcon,
        label: "Phân tích",
        tKey: "admin.sidebar.analytics",
        path: `/${prefixAdmin}/dashboard/analytics`,
        permission: "dashboard_view"
    },
    {
        id: "system",
        Icon: SettingsIcon,
        label: "Hệ thống",
        path: `/${prefixAdmin}/dashboard/system`,
        permission: "dashboard_view"
    },
];

export const menuStaffData = [
    {
        id: "staff-tasks",
        label: "Công việc của tôi",
        Icon: AssignmentIcon,
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
            { id: "expired", label: "Sản phẩm hết hạn", path: `/${prefixAdmin}/product/expired`, permission: "product_view" },
        ]
    },
    {
        id: "reviews",
        label: "Đánh giá",
        Icon: RateReviewIcon,
        path: `/${prefixAdmin}/review`,
        permission: "product_view"
    },
    {
        id: "orders",
        label: "Đơn hàng",
        Icon: ArticleIcon,
        permission: "product_view",
        children: [
            { id: "list", label: "Danh sách đơn hàng", path: `/${prefixAdmin}/order/list`, permission: "product_view" },
            { id: "create", label: "Tạo đơn hàng", path: `/${prefixAdmin}/order/create`, permission: "product_create" },
        ]
    },
    {
        id: "services",
        label: "Dịch vụ",
        Icon: PetsIcon,
        permission: "service_view",
        children: [
            { id: "list", label: "Danh sách dịch vụ", path: `/${prefixAdmin}/service/list`, permission: "service_view" },
            { id: "create", label: "Tạo dịch vụ", path: `/${prefixAdmin}/service/create`, permission: "service_create" },
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
        label: "Tài khoản quản trị",
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
        id: "boarding",
        label: "Khách sạn",
        Icon: HomeWorkIcon,
        permission: "boarding_booking_view",
        children: [
            { id: "booking-list", label: "Danh sách đơn khách sạn", path: `/${prefixAdmin}/boarding/booking-list`, permission: "boarding_booking_view" },
            { id: "booking-create", label: "Tạo đơn khách sạn", path: `/${prefixAdmin}/boarding/create`, permission: "boarding_booking_create" },
            { id: "care-schedule", label: "Lịch chăm sóc", path: `/${prefixAdmin}/boarding/care-schedule`, permission: "boarding_booking_edit" },
            { id: "cages", label: "Quản lý chuồng", path: `/${prefixAdmin}/boarding/cages`, permission: "boarding_cage_view" },
            { id: "care-templates", label: " Danh mục Thức ăn & Vận động", path: `/${prefixAdmin}/boarding/care-templates`, permission: "boarding_cage_edit" },
            { id: "config", label: "Cấu hình khách sạn", path: `/${prefixAdmin}/boarding/config`, permission: "boarding_booking_view" },
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
            { id: "create", label: "Tạo mã giảm giá", tKey: "admin.sidebar.coupon_create", path: `/${prefixAdmin}/coupon/create`, permission: "coupon_create" },
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
        id: "chat",
        label: "Chat",
        Icon: ChatIcon,
        path: `/${prefixAdmin}/chat`,
    },
    {
        id: "settings",
        label: "Cài đặt",
        tKey: "admin.sidebar.settings",
        Icon: SettingsIcon,
        path: `/${prefixAdmin}/dashboard/settings`,
        permission: "settings_view",
        children: [
            { id: "settings-general", label: "Cài đặt chung", path: `/${prefixAdmin}/dashboard/settings/general` },
            { id: "settings-shipping", label: "Vận chuyển", path: `/${prefixAdmin}/dashboard/settings/shipping` },
            { id: "settings-payment", label: "Thanh toán", path: `/${prefixAdmin}/dashboard/settings/payment` },
            { id: "settings-social", label: "Mạng xã hội", path: `/${prefixAdmin}/dashboard/settings/social` },
            { id: "settings-app-password", label: "Mật khẩu ứng dụng", path: `/${prefixAdmin}/dashboard/settings/app-password` },
            { id: "settings-breed", label: "Giống thú cưng", path: `/${prefixAdmin}/settings/breed/list` },
        ]
    }
];
