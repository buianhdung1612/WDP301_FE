import { FooterSub } from "../../components/layouts/FooterSub";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Link } from "react-router-dom";

const breadcrumbs = [
    { label: "Trang chủ", to: "/" },
    { label: "Bài viết", to: "/bai-viet" },
];

const blogs = [
    {
        id: 1,
        url: "/bai-viet/khoanh-khac-vui-tuoi-tai-nha-ma-cho-thich-thu",
        image: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Aristocraticpet.jpg",
        title: "Khoảnh khắc vui tươi tại nhà mà chó thích thú",
        description: "Dù bạn không có nhiều không gian hay thời gian, việc giữ cho người bạn bốn chân của mình được vận động và kích thích trí óc là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết dễ dàng và sáng tạo như các trò chơi tìm kiếm, huấn luyện kỹ năng mới hay các buổi ôm ấp chất lượng để biến ngôi nhà của bạn thành một sân chơi thú vị, mang lại niềm vui và sự gắn kết tuyệt vời cho cả hai. Đừng bỏ lỡ những khoảnh khắc tuyệt vời này!"
    },
    {
        id: 2,
        url: "/bai-viet/khoanh-khac-vui-tuoi-tai-nha-ma-cho-thich-thu",
        image: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Aristocraticpet.jpg",
        title: "Khoảnh khắc vui tươi tại nhà mà chó thích thú",
        description: "Dù bạn không có nhiều không gian hay thời gian, việc giữ cho người bạn bốn chân của mình được vận động và kích thích trí óc là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết dễ dàng và sáng tạo như các trò chơi tìm kiếm, huấn luyện kỹ năng mới hay các buổi ôm ấp chất lượng để biến ngôi nhà của bạn thành một sân chơi thú vị, mang lại niềm vui và sự gắn kết tuyệt vời cho cả hai. Đừng bỏ lỡ những khoảnh khắc tuyệt vời này!"
    },
    {
        id: 3,
        url: "/bai-viet/khoanh-khac-vui-tuoi-tai-nha-ma-cho-thich-thu",
        image: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Aristocraticpet.jpg",
        title: "Khoảnh khắc vui tươi tại nhà mà chó thích thú",
        description: "Dù bạn không có nhiều không gian hay thời gian, việc giữ cho người bạn bốn chân của mình được vận động và kích thích trí óc là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết dễ dàng và sáng tạo như các trò chơi tìm kiếm, huấn luyện kỹ năng mới hay các buổi ôm ấp chất lượng để biến ngôi nhà của bạn thành một sân chơi thú vị, mang lại niềm vui và sự gắn kết tuyệt vời cho cả hai. Đừng bỏ lỡ những khoảnh khắc tuyệt vời này!"
    },
    {
        id: 4,
        url: "/bai-viet/khoanh-khac-vui-tuoi-tai-nha-ma-cho-thich-thu",
        image: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Aristocraticpet.jpg",
        title: "Khoảnh khắc vui tươi tại nhà mà chó thích thú",
        description: "Dù bạn không có nhiều không gian hay thời gian, việc giữ cho người bạn bốn chân của mình được vận động và kích thích trí óc là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết dễ dàng và sáng tạo như các trò chơi tìm kiếm, huấn luyện kỹ năng mới hay các buổi ôm ấp chất lượng để biến ngôi nhà của bạn thành một sân chơi thú vị, mang lại niềm vui và sự gắn kết tuyệt vời cho cả hai. Đừng bỏ lỡ những khoảnh khắc tuyệt vời này!"
    },
    {
        id: 5,
        url: "/bai-viet/khoanh-khac-vui-tuoi-tai-nha-ma-cho-thich-thu",
        image: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Aristocraticpet.jpg",
        title: "Khoảnh khắc vui tươi tại nhà mà chó thích thú",
        description: "Dù bạn không có nhiều không gian hay thời gian, việc giữ cho người bạn bốn chân của mình được vận động và kích thích trí óc là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết dễ dàng và sáng tạo như các trò chơi tìm kiếm, huấn luyện kỹ năng mới hay các buổi ôm ấp chất lượng để biến ngôi nhà của bạn thành một sân chơi thú vị, mang lại niềm vui và sự gắn kết tuyệt vời cho cả hai. Đừng bỏ lỡ những khoảnh khắc tuyệt vời này!"
    },
    {
        id: 6,
        url: "/bai-viet/khoanh-khac-vui-tuoi-tai-nha-ma-cho-thich-thu",
        image: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Aristocraticpet.jpg",
        title: "Khoảnh khắc vui tươi tại nhà mà chó thích thú",
        description: "Dù bạn không có nhiều không gian hay thời gian, việc giữ cho người bạn bốn chân của mình được vận động và kích thích trí óc là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết dễ dàng và sáng tạo như các trò chơi tìm kiếm, huấn luyện kỹ năng mới hay các buổi ôm ấp chất lượng để biến ngôi nhà của bạn thành một sân chơi thú vị, mang lại niềm vui và sự gắn kết tuyệt vời cho cả hai. Đừng bỏ lỡ những khoảnh khắc tuyệt vời này!"
    },
    {
        id: 7,
        url: "/bai-viet/khoanh-khac-vui-tuoi-tai-nha-ma-cho-thich-thu",
        image: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Aristocraticpet.jpg",
        title: "Khoảnh khắc vui tươi tại nhà mà chó thích thú",
        description: "Dù bạn không có nhiều không gian hay thời gian, việc giữ cho người bạn bốn chân của mình được vận động và kích thích trí óc là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết dễ dàng và sáng tạo như các trò chơi tìm kiếm, huấn luyện kỹ năng mới hay các buổi ôm ấp chất lượng để biến ngôi nhà của bạn thành một sân chơi thú vị, mang lại niềm vui và sự gắn kết tuyệt vời cho cả hai. Đừng bỏ lỡ những khoảnh khắc tuyệt vời này!"
    },
    {
        id: 8,
        url: "/bai-viet/khoanh-khac-vui-tuoi-tai-nha-ma-cho-thich-thu",
        image: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Aristocraticpet.jpg",
        title: "Khoảnh khắc vui tươi tại nhà mà chó thích thú",
        description: "Dù bạn không có nhiều không gian hay thời gian, việc giữ cho người bạn bốn chân của mình được vận động và kích thích trí óc là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết dễ dàng và sáng tạo như các trò chơi tìm kiếm, huấn luyện kỹ năng mới hay các buổi ôm ấp chất lượng để biến ngôi nhà của bạn thành một sân chơi thú vị, mang lại niềm vui và sự gắn kết tuyệt vời cho cả hai. Đừng bỏ lỡ những khoảnh khắc tuyệt vời này!"
    },
    {
        id: 9,
        url: "/bai-viet/khoanh-khac-vui-tuoi-tai-nha-ma-cho-thich-thu",
        image: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Aristocraticpet.jpg",
        title: "Khoảnh khắc vui tươi tại nhà mà chó thích thú",
        description: "Dù bạn không có nhiều không gian hay thời gian, việc giữ cho người bạn bốn chân của mình được vận động và kích thích trí óc là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết dễ dàng và sáng tạo như các trò chơi tìm kiếm, huấn luyện kỹ năng mới hay các buổi ôm ấp chất lượng để biến ngôi nhà của bạn thành một sân chơi thú vị, mang lại niềm vui và sự gắn kết tuyệt vời cho cả hai. Đừng bỏ lỡ những khoảnh khắc tuyệt vời này!"
    },
];
export const BlogListPage = () => {
    return (
        <>
            <ProductBanner pageTitle="Bài viết" breadcrumbs={breadcrumbs} url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-blog-listing.jpg" />
            <section className="relative px-[30px] bg-white">
                <div className="app-container grid grid-cols-3 gap-[30px] relative">
                    {blogs.map(blog => (
                        <div className="bg-[#e67e2026] rounded-[20px] overflow-hidden product-item transition-all duration-300 ease-linear hover:bg-client-primary group">
                            <div className="p-[20px]">
                                <Link to={blog.url} className="block relative rounded-[20px] overflow-hidden aspect-[1520/800]">
                                    <img
                                        className="primary-image z-[10]-item w-full h-full object-cover rounded-[20px] transition-opacity duration-700 opacity-100 cursor-pointer"
                                        src={blog.image}
                                        alt={blog.title}
                                    />
                                    <div className="date-blog absolute z-[20] top-[5%] left-[2%] bg-client-primary transition-default py-[10px] px-[16px] text-[1.8rem] leading-[1.2] text-white w-[65px] font-secondary text-center group-hover:bg-[#F7F3EB] group-hover:text-client-secondary">23 Jun</div>
                                </Link>
                            </div>

                            <div className="grid grid-cols-[1fr_auto] gap-[10px]">
                                <div className="pl-[25px]">
                                    <Link
                                        to={blog.url}
                                        className="block text-client-secondary text-[2.2rem] font-secondary leading-[1.4] transition-default ease-in-out group-hover:text-white hover:opacity-90 mb-[10px] line-clamp-1"
                                    >
                                        {blog.title}
                                    </Link>
                                    <p className="line-clamp-2 text-client-text group-hover:text-white transition-default ease-in-out">{blog.description}</p>
                                </div>

                                {/* Button */}
                                <div className="mt-[15px]">
                                    <div className="mt-[53px]">
                                        <div className="w-[7rem] h-[7rem] pt-[10px] pl-[10px] relative rounded-tl-[30px] bg-white cart-button">
                                            <Link to="/bai-viet/khoanh-khac-vui-tuoi-tai-nha-ma-cho-thich-thu" className="w-[6rem] h-[6rem] rounded-full bg-client-primary text-white flex items-center justify-center duration-[375ms] ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:bg-client-secondary">
                                                <button className="button-watch-more-section-2 w-[50%] cursor-pointer aspect-square flex items-center justify-center  rounded-full">
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <ul className="flex items-center mt-[65px] 2xl:mt-[40px] justify-center gap-[11px] pb-[150px] 2xl:pb-[120px]">
                    <li className="flex items-center cursor-pointer justify-center bg-client-secondary text-white rounded-full w-[4.5rem] h-[4.5rem]">1</li>
                    <li className="flex items-center cursor-pointer justify-center bg-client-primary hover:bg-client-secondary transition-default text-white rounded-full w-[4.5rem] h-[4.5rem]">2</li>
                    {/* <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-client-primary hover:bg-client-secondary cursor-pointer transition-default flex items-center justify-center prev-button"></div> */}
                    <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-client-primary hover:bg-client-secondary cursor-pointer transition-default flex items-center justify-center next-button"></div>
                </ul>
            </section>
            <FooterSub />
        </>
    )
}