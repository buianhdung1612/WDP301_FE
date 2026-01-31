import { ArrowRight, MapPin, Search } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "./sections/Sidebar";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAddressDetail, updateAddress } from "../../api/dashboard.api";
import { ProductBanner } from "../product/sections/ProductBanner";

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

const schema = z.object({
    fullName: z.string()
        .min(5, "Họ tên phải có ít nhất 5 ký tự!")
        .max(50, "Họ tên không được vượt quá 50 ký tự!")
        .nonempty("Vui lòng nhập họ tên!"),
    phone: z.string()
        .nonempty("Vui lòng nhập số điện thoại!")
        .regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/, "Số điện thoại không đúng định dạng!"),
    address: z.string().nonempty("Vui lòng nhập tên đường, tòa nhà, số nhà!"),
    longitude: z.number(),
    latitude: z.number(),
    isDefault: z.boolean().optional(),
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

export const AddressEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [position, setPosition] = useState<L.LatLng | null>(new L.LatLng(10.7410688, 106.7164031));
    const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([10.7410688, 106.7164031]);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);

    const isManualChange = useRef(false);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const address = watch("address");

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                const response = await getAddressDetail(id);
                if (response.success) {
                    const data = response.data;
                    reset({
                        fullName: data.fullName,
                        phone: data.phone,
                        address: data.address,
                        longitude: data.longitude,
                        latitude: data.latitude,
                        isDefault: data.isDefault
                    });
                    const newPos = new L.LatLng(data.latitude, data.longitude);
                    setPosition(newPos);
                    setMapCenter([data.latitude, data.longitude]);
                } else {
                    toast.error(response.message);
                    navigate("/dashboard/address");
                }
            } catch (error) {
                toast.error("Lỗi khi tải thông tin địa chỉ!");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, reset, navigate]);

    const fetchAddressFromCoords = async (lat: number, lon: number) => {
        setValue("latitude", lat);
        setValue("longitude", lon);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            if (data && data.display_name) {
                isManualChange.current = false;
                setValue("address", data.display_name);
                setIsNotFound(false);
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
                const newPos = new L.LatLng(lat, lon);
                setPosition(newPos);
                setValue("latitude", lat);
                setValue("longitude", lon);

                if (isFromSearch) {
                    setMapCenter([lat, lon]);
                    setValue("address", data[0].display_name);
                    setSearchKeyword("");
                    setShowSuggestions(false);
                }
                setIsNotFound(false);
            } else {
                setIsNotFound(true);
            }
        } catch (error) {
            console.error("Lỗi Geocoding:", error);
        }
    };

    useEffect(() => {
        if (!isManualChange.current) return;
        const timer = setTimeout(() => {
            if (address && address.length >= 3) {
                geocodeFromAddress(address);
                isManualChange.current = false;
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [address]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchKeyword.length > 2) {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchKeyword)}&countrycodes=vn&limit=5`);
                    const data = await res.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.log("Lỗi gợi ý tìm kiếm");
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
        const newPos = new L.LatLng(lat, lon);
        setPosition(newPos);
        setMapCenter([lat, lon]);
        setValue("latitude", lat);
        setValue("longitude", lon);
        setValue("address", suggestion.display_name);
        setSearchKeyword("");
        setShowSuggestions(false);
        setIsNotFound(false);
    };

    const onSubmit = async (data: FormData) => {
        if (!id) return;
        try {
            const response = await updateAddress(id, data);
            if (response.success) {
                toast.success(response.message);
                navigate("/dashboard/address");
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra!");
        }
    };

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: "Danh sách địa chỉ", to: "/dashboard/address" },
        { label: "Chỉnh sửa địa chỉ", to: `/dashboard/address/edit/${id}` },
    ];

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-[2rem]">Đang tải...</div>
    }

    return (
        <>
            <ProductBanner
                pageTitle="Chỉnh sửa địa chỉ"
                breadcrumbs={breadcrumbs}
                url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
                className="bg-top"
            />

            <div className="mt-[-150px] mb-[100px] w-[1600px] mx-auto flex items-stretch">
                <div className="w-[25%] px-[12px] flex">
                    <Sidebar />
                </div>
                <div className="w-[75%] px-[12px]">
                    <div className="mt-[100px] p-[35px] bg-white shadow-[0px_8px_24px_#959da533] rounded-[12px]">
                        <h3 className="text-[2.4rem] font-[600] text-client-secondary mb-[25px] flex items-center justify-between">
                            Chỉnh sửa địa chỉ
                            <Link className="relative overflow-hidden group bg-[#ffa500] rounded-[8px] px-[25px] py-[12px] font-[500] text-[1.4rem] text-white" to={"/dashboard/address"}>
                                <span className="relative z-10">Hủy</span>
                                <div className="absolute top-0 left-0 w-full h-full bg-[#cc8400] transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                            </Link>
                        </h3>
                        <div className="p-[25px] border border-[#eee] rounded-[10px]">
                            <form className="space-y-[20px]" onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-2 gap-[25px]">
                                    <div className="flex flex-col gap-[10px]">
                                        <label className="text-[1.5rem] font-[600] text-client-secondary">Họ tên người nhận</label>
                                        <input
                                            type="text"
                                            {...register("fullName")}
                                            className={`border rounded-[10px] px-[20px] py-[15px] text-[1.5rem] focus:outline-none focus:border-client-primary transition-all bg-[#fcfcfc] hover:bg-white ${errors.fullName ? "border-red-500" : "border-[#eee]"}`}
                                            placeholder="Nhập họ tên"
                                        />
                                        {errors.fullName && <span className="text-red-500 text-[1.3rem]">{errors.fullName.message}</span>}
                                    </div>
                                    <div className="flex flex-col gap-[10px]">
                                        <label className="text-[1.5rem] font-[600] text-client-secondary">Số điện thoại</label>
                                        <input
                                            type="text"
                                            {...register("phone")}
                                            className={`border rounded-[10px] px-[20px] py-[15px] text-[1.5rem] focus:outline-none focus:border-client-primary transition-all bg-[#fcfcfc] hover:bg-white ${errors.phone ? "border-red-500" : "border-[#eee]"}`}
                                            placeholder="Nhập số điện thoại"
                                        />
                                        {errors.phone && <span className="text-red-500 text-[1.3rem]">{errors.phone.message}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-[10px]">
                                    <label className="text-[1.5rem] font-[600] text-client-secondary">Địa chỉ chi tiết</label>
                                    <div className="relative group">
                                        <textarea
                                            {...register("address")}
                                            rows={2}
                                            className={`w-full border rounded-[10px] px-[20px] py-[15px] text-[1.5rem] focus:outline-none focus:border-client-primary transition-all bg-[#fcfcfc] group-hover:bg-white resize-none outline-none ${errors.address ? "border-red-500" : "border-[#eee]"}`}
                                            placeholder="Gõ địa chỉ hoặc chọn trên bản đồ..."
                                            onChange={(e) => {
                                                isManualChange.current = true;
                                                setValue("address", e.target.value);
                                                if (isNotFound) setIsNotFound(false);
                                            }}
                                        />
                                        <div className="absolute right-[12px] top-[12px]">
                                            <MapPin className="w-[1.8rem] h-[1.8rem] text-client-primary" />
                                        </div>
                                    </div>
                                    {errors.address && <span className="text-red-500 text-[1.3rem]">{errors.address.message}</span>}
                                    {isNotFound && (
                                        <p className="text-[1.3rem] text-red-500 font-[500] mt-[10px] flex items-center gap-[6px]">
                                            <span className="text-[1.6rem]">⚠️</span>
                                            Không tìm thấy vị trí này trên bản đồ. Vui lòng kiểm tra lại địa chỉ hoặc chọn trực tiếp từ bản đồ bên dưới.
                                        </p>
                                    )}
                                </div>

                                <div className="relative h-[450px] border border-[#eee] rounded-[16px] overflow-hidden shadow-inner group/map">
                                    <div className="absolute top-[20px] left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-[500px]">
                                        <div className="relative flex items-center bg-white/90 backdrop-blur-md shadow-[0px_10px_30px_rgba(0,0,0,0.1)] rounded-[8px] border border-white/50 p-[5px]">
                                            <div className="pl-[15px]">
                                                <Search className="w-[1.8rem] h-[1.8rem] text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                className="flex-1 border-none bg-transparent rounded-[8px] px-[12px] py-[10px] text-[1.4rem] focus:outline-none placeholder:text-gray-400"
                                                placeholder="Tìm kiếm địa điểm..."
                                                value={searchKeyword}
                                                onChange={(e) => setSearchKeyword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    geocodeFromAddress(searchKeyword, true);
                                                }}
                                                className="bg-client-secondary text-white px-[18px] py-[8px] rounded-[8px] text-[1.4rem] font-[500] hover:bg-client-primary transition-all active:scale-95"
                                            >
                                                Tìm kiếm
                                            </button>
                                        </div>

                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-[calc(100%+10px)] left-0 w-full bg-white/95 backdrop-blur-lg border border-[#eee] rounded-[12px] shadow-[0px_15px_35px_rgba(0,0,0,0.15)] overflow-hidden">
                                                {suggestions.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => handleSelectSuggestion(item)}
                                                        className="px-[20px] py-[15px] hover:bg-client-primary/5 cursor-pointer border-b border-[#f5f5f5] last:border-none flex items-start gap-[12px] transition-colors"
                                                    >
                                                        <MapPin className="w-[1.6rem] h-[1.6rem] text-client-secondary shrink-0 mt-[2px]" />
                                                        <div className="flex flex-col gap-[2px]">
                                                            <span className="text-[1.4rem] font-[500] text-[#333] line-clamp-1">{item.display_name.split(',')[0]}</span>
                                                            <span className="text-[1.2rem] text-gray-500 line-clamp-1">{item.display_name}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <MapContainer
                                        center={mapCenter}
                                        zoom={15}
                                        scrollWheelZoom={true}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={fetchAddressFromCoords} />
                                        <MapController center={mapCenter} />
                                    </MapContainer>

                                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_50px_rgba(0,0,0,0.02)] rounded-[16px]"></div>
                                </div>

                                <div className="checkbox mt-[10px]">
                                    <input
                                        type="checkbox"
                                        id="default_address_checkbox"
                                        hidden
                                        {...register("isDefault")}
                                    />
                                    <label htmlFor="default_address_checkbox" className="text-[1.4rem] font-[500] text-[#555] cursor-pointer select-none">
                                        Đặt làm địa chỉ mặc định
                                    </label>
                                </div>

                                <div className="flex items-center gap-[10px] pt-[10px]">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="relative overflow-hidden group bg-client-primary rounded-[8px] px-[30px] py-[12px] font-[500] text-[1.4rem] text-white cursor-pointer flex items-center gap-[8px] disabled:opacity-50"
                                    >
                                        <span className="relative z-10">{isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}</span>
                                        {!isSubmitting && <ArrowRight className="relative z-10 w-[1.8rem] h-[1.8rem] transition-transform duration-300 rotate-[-45deg] group-hover:rotate-0" />}
                                        <div className="absolute top-0 left-0 w-full h-full bg-client-secondary transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
