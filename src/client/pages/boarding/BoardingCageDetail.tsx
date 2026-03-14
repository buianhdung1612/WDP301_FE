import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bath, BedDouble, CalendarDays, Check, ChevronLeft, ChevronRight, ImageIcon, PawPrint, ShieldCheck, Sparkles, Star, Weight } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../../stores/useAuthStore";
import { FooterSub } from "../../components/layouts/FooterSub";
import { useAvailableCages, useBoardingCageDetail, useBoardingCageReviews, useCreateBoardingCageReview } from "../../hooks/useBoarding";
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
  "https://source.unsplash.com/1600x1000/?dog-kennel",
  "https://source.unsplash.com/1600x1000/?pet-hotel-cage",
  "https://source.unsplash.com/1600x1000/?cat-room,pet",
  "https://source.unsplash.com/1600x1000/?pet-boarding",
  "https://source.unsplash.com/1600x1000/?dog-cat-hotel",
];

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='28'>Khong co hinh chuong</text></svg>";

const WEEK_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const ROOM_CAPACITY_DEFAULT = 4;
const WEEKEND_SURCHARGE = 20000;
const HOTEL_RULES = [
  "Check-in từ 14:00 và check-out trước 12:00 để nhân viên có thời gian vệ sinh chuồng.",
  "Vui lòng cập nhật tình trạng ăn uống, dị ứng và thuốc đang dùng trước ngày lưu trú.",
  "Thú cưng cần có lịch tiêm phòng cơ bản và không có dấu hiệu bệnh truyền nhiễm.",
  "Nhân viên sẽ liên hệ nếu cần điều chỉnh khẩu phần hoặc lịch vận động theo tình trạng thực tế.",
];

const renderStars = (rating: number, sizeClass = "h-[14px] w-[14px]") =>
  Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={`star-${rating}-${index}`}
      className={`${sizeClass} ${index < rating ? "fill-[#f97316] text-[#f97316]" : "text-[#d6dbe2]"}`}
    />
  ));

const getInitials = (name: string) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("") || "KH";

