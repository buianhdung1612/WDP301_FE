import { Handbag, Heart, Search, User } from "iconoir-react"
import { Link } from "react-router-dom"
import { Button } from "../ui/Button"
import { useCartStore } from "../../../stores/useCartStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { logout as logoutApi } from "../../api/auth.api";
import { toast } from "react-toastify";

export const MainHeader = () => {
    const totalItemsCount = useCartStore((state) => state.totalItems());
    const totalAmount = useCartStore((state) => state.totalAmount());
    const items = useCartStore((state) => state.items);
    const isCartHydrated = useCartStore((state) => state.isHydrated);

    const user = useAuthStore((state) => state.user);
    const logoutStore = useAuthStore((state) => state.logout);
    const isAuthHydrated = useAuthStore((state) => state.isHydrated);

    const cartCount = isCartHydrated ? totalItemsCount : 0;
    const removeFromCart = useCartStore((state) => state.removeFromCart);

    const handleRemove = (productId: string, variant?: any) => {
        setTimeout(() => {
            removeFromCart(productId, variant);
        }, 300);
    };

    const handleLogout = async () => {
        try {
            await logoutApi();
            logoutStore();
            toast.success("Đăng xuất thành công!");
        } catch (error) {
            console.log(error);
            toast.error("Lỗi khi đăng xuất!");
        }
    };

    return (
        <>
            <div className="p-[30px] bg-white border-b border-[#1029371A] z-50 relative">
                <div className="app-container flex items-center justify-between">
                    {/* Logo */}
                    <div className="w-[15%] flex justify-center">
                        <Link to="/">
                            <img src="https://i.imgur.com/V2kwkkK.png" alt="" className="w-[190px] object-cover z-10" />
                        </Link>
                    </div>

                    {/* Form Search */}
                    <form action="" className="w-[34.2%] flex">
                        <input type="text" name="keyword" placeholder="Tìm kiếm sản phẩm" className="w-[95.2%] bg-[#10293708] rounded-l-[4rem] h-[50px] border border-[#d7d7d7] px-[32px] py-[16px] focus:outline-none focus:border-[#102937] transition-[border] duration-300 ease-linear" />
                        <div className="ml-[-25px] w-[5rem] h-[5rem] rounded-full bg-client-secondary flex items-center justify-center text-white cursor-pointer hover:bg-client-primary transition-[background] duration-300 ease-linear">
                            <Search stroke="3" />
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center gap-[30px] w-[34.2%] justify-end mr-[16px]">
                        <div className="w-[3.5rem] h-[3.5rem] p-[5px] flex items-center justify-center text-[#102937] hover:text-client-primary transition-[color] duration-300 cursor-pointer">
                            <Heart stroke="2" className="w-[2.5rem] h-[2.5rem]" />
                        </div>
                        <div className="group relative w-[3.5rem] h-[3.5rem] p-[5px] flex items-center justify-center cursor-pointer">
                            <Link to="/cart">
                                <Handbag stroke="2" className="w-[2.5rem] h-[2.5rem] text-[#102937] group-hover:text-client-primary transition-default" />
                            </Link>
                            {cartCount > 0 && (
                                <span className="absolute right-[-1px] top-[-5px] w-[18px] h-[18px] text-[1rem] bg-client-secondary text-white rounded-full flex items-center justify-center">{cartCount}</span>
                            )}
                            <div
                                className="hidden group-hover:block bg-white border border-[#d7d7d7] min-w-[350px] p-[20px] absolute top-[45px] right-[-20px] rounded-[20px] shadow-[0_-1px_8px_3px_#10293714] z-50 after:content-[''] after:block after:absolute after:w-0 after:h-0 after:border-solid after:border-[8px] after:border-transparent after:border-b-[#d7d7d7] after:right-[28px] after:top-[-16px]"
                            >
                                {items.length > 0 ? (
                                    <ul>
                                        {items.map((item, index) => (
                                            <li key={index} className="p-[15px] w-full relative bg-[#fff0f0] rounded-[10px] flex mb-[15px]">
                                                <div
                                                    onClick={() => handleRemove(item.productId, item.variant)}
                                                    className="absolute left-[-7px] top-[-7px] text-[1.2rem] bg-[#10293726] text-client-secondary hover:bg-client-primary hover:text-white transition-default w-[20px] h-[20px] rounded-full flex items-center justify-center">
                                                    x
                                                </div>
                                                <Link to={`/product/detail/${item.detail.slug}`} className="inline-block w-[80px] h-[80px] mr-[20px]">
                                                    <img src={item.detail.images[0]} width={80} height={80} alt="" className="w-full h-full object-cover rounded-[10px]" />
                                                </Link>
                                                <div>
                                                    <h3 className="text-client-secondary hover:text-client-text transition-default font-secondary text-[1.8rem] mb-[3px] line-clamp-1">{item.detail.name}</h3>
                                                    {item.variant && item.variant.length > 0 && (
                                                        <div className="text-client-text text-[1.4rem] font-[400] mb-[5px]">
                                                            <span className="text-client-secondary font-secondary mr-[2px]">Phân loại:</span>
                                                            {item.variant.map(v => v.label).join(", ")}
                                                        </div>
                                                    )}
                                                    <div className="text-client-text text-[1.4rem]">{item.quantity} x {item.detail.priceNew.toLocaleString()}đ</div>
                                                </div>
                                            </li>
                                        ))}
                                        <div className="border-t border-[#d7d7d7] text-client-secondary font-[700] text-[1.8rem] mt-[20px] pt-[10px] flex justify-between">
                                            <strong>Tạm tính:</strong>
                                            <span>{totalAmount.toLocaleString()}đ</span>
                                        </div>
                                        <div className="mt-[20px] mb-[5px]">
                                            <Link to="/cart" className="block text-[1.4rem] font-secondary bg-client-secondary hover:bg-client-primary transition-default text-white py-[16px] px-[30px] cursor-pointer text-center rounded-[40px] mb-[10px]">Xem giỏ hàng</Link>
                                            <Link to="/checkout" className="block text-[1.4rem] font-secondary bg-client-secondary hover:bg-client-primary transition-default text-white py-[16px] px-[30px] cursor-pointer text-center rounded-[40px]">Thanh toán</Link>
                                        </div>
                                    </ul>
                                ) : (
                                    <span className="text-[1.6rem] text-client-secondary">Không có sản phẩm trong giỏ hàng.</span>
                                )}

                            </div>
                        </div>
                        {isAuthHydrated && user ? (
                            <div className="group relative flex items-center gap-[10px] cursor-pointer">
                                <Link to="/dashboard/profile" className="w-[3.5rem] h-[3.5rem] p-[5px] flex items-center justify-center text-[#102937] hover:text-client-primary transition-default rounded-full border border-[#eee]">
                                    <User stroke="2" className="w-[2rem] h-[2rem]" />
                                </Link>

                                <div className="hidden group-hover:block absolute top-[40px] right-0 bg-white border border-[#eee] shadow-lg rounded-[15px] min-w-[180px] z-[60] overflow-hidden">
                                    <div className="p-[15px] border-b border-[#eee] bg-[#fafafa]">
                                        <p className="text-[1.2rem] text-gray-500">Chào mừng,</p>
                                        <p className="text-[1.4rem] font-bold text-client-secondary truncate">{user.fullName}</p>
                                    </div>
                                    <Link to="/dashboard/profile" className="block px-[20px] py-[12px] text-[1.4rem] text-client-secondary hover:bg-[#FFF0F0] hover:text-client-primary transition-default">Thông tin tài khoản</Link>
                                    <div
                                        onClick={handleLogout}
                                        className="block px-[20px] py-[12px] text-[1.4rem] text-red-500 hover:bg-red-50 transition-default cursor-pointer"
                                    >
                                        Đăng xuất
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link to="/auth/login" className="w-[3.5rem] h-[3.5rem] p-[5px] flex items-center justify-center text-[#102937] hover:text-client-primary transition-[color] duration-300 cursor-pointer">
                                <User stroke="2" className="w-[2.5rem] h-[2.5rem]" />
                            </Link>
                        )}
                        <Button
                            content="Liên hệ chúng tôi"
                            background="bg-client-secondary"
                            hoverBackground="group-hover:bg-client-primary"
                            svgColor="text-client-secondary"
                            hoverSvgColor="group-hover:text-client-primary"
                            textColor="text-white"
                            hoverTextColor="text-white"
                            iconColor="before:bg-white after:bg-white"
                            hoverIconColor="hover:before:bg-white hover:after:bg-white"
                        />
                    </div>
                </div>
            </div>
        </>
    )
}