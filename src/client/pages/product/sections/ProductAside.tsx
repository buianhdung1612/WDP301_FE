import SearchIcon from "@mui/icons-material/Search";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import type { Product } from "../../../../types/products.type";
import { ProductAsideTitle } from "./ProductAsideTitle";
import { ProductAsideList } from "./ProductAsideList";

const categories = [
    { name: "Mèo cảnh", count: 8, to: "#" },
    { name: "Đồ chơi gặm nhấm", count: 2, to: "#" },
    { name: "Chó cảnh", count: 11, to: "#" },
    { name: "Nội thất thú cưng", count: 1, to: "#" },
    { name: "Phiên bản đặc biệt", count: 4, to: "#" },
    { name: "Đồ chơi", count: 4, to: "#" },
];

const brands = [
    { name: "Chic Charms", count: 2, to: "#" },
    { name: "Doggy Dive", count: 7, to: "#" },
    { name: "Glamour Gems", count: 12, to: "#" },
    { name: "Puppy Style", count: 4, to: "#" }
];

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
        title: "Áo mưa cho chó",
        price: "150.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-12-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-12c-1000x1048.jpg",
        rating: 3,
        isSale: true,
        url: "/san-pham/do-choi-meo",
    },
    {
        id: 4,
        title: "Nệm nylon",
        price: "540.000đ",
        primaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-9-1000x1048.jpg",
        secondaryImage: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-9a-1000x1048.jpg",
        rating: 4,
        isSale: true,
        url: "/san-pham/nem-nylon",
    },
]

const filterTags = [
    {
        title: "Xương gà",
        url: "/san-pham-the/xuong-ga",
    },
    {
        title: "Xương chó",
        url: "/san-pham-the/xuong-cho",
    },
    {
        title: "Nệm ấm",
        url: "/san-pham-the/nem-am",
    },
    {
        title: "Thẻ tên",
        url: "/san-pham-the/the-ten",
    },
    {
        title: "Dinh dưỡng chim",
        url: "/san-pham-the/dinh-duong-chim",
    },
    {
        title: "Đồ chơi tạ",
        url: "/san-pham-the/do-choi-ta",
    },
    {
        title: "Thức ăn",
        url: "/san-pham-the/thuc-an",
    },
    {
        title: "Lồng Hamster",
        url: "/san-pham-the/long-hamster",
    },
    {
        title: "Thức ăn mèo con",
        url: "/san-pham-the/thuc-an-meo-con",
    },
    {
        title: "Phụ kiện",
        url: "/san-pham-the/phu-kien",
    },
    {
        title: "Đồ dùng cần thiết",
        url: "/san-pham-the/do-dung-can-thiet",
    },
    {
        title: "Chó con",
        url: "/san-pham-the/cho-con",
    },
    {
        title: "Đồ nhai cho chó con",
        url: "/san-pham-the/do-nhai-cho-cho-con",
    },
    {
        title: "Thức ăn vặt",
        url: "/san-pham-the/thuc-an-vat",
    },
];

const maxPrice = 5000000;

