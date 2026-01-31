import { FooterSub } from "../../components/layouts/FooterSub";
import { ProductBanner } from "../product/sections/ProductBanner"
import { Section1 } from "./sections/Section1";
import { Section2 } from "./sections/Section2";
import { Section3 } from "./sections/Section3";

const breadcrumbs = [
    { label: "Trang chủ", to: "/" },
    { label: "Dịch vụ", to: "/dich-vu" },
];

export const ServicePage = () => {
    return (
        <>
            <ProductBanner
                pageTitle="Cửa hàng"
                breadcrumbs={breadcrumbs}
                url="https://wordpress.themehour.net/babet/wp-content/uploads/2025/07/breadcumb-bg.jpg"
                className="banner-service"
            />
            <Section1 />
            <Section2 />
            <Section3 />
            <FooterSub />
        </>
    )
}