const formatReviewDate = (value?: string) => {
  const date = dayjs(value);
  if (!date.isValid()) return "";
  const diffDays = dayjs().startOf("day").diff(date.startOf("day"), "day");
  if (diffDays <= 0) return "Hôm nay";
  if (diffDays === 1) return "1 ngày trước";
  if (diffDays < 30) return `${diffDays} ngày trước`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} tuần trước`;
  return date.format("DD/MM/YYYY");
};

export const BoardingCageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: cage, isLoading } = useBoardingCageDetail(id);
  const { data: reviewData } = useBoardingCageReviews(id);
  const createReviewMutation = useCreateBoardingCageReview(id);
  const { data: myPets = [] } = useMyPets(!!user);

  const [selectedImage, setSelectedImage] = useState("");
  const [checkInDate, setCheckInDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [quantity, setQuantity] = useState(1);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([""]);
  const [note, setNote] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(dayjs().startOf("month"));
  const [calendarPickMode, setCalendarPickMode] = useState<"checkIn" | "checkOut">("checkIn");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [brokenImages, setBrokenImages] = useState<string[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: availableCages = [] } = useAvailableCages(checkInDate, checkOutDate);

  const markImageBroken = (src?: string) => {
    const safeSrc = String(src || "").trim();
    if (!safeSrc || safeSrc.startsWith("data:image/svg+xml")) return;
    setBrokenImages((prev) => (prev.includes(safeSrc) ? prev : [...prev, safeSrc]));
  };

  const galleryImages = useMemo(() => {
    const fromCage = [
      String((cage as any)?.avatar || ""),
      ...((Array.isArray((cage as any)?.gallery) ? (cage as any).gallery : []) as string[]),
      ...((Array.isArray((cage as any)?.images) ? (cage as any).images : []) as string[]),
    ]
      .map((item) => String(item || "").trim())
      .filter((item) => Boolean(item) && /^https?:\/\//i.test(item));
    const merged = [...fromCage, ...FALLBACK_GALLERY].filter((item) => !brokenImages.includes(item));
    const unique = Array.from(new Set(merged));
    return unique.length > 0 ? unique.slice(0, 5) : [PLACEHOLDER_IMAGE];
  }, [cage, brokenImages]);

  const amenities = useMemo(() => {
    if (Array.isArray((cage as any)?.amenities) && (cage as any).amenities.length > 0) return (cage as any).amenities;
    return ["Nệm êm ái", "Bát ăn inox", "Bát nước tự động", "Đồ chơi cơ bản"];
  }, [cage]);

  const totalDays = useMemo(() => {
    const diff = dayjs(checkOutDate).diff(dayjs(checkInDate), "day");
    return diff > 0 ? diff : 0;
  }, [checkInDate, checkOutDate]);

  const monthDate = useMemo(() => calendarMonth.startOf("month"), [calendarMonth]);
  const calendarCells = useMemo(() => {
    const start = monthDate.startOf("week");
    return Array.from({ length: 35 }, (_, idx) => start.add(idx, "day"));
  }, [monthDate]);

  const estimatedTotal = useMemo(() => Number((cage as any)?.dailyPrice || 0) * Math.max(totalDays, 1) * Math.max(quantity, 1), [cage, totalDays, quantity]);

  const cageAvailability = useMemo(() => {
    const cageId = String((cage as any)?._id || "");
    return (Array.isArray(availableCages) ? availableCages : []).find((item: any) => String(item?._id || "") === cageId) || null;
  }, [availableCages, cage]);

  const totalRooms = Math.max(1, Number(cageAvailability?.totalRooms || ROOM_CAPACITY_DEFAULT));
  const remainingRooms = Math.max(0, Number(cageAvailability?.remainingRooms ?? totalRooms));
  const isSoldOut = Boolean(cageAvailability?.soldOut) || remainingRooms <= 0;
  const maxSelectableRooms = isSoldOut ? 0 : Math.max(1, Math.min(ROOM_CAPACITY_DEFAULT, totalRooms, remainingRooms));
  const previewImages = galleryImages.length > 1 ? galleryImages.slice(1, 5) : galleryImages.slice(0, 1);
  const status = STATUS_META[String((cage as any)?.status || "available")] || { label: "Sẵn sàng", className: "bg-slate-100 text-slate-700 border-slate-200" };
  const reviewItems = Array.isArray((reviewData as any)?.reviews) ? (reviewData as any).reviews : [];
  const totalReviews = Number((reviewData as any)?.total || reviewItems.length || 0);
  const averageRating = totalReviews > 0 ? Number((reviewData as any)?.averageRating || 0) : 0;

  const reviewBreakdown = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const star = 5 - index;
        const count = reviewItems.filter((item: any) => Number(item?.rating || 0) === star).length;
        return {
          star,
          count,
          percent: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
        };
      }),
    [reviewItems, totalReviews]
  );

  const recommendedCages = useMemo(() => {
    const currentId = String((cage as any)?._id || "");
    return (Array.isArray(availableCages) ? availableCages : [])
      .filter((item: any) => String(item?._id || "") !== currentId)
      .slice(0, 2);
  }, [availableCages, cage]);

  useEffect(() => {
    if (!selectedImage && galleryImages.length > 0) setSelectedImage(galleryImages[0]);
  }, [galleryImages, selectedImage]);

  useEffect(() => {
    const maxRooms = Math.max(1, Math.min(ROOM_CAPACITY_DEFAULT, Number(quantity) || 1));
    const availableIds = (Array.isArray(myPets) ? myPets : []).map((pet: any) => String(pet._id));
    setSelectedPetIds((prev) => {
      const next = (Array.isArray(prev) ? prev : []).filter((petId) => availableIds.includes(String(petId))).slice(0, maxRooms);
      while (next.length < maxRooms) next.push(availableIds.find((petId) => !next.includes(petId)) || "");
      return next;
    });
  }, [myPets, quantity]);

  useEffect(() => {
    if (!dayjs(checkOutDate).isAfter(dayjs(checkInDate), "day")) {
      setCheckOutDate(dayjs(checkInDate).add(1, "day").format("YYYY-MM-DD"));
    }
  }, [checkInDate, checkOutDate]);

  useEffect(() => {
    setCalendarMonth(dayjs(checkInDate).startOf("month"));
  }, [checkInDate]);

  useEffect(() => {
    if (maxSelectableRooms > 0 && quantity > maxSelectableRooms) setQuantity(maxSelectableRooms);
  }, [maxSelectableRooms, quantity]);

  const setQuantityWithinRange = (nextValue: number) => {
    if (maxSelectableRooms <= 0) return setQuantity(1);
    setQuantity(Math.max(1, Math.min(maxSelectableRooms, Number(nextValue) || 1)));
  };

  const setPetAtIndex = (index: number, petId: string) => {
    setSelectedPetIds((prev) => {
      const next = [...(prev || [])];
      while (next.length < Math.max(1, quantity)) next.push("");
      next[index] = petId;
      return next.slice(0, Math.max(1, quantity));
    });
  };

  const handlePickCalendarDate = (date: dayjs.Dayjs) => {
    if (date.isBefore(dayjs().startOf("day"), "day")) return;
    const picked = date.format("YYYY-MM-DD");
    const currentCheckIn = dayjs(checkInDate);
    if (calendarPickMode === "checkIn") {
      setCheckInDate(picked);
      if (!dayjs(checkOutDate).isAfter(date, "day")) setCheckOutDate(date.add(1, "day").format("YYYY-MM-DD"));
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

  const handleBookNow = () => {
    if (!user) return void toast.error("Vui lòng đăng nhập để đặt phòng.");
    if (isSoldOut) return void toast.error("Chuồng này đã hết phòng trong khoảng ngày bạn chọn.");
    if (quantity < 1 || quantity > ROOM_CAPACITY_DEFAULT) return void toast.error(`Số phòng phải từ 1 đến ${ROOM_CAPACITY_DEFAULT}.`);
    if (quantity > remainingRooms) return void toast.error(`Chỉ còn ${remainingRooms}/${totalRooms} phòng trong khoảng ngày đã chọn.`);
    const chosenPetIds = (selectedPetIds || []).map((petId) => String(petId || "").trim()).filter(Boolean);
    if (chosenPetIds.length !== quantity) return void toast.error(`Vui lòng chọn đủ ${quantity} thú cưng tương ứng ${quantity} phòng.`);
    if (new Set(chosenPetIds).size !== chosenPetIds.length) return void toast.error("Mỗi phòng phải gắn một thú cưng khác nhau.");
    if (!(cage as any)?._id) return void toast.error("Không tìm thấy thông tin chuồng.");
    if (totalDays <= 0) return void toast.error("Ngày trả phải sau ngày nhận.");

    navigate("/hotels/checkout", {
      state: {
        draft: {
          cageId: (cage as any)._id,
          cageCode: (cage as any).cageCode || "Chuong",
          cageType: String((cage as any).type || "standard").toUpperCase(),
          cageSize: SIZE_LABELS[(cage as any).size] || (cage as any).size,
          dailyPrice: Number((cage as any).dailyPrice || 0),
          avatar: String((cage as any).avatar || selectedImage || ""),
          checkInDate,
          checkOutDate,
          petIds: chosenPetIds,
          quantity,
          fullName,
          phone,
          email,
          notes: note,
          paymentGateway: "zalopay" as const,
          paymentMode: "full" as const,
        },
      },
    });
  };

  const handleSubmitReview = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá.");
      return;
    }
    if (reviewComment.trim().length < 10) {
      toast.error("Nội dung đánh giá tối thiểu 10 ký tự.");
      return;
    }

    createReviewMutation.mutate(
      {
        fullName: fullName?.trim() || user?.fullName || "Khách hàng",
        rating: reviewRating,
        comment: reviewComment.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Đánh giá đã được ghi nhận.");
          setShowReviewForm(false);
          setReviewRating(5);
          setReviewComment("");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Gửi đánh giá thất bại.");
        },
      }
    );
  };

  if (isLoading) return <div className="app-container py-[60px] text-[14px]">Đang tải...</div>;
  if (!cage) return <div className="app-container py-[60px] text-[14px]">Không tìm thấy chuồng.</div>;

  return (
    <>
      <div className="bg-[#f7f5f3] pb-[90px]">
        <div className="app-container py-[28px]">
          <div className="flex flex-wrap items-center gap-[8px] text-[13px] text-[#7d8794]">
            <Link to="/" className="hover:text-client-secondary transition-default">Trang chủ</Link>
            <span>›</span>
            <Link to="/hotels" className="hover:text-client-secondary transition-default">Danh sách phòng</Link>
            <span>›</span>
            <span className="font-[700] text-client-secondary">{(cage as any).cageCode || "Chuong"} - {String((cage as any).type || "standard").toUpperCase()}</span>
          </div>

          <div className="mt-[18px] grid grid-cols-[minmax(0,1.3fr)_380px] gap-[24px] xl:grid-cols-1">
            <div className="space-y-[22px]">
              <section className="rounded-[28px] border border-[#eadfd4] bg-white p-[18px] shadow-[0_24px_48px_rgba(36,24,14,0.06)]">
                <div className="relative overflow-hidden rounded-[24px] border border-[#efe4db] bg-[#f4f0eb]">
                  <img src={selectedImage || galleryImages[0] || PLACEHOLDER_IMAGE} alt={(cage as any).cageCode} onError={(e) => markImageBroken((e.currentTarget as HTMLImageElement).src)} className="h-[560px] w-full object-cover lg:h-[460px] md:h-[320px]" />
                  <button type="button" onClick={() => setSelectedImage(galleryImages[0] || PLACEHOLDER_IMAGE)} className="absolute bottom-[18px] right-[18px] inline-flex items-center gap-[8px] rounded-full bg-[#1f1b16]/78 px-[16px] py-[10px] text-[13px] font-[700] text-white backdrop-blur-sm"><ImageIcon className="h-[15px] w-[15px]" />Xem tất cả {galleryImages.length} ảnh</button>
                </div>
                <div className="mt-[12px] grid grid-cols-4 gap-[10px] md:grid-cols-2">
                  {previewImages.map((img, idx) => (
                    <button key={`${img}-${idx}`} type="button" onClick={() => setSelectedImage(img)} className={`overflow-hidden rounded-[18px] border bg-[#f6f2ed] ${selectedImage === img ? "border-client-primary shadow-[0_12px_28px_rgba(237,104,34,0.16)]" : "border-[#ede1d6]"}`}>
                      <img src={img} alt={`gallery-${idx + 1}`} onError={(e) => markImageBroken((e.currentTarget as HTMLImageElement).src)} className="h-[120px] w-full object-cover md:h-[110px]" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-[#eadfd4] bg-white px-[28px] py-[26px] shadow-[0_24px_48px_rgba(36,24,14,0.05)]">
                <div className="flex flex-wrap items-center gap-[10px]">
                  <span className={`inline-flex items-center rounded-full border px-[12px] py-[6px] text-[12px] font-[800] ${isSoldOut ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>{isSoldOut ? "Hết phòng" : "Còn phòng"}</span>
                  <span className="inline-flex items-center gap-[6px] rounded-full bg-[#fff4ec] px-[12px] py-[6px] text-[12px] font-[700] text-client-primary"><CalendarDays className="h-[14px] w-[14px]" />{SIZE_LABELS[(cage as any).size] || (cage as any).size}</span>
                  <span className="inline-flex items-center gap-[6px] rounded-full bg-[#fff4ec] px-[12px] py-[6px] text-[12px] font-[700] text-client-primary"><PawPrint className="h-[14px] w-[14px]" />{String((cage as any).type || "standard").toUpperCase()}</span>
                  <span className="inline-flex items-center gap-[6px] rounded-full bg-[#fff4ec] px-[12px] py-[6px] text-[12px] font-[700] text-client-primary"><Weight className="h-[14px] w-[14px]" />Tối đa {(cage as any).maxWeightCapacity ? `${(cage as any).maxWeightCapacity}kg` : "chưa cập nhật"}</span>
                </div>

                <div className="mt-[16px] flex items-end justify-between gap-[18px] md:flex-col md:items-start">
                  <div>
                    <h1 className="text-[48px] leading-[1] font-secondary text-client-secondary md:text-[38px]">{(cage as any).cageCode || "Chuong"} - {String((cage as any).type || "standard").toUpperCase()}</h1>
                    <p className="mt-[8px] text-[15px] leading-[1.8] text-[#636f7c]">Không gian lưu trú được tối ưu cho thú cưng cần môi trường sạch, yên tĩnh và dễ thích nghi trong thời gian lưu trú.</p>
                  </div>
                  <div className="text-right md:text-left">
                    <div className="text-[14px] text-[#7a8592]">Giá theo đêm</div>
                    <div className="text-[52px] leading-[1] font-[900] tracking-[-0.04em] text-client-primary md:text-[42px]">{Number((cage as any).dailyPrice || 0).toLocaleString()}đ</div>
                    <div className="mt-[4px] text-[14px] text-[#7a8592]">/ đêm</div>
                  </div>
                </div>

                <div className="mt-[22px] grid grid-cols-[1.02fr_0.98fr] gap-[22px] lg:grid-cols-1">
                  <div>
                    <h2 className="text-[28px] font-[800] text-client-secondary">Mô tả phòng</h2>
                    <p className="mt-[12px] text-[15px] leading-[1.95] text-[#53606e]">{(cage as any).description || "Chuồng được thiết kế theo tiêu chuẩn khách sạn thú cưng: sạch, thoáng, an toàn và có khu vực nghỉ ngơi riêng. Không gian phù hợp cho các bé cần lịch sinh hoạt ổn định, nghỉ ngơi yên tĩnh và được theo dõi bởi nhân viên trong suốt thời gian lưu trú."}</p>
                    <p className="mt-[14px] text-[15px] leading-[1.95] text-[#53606e]">Chúng tôi cam kết vệ sinh phòng mỗi ngày bằng dung dịch thân thiện với thú cưng, đồng thời cập nhật tình trạng ăn uống, vận động và nghỉ ngơi theo lịch chăm sóc.</p>
                  </div>
                  <div>
                    <h2 className="text-[28px] font-[800] text-client-secondary">Tiện nghi có sẵn</h2>
                    <div className="mt-[14px] grid grid-cols-2 gap-[12px] md:grid-cols-1">
                      {amenities.map((item: string, idx: number) => (
                        <div key={`${item}-${idx}`} className="flex items-center gap-[10px] rounded-[18px] border border-[#f0e4dc] bg-[#fffaf7] px-[14px] py-[13px] text-[14px] font-[700] text-[#56616d]">
                          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[12px] bg-[#fff0e6] text-client-primary">{idx % 3 === 0 ? <BedDouble className="h-[16px] w-[16px]" /> : idx % 3 === 1 ? <Bath className="h-[16px] w-[16px]" /> : <Sparkles className="h-[16px] w-[16px]" />}</div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-[24px] rounded-[22px] border border-[#f0e4dc] bg-[#fff8f5] px-[18px] py-[18px]">
                  <div className="flex items-center gap-[10px]"><ShieldCheck className="h-[18px] w-[18px] text-client-primary" /><h3 className="text-[24px] font-[800] text-client-secondary">Quy định khách sạn</h3></div>
                  <div className="mt-[14px] grid grid-cols-2 gap-x-[24px] gap-y-[10px] md:grid-cols-1">
                    {HOTEL_RULES.map((rule) => <div key={rule} className="flex items-start gap-[10px] text-[14px] leading-[1.75] text-[#5d6874]"><Check className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[#38a169]" /><span>{rule}</span></div>)}
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#eadfd4] bg-white px-[24px] py-[24px] shadow-[0_24px_48px_rgba(36,24,14,0.05)]">
                <div className="flex items-end justify-between gap-[16px] md:flex-col md:items-start">
                  <div><p className="text-[13px] font-[800] uppercase tracking-[0.24em] text-client-primary/80">Availability</p><h2 className="mt-[8px] text-[36px] font-[800] leading-[1.08] tracking-[-0.03em] text-client-secondary md:text-[30px]">Lịch trống</h2></div>
                  <p className="max-w-[420px] text-[14px] leading-[1.7] text-[#6b7582]">Bạn có thể chọn trực tiếp ngày nhận và trả phòng trên lịch bên dưới. Phần này được giữ lại để tiện kiểm tra tình trạng trống.</p>
                </div>
                <div className="mt-[18px] overflow-hidden rounded-[24px] border border-[#ebe2d8] bg-white">
                  <div className="flex items-center justify-between border-b border-[#f1e4d6] px-[16px] py-[14px]">
                    <div className="inline-flex items-center gap-[8px]">
                      <button type="button" onClick={() => setCalendarMonth((prev) => prev.subtract(1, "month"))} className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[12px] border border-[#e8dfd5] hover:bg-[#fff5ef] transition-default"><ChevronLeft className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setCalendarMonth((prev) => prev.add(1, "month"))} className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[12px] border border-[#e8dfd5] hover:bg-[#fff5ef] transition-default"><ChevronRight className="h-4 w-4" /></button>
                      <button type="button" onClick={() => { const today = dayjs(); setCalendarMonth(today.startOf("month")); setCheckInDate(today.format("YYYY-MM-DD")); setCheckOutDate(today.add(1, "day").format("YYYY-MM-DD")); setCalendarPickMode("checkOut"); }} className="h-[38px] rounded-[12px] border border-[#e8dfd5] px-[12px] text-[13px] font-[700] text-client-secondary hover:bg-[#fff5ef] transition-default">Hôm nay</button>
                    </div>
                    <div className="text-[20px] font-[800] tracking-[-0.02em] text-client-secondary">{monthDate.format("MM/YYYY")}</div>
                  </div>
                  <div className="grid grid-cols-7">
                    {WEEK_DAYS.map((day) => <div key={day} className="border-b border-r border-[#f3ece4] py-[12px] text-center text-[13px] font-[800] text-[#5f6b78] last:border-r-0">{day}</div>)}
                    {calendarCells.map((date, idx) => {
                      const isCurrentMonth = date.month() === monthDate.month();
                      const isToday = date.isSame(dayjs(), "day");
                      const isPast = date.isBefore(dayjs().startOf("day"), "day");
                      const isCheckIn = date.isSame(dayjs(checkInDate), "day");
                      const isCheckOut = date.isSame(dayjs(checkOutDate), "day");
                      const isInSelectedRange = date.isAfter(dayjs(checkInDate), "day") && date.isBefore(dayjs(checkOutDate), "day");
                      const dayPrice = Number((cage as any).dailyPrice || 0) + (date.day() === 0 || date.day() === 6 ? WEEKEND_SURCHARGE : 0);
                      let cellBg = "bg-white";
                      if (isInSelectedRange) cellBg = "bg-[#ffeaf3]";
                      if (isToday) cellBg = "bg-[#fff5eb]";
                      if (isCheckIn || isCheckOut) cellBg = "bg-client-primary";
                      return <button key={`${date.format("YYYY-MM-DD")}-${idx}`} type="button" disabled={isPast} onClick={() => handlePickCalendarDate(date)} className={`min-h-[92px] border-b border-r border-[#f3ece4] p-[10px] text-left transition-colors ${idx % 7 === 6 ? "border-r-0" : ""} ${cellBg} ${isPast ? "cursor-not-allowed opacity-45" : "hover:bg-[#fff0f6]"}`}><div className={`text-[15px] font-[800] ${isCheckIn || isCheckOut ? "text-white" : isCurrentMonth ? "text-[#495466]" : "text-[#c0c6cf]"}`}>{date.date()}</div><div className={`mt-[14px] text-[12px] ${isCheckIn || isCheckOut ? "text-white/90" : isCurrentMonth ? "text-[#6a7480]" : "text-[#d1d6dc]"}`}>{dayPrice.toLocaleString()}đ</div></button>;
                    })}
                  </div>
                  <div className="inline-flex flex-wrap items-center gap-[14px] px-[16px] py-[12px] text-[12px] text-[#64707d]">
                    <span className="inline-flex items-center gap-[6px]"><span className="h-[14px] w-[14px] border border-[#e9d5c2] bg-[#fff5eb]" /> Hôm nay</span>
                    <span className="inline-flex items-center gap-[6px]"><span className="h-[14px] w-[14px] border border-[#e5e7eb] bg-white" /> Còn trống</span>
                    <span className="inline-flex items-center gap-[6px]"><span className="h-[14px] w-[14px] border border-[#f3c8da] bg-[#ffeaf3]" /> Khoảng đã chọn</span>
                    <span className="inline-flex items-center gap-[6px]"><span className="h-[14px] w-[14px] border border-client-primary bg-client-primary" /> Nhận/Trả phòng</span>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#eadfd4] bg-white px-[24px] py-[24px] shadow-[0_24px_48px_rgba(36,24,14,0.05)]">
                <div className="flex items-center justify-between gap-[16px] md:flex-col md:items-start">
                  <div>
                    <h2 className="text-[32px] font-[800] tracking-[-0.03em] text-client-secondary">Đánh giá khách hàng</h2>
                    <p className="mt-[6px] text-[14px] text-[#6b7582]">Tổng hợp nhận xét thực tế từ khách hàng đã từng lưu trú tại chuồng này.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm((prev) => !prev)}
                    className="rounded-full border border-[#ffd9c4] bg-[#fff6f0] px-[16px] py-[10px] text-[13px] font-[800] text-client-primary transition-default hover:bg-[#ffefe3]"
                  >
                    {showReviewForm ? "Ẩn biểu mẫu" : "Viết đánh giá"}
                  </button>
                </div>

                <div className="mt-[18px] rounded-[24px] border border-[#f1e6dc] bg-[#fffaf7] p-[20px]">
                  <div className="grid grid-cols-[170px_minmax(0,1fr)] gap-[22px] lg:grid-cols-1">
                    <div className="rounded-[20px] bg-white px-[18px] py-[16px] text-center shadow-[0_12px_24px_rgba(36,24,14,0.05)]">
                      <div className="text-[50px] font-[900] leading-[1] tracking-[-0.04em] text-client-primary">
                        {totalReviews > 0 ? averageRating.toFixed(1) : "0.0"}
                      </div>
                      <div className="mt-[8px] flex items-center justify-center gap-[4px]">
                        {renderStars(Math.round(averageRating || 0), "h-[15px] w-[15px]")}
                      </div>
                      <p className="mt-[8px] text-[12px] text-[#7a8592]">Dựa trên {totalReviews} nhận xét</p>
                    </div>

                    <div className="space-y-[10px]">
                      {reviewBreakdown.map((item) => (
                        <div key={item.star} className="grid grid-cols-[28px_minmax(0,1fr)_44px] items-center gap-[10px] text-[13px] text-[#596372]">
                          <span className="font-[700]">{item.star}</span>
                          <div className="h-[8px] overflow-hidden rounded-full bg-[#e8edf3]">
                            <div
                              className="h-full rounded-full bg-[#f97316] transition-all duration-300"
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <span className="text-right text-[#8a94a1]">{item.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {showReviewForm ? (
                  <div className="mt-[18px] rounded-[24px] border border-[#f0e4dc] bg-[#fffaf7] p-[18px]">
                    <div className="flex flex-wrap items-center justify-between gap-[12px]">
                      <div>
                        <h3 className="text-[20px] font-[800] text-client-secondary">Gửi nhận xét của bạn</h3>
                        <p className="mt-[4px] text-[13px] text-[#6b7582]">Bạn chỉ có thể đánh giá khi đã từng đặt chuồng này.</p>
                      </div>
                      <div className="flex items-center gap-[6px]">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const starValue = index + 1;
                          return (
                            <button
                              key={`review-form-star-${starValue}`}
                              type="button"
                              onClick={() => setReviewRating(starValue)}
                              className="rounded-full p-[4px]"
                            >
                              <Star
                                className={`h-[22px] w-[22px] ${starValue <= reviewRating ? "fill-[#f97316] text-[#f97316]" : "text-[#d6dbe2]"}`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      placeholder="Chia sẻ trải nghiệm của bạn về chuồng, độ sạch sẽ, sự chăm sóc của nhân viên..."
                      className="mt-[14px] w-full resize-none rounded-[18px] border border-[#eadfd4] bg-white px-[14px] py-[12px] text-[14px] leading-[1.7] text-client-secondary outline-none focus:border-client-primary"
                    />
                    <div className="mt-[14px] flex justify-end gap-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewRating(5);
                          setReviewComment("");
                        }}
                        className="rounded-full border border-[#eadfd4] px-[16px] py-[10px] text-[13px] font-[700] text-[#697483] transition-default hover:bg-white"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitReview}
                        disabled={createReviewMutation.isPending}
                        className="rounded-full bg-client-primary px-[18px] py-[10px] text-[13px] font-[800] text-white transition-default hover:bg-client-secondary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {createReviewMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-[18px] space-y-[16px]">
                  {reviewItems.length > 0 ? (
                    reviewItems.map((review: any, index: number) => (
                      <div key={String(review?._id || review?.createdAt || `review-${index}`)} className="flex gap-[14px] rounded-[22px] border border-[#efe4db] bg-white px-[18px] py-[16px]">
                        <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-[14px] font-[800] text-white">
                          {getInitials(String(review?.fullName || "Khách hàng"))}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-[8px]">
                            <div>
                              <p className="text-[15px] font-[800] text-client-secondary">{String(review?.fullName || "Khách hàng")}</p>
                              <p className="mt-[2px] text-[12px] text-[#8a94a1]">{formatReviewDate(review?.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-[3px]">{renderStars(Number(review?.rating || 0))}</div>
                          </div>
                          <p className="mt-[8px] text-[14px] leading-[1.8] text-[#55616f]">{String(review?.comment || "")}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-[#eadfd4] bg-[#fffaf7] px-[20px] py-[24px] text-center">
                      <p className="text-[16px] font-[800] text-client-secondary">Chưa có đánh giá nào</p>
                      <p className="mt-[6px] text-[14px] text-[#6b7582]">Khi có khách hàng đánh giá chuồng này, nội dung sẽ hiển thị tại đây.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-[#eadfd4] bg-white px-[24px] py-[24px] shadow-[0_24px_48px_rgba(36,24,14,0.05)]">
                <div className="flex items-center justify-between gap-[12px] md:flex-col md:items-start">
                  <div>
                    <h2 className="text-[32px] font-[800] tracking-[-0.03em] text-client-secondary">Gợi ý dành cho bạn</h2>
                    <p className="mt-[6px] text-[14px] text-[#6b7582]">Một vài lựa chọn chuồng khác đang còn trống trong cùng khoảng ngày bạn đang xem.</p>
                  </div>
                </div>

                {recommendedCages.length > 0 ? (
                  <div className="mt-[18px] grid grid-cols-2 gap-[18px] md:grid-cols-1">
                    {recommendedCages.map((item: any, index: number) => {
                      const itemImage = String(item?.avatar || item?.gallery?.[0] || FALLBACK_GALLERY[index % FALLBACK_GALLERY.length] || PLACEHOLDER_IMAGE);
                      const itemType = String(item?.type || "standard").toUpperCase();
                      return (
                        <article key={String(item?._id || index)} className="overflow-hidden rounded-[22px] border border-[#efe4db] bg-white shadow-[0_18px_40px_rgba(36,24,14,0.05)]">
                          <div className="relative">
                            <img
                              src={itemImage}
                              alt={String(item?.cageCode || "Chuồng")}
                              onError={(e) => markImageBroken((e.currentTarget as HTMLImageElement).src)}
                              className="h-[240px] w-full object-cover"
                            />
                            <span className="absolute left-[14px] top-[14px] rounded-full bg-white/92 px-[10px] py-[5px] text-[11px] font-[800] text-client-primary shadow-sm">
                              {index === 0 ? "Bán chạy" : "Cao cấp"}
                            </span>
                          </div>
                          <div className="px-[18px] py-[16px]">
                            <h3 className="text-[28px] leading-[1.05] font-secondary text-client-secondary">
                              {String(item?.cageCode || "Chuồng")} - {itemType}
                            </h3>
                            <div className="mt-[10px] flex items-center gap-[8px] text-[13px] text-[#7a8592]">
                              <span>{SIZE_LABELS[String(item?.size || "")] || String(item?.size || "Chưa cập nhật")}</span>
                              <span>•</span>
                              <span>{Math.max(0, Number(item?.remainingRooms ?? ROOM_CAPACITY_DEFAULT))}/{Math.max(1, Number(item?.totalRooms || ROOM_CAPACITY_DEFAULT))} phòng</span>
                            </div>
                            <div className="mt-[12px] text-[28px] font-[900] tracking-[-0.03em] text-client-primary">
                              {Number(item?.dailyPrice || 0).toLocaleString()}đ
                              <span className="ml-[4px] text-[14px] font-[600] text-[#7a8592]">/ đêm</span>
                            </div>
                            <Link
                              to={`/hotels/${item?._id}`}
                              className="mt-[14px] inline-flex h-[44px] w-full items-center justify-center rounded-[14px] bg-[#f3f6fa] text-[14px] font-[800] text-client-secondary transition-default hover:bg-[#e9eef5]"
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-[18px] rounded-[22px] border border-dashed border-[#eadfd4] bg-[#fffaf7] px-[20px] py-[24px] text-center">
                    <p className="text-[16px] font-[800] text-client-secondary">Chưa có chuồng gợi ý khác</p>
                    <p className="mt-[6px] text-[14px] text-[#6b7582]">Hệ thống chưa tìm thấy lựa chọn còn trống khác trong khoảng ngày bạn đang chọn.</p>
                  </div>
                )}
              </section>
            </div>

            <aside className="sticky top-[110px] h-fit space-y-[16px] xl:static">
              <div className="overflow-hidden rounded-[28px] border border-[#eadfd4] bg-white shadow-[0_24px_48px_rgba(36,24,14,0.07)]">
                <div className="border-b border-[#efe2d8] px-[20px] py-[18px]"><div className="flex items-center gap-[10px]"><CalendarDays className="h-[18px] w-[18px] text-client-primary" /><p className="text-[30px] font-secondary leading-[1] text-client-secondary">Đặt phòng ngay</p></div></div>
                <div className="space-y-[14px] p-[18px]">
                  <div className="grid grid-cols-2 gap-[10px]"><div><p className="mb-[6px] text-[11px] font-[800] uppercase tracking-[0.12em] text-[#a1a9b4]">Nhận phòng</p><input type="date" min={dayjs().format("YYYY-MM-DD")} value={checkInDate} onChange={(e) => { setCheckInDate(e.target.value); setCalendarPickMode("checkOut"); }} className="h-[48px] w-full rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] font-[700] text-client-secondary outline-none focus:border-client-primary" /></div><div><p className="mb-[6px] text-[11px] font-[800] uppercase tracking-[0.12em] text-[#a1a9b4]">Trả phòng</p><input type="date" min={dayjs(checkInDate).add(1, "day").format("YYYY-MM-DD")} value={checkOutDate} onChange={(e) => { setCheckOutDate(e.target.value); setCalendarPickMode("checkIn"); }} className="h-[48px] w-full rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] font-[700] text-client-secondary outline-none focus:border-client-primary" /></div></div>
                  <div>
                    <p className="mb-[6px] text-[11px] font-[800] uppercase tracking-[0.12em] text-[#a1a9b4]">Số lượng thú cưng</p>
                    <div className="inline-flex h-[48px] w-full items-center overflow-hidden rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8]"><button type="button" onClick={() => setQuantityWithinRange(quantity - 1)} disabled={isSoldOut || quantity <= 1} className="h-full w-[46px] border-r border-[#e7ddd3] text-[18px] font-[800] text-[#596273] transition-default hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">-</button><input type="number" min={1} max={Math.max(1, maxSelectableRooms || ROOM_CAPACITY_DEFAULT)} value={quantity} onChange={(e) => setQuantityWithinRange(Number(e.target.value || 1))} disabled={isSoldOut} className="h-full w-full bg-transparent px-[10px] text-center text-[14px] font-[700] text-client-secondary outline-none" /><button type="button" onClick={() => setQuantityWithinRange(quantity + 1)} disabled={isSoldOut || quantity >= Math.max(1, maxSelectableRooms)} className="h-full w-[46px] border-l border-[#e7ddd3] text-[18px] font-[800] text-[#596273] transition-default hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">+</button></div>
                    <p className="mt-[6px] text-[11px] text-[#7b8591]">Hiện còn {remainingRooms}/{totalRooms} phòng có thể đặt trong khoảng ngày đã chọn.</p>
                  </div>
                  <div>
                    <p className="mb-[6px] text-[11px] font-[800] uppercase tracking-[0.12em] text-[#a1a9b4]">Thông tin bé</p>
                    <div className="space-y-[8px]">{myPets.length === 0 ? <div className="flex h-[48px] items-center rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] text-[#6b7280]">Chưa có thú cưng trong tài khoản</div> : Array.from({ length: quantity }).map((_, idx) => { const currentPetId = selectedPetIds[idx] || ""; const usedByOtherSlots = selectedPetIds.filter((_, selectedIdx) => selectedIdx !== idx).map((selectedId) => String(selectedId || "")).filter(Boolean); return <select key={`pet-slot-${idx}`} value={currentPetId} onChange={(e) => setPetAtIndex(idx, e.target.value)} className="h-[48px] w-full rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] font-[700] text-client-secondary outline-none focus:border-client-primary"><option value="">Chọn thú cưng cho phòng {idx + 1}</option>{myPets.map((pet: any) => { const petId = String(pet._id); return <option key={petId} value={petId} disabled={usedByOtherSlots.includes(petId)}>{pet.name} {pet.breed ? `(${pet.breed})` : ""}</option>; })}</select>; })}</div>
                  </div>
                  <div className="rounded-[18px] border border-[#d6eee2] bg-[#edf8f1] px-[14px] py-[12px]"><p className="text-[11px] font-[800] uppercase tracking-[0.12em] text-[#4a7d62]">Thông tin người gửi</p><div className="mt-[8px] space-y-[2px]"><p className="text-[14px] font-[800] text-client-secondary">{fullName || "Chưa cập nhật"}</p><p className="text-[13px] text-[#51606d]">{phone || "Chưa cập nhật số điện thoại"}</p>{email ? <p className="text-[13px] text-[#51606d]">{email}</p> : null}</div></div>
                  <div className="space-y-[8px]"><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ và tên" className="h-[46px] w-full rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] outline-none focus:border-client-primary" /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" className="h-[46px] w-full rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] outline-none focus:border-client-primary" /><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-[46px] w-full rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] outline-none focus:border-client-primary" /><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full resize-none rounded-[16px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] py-[10px] text-[13px] outline-none focus:border-client-primary" placeholder="Lưu ý khẩu phần, tính cách, thuốc hoặc các yêu cầu đặc biệt." /></div>
                  <div className="rounded-[18px] border border-[#eee2d7] bg-[#fffaf7] px-[14px] py-[12px]"><div className="flex items-center justify-between text-[14px] text-[#596372]"><span>Phòng {(cage as any).cageCode} ({Math.max(totalDays, 1)} đêm)</span><span className="font-[800] text-client-secondary">{estimatedTotal.toLocaleString()}đ</span></div><div className="mt-[8px] flex items-center justify-between text-[14px] text-[#596372]"><span>Số lượng phòng</span><span className="font-[800] text-client-secondary">{quantity}</span></div><div className="mt-[8px] flex items-center justify-between border-t border-[#efe3d8] pt-[8px]"><span className="text-[16px] font-[800] text-client-secondary">Tổng cộng</span><span className="text-[30px] font-[900] tracking-[-0.03em] text-client-primary">{estimatedTotal.toLocaleString()}đ</span></div></div>
                  <button type="button" onClick={handleBookNow} disabled={isSoldOut} className="h-[56px] w-full rounded-[18px] bg-client-primary text-[18px] font-[800] text-white shadow-[0_18px_34px_rgba(237,104,34,0.25)] transition-default hover:bg-client-secondary disabled:cursor-not-allowed disabled:bg-[#d1d5db] disabled:text-[#6b7280]">{isSoldOut ? "HẾT PHÒNG" : "ĐẶT PHÒNG NGAY"}</button>
                </div>
              </div>
              <div className="rounded-[24px] border border-[#eadfd4] bg-white px-[18px] py-[16px] shadow-[0_20px_40px_rgba(36,24,14,0.05)]"><p className="text-[22px] font-[800] text-client-secondary">Thông tin giá</p><div className="mt-[12px] space-y-[10px] text-[14px] text-[#596372]"><div className="flex items-center justify-between"><span>Giá cơ bản / đêm</span><span className="font-[800] text-client-secondary">{Number((cage as any).dailyPrice || 0).toLocaleString()}đ</span></div><div className="flex items-center justify-between"><span>Phụ thu cuối tuần</span><span className="font-[800] text-client-secondary">+{WEEKEND_SURCHARGE.toLocaleString()}đ</span></div><div className="flex items-center justify-between"><span>Còn trống trong ngày</span><span className="font-[800] text-client-secondary">{remainingRooms}/{totalRooms}</span></div><div className="flex items-center justify-between"><span>Tải trọng tối đa</span><span className="font-[800] text-client-secondary">{(cage as any).maxWeightCapacity ? `${(cage as any).maxWeightCapacity}kg` : "Chưa cập nhật"}</span></div><div className="flex items-center justify-between"><span>Trạng thái</span><span className={`rounded-full border px-[10px] py-[4px] text-[12px] font-[800] ${status.className}`}>{status.label}</span></div></div></div>
            </aside>
          </div>
        </div>
      </div>
      <FooterSub />
    </>
  );
};

