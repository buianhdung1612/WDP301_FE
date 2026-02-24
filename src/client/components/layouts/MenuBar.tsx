import { Building2 } from "lucide-react";
import { NavLink } from "react-router-dom";

type MenuItem = {
  label: string;
  to: string;
  img?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
};

export const MenuBar = () => {
  const menuItems: MenuItem[] = [
    {
      label: "Trang chủ",
      to: "/",
      img: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/Menu-img-2.png",
    },
    {
      label: "Dịch vụ",
      to: "/services",
      img: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/Menu-img-1.png",
    },
    {
      label: "Khách sạn",
      to: "/khach-san",
      icon: Building2,
    },
    {
      label: "Bài viết",
      to: "/bai-viet",
      img: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/07/Menu-img-12.png",
    },
    {
      label: "Sản phẩm",
      to: "/shop",
      img: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/07/Menu-img-11-1.png",
    },
    {
      label: "Chó cưng",
      to: "/danh-muc-san-pham/cho-cung",
      img: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/Menu-img-4.png",
    },
    {
      label: "Mèo cưng",
      to: "/danh-muc-san-pham/meo-cung",
      img: "https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/Menu-img-5.png",
    },
  ];

  return (
    <div className="px-[30px] py-[10px] justify-between relative z-30">
      <div className="app-container">
        <ul className="flex items-center justify-between ml-[-22px] 2xl:ml-[-21px]">
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              className="p-[22px] 2xl:p-[21px] text-client-secondary font-[500] uppercase hover:text-client-primary transition-[color] duration-300 ease-linear cursor-pointer"
            >
              <NavLink to={item.to} className="flex items-center gap-[10px]">
                {item.icon ? (
                  <item.icon size={24} className="text-[#f4a623]" />
                ) : (
                  <img
                    src={item.img}
                    alt={item.label}
                    width={25}
                    height={25}
                    loading="eager"
                    decoding="async"
                  />
                )}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
