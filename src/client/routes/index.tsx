import type { RouteObject } from "react-router-dom";
import { HomePage } from "../pages/home/HomePage";
import { ProductDetailPage } from "../pages/product/ProductDetail";
import { ProductListPage } from "../pages/product/ProductList";
import { BlogListPage } from "../pages/blog/BlogList";
import { RegisterPage } from "../pages/auth/Register";
import { LoginPage } from "../pages/auth/Login";
import { ForgotPasswordPage } from "../pages/auth/ForgotPassword";
import { OTPPasswordPage } from "../pages/auth/OTPPassword";
import { ResetPasswordPage } from "../pages/auth/ResetPassword";
import { ServicePage } from "../pages/service/Service";


import { ServiceDetailPage } from "../pages/service/ServiceDetail";
import { ServiceCheckoutPage } from "../pages/service/ServiceCheckout";
import { CartPage } from "../pages/cart/Cart";
import { CheckoutPage } from "../pages/checkout/Checkout";
import { CheckSuccessPage } from "../pages/checkout/CheckoutSuccess";
import { ProfilePage } from "../pages/dashboard/Profile";
import { OverviewPage } from "../pages/dashboard/Overview";
import { ProfileEditPage } from "../pages/dashboard/ProfileEdit";
import { AddressListPage } from "../pages/dashboard/AddressList";
import { AddressCreatePage } from "../pages/dashboard/AddressCreate";
import { AddressEditPage } from "../pages/dashboard/AddressEdit";
import { WishlistPage } from "../pages/dashboard/Wishlist";
import { ChangePasswordPage } from "../pages/dashboard/ChangePassword";
import { ReviewPage } from "../pages/dashboard/Review";
import { OrderDetailPage } from "../pages/dashboard/OrderDetail";
import { OrderHistoryPage } from "../pages/dashboard/OrderHistory";
import { OrderInvoicePage } from "../pages/dashboard/OrderInvoice";
import { PetListPage } from "../pages/dashboard/PetList";
import { PetCreatePage } from "../pages/dashboard/PetCreate";
import { PetEditPage } from "../pages/dashboard/PetEdit";
import { PetCagesPage } from "../pages/dashboard/PetCages";
import { BoardingBookingPage } from "../pages/boarding/BoardingBooking";
import { BoardingCageDetailPage } from "../pages/boarding/BoardingCageDetail";
import { BoardingCheckoutPage } from "../pages/boarding/BoardingCheckout";
import { BoardingPaymentSuccessPage } from "../pages/boarding/BoardingPaymentSuccess";
import { BookingSuccessPage } from "../pages/booking/BookingSuccess";
import { BookingHistoryPage } from "../pages/dashboard/BookingHistory";
import { BookingDetailPage } from "../pages/dashboard/BookingDetail";
import { TransactionHistoryPage } from "../pages/dashboard/TransactionHistory";
import { BoardingBookingDetailPage } from "../pages/dashboard/BoardingBookingDetail";
import { AuthGuard } from "../components/guards/AuthGuard";
import { StaticPage } from "../pages/static/StaticPage";
import { FaqPage } from "../pages/static/FaqPage";
import { ContactPage } from "../pages/static/ContactPage";

export const ClientRoutes: RouteObject[] = [
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <StaticPage /> },
    { path: "/stores", element: <StaticPage /> },
    { path: "/faq", element: <FaqPage /> },
    { path: "/contact", element: <ContactPage /> },
    { path: "/policy/:type", element: <StaticPage /> },
    { path: "/product/detail/:slug", element: <ProductDetailPage /> },

    { path: "/shop", element: <ProductListPage /> },
    { path: "/blogs", element: <BlogListPage /> },
    { path: "/cart", element: <CartPage /> },
    { path: "/checkout", element: <CheckoutPage /> },
    { path: "/order/success", element: <CheckSuccessPage /> },
    { path: "/booking/success", element: <BookingSuccessPage /> },
    { path: "/services/booking/success", element: <BookingSuccessPage /> },
    { path: "/services", element: <ServicePage /> },
    { path: "/services/:slug", element: <ServiceDetailPage /> },
    { path: "/services/checkout/:id", element: <ServiceCheckoutPage /> },
    { path: "/hotels", element: <BoardingBookingPage /> },
    { path: "/hotels/checkout", element: <BoardingCheckoutPage /> },
    { path: "/hotels/success", element: <BoardingPaymentSuccessPage /> },
    { path: "/hotels/:id", element: <BoardingCageDetailPage /> },
    {
        element: <AuthGuard />,
        children: []
    },
    { path: "/auth/register", element: <RegisterPage /> },
    { path: "/auth/login", element: <LoginPage /> },
    { path: "/auth/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/auth/otp-password", element: <OTPPasswordPage /> },
    { path: "/auth/reset-password", element: <ResetPasswordPage /> },
    {
        path: "/dashboard",
        element: <AuthGuard />,
        children: [
            { path: "profile", element: <ProfilePage /> },
            { path: "overview", element: <OverviewPage /> },
            { path: "profile/edit", element: <ProfileEditPage /> },
            { path: "address", element: <AddressListPage /> },
            { path: "address/create", element: <AddressCreatePage /> },
            { path: "address/edit/:id", element: <AddressEditPage /> },
            { path: "wishlist", element: <WishlistPage /> },
            { path: "change-password", element: <ChangePasswordPage /> },
            { path: "review", element: <ReviewPage /> },
            { path: "order/invoice/:id", element: <OrderInvoicePage /> },
            { path: "order/detail/:id", element: <OrderDetailPage /> },
            { path: "orders", element: <OrderHistoryPage /> },
            { path: "bookings", element: <BookingHistoryPage /> },
            { path: "transactions", element: <TransactionHistoryPage /> },
            { path: "booking/detail/:id", element: <BookingDetailPage /> },
            { path: "boarding/detail/:id", element: <BoardingBookingDetailPage /> },
            { path: "pet", element: <PetListPage /> },
            { path: "pet/create", element: <PetCreatePage /> },
            { path: "pet/edit/:id", element: <PetEditPage /> },
            { path: "pet-cages", element: <PetCagesPage /> },
        ]
    },
];
