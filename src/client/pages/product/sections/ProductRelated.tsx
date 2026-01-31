import { Navigation } from "swiper/modules";
import type { Product } from "../../../../types/products.type";
import { ProductCard } from "../../../components/ui/ProductCard"
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from "swiper";
import { useRef } from "react";

const products: Product[] = [
    {
        id: 1,
        title: "Thẻ tên",
        price: "360.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10c-1000x1048.jpg",
        rating: 5,
        isSale: true,
        url: "/product/detail/the-ten",
    },
    {
        id: 2,
        title: "Vòng cổ",
        price: "220.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-11-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-11c-1000x1048.jpg",
        rating: 4,
        isSale: false,
        url: "/product/detail/vong-co",
    },
    {
        id: 3,
        title: "Đồ chơi mèo",
        price: "150.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-12-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-12c-1000x1048.jpg",
        rating: 3,
        isSale: true,
        url: "/product/detail/do-choi-meo",
    },
    {
        id: 4,
        title: "Nệm nylon",
        price: "540.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-9-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-9a-1000x1048.jpg",
        rating: 4,
        isSale: true,
        url: "/product/detail/nem-nylon",
    },
    {
        id: 5,
        title: "Đồ chơi mèo",
        price: "150.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-12-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-12c-1000x1048.jpg",
        rating: 3,
        isSale: true,
        url: "/product/detail/do-choi-meo",
    },
    {
        id: 6,
        title: "Đồ chơi mèo",
        price: "150.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-12-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-12c-1000x1048.jpg",
        rating: 3,
        isSale: true,
        url: "/product/detail/do-choi-meo",
    },
];

export const ProductRelated = () => {
    const prevButtonRef = useRef<HTMLDivElement>(null);
    const nextButtonRef = useRef<HTMLDivElement>(null);

    return (
        <div className="app-container pb-[150px] 2xl:pb-[120px] relative">
            <h2 className="text-[3.5rem] 2xl:text-[2.8rem] font-secondary text-client-secondary mb-[40px]">Sản phẩm liên quan</h2>
            <div className="flex gap-[10px] absolute top-[-3%] right-0">
                <div ref={prevButtonRef} className="w-[50px] h-[50px] rounded-full bg-client-primary hover:bg-client-secondary cursor-pointer transition-default flex items-center justify-center prev-button"></div>
                <div ref={nextButtonRef} className="w-[50px] h-[50px] rounded-full bg-client-primary hover:bg-client-secondary cursor-pointer transition-default flex items-center justify-center next-button"></div>
            </div>

            <Swiper
                modules={[Navigation]}
                slidesPerView={4}
                spaceBetween={30}
                navigation={{
                    prevEl: prevButtonRef.current,
                    nextEl: nextButtonRef.current,
                }}
                onBeforeInit={(swiper: SwiperType) => {
                    if (
                        swiper.params.navigation &&
                        typeof swiper.params.navigation !== "boolean"
                    ) {
                        swiper.params.navigation.prevEl = prevButtonRef.current;
                        swiper.params.navigation.nextEl = nextButtonRef.current;
                    }
                }}
                className="mySwiper"
            >
                {products.map((item: Product) => (
                    <SwiperSlide key={item.id}>
                        <ProductCard product={item} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}