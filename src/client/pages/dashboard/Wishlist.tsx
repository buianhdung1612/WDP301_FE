import { Sidebar } from "./sections/Sidebar";
import { ProductBanner } from "../product/sections/ProductBanner";
import { ProductCard } from "../../components/ui/ProductCard";
import type { Product } from "../../../types/products.type";

export const WishlistPage = () => {
    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: "Sản phẩm yêu thích", to: "/dashboard/wishlist" },
    ];

    const wishlistItems: Product[] = [
        {
            id: 1,
            title: "Chocolate Cake",
            price: "250.000đ",
            primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10c-1000x1048.jpg",
            secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10-1000x1048.jpg",
            rating: 5,
            isSale: true,
            url: "/product/detail/chocolate-cake",
        },
        {
            id: 2,
            title: "Strawberry",
            price: "180.000đ",
            primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10c-1000x1048.jpg",
            secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10-1000x1048.jpg",
            rating: 4,
            isSale: false,
            url: "/product/detail/strawberry-shortcake",
        },
        {
            id: 3,
            title: "Blueberry",
            price: "45.000đ",
            primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10c-1000x1048.jpg",
            secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10-1000x1048.jpg",
            rating: 5,
            isSale: true,
            url: "/product/detail/blueberry-muffin",
        },
        {
            id: 4,
            title: "Cupcake",
            price: "35.000đ",
            primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10c-1000x1048.jpg",
            secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10-1000x1048.jpg",
            rating: 4,
            isSale: false,
            url: "/product/detail/vanilla-cupcake",
        },
        {
            id: 5,
            title: "Red Velvet",
            price: "220.000đ",
            primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10c-1000x1048.jpg",
            secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10-1000x1048.jpg",
            rating: 5,
            isSale: true,
            url: "/product/detail/red-velvet-cake",
        },
        {
            id: 6,
            title: "Lemon Tart",
            price: "120.000đ",
            primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10c-1000x1048.jpg",
            secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10-1000x1048.jpg",
            rating: 4,
            isSale: false,
            url: "/product/detail/lemon-tart",
        },
    ];

    return (
        <>
            <ProductBanner
                pageTitle="Sản phẩm yêu thích"
                breadcrumbs={breadcrumbs}
                url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
                className="bg-top"
            />

            <div className="mt-[-150px] mb-[100px] w-[1600px] mx-auto flex items-stretch">
                <div className="w-[25%] px-[12px] flex">
                    <Sidebar />
                </div>
                <div className="w-[75%] px-[12px]">
                    <div className="mt-[100px] p-[35px] bg-white shadow-[0px_8px_24px_#959da533] rounded-[12px]">
                        <h3 className="text-[2.4rem] font-[600] text-client-secondary mb-[30px] flex items-center justify-between">
                            Sản phẩm yêu thích
                        </h3>

                        <div className="grid grid-cols-3 gap-[25px]">
                            {wishlistItems.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <ul className="flex items-center mt-[50px] justify-center gap-[11px]">
                            <li className="flex items-center cursor-pointer justify-center bg-client-secondary text-white rounded-full w-[4.5rem] h-[4.5rem]">1</li>
                            <li className="flex items-center cursor-pointer justify-center bg-client-primary hover:bg-client-secondary transition-default text-white rounded-full w-[4.5rem] h-[4.5rem]">2</li>
                            <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-client-primary hover:bg-client-secondary cursor-pointer transition-default flex items-center justify-center next-button"></div>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};
