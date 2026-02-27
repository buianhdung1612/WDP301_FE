import { ProductListPage } from "../pages/product/ProductListPage";
import { ProductCreatePage } from "../pages/product/ProductCreatePage";
import { ProductEditPage } from "../pages/product/ProductEditPage";
import { ProductCategoryListPage } from "../pages/product-category/ProductCategoryListPage";
import { ProductCategoryCreatePage } from "../pages/product-category/ProductCategoryCreatePage";
import { ProductCategoryEditPage } from "../pages/product-category/ProductCategoryEditPage";
import { BrandListPage } from "../pages/brand/BrandListPage";
import { BrandCreatePage } from "../pages/brand/BrandCreatePage";
import { BrandEditPage } from "../pages/brand/BrandEditPage";
import { BlogListPage } from "../pages/blog/BlogListPage";
import { BlogCategoryListPage } from "../pages/blog-category/BlogCategoryListPage";
import { BlogCategoryCreatePage } from "../pages/blog-category/BlogCategoryCreatePage";
import { BlogCreatePage } from "../pages/blog/BlogCreatePage";
import { BlogDetailPage } from "../pages/blog/BlogDetailPage";
import { BlogEditPage } from "../pages/blog/BlogEditPage";
import { LoginPage } from "../pages/authen/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { SystemPage } from "../pages/dashboard/SystemPage";
import { BlogCategoryEditPage } from "../pages/blog-category/BlogCategoryEditPage";
import { CouponListPage } from "../pages/coupon/CouponListPage";
import { CouponCreatePage } from "../pages/coupon/CouponCreatePage";
import { CouponEditPage } from "../pages/coupon/CouponEditPage";
import { ProductAttributeListPage } from "../pages/product-attribute/ProductAttributeListPage";
import { ProductAttributeCreatePage } from "../pages/product-attribute/ProductAttributeCreatePage";
import { ProductAttributeEditPage } from "../pages/product-attribute/ProductAttributeEditPage";
import { ServiceListPage } from "../pages/service/ServiceListPage";
import { ServiceCreatePage } from "../pages/service/ServiceCreatePage";
import { ServiceEditPage } from "../pages/service/ServiceEditPage";
import { ServiceDetailPage } from "../pages/service/ServiceDetailPage";
import { ServiceCategoryListPage } from "../pages/service-category/ServiceCategoryListPage";
import { ServiceCategoryEditPage } from "../pages/service-category/ServiceCategoryEditPage";
import { RoleListPage } from "../pages/role/RoleListPage";
import { RoleCreatePage } from "../pages/role/RoleCreatePage";
import { RoleEditPage } from "../pages/role/RoleEditPage";
import { AccountAdminListPage } from "../pages/account-admin/AccountAdminListPage";
import { AccountAdminCreatePage } from "../pages/account-admin/AccountAdminCreatePage";
import { AccountAdminEditPage } from "../pages/account-admin/AccountAdminEditPage";
import { AccountAdminDetailPage } from "../pages/account-admin/AccountAdminDetailPage";
import { ProfilePage } from "../pages/account-admin/ProfilePage";
import { ChangePasswordPage as ChangePasswordAdminPage } from "../pages/account-admin/ChangePasswordPage";
import { AccountUserListPage } from "../pages/account-user/AccountUserListPage";
import { AccountUserCreatePage } from "../pages/account-user/AccountUserCreatePage";
import { AccountUserEditPage } from "../pages/account-user/AccountUserEditPage";
import { AccountUserDetailPage } from "../pages/account-user/AccountUserDetailPage";
import { ChangePasswordPage as ChangePasswordUserPage } from "../pages/account-user/ChangePasswordPage";
import { BookingListPage } from "../pages/booking/BookingListPage";
import { BookingCreatePage } from "../pages/booking/BookingCreatePage";
import { BookingEditPage } from "../pages/booking/BookingEditPage";
import { BookingDetailPage } from "../pages/booking/BookingDetailPage";
import { BookingConfigPage } from "../pages/booking/BookingConfigPage";
import { CalendarPage } from "../pages/calendar/CalendarPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { BreedListPage } from "../pages/settings/BreedListPage";
// HR Management Pages
import { ScheduleCalendarPage } from "../pages/hr/ScheduleCalendarPage";
import { ShiftListPage } from "../pages/hr/ShiftListPage";
import { DepartmentListPage } from "../pages/hr/DepartmentListPage";
import { AttendanceListPage } from "../pages/hr/AttendanceListPage";
import { StaffWorkHistoryPage } from "../pages/hr/StaffWorkHistoryPage";
import { AttendanceConfigPage } from "../pages/hr/AttendanceConfigPage";

