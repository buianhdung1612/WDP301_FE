import { FooterSub } from "../../components/layouts/FooterSub"
import { ProductAside } from "./sections/ProductAside"
import { ProductBanner } from "./sections/ProductBanner"
import type { Product } from "../../../types/products.type"
import { ProductCard } from "../../components/ui/ProductCard"
import { ProductListSearch } from "./sections/ProductListSearch"

import { useProducts } from "../../hooks/useProduct"
import { Skeleton } from "@mui/material"

const breadcrumbs = [
    { label: "Trang chủ", to: "/" },
    { label: "Cửa hàng", to: "/shop" },
];

export const ProductListPage = () => {
    const { data: productsData, isLoading } = useProducts();

    const products: Product[] = productsData?.map((item: any) => ({
        id: item._id,
        title: item.name,
        price: `${(item.priceNew || item.priceOld || 0).toLocaleString("vi-VN")}đ`,
        primaryImage: item.images?.[0] || "",
        secondaryImage: item.images?.[1] || item.images?.[0] || "",
        rating: 5,
        isSale: item.priceOld > item.priceNew,
        url: `/product/detail/${item.slug}`,
    })) || [];

    return (
        <>
            <ProductBanner pageTitle="Cửa hàng" breadcrumbs={breadcrumbs} url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-blog-listing.jpg" className="bg-top" />

            <div className="app-container flex gap-[80px] 2xl:gap-[30px] relative">
                <ProductAside />
                <section className="w-[1040px] 2xl:w-[970px]">
                    <ProductListSearch />
                    <div className="grid grid-cols-3 gap-[30px]">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="space-y-4">
                                    <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: '20px' }} />
                                    <Skeleton variant="text" width="60%" height={30} />
                                    <Skeleton variant="text" width="40%" height={20} />
                                </div>
                            ))
                        ) : (
                            products.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))
                        )}
                    </div>
                    <ul className="flex items-center mt-[65px] 2xl:mt-[40px] justify-center gap-[11px] pb-[150px] 2xl:pb-[120px]">
                        <li className="flex items-center cursor-pointer justify-center bg-client-secondary text-white rounded-full w-[4.5rem] h-[4.5rem]">1</li>
                        <li className="flex items-center cursor-pointer justify-center bg-client-primary hover:bg-client-secondary transition-default text-white rounded-full w-[4.5rem] h-[4.5rem]">2</li>
                        {/* <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-client-primary hover:bg-client-secondary cursor-pointer transition-default flex items-center justify-center prev-button"></div> */}
                        <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-client-primary hover:bg-client-secondary cursor-pointer transition-default flex items-center justify-center next-button"></div>
                    </ul>
                </section>
            </div>

            <FooterSub />
        </>
    );
};
