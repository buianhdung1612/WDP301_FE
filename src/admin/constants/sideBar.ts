import { prefixAdmin } from "./routes";
import DataExplorationIcon from '@mui/icons-material/DataExploration';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import ExtensionIcon from '@mui/icons-material/Extension';
import ArticleIcon from '@mui/icons-material/Article';
import DiscountIcon from '@mui/icons-material/Discount';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';

export const menuOverviewData = [
    {
        id: "analytics",
        Icon: DataExplorationIcon,
        label: "Phân tích",
        tKey: "admin.sidebar.analytics",
        path: `/${prefixAdmin}/dashboard/analytics`
    },
    {
        id: "booking",
        Icon: ScheduleSendIcon,
        label: "Đặt lịch",
        tKey: "admin.sidebar.booking",
        path: `/${prefixAdmin}/dashboard/booking`
    },
];

export const menuManagementData = [
    {
        id: "products",
        label: "Sản phẩm",
        tKey: "admin.sidebar.products",
        Icon: ExtensionIcon,
        children: [
            { id: "list", label: "Danh sách", tKey: "admin.sidebar.list", path: `/${prefixAdmin}/product/list` },
            { id: "brand", label: "Thương hiệu", tKey: "admin.sidebar.brand", path: `/${prefixAdmin}/brand/list` },
            { id: "category", label: "Danh mục", tKey: "admin.sidebar.category", path: `/${prefixAdmin}/product-category/list` },
            { id: "attribute", label: "Thuộc tính", tKey: "admin.sidebar.attribute", path: `/${prefixAdmin}/product/attribute/list` },
            { id: "create", label: "Tạo sản phẩm", tKey: "admin.sidebar.product_create", path: `/${prefixAdmin}/product/create`, hidden: true },
            { id: "edit", label: "Sửa sản phẩm", tKey: "admin.sidebar.product_edit", path: `/${prefixAdmin}/product/edit`, hidden: true },
            { id: "category-create", label: "Tạo danh mục sản phẩm", tKey: "admin.sidebar.category_create", path: `/${prefixAdmin}/product-category/create`, hidden: true },
            { id: "brand-create", label: "Tạo thương hiệu", tKey: "admin.sidebar.brand_create", path: `/${prefixAdmin}/brand/create`, hidden: true },
        ]
    },
    {
        id: "services",
        label: "Dịch vụ",
        Icon: MedicalServicesIcon,
        children: [
            { id: "create", label: "Tạo dịch vụ", path: `/${prefixAdmin}/service/create` },
            { id: "list", label: "Danh sách dịch vụ", path: `/${prefixAdmin}/service/list` },
            { id: "category", label: "Danh mục dịch vụ", path: `/${prefixAdmin}/service/categories` },
        ]
    },
    {
        id: "blogs",
        label: "Bài viết",
        tKey: "admin.sidebar.blogs",
        Icon: ArticleIcon,
        children: [
            { id: "create", label: "Tạo bài viết", tKey: "admin.sidebar.blog_create", path: `/${prefixAdmin}/blog/create` },
            { id: "list", label: "Danh sách bài viết", tKey: "admin.sidebar.blog_list", path: `/${prefixAdmin}/blog/list` },
            { id: "category", label: "Danh mục bài viết", tKey: "admin.sidebar.blog_category", path: `/${prefixAdmin}/blog-category/list` },
            { id: "tags", label: "Tags", tKey: "admin.sidebar.tags", path: `/${prefixAdmin}/blog/list?modal=tags` },
            { id: "category-create", label: "Tạo danh mục bài viết", tKey: "admin.sidebar.blog_category_create", path: `/${prefixAdmin}/blog-category/create`, hidden: true },
        ]
    },
    {
        id: "roles",
        label: "Nhóm quyền",
        tKey: "admin.sidebar.roles",
        Icon: SecurityIcon,
        children: [
            { id: "list", label: "Danh sách", tKey: "admin.sidebar.role_list", path: `/${prefixAdmin}/role/list` },
            { id: "create", label: "Tạo mới", tKey: "admin.sidebar.role_create", path: `/${prefixAdmin}/role/create` },
        ]
    },
    {
        id: "accounts",
        label: "Tài khoản admin",
        tKey: "admin.sidebar.accounts",
        Icon: PeopleIcon,
        children: [
            { id: "list", label: "Danh sách", tKey: "admin.sidebar.account_list", path: `/${prefixAdmin}/account-admin/list` },
            { id: "create", label: "Tạo mới", tKey: "admin.sidebar.account_create", path: `/${prefixAdmin}/account-admin/create` },
        ]
    },
    {
        id: "coupons",
        label: "Mã giảm giá",
        tKey: "admin.sidebar.coupons",
        Icon: DiscountIcon,
        children: [
            { id: "list", label: "Danh sách mã giảm giá", tKey: "admin.sidebar.coupon_list", path: `/${prefixAdmin}/coupon/list` },
            { id: "create", label: "Tạo mã giảm giá", tKey: "admin.sidebar.coupon_create", path: `/${prefixAdmin}/coupon/create`, hidden: true },
            { id: "edit", label: "Sửa mã giảm giá", tKey: "admin.sidebar.coupon_edit", path: `/${prefixAdmin}/coupon/edit`, hidden: true },
        ]
    }
];
