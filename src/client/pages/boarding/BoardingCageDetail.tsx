import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Weight,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../../stores/useAuthStore";
import { FooterSub } from "../../components/layouts/FooterSub";
import {
  useAvailableCages,
  useBoardingCageDetail,
  useBoardingCageReviews,
  useCreateBoardingCageReview,
} from "../../hooks/useBoarding";
import { useMyPets } from "../../hooks/usePet";

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

const STATUS_META: Record<string, { label: string; className: string }> = {
  available: { label: "Sẵn sàng", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  occupied: { label: "Đang sử dụng", className: "bg-amber-100 text-amber-700 border-amber-200" },
  maintenance: { label: "Bảo trì", className: "bg-rose-100 text-rose-700 border-rose-200" },
};

const FALLBACK_GALLERY = [
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop",
];

const WEEK_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const ROOM_CAPACITY_DEFAULT = 4;

type ReviewItem = {
  _id?: string;
  fullName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export const BoardingCageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: cage, isLoading } = useBoardingCageDetail(id);
  const { data: myPets = [] } = useMyPets(!!user);
  const { data: reviewData, isLoading: isLoadingReviews } = useBoardingCageReviews(id);
  const { mutateAsync: createReview, isPending: isSubmittingReview } = useCreateBoardingCageReview(id);

  const [selectedImage, setSelectedImage] = useState("");
  const [checkInDate, setCheckInDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [quantity, setQuantity] = useState(1);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([""]);
  const [note, setNote] = useState("");
  const [paymentMode, setPaymentMode] = useState<"full" | "deposit">("full");
  const [paymentGateway, setPaymentGateway] = useState<"zalopay" | "vnpay">("zalopay");
  const [calendarMonth, setCalendarMonth] = useState(dayjs().startOf("month"));
  const [calendarPickMode, setCalendarPickMode] = useState<"checkIn" | "checkOut">("checkIn");

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [reviewAuthor, setReviewAuthor] = useState(user?.fullName || "");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const { data: availableCages = [] } = useAvailableCages(checkInDate, checkOutDate);

  const galleryImages = useMemo(() => {
    const fromCage = [
      String((cage as any)?.avatar || ""),
      ...((Array.isArray((cage as any)?.gallery) ? (cage as any).gallery : []) as string[]),
      ...((Array.isArray((cage as any)?.images) ? (cage as any).images : []) as string[]),
    ].filter(Boolean);

    const merged = [...fromCage, ...FALLBACK_GALLERY];
    const unique = Array.from(new Set(merged));
    return unique.slice(0, 5);
  }, [cage]);

  useEffect(() => {
    if (!selectedImage && galleryImages.length > 0) {
      setSelectedImage(galleryImages[0]);
    }
  }, [galleryImages, selectedImage]);

  useEffect(() => {
    if (user?.fullName && !reviewAuthor) {
      setReviewAuthor(user.fullName);
    }
  }, [user?.fullName, reviewAuthor]);

  useEffect(() => {
    const maxRooms = Math.max(1, Math.min(ROOM_CAPACITY_DEFAULT, Number(quantity) || 1));
    const availableIds = (Array.isArray(myPets) ? myPets : []).map((pet: any) => String(pet._id));

    setSelectedPetIds((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const next = safePrev.filter((id) => availableIds.includes(String(id))).slice(0, maxRooms);

      while (next.length < maxRooms) {
        const candidate = availableIds.find((id) => !next.includes(id));
        next.push(candidate || "");
      }
      return next;
    });
  }, [myPets, quantity]);

  const statusKey = String(cage?.status || "available");
  const status = STATUS_META[statusKey] || {
    label: statusKey,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const amenities = useMemo(() => {
    if (Array.isArray(cage?.amenities) && cage.amenities.length > 0) return cage.amenities;
    return ["Nệm êm", "Khay ăn uống", "Vệ sinh định kỳ", "Camera theo dõi", "Điều hòa", "Đồ chơi cơ bản"];
  }, [cage]);

  const totalDays = useMemo(() => {
    const start = dayjs(checkInDate);
    const end = dayjs(checkOutDate);
    const diff = end.diff(start, "day");
    return diff > 0 ? diff : 0;
  }, [checkInDate, checkOutDate]);

  const monthDate = useMemo(() => calendarMonth.startOf("month"), [calendarMonth]);
  const calendarCells = useMemo(() => {
    const start = monthDate.startOf("week");
    return Array.from({ length: 35 }, (_, idx) => start.add(idx, "day"));
  }, [monthDate]);

  useEffect(() => {
    const start = dayjs(checkInDate);
    const end = dayjs(checkOutDate);
    if (!end.isAfter(start, "day")) {
      setCheckOutDate(start.add(1, "day").format("YYYY-MM-DD"));
    }
  }, [checkInDate, checkOutDate]);

  useEffect(() => {
    setCalendarMonth(dayjs(checkInDate).startOf("month"));
  }, [checkInDate]);

  const estimatedTotal = useMemo(() => {
    const price = Number(cage?.dailyPrice || 0);
    return price * Math.max(totalDays, 1) * Math.max(quantity, 1);
  }, [cage?.dailyPrice, totalDays, quantity]);

  const cageAvailability = useMemo(() => {
    const cageId = String(cage?._id || "");
    const list = Array.isArray(availableCages) ? availableCages : [];
    return list.find((item: any) => String(item?._id || "") === cageId) || null;
  }, [availableCages, cage?._id]);

  const totalRooms = Math.max(1, Number(cageAvailability?.totalRooms || ROOM_CAPACITY_DEFAULT));
  const remainingRooms = Math.max(0, Number(cageAvailability?.remainingRooms ?? totalRooms));
  const isSoldOut = Boolean(cageAvailability?.soldOut) || remainingRooms <= 0;
  const maxSelectableRooms = isSoldOut ? 0 : Math.max(1, Math.min(ROOM_CAPACITY_DEFAULT, totalRooms, remainingRooms));

  useEffect(() => {
    if (maxSelectableRooms > 0 && quantity > maxSelectableRooms) {
      setQuantity(maxSelectableRooms);
    }
  }, [maxSelectableRooms, quantity]);

  const setQuantityWithinRange = (nextValue: number) => {
    const parsed = Number(nextValue) || 1;
    if (maxSelectableRooms <= 0) {
      setQuantity(1);
      return;
    }
    const limited = Math.max(1, Math.min(maxSelectableRooms, parsed));
    setQuantity(limited);
  };

  const setPetAtIndex = (index: number, petId: string) => {
    setSelectedPetIds((prev) => {
      const targetLength = Math.max(1, quantity);
      const next = [...(prev || [])];
      while (next.length < targetLength) next.push("");
      next[index] = petId;
      return next.slice(0, targetLength);
    });
  };

  const handlePickCalendarDate = (date: dayjs.Dayjs) => {
    const today = dayjs().startOf("day");
    if (date.isBefore(today, "day")) return;

    const picked = date.format("YYYY-MM-DD");
    const currentCheckIn = dayjs(checkInDate);

    if (calendarPickMode === "checkIn") {
      setCheckInDate(picked);
      if (!dayjs(checkOutDate).isAfter(date, "day")) {
        setCheckOutDate(date.add(1, "day").format("YYYY-MM-DD"));
      }
      setCalendarPickMode("checkOut");
      return;
    }

    if (date.isAfter(currentCheckIn, "day")) {
      setCheckOutDate(picked);
      setCalendarPickMode("checkIn");
      return;
    }

    setCheckInDate(picked);
    setCheckOutDate(date.add(1, "day").format("YYYY-MM-DD"));
    setCalendarPickMode("checkOut");
  };

  const reviews = useMemo<ReviewItem[]>(
    () => (Array.isArray(reviewData?.reviews) ? reviewData.reviews : []),
    [reviewData]
  );
  const totalReviews = Number(reviewData?.total || reviews.length || 0);
  const averageRating = Number(reviewData?.averageRating || 0);

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá.");
      return;
    }
    const author = reviewAuthor.trim();
    const content = reviewContent.trim();

    if (!author) {
      toast.error("Vui lòng nhập tên người đánh giá.");
      return;
    }
    if (content.length < 10) {
      toast.error("Nội dung đánh giá tối thiểu 10 ký tự.");
      return;
    }

    try {
      await createReview({
        fullName: author,
        rating: Math.max(1, Math.min(5, reviewRating)),
        comment: content,
      });
      setReviewContent("");
      setReviewRating(5);
      toast.success("Đã gửi đánh giá.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Gửi đánh giá thất bại.");
    }
  };

  const handleBookNow = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt phòng!");
      return;
    }
    if (isSoldOut) {
      toast.error("Chuồng này đã hết phòng trong khoảng ngày bạn chọn.");
      return;
    }
    if (quantity < 1 || quantity > ROOM_CAPACITY_DEFAULT) {
      toast.error(`Số phòng phải từ 1 đến ${ROOM_CAPACITY_DEFAULT}.`);
      return;
    }
    if (quantity > remainingRooms) {
      toast.error(`Chỉ còn ${remainingRooms}/${totalRooms} phòng trong khoảng ngày đã chọn.`);
      return;
    }

    const chosenPetIds = (selectedPetIds || []).map((id) => String(id || "").trim()).filter(Boolean);
    if (chosenPetIds.length !== quantity) {
      toast.error(`Vui lòng chọn đủ ${quantity} thú cưng tương ứng ${quantity} phòng.`);
      return;
    }
    if (new Set(chosenPetIds).size !== chosenPetIds.length) {
      toast.error("Mỗi phòng phải gắn một thú cưng khác nhau.");
      return;
    }
    if (!cage?._id) {
      toast.error("Không tìm thấy thông tin chuồng.");
      return;
    }
    if (totalDays <= 0) {
      toast.error("Ngày trả phải sau ngày nhận.");
      return;
    }

    try {
      const checkoutDraft = {
        cageId: cage._id,
        cageCode: cage.cageCode || "Chuồng",
        cageType: String(cage.type || "standard").toUpperCase(),
        cageSize: SIZE_LABELS[cage.size] || cage.size,
        dailyPrice: Number(cage.dailyPrice || 0),
        avatar: String(cage.avatar || selectedImage || ""),
        checkInDate,
        checkOutDate,
        petIds: chosenPetIds,
        quantity,
        fullName,
        phone,
        email,
        notes: note,
        paymentGateway,
        paymentMode,
      };

      navigate("/hotels/checkout", {
        state: { draft: checkoutDraft },
      });
    } catch (error: any) {
      toast.error(error?.message || "Không thể chuyển sang trang checkout.");
    }
  };

  if (isLoading) {
    return <div className="app-container py-[60px] text-[14px]">Đang tải...</div>;
  }

  if (!cage) {
    return <div className="app-container py-[60px] text-[14px]">Không tìm thấy chuồng.</div>;
  }

  return (
    <>
      <div className="bg-[#fcfcfc]">
        <div className="app-container py-[28px]">
          <Link to="/hotels" className="inline-flex items-center gap-[6px] text-[13px] text-[#555] hover:text-client-secondary transition-default">
            <ChevronLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>

          <div className="mt-[10px] border-b border-[#eadfd4] pb-[14px] flex flex-row items-end justify-between md:flex-col md:items-start gap-[10px]">
            <h1 className="text-[40px] leading-[1] font-secondary text-client-secondary py-[40px]">
              {cage.cageCode || "Chuồng"} - {String(cage.type || "standard").toUpperCase()}
            </h1>
            <div className="text-[14px] text-[#6c7480]">
              Từ <span className="text-[42px] font-[800] text-client-primary">{Number(cage.dailyPrice || 0).toLocaleString()}đ</span> / đêm
            </div>
          </div>

          <div className="mt-[14px] flex flex-wrap items-center gap-x-[20px] gap-y-[8px] text-[13px] text-[#586273]">
            <span className="inline-flex items-center gap-[6px]"><CalendarDays className="w-4 h-4 text-client-primary" /> Kích thước: {SIZE_LABELS[cage.size] || cage.size}</span>
            <span className="inline-flex items-center gap-[6px]"><BedDouble className="w-4 h-4 text-client-primary" /> Loại: {String(cage.type || "standard").toUpperCase()}</span>
            <span className="inline-flex items-center gap-[6px]"><Bath className="w-4 h-4 text-client-primary" /> Tiện nghi: {amenities.length}</span>
            <span className="inline-flex items-center gap-[6px]"><Weight className="w-4 h-4 text-client-primary" /> Tối đa: {cage.maxWeightCapacity ? `${cage.maxWeightCapacity}kg` : "Chưa cập nhật"}</span>
            <span className={`inline-flex items-center px-[10px] py-[4px] rounded-full border text-[11px] font-[700] ${isSoldOut ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-sky-100 text-sky-700 border-sky-200"}`}>
              {isSoldOut ? "Sold Out" : `Còn ${remainingRooms}/${totalRooms} phòng`}
            </span>
            <span className={`inline-flex items-center px-[10px] py-[4px] rounded-full border text-[11px] font-[700] ${status.className}`}>
              <ShieldCheck className="w-3.5 h-3.5 mr-[5px]" /> {status.label}
            </span>
          </div>

          <div className="mt-[14px] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[12px]">
            <div className="rounded-[6px] overflow-hidden bg-[#f4f4f4] border border-[#f1e4d6] h-[520px]">
              <img src={selectedImage || galleryImages[0]} alt={cage.cageCode} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-[10px]">
              {galleryImages.slice(1).map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`h-[254px] rounded-[6px] overflow-hidden border ${selectedImage === img ? "border-client-primary" : "border-[#f1e4d6]"}`}
                >
                  <img src={img} alt={`gallery-${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-[24px] grid grid-cols-[1.45fr_0.78fr] xl:grid-cols-1 gap-[20px] items-start">
            <div className="space-y-[28px]">
              <section>
                <h2 className="text-[40px] font-secondary text-client-secondary mb-[8px]">Mô tả</h2>
                <p className="text-[15px] leading-[1.9] text-[#505b66]">
                  {cage.description || "Chuồng được thiết kế theo tiêu chuẩn khách sạn thú cưng: sạch, thoáng, an toàn và có khu vực nghỉ ngơi riêng. Nhân viên theo dõi và cập nhật lịch chăm sóc hằng ngày cho từng bé."}
                </p>
              </section>

              <section>
                <h2 className="text-[40px] font-secondary text-client-secondary mb-[8px]">Tiện nghi phòng</h2>
                <ul className="grid grid-cols-3 xl:grid-cols-2 md:grid-cols-1 gap-x-[14px] gap-y-[10px]">
                  {amenities.map((item: string, idx: number) => (
                    <li key={`${item}-${idx}`} className="inline-flex items-center gap-[8px] text-[14px] text-[#54606e]">
                      <Check className="w-4 h-4 text-client-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-[40px] font-secondary text-client-secondary mb-[8px]">Nội quy lưu trú</h2>
                <p className="text-[15px] leading-[1.9] text-[#505b66]">
                  Nhằm đảm bảo an toàn cho tất cả thú cưng, chuồng sẽ được vệ sinh theo ca và kiểm tra sức khỏe cơ bản trong ngày. Chủ nuôi vui lòng cung cấp thông tin ăn uống, dị ứng và lưu ý hành vi nếu có.
                </p>
                <ul className="mt-[10px] space-y-[8px] text-[14px] text-[#54606e]">
                  <li className="flex items-start gap-[8px]">
                    <span className="w-[6px] h-[6px] mt-[6px] rounded-full bg-client-primary" />
                    <span>Nhận phòng: Sau 07:00</span>
                  </li>

                  <li className="flex items-start gap-[8px]">
                    <span className="w-[6px] h-[6px] mt-[6px] rounded-full bg-client-primary" />
                    <span>Trả phòng: Trước 12:00</span>
                  </li>

                  <li className="flex items-start gap-[8px]">
                    <span className="w-[6px] h-[6px] mt-[6px] rounded-full bg-client-primary" />
                    <span>Cần cung cấp hồ sơ tiêm phòng cơ bản.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-[40px] font-secondary text-client-secondary mb-[8px]">Lịch trống</h2>
                <div className="rounded-[10px] border border-[#ebe2d8] bg-white overflow-hidden">
                  <div className="px-[14px] py-[12px] border-b border-[#f1e4d6] flex items-center justify-between">
                    <div className="inline-flex items-center gap-[8px]">
                      <button
                        type="button"
                        onClick={() => setCalendarMonth((prev) => prev.subtract(1, "month"))}
                        className="w-[32px] h-[32px] rounded-[8px] border border-[#e8dfd5] inline-flex items-center justify-center"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth((prev) => prev.add(1, "month"))}
                        className="w-[32px] h-[32px] rounded-[8px] border border-[#e8dfd5] inline-flex items-center justify-center"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const today = dayjs();
                          setCalendarMonth(today.startOf("month"));
                          setCheckInDate(today.format("YYYY-MM-DD"));
                          setCheckOutDate(today.add(1, "day").format("YYYY-MM-DD"));
                          setCalendarPickMode("checkOut");
                        }}
                        className="px-[10px] h-[32px] rounded-[8px] border border-[#e8dfd5] text-[13px]"
                      >
                        Hôm nay
                      </button>
                    </div>
                    <div className="text-[18px] font-[700] text-client-secondary">{monthDate.format("MM/YYYY")}</div>
                  </div>
                  <div className="grid grid-cols-7">
                    {WEEK_DAYS.map((day) => (
                      <div key={day} className="text-center text-[13px] font-[700] py-[10px] border-b border-r border-[#f3ece4] last:border-r-0">{day}</div>
                    ))}
                    {calendarCells.map((date, idx) => {
                      const isCurrentMonth = date.month() === monthDate.month();
                      const isToday = date.isSame(dayjs(), "day");
                      const isPast = date.isBefore(dayjs().startOf("day"), "day");
                      const isCheckIn = date.isSame(dayjs(checkInDate), "day");
                      const isCheckOut = date.isSame(dayjs(checkOutDate), "day");
                      const isInSelectedRange =
                        date.isAfter(dayjs(checkInDate), "day") && date.isBefore(dayjs(checkOutDate), "day");
                      const dayPrice = Number(cage.dailyPrice || 0) + (date.day() === 0 || date.day() === 6 ? 20000 : 0);

                      let cellBg = "bg-white";
                      if (isInSelectedRange) cellBg = "bg-[#ffeaf3]";
                      if (isToday) cellBg = "bg-[#fff5eb]";
                      if (isCheckIn || isCheckOut) cellBg = "bg-client-primary";

                      return (
                        <button
                          key={`${date.format("YYYY-MM-DD")}-${idx}`}
                          type="button"
                          disabled={isPast}
                          onClick={() => handlePickCalendarDate(date)}
                          className={`min-h-[84px] p-[8px] text-left border-r border-b border-[#f3ece4] ${idx % 7 === 6 ? "border-r-0" : ""
                            } ${cellBg} ${isPast ? "opacity-45 cursor-not-allowed" : "hover:bg-[#fff0f6]"} transition-colors`}
                        >
                          <div
                            className={`text-[14px] font-[700] ${isCheckIn || isCheckOut
                                ? "text-white"
                                : isCurrentMonth
                                  ? "text-[#495466]"
                                  : "text-[#c0c6cf]"
                              }`}
                          >
                            {date.date()}
                          </div>
                          <div
                            className={`text-[12px] mt-[12px] ${isCheckIn || isCheckOut
                                ? "text-white/90"
                                : isCurrentMonth
                                  ? "text-[#6a7480]"
                                  : "text-[#d1d6dc]"
                              }`}
                          >
                            {dayPrice.toLocaleString()}đ
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-[14px] py-[10px] text-[12px] text-[#64707d] inline-flex items-center gap-[14px]">
                    <span className="inline-flex items-center gap-[6px]"><span className="w-[14px] h-[14px] bg-[#fff5eb] border border-[#e9d5c2]" /> Hôm nay</span>
                    <span className="inline-flex items-center gap-[6px]"><span className="w-[14px] h-[14px] bg-white border border-[#e5e7eb]" /> Còn trống</span>
                    <span className="inline-flex items-center gap-[6px]"><span className="w-[14px] h-[14px] bg-[#ffeaf3] border border-[#f3c8da]" /> Khoảng đã chọn</span>
                    <span className="inline-flex items-center gap-[6px]"><span className="w-[14px] h-[14px] bg-client-primary border border-client-primary" /> Nhận/Trả phòng</span>
                  </div>
                </div>
              </section>
            </div>

            <aside className="sticky top-[110px] xl:static h-fit">
              <div className="bg-[#f8f4ef] border border-[#eadfd4] rounded-[10px] overflow-hidden">
                <div className="border-b border-[#eadfd4] px-[14px] py-[12px] bg-white">
                  <p className="text-[28px] font-secondary text-client-primary leading-[1]">Biểu mẫu đặt phòng</p>
                  <p className="text-[12px] text-[#6a7480] mt-[6px]">
                    Đặt lịch nhanh từ biểu mẫu này hoặc chọn trực tiếp trên lịch trống.
                  </p>
                </div>

                <div className="p-[14px] space-y-[12px]">
                  <div className="grid grid-cols-2 gap-[8px]">
                    <div>
                      <p className="text-[12px] font-[700] mb-[4px]">Ngày nhận phòng</p>
                      <input
                        type="date"
                        min={dayjs().format("YYYY-MM-DD")}
                        value={checkInDate}
                        onChange={(e) => {
                          setCheckInDate(e.target.value);
                          setCalendarPickMode("checkOut");
                        }}
                        className="w-full h-[42px] px-[10px] border border-[#e4d8cc] rounded-[8px] text-[13px]"
                      />
                    </div>
                    <div>
                      <p className="text-[12px] font-[700] mb-[4px]">Ngày trả phòng</p>
                      <input
                        type="date"
                        min={dayjs(checkInDate).add(1, "day").format("YYYY-MM-DD")}
                        value={checkOutDate}
                        onChange={(e) => {
                          setCheckOutDate(e.target.value);
                          setCalendarPickMode("checkIn");
                        }}
                        className="w-full h-[42px] px-[10px] border border-[#e4d8cc] rounded-[8px] text-[13px]"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] font-[700] mb-[4px]">Số phòng</p>
                    <div className="inline-flex items-center w-full h-[42px] border border-[#e4d8cc] rounded-[8px] overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantityWithinRange(quantity - 1)}
                        disabled={isSoldOut || quantity <= 1}
                        className="w-[42px] h-full border-r border-[#e4d8cc] text-[18px] font-[700] text-[#596273] hover:bg-[#f9f5f0] transition-default disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, maxSelectableRooms || ROOM_CAPACITY_DEFAULT)}
                        value={quantity}
                        onChange={(e) => setQuantityWithinRange(Number(e.target.value || 1))}
                        disabled={isSoldOut}
                        className="w-full h-full px-[10px] text-center text-[13px] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantityWithinRange(quantity + 1)}
                        disabled={isSoldOut || quantity >= Math.max(1, maxSelectableRooms)}
                        className="w-[42px] h-full border-l border-[#e4d8cc] text-[18px] font-[700] text-[#596273] hover:bg-[#f9f5f0] transition-default disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-[11px] text-[#6b7280] mt-[4px]">
                      Tối đa {ROOM_CAPACITY_DEFAULT} phòng mỗi chuồng. Hiện còn {remainingRooms}/{totalRooms} phòng.
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] font-[700] mb-[4px]">Thông tin khách hàng</p>
                    <div className="space-y-[6px]">
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ và tên" className="w-full h-[40px] px-[10px] border border-[#e4d8cc] rounded-[8px] text-[13px]" />
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" className="w-full h-[40px] px-[10px] border border-[#e4d8cc] rounded-[8px] text-[13px]" />
                      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full h-[40px] px-[10px] border border-[#e4d8cc] rounded-[8px] text-[13px]" />
                    </div>
                  </div>

                  <div>
                    <p className="text-[12px] font-[700] mb-[4px]">Thú cưng theo phòng</p>
                    {myPets.length === 0 ? (
                      <div className="w-full h-[42px] px-[10px] border border-[#e4d8cc] rounded-[8px] text-[13px] flex items-center text-[#6b7280]">
                        Chưa có thú cưng
                      </div>
                    ) : (
                      <div className="space-y-[8px]">
                        {Array.from({ length: quantity }).map((_, idx) => {
                          const currentPetId = selectedPetIds[idx] || "";
                          const usedByOtherSlots = selectedPetIds
                            .filter((_, selectedIdx) => selectedIdx !== idx)
                            .map((id) => String(id || ""))
                            .filter(Boolean);
                          return (
                            <div key={`pet-slot-${idx}`}>
                              <p className="text-[11px] text-[#6b7280] mb-[3px]">Phòng {idx + 1}</p>
                              <select
                                value={currentPetId}
                                onChange={(e) => setPetAtIndex(idx, e.target.value)}
                                className="w-full h-[42px] px-[10px] border border-[#e4d8cc] rounded-[8px] text-[13px]"
                              >
                                <option value="">Chọn thú cưng</option>
                                {myPets.map((pet: any) => {
                                  const petId = String(pet._id);
                                  const disabled = usedByOtherSlots.includes(petId);
                                  return (
                                    <option key={petId} value={petId} disabled={disabled}>
                                      {pet.name} {pet.breed ? `- ${pet.breed}` : ""}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[12px] font-[700] mb-[4px]">Ghi chú</p>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full px-[10px] py-[8px] border border-[#e4d8cc] rounded-[8px] text-[13px] resize-none" />
                  </div>

                

                  <div className="rounded-[8px] border border-[#eadfd4] bg-white px-[10px] py-[9px] text-[13px]">
                    <div className="flex items-center justify-between"><span>Dự kiến</span><span className="font-[800] text-client-primary">{estimatedTotal.toLocaleString()}đ</span></div>
                    <div className="text-[11px] text-[#6b7280] mt-[3px]">{Math.max(totalDays, 1)} đêm x {quantity} phòng</div>
                  </div>

                  <button
                    type="button"
                    onClick={handleBookNow}
                    disabled={isSoldOut}
                    className="w-full h-[50px] bg-client-primary text-white text-[24px] font-secondary hover:bg-client-secondary transition-default disabled:bg-[#d1d5db] disabled:text-[#6b7280] disabled:cursor-not-allowed"
                  >
                    {isSoldOut ? "SOLD OUT" : "ĐẶT PHÒNG"}
                  </button>
                </div>
              </div>

              <div className="mt-[14px] rounded-[8px] border border-[#eadfd4] bg-white px-[12px] py-[10px] text-[18px] font-secondary text-client-secondary">
                Bảng giá tham khảo
              </div>
            </aside>
          </div>

          <section id="reviews" className="mt-[28px]">
            <h2 className="text-[40px] font-secondary text-client-secondary mb-[8px]">Đánh giá</h2>
            <p className="text-[15px] text-[#5d6874]">
              {totalReviews > 0
                ? `${totalReviews} nhận xét • Điểm trung bình ${averageRating.toFixed(1)}/5`
                : "Chưa có đánh giá nào."}
            </p>

            <div className="mt-[12px] grid grid-cols-[1.25fr_0.95fr] xl:grid-cols-1 gap-[14px]">
              <div className="space-y-[10px]">
                {isLoadingReviews && (
                  <div className="rounded-[10px] border border-[#eadfd4] bg-white px-[12px] py-[12px] text-[14px] text-[#5d6874]">
                    Đang tải đánh giá...
                  </div>
                )}
                {!isLoadingReviews && reviews.length === 0 && (
                  <div className="rounded-[10px] border border-[#eadfd4] bg-white px-[12px] py-[12px] text-[14px] text-[#5d6874]">
                    Hãy là người đầu tiên đánh giá cho chuồng {cage.cageCode || "này"}.
                  </div>
                )}

                {reviews.map((item) => (
                  <article key={String(item._id || `${item.createdAt}-${item.fullName}`)} className="rounded-[10px] border border-[#eadfd4] bg-white px-[12px] py-[10px]">
                    <div className="flex items-center justify-between gap-[10px]">
                      <p className="text-[14px] font-[700] text-client-secondary">{item.fullName}</p>
                      <p className="text-[12px] text-[#6a7480]">{dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}</p>
                    </div>
                    <p className="text-[13px] text-[#e67e22] mt-[2px]">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</p>
                    <p className="text-[14px] text-[#505b66] mt-[6px] leading-[1.7]">{item.comment}</p>
                  </article>
                ))}
              </div>

              <div className="rounded-[10px] border border-[#eadfd4] bg-white p-[12px] h-fit">
                <p className="text-[20px] font-secondary text-client-secondary">Gửi đánh giá</p>
                <div className="space-y-[8px] mt-[8px]">
                  <input
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="Tên của bạn"
                    className="w-full h-[40px] px-[10px] border border-[#e4d8cc] rounded-[8px] text-[13px]"
                  />
                  <div>
                    <p className="text-[12px] font-[700] mb-[4px]">Số sao</p>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value || 5))}
                      className="w-full h-[40px] px-[10px] border border-[#e4d8cc] rounded-[8px] text-[13px]"
                    >
                      <option value={5}>5 sao - Rất tốt</option>
                      <option value={4}>4 sao - Tốt</option>
                      <option value={3}>3 sao - Ổn</option>
                      <option value={2}>2 sao - Chưa tốt</option>
                      <option value={1}>1 sao - Kém</option>
                    </select>
                  </div>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    className="w-full px-[10px] py-[8px] border border-[#e4d8cc] rounded-[8px] text-[13px] resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview}
                    className="w-full h-[42px] rounded-[8px] bg-client-primary text-white text-[13px] font-[700] hover:bg-client-secondary transition-default"
                  >
                    {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-[30px]">
            <h2 className="text-[50px] font-secondary text-center text-client-secondary mb-[12px]">Có thể bạn sẽ thích</h2>
            <div className="grid grid-cols-3 xl:grid-cols-2 md:grid-cols-1 gap-[14px]">
              {galleryImages.slice(0, 3).map((img, idx) => (
                <article key={`${img}-${idx}`} className="bg-white border border-[#eadfd4] rounded-[8px] overflow-hidden">
                  <img src={img} alt={`room-like-${idx}`} className="w-full h-[220px] object-cover" />
                  <div className="p-[10px]">
                    <p className="text-[30px] font-secondary text-client-secondary">{cage.cageCode || "Chuồng"} {idx + 1}</p>
                    <p className="text-[13px] text-[#606b76]">{SIZE_LABELS[cage.size] || cage.size} • {String(cage.type || "standard").toUpperCase()}</p>
                    <div className="mt-[8px] flex items-center justify-between">
                      <span className="text-[14px] text-[#5f6670]">Từ <strong className="text-client-primary">{Number(cage.dailyPrice || 0).toLocaleString()}đ</strong> / đêm</span>
                      <Link to={`/hotels/${cage._id}`} className="text-[13px] font-[700] text-client-primary hover:text-client-secondary">Đặt ngay</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
      <FooterSub />
    </>
  );
};
