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
import { BlogCategoryEditPage } from "../pages/blog-category/BlogCategoryEditPage";
import { CouponListPage } from "../pages/coupon/CouponListPage";
import { CouponCreatePage } from "../pages/coupon/CouponCreatePage";
import { CouponEditPage } from "../pages/coupon/CouponEditPage";
import { ProductAttributeListPage } from "../pages/product-attribute/ProductAttributeListPage";
import { ProductAttributeCreatePage } from "../pages/product-attribute/ProductAttributeCreatePage";
import { ProductAttributeEditPage } from "../pages/product-attribute/ProductAttributeEditPage";

export const AdminRoutes = [
    { path: "dashboard", element: <DashboardPage /> },
    { path: "product/list", element: <ProductListPage /> },
    { path: "product/create", element: <ProductCreatePage /> },
    { path: "product/edit/:id", element: <ProductEditPage /> },
    { path: "product-category/list", element: <ProductCategoryListPage /> },
    { path: "product-category/create", element: <ProductCategoryCreatePage /> },
    { path: "product-category/edit/:id", element: <ProductCategoryEditPage /> },
    { path: "product-category/detail/:id", element: <ProductCategoryEditPage /> },
    { path: "brand/list", element: <BrandListPage /> },
    { path: "brand/create", element: <BrandCreatePage /> },
    { path: "brand/edit/:id", element: <BrandEditPage /> },
    { path: "brand/detail/:id", element: <BrandEditPage /> },
    { path: "blog/list", element: <BlogListPage /> },
    { path: "blog/create", element: <BlogCreatePage /> },
    { path: "blog/edit/:id", element: <BlogEditPage /> },
    { path: "blog/detail/:id", element: <BlogDetailPage /> },
    { path: "blog-category/list", element: <BlogCategoryListPage /> },
    { path: "blog-category/create", element: <BlogCategoryCreatePage /> },
    { path: "blog-category/edit/:id", element: <BlogCategoryEditPage /> },
    { path: "blog-category/detail/:id", element: <BlogCategoryEditPage /> },
    { path: "coupon/list", element: <CouponListPage /> },
    { path: "coupon/create", element: <CouponCreatePage /> },
    { path: "coupon/edit/:id", element: <CouponEditPage /> },
    { path: "product/attribute/list", element: <ProductAttributeListPage /> },
    { path: "product/attribute/create", element: <ProductAttributeCreatePage /> },
    { path: "product/attribute/edit/:id", element: <ProductAttributeEditPage /> },
];

export const AdminAuthRoutes = [
    { path: "auth/login", element: <LoginPage /> },
];