import { StaffTaskListPage } from "../pages/staff-panel/StaffTaskListPage";
import { StaffWorkSchedulePage } from "../pages/staff-panel/StaffWorkSchedulePage";
import { StaffCustomerListPage } from "../pages/staff-panel/StaffCustomerListPage";
import { OrderListPage } from "../pages/order/OrderListPage";
import { OrderDetailPage } from "../pages/order/OrderDetailPage";
import { OrderCreatePage } from "../pages/order/OrderCreatePage";
import { OrderEditPage } from "../pages/order/OrderEditPage";
import { ChatPage } from "../pages/chat/ChatPage";
import { PermissionGuard } from "../components/auth/PermissionGuard";

export const AdminRoutes = [
    { path: "dashboard", element: <PermissionGuard permission="dashboard_view"><DashboardPage /></PermissionGuard> },
    { path: "dashboard/system", element: <PermissionGuard permission="dashboard_view"><SystemPage /></PermissionGuard> },
    { path: "product/list", element: <PermissionGuard permission="product_view"><ProductListPage /></PermissionGuard> },
    { path: "product/create", element: <PermissionGuard permission="product_create"><ProductCreatePage /></PermissionGuard> },
    { path: "product/edit/:id", element: <PermissionGuard permission="product_edit"><ProductEditPage /></PermissionGuard> },
    { path: "product-category/list", element: <PermissionGuard permission="product_category_view"><ProductCategoryListPage /></PermissionGuard> },
    { path: "product-category/create", element: <PermissionGuard permission="product_category_create"><ProductCategoryCreatePage /></PermissionGuard> },
    { path: "product-category/edit/:id", element: <PermissionGuard permission="product_category_edit"><ProductCategoryEditPage /></PermissionGuard> },
    { path: "product-category/detail/:id", element: <PermissionGuard permission="product_category_view"><ProductCategoryEditPage /></PermissionGuard> },
    { path: "brand/list", element: <PermissionGuard permission="brand_view"><BrandListPage /></PermissionGuard> },
    { path: "brand/create", element: <PermissionGuard permission="brand_create"><BrandCreatePage /></PermissionGuard> },
    { path: "brand/edit/:id", element: <PermissionGuard permission="brand_edit"><BrandEditPage /></PermissionGuard> },
    { path: "brand/detail/:id", element: <PermissionGuard permission="brand_view"><BrandEditPage /></PermissionGuard> },
    { path: "service/list", element: <PermissionGuard permission="service_view"><ServiceListPage /></PermissionGuard> },
    { path: "service/create", element: <PermissionGuard permission="service_create"><ServiceCreatePage /></PermissionGuard> },
    { path: "service/edit/:id", element: <PermissionGuard permission="service_edit"><ServiceEditPage /></PermissionGuard> },
    { path: "service/detail/:id", element: <PermissionGuard permission="service_view"><ServiceDetailPage /></PermissionGuard> },
    { path: "service/categories", element: <PermissionGuard permission="service_category_view"><ServiceCategoryListPage /></PermissionGuard> },
    { path: "service/categories/create", element: <PermissionGuard permission="service_category_create"><ServiceCreatePage /></PermissionGuard> },
    { path: "service/categories/edit/:id", element: <PermissionGuard permission="service_category_edit"><ServiceCategoryEditPage /></PermissionGuard> },
    { path: "blog/list", element: <PermissionGuard permission="blog_view"><BlogListPage /></PermissionGuard> },
    { path: "blog/create", element: <PermissionGuard permission="blog_create"><BlogCreatePage /></PermissionGuard> },
    { path: "blog/edit/:id", element: <PermissionGuard permission="blog_edit"><BlogEditPage /></PermissionGuard> },
    { path: "blog/detail/:id", element: <PermissionGuard permission="blog_view"><BlogDetailPage /></PermissionGuard> },
    { path: "blog-category/list", element: <PermissionGuard permission="blog_category_view"><BlogCategoryListPage /></PermissionGuard> },
    { path: "blog-category/create", element: <PermissionGuard permission="blog_category_create"><BlogCategoryCreatePage /></PermissionGuard> },
    { path: "blog-category/edit/:id", element: <PermissionGuard permission="blog_category_edit"><BlogCategoryEditPage /></PermissionGuard> },
    { path: "blog-category/detail/:id", element: <PermissionGuard permission="blog_category_view"><BlogCategoryEditPage /></PermissionGuard> },
    { path: "coupon/list", element: <PermissionGuard permission="coupon_view"><CouponListPage /></PermissionGuard> },
    { path: "coupon/create", element: <PermissionGuard permission="coupon_create"><CouponCreatePage /></PermissionGuard> },
    { path: "coupon/edit/:id", element: <PermissionGuard permission="coupon_edit"><CouponEditPage /></PermissionGuard> },
    { path: "product/attribute/list", element: <PermissionGuard permission="product_attribute_view"><ProductAttributeListPage /></PermissionGuard> },
    { path: "product/attribute/create", element: <PermissionGuard permission="product_attribute_create"><ProductAttributeCreatePage /></PermissionGuard> },
    { path: "product/attribute/edit/:id", element: <PermissionGuard permission="product_attribute_edit"><ProductAttributeEditPage /></PermissionGuard> },
    { path: "role/list", element: <PermissionGuard permission="role_view"><RoleListPage /></PermissionGuard> },
    { path: "role/create", element: <PermissionGuard permission="role_create"><RoleCreatePage /></PermissionGuard> },
    { path: "role/edit/:id", element: <PermissionGuard permission="role_edit"><RoleEditPage /></PermissionGuard> },
    { path: "account-admin/list", element: <PermissionGuard permission="account_admin_view"><AccountAdminListPage /></PermissionGuard> },
    { path: "account-admin/create", element: <PermissionGuard permission="account_admin_create"><AccountAdminCreatePage /></PermissionGuard> },
    { path: "account-admin/edit/:id", element: <PermissionGuard permission="account_admin_edit"><AccountAdminEditPage /></PermissionGuard> },
    { path: "account-admin/detail/:id", element: <PermissionGuard permission="account_admin_view"><AccountAdminDetailPage /></PermissionGuard> },
    { path: "profile", element: <ProfilePage /> },
    { path: "account-admin/change-password/:id", element: <PermissionGuard permission="account_admin_edit"><ChangePasswordAdminPage /></PermissionGuard> },
    { path: "account-user/list", element: <PermissionGuard permission="account_user_view"><AccountUserListPage /></PermissionGuard> },
    { path: "account-user/create", element: <PermissionGuard permission="account_user_create"><AccountUserCreatePage /></PermissionGuard> },
    { path: "account-user/edit/:id", element: <PermissionGuard permission="account_user_edit"><AccountUserEditPage /></PermissionGuard> },
    { path: "account-user/detail/:id", element: <PermissionGuard permission="account_user_view"><AccountUserDetailPage /></PermissionGuard> },
    { path: "account-user/change-password/:id", element: <PermissionGuard permission="account_user_edit"><ChangePasswordUserPage /></PermissionGuard> },
    { path: "booking/list", element: <PermissionGuard permission="booking_view"><BookingListPage /></PermissionGuard> },
    { path: "booking/create", element: <PermissionGuard permission="booking_create"><BookingCreatePage /></PermissionGuard> },
    { path: "booking/edit/:id", element: <PermissionGuard permission="booking_edit"><BookingEditPage /></PermissionGuard> },
    { path: "booking/detail/:id", element: <PermissionGuard permission="booking_view"><BookingDetailPage /></PermissionGuard> },
    { path: "booking/config", element: <PermissionGuard permission="booking_view"><BookingConfigPage /></PermissionGuard> },
    { path: "order/list", element: <PermissionGuard permission="product_view"><OrderListPage /></PermissionGuard> },
    { path: "order/create", element: <PermissionGuard permission="product_create"><OrderCreatePage /></PermissionGuard> },
    { path: "order/edit/:id", element: <PermissionGuard permission="product_edit"><OrderEditPage /></PermissionGuard> },
    { path: "order/detail/:id", element: <PermissionGuard permission="product_view"><OrderDetailPage /></PermissionGuard> },
    { path: "calendar", element: <PermissionGuard permission="calendar_view"><CalendarPage /></PermissionGuard> },
    { path: "dashboard/settings/*", element: <PermissionGuard permission="settings_view"><SettingsPage /></PermissionGuard> },
    { path: "settings/breed/list", element: <PermissionGuard permission="breed_view"><BreedListPage /></PermissionGuard> },
    { path: "schedule-calendar", element: <PermissionGuard permission="schedule_view"><ScheduleCalendarPage /></PermissionGuard> },
    { path: "shifts", element: <PermissionGuard permission="shift_view"><ShiftListPage /></PermissionGuard> },
    { path: "departments", element: <PermissionGuard permission="department_view"><DepartmentListPage /></PermissionGuard> },
    { path: "attendance", element: <PermissionGuard permission="attendance_view"><AttendanceListPage /></PermissionGuard> },
    { path: "hr/work-history", element: <PermissionGuard permission="hr_view"><StaffWorkHistoryPage /></PermissionGuard> },
    { path: "settings/attendance-config", element: <PermissionGuard permission="attendance_edit"><AttendanceConfigPage /></PermissionGuard> },
    { path: "staff/tasks", element: <StaffTaskListPage /> },
    { path: "staff/schedule", element: <StaffWorkSchedulePage /> },
    { path: "staff/customers", element: <StaffCustomerListPage /> },
    { path: "chat", element: <ChatPage /> },
];

export const AdminAuthRoutes = [
    { path: "auth/login", element: <LoginPage /> },
];
