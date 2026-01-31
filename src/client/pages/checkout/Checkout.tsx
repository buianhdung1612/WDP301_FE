import { useEffect, useState, useRef } from "react";
import { ProductBanner } from "../product/sections/ProductBanner"
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Phone, User, Search, LogOut } from "iconoir-react";
import { useCartStore } from "../../../stores/useCartStore";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { FooterSub } from "../../components/layouts/FooterSub";
import { getAddresses } from "../../api/dashboard.api";
import { getCartDetails } from "../../api/cart.api";
import { createOrder } from "../../api/order.api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../../../stores/useAuthStore";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for leaflet default marker icon
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const breadcrumbs = [
    { label: "Trang chủ", to: "/" },
    { label: "Thanh toán", to: "/checkout" },
];

const schema = z.object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function MapController({ center }: { center: L.LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 15);
    }, [center, map]);
    return null;
}

function LocationMarker({
    position,
    setPosition,
    onLocationSelect
}: {
    position: L.LatLng | null;
    setPosition: (pos: L.LatLng) => void;
    onLocationSelect: (lat: number, lon: number) => void;
}) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [showOrderNotes, setShowOrderNotes] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    // Shipping & Payment States
    const [shippingOptions, setShippingOptions] = useState<any[]>([]);
    const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
    const [shippingFee, setShippingFee] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>("money");
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Map States for New Address
    const [newPos, setNewPos] = useState<L.LatLng | null>(new L.LatLng(10.7410688, 106.7164031));
    const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([10.7410688, 106.7164031]);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const isManualChange = useRef(false);

    const items = useCartStore((state) => state.items);
    const totalAmount = useCartStore((state) => state.totalAmount());
    const clearCart = useCartStore((state) => state.clearCart);

    const { register, handleSubmit, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            latitude: 10.7410688,
            longitude: 106.7164031
        }
    });

    const watchAddress = watch("address");
    const watchLat = watch("latitude");
    const watchLon = watch("longitude");

    // Fetch initial addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) {
                setLoadingAddresses(false);
                return;
            }
            try {
                const response = await getAddresses();
                if (response.success) {
                    setAddresses(response.data);
                    const defaultAddr = response.data.find((addr: any) => addr.isDefault);
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr._id);
                    } else if (response.data.length > 0) {
                        setSelectedAddressId(response.data[0]._id);
                    } else {
                        setSelectedAddressId("new");
                    }
                }
            } catch (error) {
                console.error("Lỗi lấy địa chỉ:", error);
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, [user]);

    // Calculate shipping fee when address or cart changes
    useEffect(() => {
        const calculateShipping = async () => {
            let lat, lon;

            if (selectedAddressId === "new") {
                lat = watchLat;
                lon = watchLon;
            } else {
                const activeAddress = addresses.find(addr => addr._id === selectedAddressId);
                if (!activeAddress) return;
                lat = activeAddress.latitude;
                lon = activeAddress.longitude;
            }

            if (!lat || !lon) return;

            setIsCalculatingShipping(true);
            try {
                const activeItems = items.filter(item => item.checked);
                if (activeItems.length === 0) {
                    setShippingOptions([]);
                    setShippingFee(0);
                    setSelectedShippingId(null);
                    setIsCalculatingShipping(false);
                    return;
                }

                // Now using getCartDetails to fetch both cart info and shipping info together
                const response = await getCartDetails(activeItems, {
                    latitude: lat,
                    longitude: lon
                });

                if (response.success) {
                    // Update shipping options if available
                    if (response.shippingOptions) {
                        setShippingOptions(response.shippingOptions);
                        if (response.shippingOptions.length > 0) {
                            setSelectedShippingId(response.shippingOptions[0].id);
                            setShippingFee(response.shippingOptions[0].total_fee);
                        } else {
                            setShippingOptions([]);
                            setShippingFee(0);
                            setSelectedShippingId(null);
                        }
                    }

                    // You could also update cart details here if needed
                    // updateCartFromAPI(response.cart);
                }
            } catch (error) {
                console.error("Lỗi tính phí ship:", error);
            } finally {
                setIsCalculatingShipping(false);
            }
        };

        calculateShipping();
    }, [selectedAddressId, addresses, items, watchLat, watchLon]);

    // Map Logic handling
    const fetchAddressFromCoords = async (lat: number, lon: number) => {
        setValue("latitude", lat);
        setValue("longitude", lon);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            if (data && data.display_name) {
                isManualChange.current = false;
                setValue("address", data.display_name);
            }
        } catch (error) {
            console.error("Lỗi reverse geocoding:", error);
        }
    };

    const geocodeFromAddress = async (query: string, isFromSearch: boolean = false) => {
        if (!query.trim() || query.length < 3) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setNewPos(new L.LatLng(lat, lon));
                setValue("latitude", lat);
                setValue("longitude", lon);
                if (isFromSearch) {
                    setMapCenter([lat, lon]);
                    setValue("address", data[0].display_name);
                    setSearchKeyword("");
                    setShowSuggestions(false);
                }
            }
        } catch (error) {
            console.error("Lỗi Geocoding:", error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchKeyword.length > 2) {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchKeyword)}&countrycodes=vn&limit=5`);
                    const data = await res.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.log(error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    const handleSelectSuggestion = (suggestion: any) => {
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);
        setNewPos(new L.LatLng(lat, lon));
        setMapCenter([lat, lon]);
        setValue("latitude", lat);
        setValue("longitude", lon);
        setValue("address", suggestion.display_name);
        setSearchKeyword("");
        setShowSuggestions(false);
    };

    const handleShippingChange = (option: any) => {
        setSelectedShippingId(option.id);
        setShippingFee(option.total_fee);
    };

    const handlePlaceOrder = async (data: FormData) => {
        if (!selectedShippingId) {
            alert("Vui lòng chọn phương thức vận chuyển!");
            return;
        }

        const activeItems = items.filter(item => item.checked).map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            variant: item.variant // [{attrId, label, value}]
        }));

        let orderData: any = {
            items: activeItems,
            paymentMethod: paymentMethod,
            shippingMethod: selectedShippingId,
            note: data.note,
            coupon: sessionStorage.getItem("couponCode") || ""
        };

        if (selectedAddressId === "new") {
            orderData = {
                ...orderData,
                fullName: data.fullName,
                phone: data.phone,
                address: data.address,
                latitude: data.latitude,
                longitude: data.longitude
            };
        } else {
            const selectedAddr = addresses.find(addr => addr._id === selectedAddressId);
            if (selectedAddr) {
                orderData = {
                    ...orderData,
                    fullName: selectedAddr.fullName,
                    phone: selectedAddr.phone,
                    address: selectedAddr.address,
                    latitude: selectedAddr.latitude,
                    longitude: selectedAddr.longitude
                };
            }
        }

        setIsPlacingOrder(true);
        try {
            const response = await createOrder(orderData);
            if (response.code === "success") {
                clearCart();
                if (paymentMethod === "zalopay") {
                    window.location.href = `http://localhost:3000/api/v1/client/order/payment-zalopay?orderCode=${response.orderCode}&phone=${response.phone}`;
                } else if (paymentMethod === "vnpay") {
                    window.location.href = `http://localhost:3000/api/v1/client/order/payment-vnpay?orderCode=${response.orderCode}&phone=${response.phone}`;
                } else {
                    navigate(`/order/success?orderCode=${response.orderCode}&phone=${response.phone}`);
                }
            } else {
                setIsPlacingOrder(false);
                alert(response.message || "Đặt hàng thất bại!");
            }
        } catch (error) {
            setIsPlacingOrder(false);
            console.error("Lỗi đặt hàng:", error);
            alert("Đã có lỗi xảy ra khi đặt hàng!");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/auth/login");
    }

    return (
        <>
            <ProductBanner
                pageTitle="Thanh toán"
                breadcrumbs={breadcrumbs}
                url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-listing.jpg"
                className="bg-top"
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active,
                textarea:-webkit-autofill,
                textarea:-webkit-autofill:hover,
                textarea:-webkit-autofill:focus,
                textarea:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 1000px white inset !important;
                    -webkit-text-fill-color: inherit !important;
                    transition: background-color 5000s ease-in-out 0s !important;
                    background-color: white !important;
                }
                
                input, textarea {
                    background-color: white !important;
                }
                
                input:focus, textarea:focus {
                    background-color: white !important;
                }
            `}} />
            {items.length > 0 ? (
                <div className="app-container flex pb-[150px] 2xl:pb-[100px] relative">
                    <div className="w-[60%] py-[50px]">
                        <form onSubmit={handleSubmit(handlePlaceOrder)}>
                            {/* Account Header */}
                            <div className="mb-[40px] p-[20px] bg-[#fcfcfc] border border-dashed border-gray-200 rounded-[15px] flex items-center justify-between">
                                <div className="flex items-center gap-[12px] text-[1.6rem] text-client-secondary font-medium">
                                    <div className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                        <User className="w-[2rem] h-[2rem] text-client-primary" />
                                    </div>
                                    <span>Tài khoản: <span className="font-bold">{user?.fullName}</span></span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="px-[15px] py-[8px] rounded-[10px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center gap-[8px] text-[1.3rem] font-bold"
                                >
                                    <LogOut className="w-[1.6rem] h-[1.6rem]" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>

                            <h2 className="text-[2.5rem] font-secondary mt-[8px] mb-[30px] font-bold">Thông tin nhận hàng</h2>

                            {/* Danh sách địa chỉ có sẵn */}
                            {user && !loadingAddresses && addresses.length > 0 && (
                                <div className="space-y-[15px] mb-[25px]">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            onClick={() => setSelectedAddressId(addr._id)}
                                            className={`relative border rounded-[20px] px-[25px] py-[18px] cursor-pointer transition-all duration-300 flex items-center gap-[20px] ${selectedAddressId === addr._id
                                                ? 'border-client-primary bg-client-primary/[0.03] ring-1 ring-client-primary/10 shadow-sm'
                                                : 'border-[#eee] hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            <div className="shrink-0 flex items-center">
                                                <input
                                                    type="radio"
                                                    checked={selectedAddressId === addr._id}
                                                    onChange={() => setSelectedAddressId(addr._id)}
                                                    className="appearance-none w-[20px] h-[20px] border-[2px] border-[#ddd] rounded-full checked:border-client-primary checked:border-[6px] transition-all cursor-pointer bg-white"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-[12px] text-[1.5rem] font-bold text-client-secondary">
                                                    <span className="line-clamp-1">{addr.fullName}</span>
                                                    {addr.isDefault && <span className="shrink-0 bg-client-primary/10 text-client-primary text-[1.1rem] px-[10px] py-[3px] rounded-full font-bold uppercase tracking-tighter">Mặc định</span>}
                                                </div>
                                                <div className="flex items-center gap-[25px] mt-[6px]">
                                                    <div className="flex items-center gap-[8px] text-[1.4rem] text-gray-500 font-medium">
                                                        <Phone className="w-[1.6rem] h-[1.6rem] text-gray-400" />
                                                        {addr.phone}
                                                    </div>
                                                    <div className="flex items-center gap-[8px] text-[1.4rem] text-gray-500 truncate flex-1">
                                                        <MapPin className="w-[1.6rem] h-[1.6rem] text-gray-400 shrink-0" />
                                                        <span className="truncate">{addr.address}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Option Sử dụng địa chỉ khác - Styled more subtly */}
                            <div
                                onClick={() => setSelectedAddressId("new")}
                                className="flex items-center gap-[12px] mb-[30px] cursor-pointer group w-fit pr-[20px]"
                            >
                                <div className="shrink-0">
                                    <input
                                        type="radio"
                                        checked={selectedAddressId === "new"}
                                        onChange={() => setSelectedAddressId("new")}
                                        className="appearance-none w-[18px] h-[18px] border-[2px] border-[#ddd] rounded-full checked:border-client-primary checked:border-[5px] transition-all cursor-pointer bg-white"
                                    />
                                </div>
                                <span className={`text-[1.5rem] font-bold tracking-wide transition-all ${selectedAddressId === "new" ? 'text-client-primary' : 'text-gray-400 group-hover:text-client-secondary'}`}>
                                    Sử dụng địa chỉ khác
                                    <div className={`h-[2px] bg-client-primary transition-all duration-300 ${selectedAddressId === "new" ? 'w-full opacity-10' : 'w-0 opacity-0'}`}></div>
                                </span>
                            </div>

                            {/* New Address Form & Map */}
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${selectedAddressId === "new" ? "max-h-[1500px] opacity-100 scale-100" : "max-h-0 opacity-0 scale-95 invisible"}`}>
                                <div className="pt-[20px] space-y-[25px] mb-[40px]">
                                    <div className="grid grid-cols-2 gap-[20px]">
                                        <input
                                            type="text"
                                            placeholder="Họ và tên người nhận *"
                                            {...register("fullName")}
                                            className="rounded-[40px] border border-[#eee] text-client-secondary py-[14px] px-[28px] w-full outline-none focus:border-client-primary transition-default bg-white hover:border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Số điện thoại *"
                                            {...register("phone")}
                                            className="rounded-[40px] border border-[#eee] text-client-secondary py-[14px] px-[28px] w-full outline-none focus:border-client-primary transition-default bg-white hover:border-gray-300"
                                        />
                                    </div>

                                    {/* Map Integration */}
                                    <div className="space-y-[15px]">
                                        <textarea
                                            placeholder="Địa chỉ chi tiết (Số nhà, tên đường...) *"
                                            {...register("address")}
                                            rows={2}
                                            className="rounded-[20px] border border-[#eee] text-client-secondary py-[14px] px-[28px] w-full outline-none focus:border-client-primary transition-default bg-white hover:border-gray-300 resize-none"
                                            onChange={(e) => {
                                                isManualChange.current = true;
                                                setValue("address", e.target.value);
                                            }}
                                            onBlur={() => {
                                                if (isManualChange.current && watchAddress) {
                                                    geocodeFromAddress(watchAddress);
                                                    isManualChange.current = false;
                                                }
                                            }}
                                        />

                                        <div className="relative h-[400px] rounded-[20px] overflow-hidden border border-[#eee] shadow-inner">
                                            {/* Search box on map */}
                                            <div className="absolute top-[20px] left-[20px] right-[20px] z-[1000] flex gap-[10px]">
                                                <div className="flex-1 relative">
                                                    <div className="absolute left-[15px] top-1/2 -translate-y-1/2">
                                                        <Search className="w-[1.8rem] h-[1.8rem] text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="w-full h-full border-none bg-white rounded-[12px] pl-[45px] pr-[15px] py-[12px] text-[1.4rem] focus:outline-none shadow-lg placeholder:text-gray-400"
                                                        placeholder="Tìm kiếm vị trí trên bản đồ..."
                                                        value={searchKeyword}
                                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                                    />
                                                    {showSuggestions && suggestions.length > 0 && (
                                                        <div className="absolute top-[calc(100%+10px)] left-0 w-full bg-white rounded-[12px] shadow-2xl overflow-hidden border border-[#eee]">
                                                            {suggestions.map((item, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    onClick={() => handleSelectSuggestion(item)}
                                                                    className="px-[20px] py-[15px] hover:bg-gray-50 cursor-pointer border-b border-[#f5f5f5] last:border-none flex items-start gap-[12px]"
                                                                >
                                                                    <MapPin className="w-[1.6rem] h-[1.6rem] text-client-primary shrink-0 mt-[2px]" />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[1.4rem] font-bold text-client-secondary line-clamp-1">{item.display_name.split(',')[0]}</span>
                                                                        <span className="text-[1.2rem] text-gray-500 line-clamp-1">{item.display_name}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <MapContainer center={mapCenter} zoom={15} style={{ height: "100%", width: "100%" }}>
                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                <MapController center={mapCenter} />
                                                <LocationMarker
                                                    position={newPos}
                                                    setPosition={setNewPos}
                                                    onLocationSelect={fetchAddressFromCoords}
                                                />
                                            </MapContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-[30px] mb-[40px] cursor-pointer">
                                <input type="checkbox" id="orderNotesCheckbox" checked={showOrderNotes} onChange={() => setShowOrderNotes(!showOrderNotes)} className="hidden" />
                                <label htmlFor="orderNotesCheckbox" className="text-client-text pl-[0px] text-[1.6rem] font-medium select-none flex items-center gap-[12px]">
                                    <div className={`w-[20px] h-[20px] border-2 rounded-[4px] flex items-center justify-center transition-all ${showOrderNotes ? 'bg-client-primary border-client-primary' : 'border-[#ddd]'}`}>
                                        {showOrderNotes && <div className="w-[10px] h-[6px] border-l-2 border-b-2 border-white -rotate-45 mb-[2px]"></div>}
                                    </div>
                                    Thêm ghi chú đơn hàng
                                </label>
                                {showOrderNotes && (
                                    <div className="mt-[20px] transition-all duration-300 ease-in-out animate-fade-in-down">
                                        <textarea
                                            placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng mong muốn..."
                                            {...register("note")}
                                            rows={3}
                                            className="rounded-[20px] border border-[#eee] text-client-secondary py-[14px] px-[28px] w-full outline-none focus:border-client-primary transition-default resize-none bg-white hover:border-gray-300"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="pt-[40px] border-t border-[#eee] flex items-center justify-between">
                                <Link to="/cart" className="flex items-center text-client-secondary font-secondary hover:text-client-primary transition-default group">
                                    <ArrowLeft className="text-[1.8rem] mr-[10px] transition-transform group-hover:-translate-x-1" />
                                    <span className="text-[1.6rem] font-secondary font-medium">Trở lại giỏ hàng</span>
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-[40%] ml-[50px] py-[50px]">
                        <div className="sticky top-[20px] bg-white rounded-[25px] border border-[#eee] overflow-hidden">
                            <h2 className="py-[20px] px-[30px] text-[2rem] font-bold text-client-secondary border-b border-[#eee]">Order summary</h2>

                            <div className="p-[35px]">
                                {/* Product List */}
                                <ul className="mb-[25px] max-h-[300px] overflow-visible pr-[10px]">
                                    {items.filter(item => item.checked).map((item, index) => (
                                        <li key={index} className="flex mb-[20px] pb-[20px] overflow-visible border-b border-[#f9f9f9] last:border-0 last:mb-0">
                                            <div className="relative shrink-0">
                                                <div className="w-[65px] h-[65px] rounded-[12px] overflow-hidden border border-[#eee] bg-gray-50">
                                                    <img src={item.detail.images[0]} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute top-0 right-0 translate-y-[-35%] translate-x-[35%] shadow-md aspect-square bg-client-primary w-[22px] rounded-full flex items-center justify-center text-white text-[1.1rem] font-bold border-2 border-white">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <div className="pl-[15px] pr-[10px] flex-1">
                                                <div className="text-[1.4rem] font-bold text-client-secondary mb-[2px] line-clamp-1">{item.detail.name}</div>
                                                <p className="text-client-primary font-bold text-[1.3rem]">{item.detail.priceNew.toLocaleString()}đ</p>
                                                {item.variant && item.variant.length > 0 && (
                                                    <div className="text-[#999] text-[1.1rem] mt-[2px] italic">
                                                        {item.variant.map(v => v.label).join(" / ")}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-client-secondary ml-auto font-bold text-[1.4rem] self-center">
                                                {(item.detail.priceNew * item.quantity).toLocaleString()}đ
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* Shipping Options */}
                                <div className="mb-[35px] pt-[25px] border-t border-[#eee]">
                                    <h3 className="text-[1.6rem] font-bold text-client-secondary mb-[18px] tracking-tight">
                                        Phương thức vận chuyển
                                    </h3>

                                    {isCalculatingShipping ? (
                                        <div className="py-[10px] italic text-gray-400 text-[1.4rem]">Đang tính phí ship...</div>
                                    ) : shippingOptions.length > 0 ? (
                                        <div className="space-y-[12px]">
                                            {shippingOptions.map((option, idx) => (
                                                <label key={idx} className="flex items-center justify-between cursor-pointer group">
                                                    <div className="flex items-center gap-[12px]">
                                                        <input
                                                            type="radio"
                                                            name="shipping"
                                                            checked={selectedShippingId === option.id}
                                                            onChange={() => handleShippingChange(option)}
                                                            className="appearance-none w-[16px] h-[16px] border-[2px] border-[#ddd] rounded-full checked:border-client-primary checked:border-[5px] bg-white transition-all cursor-pointer"
                                                        />
                                                        <span className={`text-[1.4rem] font-medium transition-colors ${selectedShippingId === option.id ? 'text-client-secondary font-bold' : 'text-gray-600'}`}>
                                                            {option.carrier_name} <span className="text-[1.2rem] opacity-60 font-normal">({option.service})</span>
                                                        </span>
                                                    </div>
                                                    <span className={`text-[1.4rem] font-bold ${selectedShippingId === option.id ? 'text-client-primary' : 'text-gray-500'}`}>
                                                        (+) {option.total_fee.toLocaleString()}đ
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[1.3rem] text-gray-400 italic">
                                            {selectedAddressId === "new" ? "Vui lòng nhập địa chỉ để xem phí ship." : "Không có phương thức vận chuyển."}
                                        </div>
                                    )}
                                </div>

                                {/* Payment Methods */}
                                <div className="mb-[35px] pt-[25px] border-t border-[#eee]">
                                    <h3 className="text-[1.6rem] font-bold text-client-secondary mb-[18px] tracking-tight">
                                        Phương thức thanh toán
                                    </h3>
                                    <div className="space-y-[12px]">
                                        {[
                                            { id: 'money', label: 'Thanh toán khi nhận hàng (COD)' },
                                            { id: 'zalopay', label: 'Ví điện tử ZaloPay' },
                                            { id: 'vnpay', label: 'Cổng thanh toán VNPAY' }
                                        ].map((method) => (
                                            <label key={method.id} className="flex items-center gap-[12px] cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    checked={paymentMethod === method.id}
                                                    onChange={() => setPaymentMethod(method.id)}
                                                    className="appearance-none w-[16px] h-[16px] border-[2px] border-[#ddd] rounded-full checked:border-client-primary checked:border-[5px] bg-white transition-all cursor-pointer"
                                                />
                                                <span className={`text-[1.4rem] font-medium transition-colors ${paymentMethod === method.id ? 'text-client-secondary font-bold' : 'text-gray-600'}`}>
                                                    {method.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-[15px] pt-[25px] border-t border-[#eee]">
                                    <div className="flex justify-between text-[#666] text-[1.4rem]">
                                        <span className="font-medium">Tạm tính</span>
                                        <span className="font-bold text-client-secondary">{totalAmount.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex justify-between text-[#666] text-[1.4rem]">
                                        <span className="font-medium">Phí vận chuyển</span>
                                        <span className={`${shippingFee === 0 ? 'text-green-600' : 'text-client-primary'} font-bold`}>
                                            {shippingFee === 0 ? "Miễn phí" : `+${shippingFee.toLocaleString()}đ`}
                                        </span>
                                    </div>
                                    <div className="pt-[20px] border-t border-[#eee] flex justify-between items-center">
                                        <span className="text-[1.6rem] font-bold text-client-secondary uppercase tracking-tight">Tổng thanh toán</span>
                                        <div className="text-[2.6rem] text-client-primary font-bold tracking-tighter leading-none">{(totalAmount + shippingFee).toLocaleString()}đ</div>
                                    </div>

                                    <button
                                        onClick={handleSubmit(handlePlaceOrder)}
                                        disabled={isPlacingOrder}
                                        className={`w-full mt-[10px] py-[16px] px-[30px] rounded-[40px] text-white font-bold transition-all text-[1.6rem] flex items-center justify-center gap-2 ${isPlacingOrder
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-client-primary hover:bg-client-secondary cursor-pointer active:scale-95'
                                            }`}
                                    >
                                        {isPlacingOrder ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                ĐANG XỬ LÝ...
                                            </>
                                        ) : (
                                            <>
                                                ĐẶT HÀNG NGAY
                                                <ArrowRight className="w-6 h-6 rotate-[-45deg]" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="app-container p-[80px] text-center pb-[150px]">
                    <div className="w-[160px] h-[160px] bg-white rounded-full flex items-center justify-center mx-auto mb-[40px] border-4 border-dashed border-gray-100 shadow-xl">
                        <ShoppingCartOutlinedIcon style={{
                            fontSize: "7rem",
                            color: "#eee"
                        }} />
                    </div>
                    <div className="text-client-secondary text-[3.2rem] font-black font-secondary mb-[20px] uppercase tracking-tighter">Giỏ hàng trống trơn!</div>
                    <p className="max-w-[600px] mx-auto mb-[50px] text-client-text text-[1.8rem] leading-relaxed opacity-60">Bạn chưa chọn được món nào ưng ý sao? Hãy cùng khám phá thêm hàng ngàn sản phẩm tuyệt vời khác từ chúng tôi nhé!</p>
                    <Link to="/shop" className="px-[60px] py-[22px] inline-flex bg-client-primary hover:bg-client-secondary transition-all text-white rounded-[9999px] font-black font-secondary text-[1.8rem] shadow-2xl shadow-client-primary/30 active:scale-95 uppercase tracking-[0.3em] italic">
                        Tiếp tục mua hàng
                    </Link>
                </div>
            )}
            <FooterSub />
        </>
    )
}