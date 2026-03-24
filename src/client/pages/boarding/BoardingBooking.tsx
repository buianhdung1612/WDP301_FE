import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { BedDouble, CalendarDays, Check, MapPin, PawPrint, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";
import { FooterSub } from "../../components/layouts/FooterSub";
import { useMyPets } from "../../hooks/usePet";
import { ProductBanner } from "../product/sections/ProductBanner";
import {
  useAvailableCages,
  useCreateBoardingBooking,
  usePayBoardingBooking,
} from "../../hooks/useBoarding";

const ROOM_CAPACITY_DEFAULT = 4;

const SIZE_LABELS: Record<string, string> = {
  S: "S (dưới 8kg)",
  M: "M (8-15kg)",
  L: "L (15-20kg)",
  XL_XXL: "XL/XXL (trên 20kg)",
  C: "S (dữ liệu cũ)",
  B: "M (dữ liệu cũ)",
  A: "L (dữ liệu cũ)",
  XL: "XL/XXL (dữ liệu cũ)",
};

const SIZE_OPTIONS = [
  { value: "", label: "Tất cả kích thước" },
  { value: "S", label: "Size S - 50 x 35 x 35 cm (dưới 8kg)" },
  { value: "M", label: "Size M - 63 x 43 x 53 cm (8-15kg)" },
  { value: "L", label: "Size L - 83 x 63 x 63 cm (15-20kg)" },
  { value: "XL_XXL", label: "Size XL/XXL - 105 x 85 x 100 cm (trên 20kg)" },
];

const breadcrumbs = [
  { label: "Trang chủ", to: "/" },
  { label: "Khách sạn", to: "/hotels" },
];

export const BoardingBookingPage = () => {
  const { user } = useAuthStore();
  const { data: myPets = [], isLoading: isLoadingPets } = useMyPets(!!user);
  const { mutateAsync: createBoarding } = useCreateBoardingBooking();
  const { mutateAsync: payBoarding } = usePayBoardingBooking();

  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [petCageMap, setPetCageMap] = useState<Record<string, string>>({});

  const [checkInDate, setCheckInDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [size, setSize] = useState<string>("");

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [specialCare, setSpecialCare] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "pay_at_site">("pay_at_site");
  const [paymentGateway, setPaymentGateway] = useState<"zalopay" | "vnpay">("zalopay");
  const [pendingPaymentLinks, setPendingPaymentLinks] = useState<
    { bookingId: string; petName: string; paymentUrl: string }[]
  >([]);

  const { data: cages = [], isLoading: isLoadingCages } = useAvailableCages(
    checkInDate,
    checkOutDate,
    undefined,
    size || undefined
  );
  const cagesSafe = useMemo(() => (Array.isArray(cages) ? cages : []), [cages]);

  const totalDays = useMemo(() => {
    const start = dayjs(checkInDate);
    const end = dayjs(checkOutDate);
    const diff = end.diff(start, "day");
    return diff > 0 ? diff : 0;
  }, [checkInDate, checkOutDate]);

  const cageMapById = useMemo(() => {
    const map: Record<string, any> = {};
    cagesSafe.forEach((c: any) => {
      map[c._id] = c;
    });
    return map;
  }, [cagesSafe]);

  const selectedPets = useMemo(() => {
    return myPets.filter((pet: any) => selectedPetIds.includes(pet._id));
  }, [myPets, selectedPetIds]);

  const totalPrice = useMemo(() => {
    if (!totalDays) return 0;
    return selectedPetIds.reduce((sum, petId) => {
      const cageId = petCageMap[petId];
      const cage = cageMapById[cageId];
      return sum + (cage?.dailyPrice || 0) * totalDays;
    }, 0);
  }, [selectedPetIds, petCageMap, cageMapById, totalDays]);

  const togglePet = (petId: string) => {
    setSelectedPetIds((prev) => {
      const exists = prev.includes(petId);
      if (exists) {
        setPetCageMap((old) => {
          const next = { ...old };
          delete next[petId];
          return next;
        });
        return prev.filter((id) => id !== petId);
      }
      return [...prev, petId];
    });
  };

  const setPetCage = (petId: string, cageId: string) => {
    setPetCageMap((prev) => ({ ...prev, [petId]: cageId }));
  };

  const setQuickPickCage = (cageId: string) => {
    if (!selectedPetIds.length) {
      toast.info("Hãy chọn thú cưng ở phần Đặt phòng nhanh để gán chuồng.");
      return;
    }
    setPetCage(selectedPetIds[0], cageId);
    toast.success("Đã gán chuồng cho thú cưng đầu tiên trong danh sách chọn.");
  };

  const clearFilters = () => {
    setSize("");
  };



  return (
    <>
      <ProductBanner
        pageTitle="Khách sạn thú cưng"
        breadcrumbs={breadcrumbs}
        url="https://i.pinimg.com/1200x/c1/f4/49/c1f44969b4eab486fb51b9501792fdc1.jpg"
        className="banner-hotel bg-top"
      />

      <div className="bg-[#fffdf9] pb-[30px]">
        <div className="app-container -mt-[86px] relative z-[4]">
          <div className="rounded-[14px] bg-gradient-to-r from-[#fff1f7] to-[#ffeaf3] text-client-secondary border border-[#f3c8da] shadow-[0_20px_40px_-20px_rgba(214,104,154,.45)] px-[16px] py-[16px] grid grid-cols-4 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-[10px]">
            <div className="border border-[#efc0d4] bg-white/80 rounded-[10px] px-[10px] py-[8px]">
              <p className="text-[11px] text-[#9d6d83] mb-[4px]">Check-in (Từ 09:00)</p>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={dayjs().format("YYYY-MM-DD")}
                className="w-full bg-transparent text-[13px] text-client-secondary focus:outline-none"
              />
            </div>
            <div className="border border-[#efc0d4] bg-white/80 rounded-[10px] px-[10px] py-[8px]">
              <p className="text-[11px] text-[#9d6d83] mb-[4px]">Check-out (Trước 09:00)</p>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={dayjs(checkInDate).add(1, "day").format("YYYY-MM-DD")}
                className="w-full bg-transparent text-[13px] text-client-secondary focus:outline-none"
              />
            </div>
            <div className="border border-[#efc0d4] bg-white/80 rounded-[10px] px-[10px] py-[8px]">
              <p className="text-[11px] text-[#9d6d83] mb-[4px]">Kích thước</p>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-transparent text-[13px] text-client-secondary focus:outline-none"
              >
                {SIZE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="text-black">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="rounded-[10px] border border-[#f0e4d8] bg-[#f9f5f0] text-client-secondary hover:bg-client-primary hover:border-client-primary hover:text-white transition-default text-[14px] font-[800] flex items-center justify-center gap-[8px]"
            >
              <Search className="w-4 h-4" />
              Search Now
            </button>
          </div>
        </div>

        <div className="app-container mt-[28px]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-[8px] mb-[16px] border-b border-[#eadfd4] pb-[10px]">
            <div className="text-[32px] font-secondary text-client-secondary leading-[1.1]">
              {cagesSafe.length} Rooms found
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-[14px] font-[700] text-client-primary hover:text-client-secondary"
            >
              Clear Filter
            </button>
          </div>

          {isLoadingCages && <div className="text-[13px] text-[#637381] py-[18px]">Đang tải...</div>}
          {!isLoadingCages && cagesSafe.length === 0 && (
            <div className="text-[13px] text-[#637381] py-[18px]">Không có phòng trống phù hợp.</div>
          )}

          <div className="grid grid-cols-3 xl:grid-cols-2 lg:grid-cols-1 gap-[26px]">
            {cagesSafe.map((c: any) => (
              <article
                key={c._id}
                className="group bg-white border border-[#f0e4d8] overflow-hidden rounded-[10px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_rgba(0,0,0,.38)]"
              >
                <div className="h-[290px] bg-[#f4f4f4]">
                  {c.avatar ? (
                    <img
                      src={c.avatar}
                      alt={c.cageCode}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#999] text-[12px]">Không có hình</div>
                  )}
                </div>

                <div className="p-[20px] min-h-[240px]">
                  <h3 className="text-[36px] leading-[1] font-secondary text-client-secondary mb-[8px]">
                    {c.cageCode || "Chuồng"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[6px] text-[12px] text-[#596273] mb-[8px]">
                    <span className="inline-flex items-center gap-[5px]"><BedDouble className="w-3.5 h-3.5 text-client-primary" /> {String(c.type || "standard").toUpperCase()}</span>
                    <span className="inline-flex items-center gap-[5px]"><CalendarDays className="w-3.5 h-3.5 text-client-primary" /> {SIZE_LABELS[c.size] || c.size}</span>
                    <span className="inline-flex items-center gap-[5px]">
                      <MapPin className="w-3.5 h-3.5 text-client-primary" />
                      {c.soldOut
                        ? "Sold Out"
                        : `Còn ${Math.max(0, Number(c.remainingRooms ?? ROOM_CAPACITY_DEFAULT))}/${Math.max(1, Number(c.totalRooms ?? ROOM_CAPACITY_DEFAULT))} phòng`}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#505050] leading-[1.7] line-clamp-3 min-h-[68px]">
                    {c.description || "Phòng sạch sẽ, an toàn, đầy đủ tiện nghi cơ bản."}
                  </p>

                  <div className="mt-[12px] flex items-end justify-between">
                    <div className="text-[15px] text-[#5f6570]">From <span className="text-[30px] font-[800] text-client-primary">{Number(c.dailyPrice || 0).toLocaleString()}đ</span> / đêm</div>

                  </div>
                </div>

                {c.soldOut ? (
                  <div className="block text-center border-t border-[#f0e4d8] bg-[#f6d8de] text-[#9f1239] py-[13px] text-[18px] font-secondary cursor-not-allowed">
                    Sold Out
                  </div>
                ) : (
                  <Link
                    to={`/hotels/${c._id}`}
                    className="block text-center border-t border-[#f0e4d8] bg-[#f9f5f0] hover:bg-client-primary hover:text-white transition-default py-[13px] text-[18px] font-secondary text-client-secondary"
                  >
                    Book Now
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>


      </div>

      <FooterSub />
    </>
  );
};
