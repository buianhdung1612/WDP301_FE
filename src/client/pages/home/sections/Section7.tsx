import type { Product } from "../../../../types/products.type";
import { Button } from "../../../components/ui/Button"
import { ProductCard } from "../../../components/ui/ProductCard";
import { SaleOff } from "../../../components/ui/SaleOff"
import { SectionHeader } from "../../../components/ui/SectionHeader"

const products: Product[] = [
    {
        id: 1,
        title: "Thẻ tên",
        price: "360.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-10c-1000x1048.jpg",
        rating: 5,
        isSale: true,
        url: "/san-pham/the-ten",
    },
    {
        id: 2,
        title: "Vòng cổ",
        price: "220.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-11-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-11c-1000x1048.jpg",
        rating: 4,
        isSale: false,
        url: "/san-pham/vong-co",
    },
    {
        id: 3,
        title: "Đồ chơi mèo",
        price: "150.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-12-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-12c-1000x1048.jpg",
        rating: 3,
        isSale: true,
        url: "/san-pham/do-choi-meo",
    },
    // {
    //     id: 4,
    //     title: "Nệm nylon",
    //     price: "540.000đ",
    //     primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-9-1000x1048.jpg",
    //     secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-9a-1000x1048.jpg",
    //     rating: 4,
    //     isSale: true,
    //     url: "/san-pham/nem-nylon",
    // },
];

export const Section7 = () => {
    return (
        <section className="relative px-[30px] py-[120px]">
            <div className="app-container flex gap-[30px]">
                <div className="w-[63.5%]">
                    <SectionHeader
                        subtitle="Đồ Dùng Thú Cưng Thiết Yếu"
                        title="Sản Phẩm Yêu Thích"
                        align="left"
                    />
                    <div className="grid grid-cols-3 gap-[30px] mt-[50px]">
                        {products.map((item: Product) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </div>
                <div className="flex-1">
                    <div
                        className="flex flex-col gap-[30px] justify-end bg-center bg-cover bg-no-repeat w-full h-full rounded-[30px] p-[40px] relative bg-image-section-7"
                        style={{
                            backgroundImage: "url('https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/h1-Product-imgbox.jpg')"
                        }}
                    >
                        <SaleOff content="20% OFF" backgroundColor="bg-[#FFF3E2]" textColor="text-client-secondary" />
                        <h2 className="text-white text-[4rem] leading-[1.2] font-secondary relative">Điểm Đến Cao Cấp Cho Người Yêu Thú Cưng</h2>
                        <div className="relative">
                            <Button
                                content="Xem tất cả sản phẩm"
                                hoverBackground="group-hover:bg-client-primary"
                                textColor="text-client-secondary"
                                hoverTextColor="group-hover:text-white"
                                iconColor="before:bg-client-secondary after:bg-client-secondary"
                                hoverIconColor="hover:before:bg-white hover:after:bg-white"
                                url="cua-hang"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}