export const ProductAside = () => {
    const [minPriceRange, setMinPriceRange] = useState(0);
    const [maxPriceRange, setMaxPriceRange] = useState(100);
    const trackRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<null | "min" | "max">(null);

    const handleMouseDown = (type: "min" | "max") => {
        setDragging(type);
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragging || !trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        const step = 2;
        const clamped = Math.min(Math.max(Math.round(percent / step) * step, 0), 100);

        if (dragging === "min" && clamped <= maxPriceRange) {
            setMinPriceRange(clamped);
        } else if (dragging === "max" && clamped >= minPriceRange) {
            setMaxPriceRange(clamped);
        }
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    });

    return (
        <aside className="w-[400px] 2xl:w-[300px] pb-[120px] 2xl:pb-[100px] sticky top-0 self-start">
            {/* Tìm kiếm */}
            <form className="relative mb-[40px]" action="">
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full outline-none text-client-text border border-[#d7d7d7] px-[32px] py-[16px] bg-white rounded-[40px]"
                />
                <button
                    type="submit"
                    className="absolute top-0 right-0 p-[10px] rotate-90 rounded-full text-white bg-client-primary hover:bg-client-secondary transition-default cursor-pointer w-[5.7rem] h-[5.7rem] flex items-center justify-center"
                >
                    <SearchIcon sx={{ fontSize: "3.5rem" }} />
                </button>
            </form>

            {/* Danh mục */}
            <div className="mb-[40px]">
                <ProductAsideTitle title="Mua sắm theo danh mục" />
                <ProductAsideList categories={categories} />
            </div>

            {/* Khoảng giá */}
            <div className="mb-[40px]">
                <ProductAsideTitle title="Khoảng giá" />
                <div className="mt-[40px]">
                    <div
                        ref={trackRef}
                        className="bg-[#10293726] rounded-[16px] h-[3px] mx-[8px] relative select-none"
                    >
                        <div
                            className="absolute top-0 bg-client-secondary h-full z-[1] rounded-[16px]"
                            style={{
                                left: `${minPriceRange}%`,
                                width: `${maxPriceRange - minPriceRange}%`,
                            }}
                        ></div>

                        {/* Nút min */}
                        <span
                            onMouseDown={() => handleMouseDown("min")}
                            className="absolute top-[1px] translate-y-[-50%] bg-client-primary rounded-full w-[16px] ml-[-8px] h-[16px] z-[2] cursor-ew-resize"
                            style={{
                                left: `${minPriceRange}%`,
                            }}
                        ></span>

                        {/* Nút max */}
                        <span
                            onMouseDown={() => handleMouseDown("max")}
                            className="absolute top-[1px] translate-y-[-50%] bg-client-primary rounded-full w-[16px] ml-[-8px] h-[16px] z-[2] cursor-ew-resize"
                            style={{
                                left: `${maxPriceRange}%`,
                            }}
                        ></span>
                    </div>

                    {/* Giá hiển thị */}
                    <div className="flex justify-between mt-[20px] text-client-text text-[1.4rem]">
                        <span>
                            Giá: {(minPriceRange / 100 * maxPrice).toLocaleString("vi-VN")}đ - {(maxPriceRange / 100 * maxPrice).toLocaleString("vi-VN")}đ
                        </span>
                    </div>
                </div>
                <div className="relative block min-w-[135px] mt-[15px]">
                    <button
                        className={`button-text cursor-pointer before:bg-white after:bg-white bg-client-primary hover:bg-client-secondary text-white hover:[box-shadow:0_0_30px_#ffffff33] inline-block relative mask-[url('/mask-bg-button.svg')] mask-no-repeat mask-center mask-[size:100%] rounded-[10px] px-[40px] py-[10px] text-[1.6rem] font-secondary transition-default`}
                    >
                        Lọc
                    </button>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="mb-[40px]">
                <ProductAsideTitle title="Sản phẩm" />
                <ul className="mt-[25px]">
                    {products.map((item) => (
                        <li className="p-[15px] mb-[15px] rounded-[10px] bg-[#fff0f066] flex">
                            <Link to="#" className="mr-[20px] rounded-[10px] overflow-hidden">
                                <img src={item.primaryImage} alt="" width={80} height={84} />
                            </Link>
                            <div>
                                <Link to="#" className="block text-[1.7rem] font-secondary text-client-secondary hover:text-[#10293799] transition-default mb-[2px] line-clamp-1">{item.title}</Link>
                                <div className="flex items-center mb-[7px] ml-[-5px]">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon
                                            key={i}
                                            sx={{
                                                fontSize: "1.8rem !important",
                                                color: i < item.rating ? "#ffbb00 !important" : "#ccc !important",
                                            }}
                                        />
                                    ))}
                                </div>
                                <p className="text-client-text">{item.price}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Thương hiệu sản phẩm */}
            <div className="mb-[40px]">
                <ProductAsideTitle title="Thương hiệu" />
                <ProductAsideList categories={brands} />
            </div>

            {/* Lọc theo thẻ */}
            <div>
                <ProductAsideTitle title="Lọc theo thẻ" />
                <div className="gap-[15px] mt-[10px] p-[20px] bg-[#fff0f066] rounded-[20px] flex flex-wrap">
                    {filterTags.map(item => (
                        <Link to={item.url} className="text-client-secondary bg-white hover:text-white hover:bg-client-secondary transition-default py-[8px] px-[16px] text-[1.4rem] border border-[#10293726] rounded-[35px]">
                            {item.title}
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    )
}