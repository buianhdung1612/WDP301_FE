import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bath, BedDouble, CalendarDays, Check, ChevronLeft, ChevronRight, Dumbbell, ImageIcon, Mail, PawPrint, Phone, Search, ShieldCheck, Sparkles, Star, UserRound, Utensils, Weight, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../../stores/useAuthStore";
import { getBoardingBookingList } from "../../api/dashboard.api";
import { FooterSub } from "../../components/layouts/FooterSub";
import { useAvailableCages, useBoardingCageDetail, useBoardingCageReviews, useCreateBoardingCageReview, useExerciseTemplates, useFoodTemplates } from "../../hooks/useBoarding";
import { useMyPets } from "../../hooks/usePet";

const SIZE_LABELS: Record<string, string> = {
  S: "S (dưới 8kg)",
  M: "M (8-15kg)",
  L: "L (15-20kg)",
  XL_XXL: "XL/XXL (trên 20kg)",
  C: "S",
  B: "M",
  A: "L",
  XL: "XL/XXL",
};

const STATUS_META: Record<string, { label: string; className: string }> = {
  available: { label: "Sẵn sàng", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  occupied: { label: "Đang sử dụng", className: "bg-amber-100 text-amber-700 border-amber-200" },
  maintenance: { label: "Bảo trì", className: "bg-rose-100 text-rose-700 border-rose-200" },
};

const FALLBACK_GALLERY = [
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=1200",
];

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='28' font-family='sans-serif'>Không có hình ảnh</text></svg>";

const WEEK_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const ROOM_CAPACITY_DEFAULT = 4;
const WEEKEND_SURCHARGE = 20000;
const HOTEL_RULES = [
  "Check-in từ 09:00 và check-out trước 09:00 sáng hôm sau để nhân viên có thời gian vệ sinh chuồng.",
  "Vui lòng cập nhật tình trạng ăn uống, dị ứng và thuốc đang dùng trước ngày lưu trú.",
  "Thú cưng cần có lịch tiêm phòng cơ bản và không có dấu hiệu bệnh truyền nhiễm.",
  "Nhân viên sẽ liên hệ nếu cần điều chỉnh khẩu phần hoặc lịch vận động theo tình trạng thực tế.",
];

const normalizeId = (value: any) => String(value || "").trim();

const isBookingActiveForPetConflict = (booking: any) => {
  const status = String(booking?.boardingStatus || "").trim();
  if (status === "confirmed" || status === "checked-in") return true;
  if (status === "held") {
    const holdExpiresAt = dayjs(booking?.holdExpiresAt);
    return holdExpiresAt.isValid() && holdExpiresAt.isAfter(dayjs());
  }
  return false;
};

const isBookingOverlappingRange = (booking: any, checkInDate: string, checkOutDate: string) => {
  const start = dayjs(checkInDate);
  const end = dayjs(checkOutDate);
  const bookingCheckIn = dayjs(booking?.checkInDate);
  const bookingCheckOut = dayjs(booking?.checkOutDate);
  if (!start.isValid() || !end.isValid() || !bookingCheckIn.isValid() || !bookingCheckOut.isValid()) return false;
  return bookingCheckIn.isBefore(end) && bookingCheckOut.isAfter(start);
};

const formatBookingRange = (booking: any) => {
  const start = dayjs(booking?.checkInDate);
  const end = dayjs(booking?.checkOutDate);
  if (!start.isValid() || !end.isValid()) return "trùng ngày đã chọn";
  return `${start.format("DD/MM")} - ${end.format("DD/MM")}`;
};

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
  const { data: myBoardingBookings = [] } = useQuery({
    queryKey: ["client-boarding-bookings"],
    queryFn: async () => {
      const response = await getBoardingBookingList();
      if (Array.isArray(response)) return response;
      if (Array.isArray((response as any)?.data)) return (response as any).data;
      return [];
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

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
  const [feedingOption, setFeedingOption] = useState<"standard" | "custom">("standard");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [customFeeding, setCustomFeeding] = useState<Record<string, string>>({});
  const [customExercise, setCustomExercise] = useState<Record<string, string>>({});
  const [scheduleTab, setScheduleTab] = useState<"food" | "exercise">("food");
  const [scheduleSearch, setScheduleSearch] = useState("");

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


  const conflictingPetBookings = useMemo(() => {
    const map = new Map<string, any>();
    (Array.isArray(myBoardingBookings) ? myBoardingBookings : []).forEach((booking: any) => {
      if (!isBookingActiveForPetConflict(booking)) return;
      if (!isBookingOverlappingRange(booking, checkInDate, checkOutDate)) return;
      const petIds = Array.isArray(booking?.petIds) ? booking.petIds : [];
      petIds.forEach((petId: any) => {
        const normalizedPetId = normalizeId(petId);
        if (normalizedPetId && !map.has(normalizedPetId)) map.set(normalizedPetId, booking);
      });
    });
    return map;
  }, [myBoardingBookings, checkInDate, checkOutDate]);

  const conflictingPets = useMemo(
    () => (Array.isArray(myPets) ? myPets : []).filter((pet: any) => conflictingPetBookings.has(normalizeId(pet?._id))),
    [myPets, conflictingPetBookings]
  );

  const bookedPetsByDate = useMemo(() => {
    const petNameMap = new Map<string, string>((Array.isArray(myPets) ? myPets : []).map((pet: any) => [normalizeId(pet?._id), String(pet?.name || "Thú cưng")]));
    const map = new Map<string, string[]>();

    (Array.isArray(myBoardingBookings) ? myBoardingBookings : []).forEach((booking: any) => {
      if (!isBookingActiveForPetConflict(booking)) return;
      const bookingCheckIn = dayjs(booking?.checkInDate).startOf("day");
      const bookingCheckOut = dayjs(booking?.checkOutDate).startOf("day");
      if (!bookingCheckIn.isValid() || !bookingCheckOut.isValid() || !bookingCheckOut.isAfter(bookingCheckIn, "day")) return;

      const petNames = (Array.isArray(booking?.petIds) ? booking.petIds : [])
        .map((petId: any) => petNameMap.get(normalizeId(petId)))
        .filter(Boolean) as string[];
      if (petNames.length === 0) return;

      let cursor = bookingCheckIn.clone();
      while (cursor.isBefore(bookingCheckOut, "day")) {
        const key = cursor.format("YYYY-MM-DD");
        const merged = new Set([...(map.get(key) || []), ...petNames]);
        map.set(key, Array.from(merged));
        cursor = cursor.add(1, "day");
      }
    });

    return map;
  }, [myBoardingBookings, myPets]);

  const recommendedCages = useMemo(() => {
    const currentId = String((cage as any)?._id || "");
    return (Array.isArray(availableCages) ? availableCages : [])
      .filter((item: any) => String(item?._id || "") !== currentId)
      .slice(0, 2);
  }, [availableCages, cage]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      const isMissingOrBroken = !selectedImage || !galleryImages.includes(selectedImage) || brokenImages.includes(selectedImage);
      if (isMissingOrBroken) {
        setSelectedImage(galleryImages[0]);
      }
    }
  }, [galleryImages, selectedImage, brokenImages]);

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
    setSelectedPetIds((prev) => (Array.isArray(prev) ? prev : []).map((petId) => (petId && conflictingPetBookings.has(normalizeId(petId)) ? "" : petId)));
  }, [conflictingPetBookings]);

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
    if (new Set(chosenPetIds).size !== chosenPetIds.length) return void toast.error("Mỗi phòng phải gán một thú cưng khác nhau.");
    const conflictedChosenPets = chosenPetIds
      .map((petId) => (Array.isArray(myPets) ? myPets : []).find((pet: any) => normalizeId(pet?._id) === petId))
      .filter((pet: any) => pet && conflictingPetBookings.has(normalizeId(pet?._id)));
    if (conflictedChosenPets.length > 0) {
      const names = conflictedChosenPets.map((pet: any) => pet.name).join(", ");
      return void toast.error(`${names} đã có lịch khách sạn trùng ngày. Vui lòng chọn bé khác hoặc đổi ngày.`);
    }
    if (!(cage as any)?._id) return void toast.error("Không tìm thấy thông tin chuồng.");
    if (totalDays <= 0) return void toast.error("Ngày trả phải sau ngày nhận.");

    navigate("/hotels/checkout", {
      state: {
        draft: {
          cageId: (cage as any)._id,
          cageCode: (cage as any).cageCode || "Chuồng",
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
          customFeeding,
          customExercise,
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
            <span className="text-[#a1a9b4] mx-1">/</span>
            <Link to="/hotels" className="hover:text-client-secondary transition-default">Khách sạn</Link>
            <span className="text-[#a1a9b4] mx-1">/</span>
            <span className="font-[700] text-client-secondary">{(cage as any).cageCode || "Chuồng"} - {String((cage as any).type || "STANDARD").toUpperCase()}</span>
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
                    <h1 className="text-[48px] leading-[1] font-secondary text-client-secondary md:text-[38px]">{(cage as any).cageCode || "Chuồng"} - {String((cage as any).type || "standard").toUpperCase()}</h1>
                    <p className="mt-[8px] text-[15px] leading-[1.8] text-[#636f7c]">Không gian lưu trú được tối ưu cho thú cưng cần môi trường sạch, yên tĩnh và dễ thích nghi trong thời gian lưu trú.</p>
                  </div>
                  <div className="text-right md:text-left">
                    <div className="text-[14px] text-[#7a8592]">Giá theo ngày</div>
                    <div className="text-[52px] leading-[1] font-[900] tracking-[-0.04em] text-client-primary md:text-[42px]">{Number((cage as any).dailyPrice || 0).toLocaleString()}đ</div>
                    <div className="mt-[4px] text-[14px] text-[#7a8592]">/ ngày</div>
                  </div>
                </div>

                <div className="mt-[22px] grid grid-cols-[1.02fr_0.98fr] gap-[22px] lg:grid-cols-1">
                  <div>
                    <h2 className="text-[28px] font-[800] text-client-secondary">Mô tả phòng</h2>
                    <p className="mt-[12px] text-[15px] leading-[1.95] text-[#53606e]">{(cage as any).description || "Chuồng được thiết kế theo tiêu chuẩn khách sạn thú cưng: sạch, thoáng, an toàn và có khu vực nghỉ ngơi riêng. Không gian phù hợp cho các bé cần lịch sinh hoạt ổn định, nghỉ ngơi yên tĩnh và được theo dõi bởi nhân viên trong suốt thời gian lưu trú."}</p>
                    <p className="mt-[14px] text-[15px] leading-[1.95] text-[#53606e]">Chúng tôi cam kết vệ sinh phòng mỗi ngày bằng dung dịch thân thiện với thú cưng, đồng thời cập nhật tình trạng ăn uống, vận động và nghỉ ngơi theo lịch chăm sóc.</p>
                  </div>
                  <div>
                    <h2 className="text-[28px] font-[800] text-client-secondary">Tiện nghi cơ sở</h2>
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
                  <div><p className="text-[13px] font-[800] uppercase tracking-[0.24em] text-client-primary/80">Khả dụng</p><h2 className="mt-[8px] text-[36px] font-[800] leading-[1.08] tracking-[-0.03em] text-client-secondary md:text-[30px]">Lịch trống</h2></div>
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
                      const bookedPetNames = bookedPetsByDate.get(date.format("YYYY-MM-DD")) || [];
                      const hasBookedPets = bookedPetNames.length > 0;
                      const badgeText = bookedPetNames.length === 1 ? bookedPetNames[0] : `${bookedPetNames.length} bé đã có lịch`;
                      let cellBg = "bg-white";
                      if (isInSelectedRange) cellBg = "bg-[#ffeaf3]";
                      if (isToday) cellBg = "bg-[#fff5eb]";
                      if (isCheckIn || isCheckOut) cellBg = "bg-client-primary";

                      return (
                        <button
                          key={`${date.format("YYYY-MM-DD")}-${idx}`}
                          type="button"
                          disabled={isPast}
                          title={hasBookedPets ? `Bé của bạn đã có booking ngày này: ${bookedPetNames.join(", ")}` : ""}
                          onClick={() => handlePickCalendarDate(date)}
                          className={`min-h-[104px] border-b border-r border-[#f3ece4] p-[10px] text-left transition-colors ${idx % 7 === 6 ? "border-r-0" : ""} ${cellBg} ${isPast ? "cursor-not-allowed opacity-45" : "hover:bg-[#fff0f6]"}`}
                        >
                          <div className={`text-[15px] font-[800] ${isCheckIn || isCheckOut ? "text-white" : isCurrentMonth ? "text-[#495466]" : "text-[#c0c6cf]"}`}>{date.date()}</div>
                          <div className={`mt-[14px] text-[12px] ${isCheckIn || isCheckOut ? "text-white/90" : isCurrentMonth ? "text-[#6a7480]" : "text-[#d1d6dc]"}`}>{dayPrice.toLocaleString()}đ</div>
                          {hasBookedPets ? (
                            <div className={`mt-[8px] inline-flex max-w-full items-center rounded-full px-[8px] py-[3px] text-[10px] font-[800] ${isCheckIn || isCheckOut ? "bg-white/20 text-white" : "bg-[#eef2ff] text-[#4f46e5]"}`}>
                              <span className="truncate">{badgeText}</span>
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <div className="inline-flex flex-wrap items-center gap-[14px] px-[16px] py-[12px] text-[12px] text-[#64707d]">
                    <span className="inline-flex items-center gap-[6px]"><span className="h-[14px] w-[14px] border border-[#e9d5c2] bg-[#fff5eb]" /> Hôm nay</span>
                    <span className="inline-flex items-center gap-[6px]"><span className="h-[14px] w-[14px] border border-[#e5e7eb] bg-white" /> Còn trống</span>
                    <span className="inline-flex items-center gap-[6px]"><span className="h-[14px] w-[14px] border border-[#f3c8da] bg-[#ffeaf3]" /> Khoảng trống</span>
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

                              <span>{Math.max(0, Number(item?.remainingRooms ?? ROOM_CAPACITY_DEFAULT))}/{Math.max(1, Number(item?.totalRooms || ROOM_CAPACITY_DEFAULT))} phòng</span>
                            </div>
                            <div className="mt-[12px] text-[28px] font-[900] tracking-[-0.03em] text-client-primary">
                              {Number(item?.dailyPrice || 0).toLocaleString()}đ
                              <span className="ml-[4px] text-[14px] font-[600] text-[#7a8592]">/ ngày</span>
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
                  <div className="grid grid-cols-2 gap-[10px]"><div><p className="mb-[6px] text-[11px] font-[800] uppercase tracking-[0.12em] text-[#a1a9b4]">Nhận từ 09:00</p><input type="date" min={dayjs().format("YYYY-MM-DD")} value={checkInDate} onChange={(e) => { setCheckInDate(e.target.value); setCalendarPickMode("checkOut"); }} className="h-[48px] w-full rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] font-[700] text-client-secondary outline-none focus:border-client-primary" /></div><div><p className="mb-[6px] text-[11px] font-[800] uppercase tracking-[0.12em] text-[#a1a9b4]">Trả trước 09:00</p><input type="date" min={dayjs(checkInDate).add(1, "day").format("YYYY-MM-DD")} value={checkOutDate} onChange={(e) => { setCheckOutDate(e.target.value); setCalendarPickMode("checkIn"); }} className="h-[48px] w-full rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] font-[700] text-client-secondary outline-none focus:border-client-primary" /></div></div>
                  <div>
                    <p className="mb-[6px] text-[11px] font-[800] uppercase tracking-[0.12em] text-[#a1a9b4]">Số lượng thú cưng</p>
                    <div className="inline-flex h-[48px] w-full items-center overflow-hidden rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8]"><button type="button" onClick={() => setQuantityWithinRange(quantity - 1)} disabled={isSoldOut || quantity <= 1} className="h-full w-[46px] border-r border-[#e7ddd3] text-[18px] font-[800] text-[#596273] transition-default hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">-</button><input type="number" min={1} max={Math.max(1, maxSelectableRooms || ROOM_CAPACITY_DEFAULT)} value={quantity} onChange={(e) => setQuantityWithinRange(Number(e.target.value || 1))} disabled={isSoldOut} className="h-full w-full bg-transparent px-[10px] text-center text-[14px] font-[700] text-client-secondary outline-none" /><button type="button" onClick={() => setQuantityWithinRange(quantity + 1)} disabled={isSoldOut || quantity >= Math.max(1, maxSelectableRooms)} className="h-full w-[46px] border-l border-[#e7ddd3] text-[18px] font-[800] text-[#596273] transition-default hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">+</button></div>
                    <p className="mt-[6px] text-[11px] text-[#7b8591]">Hiện còn {remainingRooms}/{totalRooms} phòng có thể đặt trong khoảng ngày đã chọn.</p>
                  </div>
                  <div className="space-y-[8px]">
                    <p className="text-[11px] font-[800] uppercase tracking-[0.12em] text-[#a1a9b4]">Lựa chọn thực đơn</p>
                    <div className="grid grid-cols-2 gap-[8px]">
                      <button
                        type="button"
                        onClick={() => setFeedingOption("standard")}
                        className={`flex flex-col items-center gap-[6px] rounded-[18px] border py-[12px] px-[8px] transition-all ${feedingOption === "standard"
                          ? "border-client-primary bg-[#fffbf9] shadow-[0_8px_20px_rgba(237,104,34,0.08)]"
                          : "border-[#e7ddd3] bg-[#fbfaf8] hover:border-client-primary/40"
                          }`}
                      >
                        <Sparkles className={`h-[20px] w-[20px] ${feedingOption === "standard" ? "text-client-primary" : "text-[#9aa3b2]"}`} />
                        <div className="text-center">
                          <p className={`text-[12px] font-[800] ${feedingOption === "standard" ? "text-client-secondary" : "text-[#51606d]"}`}>Gói dinh dưỡng</p>
                          <p className="text-[10px] text-[#8a94a1]">TeddyPet lo liệu</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedingOption("custom")}
                        className={`flex flex-col items-center gap-[6px] rounded-[18px] border py-[12px] px-[8px] transition-all ${feedingOption === "custom"
                          ? "border-client-primary bg-[#fffbf9] shadow-[0_8px_20px_rgba(237,104,34,0.08)]"
                          : "border-[#e7ddd3] bg-[#fbfaf8] hover:border-client-primary/40"
                          }`}
                      >
                        <UserRound className={`h-[20px] w-[20px] ${feedingOption === "custom" ? "text-client-primary" : "text-[#9aa3b2]"}`} />
                        <div className="text-center">
                          <p className={`text-[12px] font-[800] ${feedingOption === "custom" ? "text-client-secondary" : "text-[#51606d]"}`}>Thực đơn riêng</p>
                          <p className="text-[10px] text-[#8a94a1]">Chủ nuôi chuẩn bị</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-[6px] text-[11px] font-[800] uppercase tracking-[0.12em] text-[#a1a9b4]">Thông tin bé</p>
                    <div className="space-y-[8px]">{myPets.length === 0 ? <div className="flex h-[48px] items-center rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] text-[#6b7280]">Chưa có thú cưng trong tài khoản</div> : Array.from({ length: quantity }).map((_, idx) => { const currentPetId = selectedPetIds[idx] || ""; const usedByOtherSlots = selectedPetIds.filter((_, selectedIdx) => selectedIdx !== idx).map((selectedId) => String(selectedId || "")).filter(Boolean); return <select key={`pet-slot-${idx}`} value={currentPetId} onChange={(e) => setPetAtIndex(idx, e.target.value)} className="h-[48px] w-full rounded-[14px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] text-[13px] font-[700] text-client-secondary outline-none focus:border-client-primary"><option value="">Chọn thú cưng cho phòng {idx + 1}</option>{myPets.map((pet: any) => { const petId = String(pet._id); return <option key={petId} value={petId} disabled={usedByOtherSlots.includes(petId) || conflictingPetBookings.has(petId)}>{pet.name} {pet.breed ? `(${pet.breed})` : ""}{conflictingPetBookings.has(petId) ? ` - Đã đặt ${formatBookingRange(conflictingPetBookings.get(petId))}` : ""}</option>; })}</select>; })}</div>{conflictingPets.length > 0 ? <div className="mt-[8px] rounded-[14px] border border-[#fde1cf] bg-[#fff7f2] px-[12px] py-[10px] text-[12px] leading-[1.7] text-[#9a5a28]"><span className="font-[800]">Các bé đã có lịch khách sạn trùng ngày:</span> {conflictingPets.map((pet: any) => `${pet.name}${pet.breed ? ` (${pet.breed})` : ""} - ${formatBookingRange(conflictingPetBookings.get(normalizeId(pet?._id)))}`).join("; ")}</div> : null}</div>
                  <div className="rounded-[22px] border border-[#d6eee2] bg-[#edf8f1] p-[18px] space-y-[12px]">
                    <div className="flex items-center gap-[10px] border-b border-[#c9e4d6] pb-[10px]">
                      <UserRound className="h-[18px] w-[18px] text-[#4a7d62]" />
                      <p className="text-[14px] font-[800] uppercase tracking-[0.12em] text-[#4a7d62]">Thông tin người đặt</p>
                    </div>

                    <div className="space-y-[10px]">
                      {[
                        { icon: <UserRound className="h-[18px] w-[18px]" />, label: "Họ và tên", value: fullName, setter: setFullName, placeholder: "Nhập họ tên...", type: "text" },
                        { icon: <Phone className="h-[18px] w-[18px]" />, label: "Số điện thoại", value: phone, setter: setPhone, placeholder: "Số điện thoại...", type: "tel" },
                        { icon: <Mail className="h-[18px] w-[18px]" />, label: "Email", value: email, setter: setEmail, placeholder: "Email (không bắt buộc)...", type: "email" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-[12px] rounded-[18px] border border-[#d6eee2] bg-white p-[11px] shadow-sm transition-all focus-within:border-client-primary/50 focus-within:shadow-md">
                          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px] bg-[#edf8f1] text-[#4a7d62]">
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-[800] uppercase tracking-[0.16em] text-[#9aa3b2]/80 mb-0.5">{item.label}</p>
                            <input
                              type={item.type}
                              value={item.value}
                              onChange={(e) => item.setter(e.target.value)}
                              placeholder={item.placeholder}
                              className="w-full bg-transparent text-[14px] font-[700] text-client-secondary outline-none break-all placeholder:font-[400] placeholder:text-[#cbd5e1]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-[#efe2d8] bg-[#fffaf7] p-[16px] space-y-[12px]">
                    <div className="flex items-center justify-between border-b border-[#f1e6dc] pb-[8px]">
                      <div className="flex items-center gap-[8px]">
                        <Sparkles className="h-[16px] w-[16px] text-client-primary" />
                        <h4 className="text-[14px] font-[800] text-client-secondary uppercase tracking-wider">Chế độ chăm sóc dự kiến</h4>
                      </div>
                      {feedingOption === "standard" && (
                        <button
                          type="button"
                          onClick={() => setShowScheduleModal(true)}
                          className="text-[11px] font-[800] text-client-primary hover:underline hover:underline-offset-4"
                        >
                          Tùy chỉnh
                        </button>
                      )}
                    </div>

                    <div className="animate-in fade-in duration-500">
                      {feedingOption === "custom" ? (
                        <div className="space-y-[12px]">
                          <div className="rounded-[16px] border border-dashed border-client-primary/40 bg-white p-[14px] text-center">
                            <div className="flex justify-center mb-2">
                              <div className="h-[42px] w-[42px] rounded-full bg-[#fff4ee] text-client-primary flex items-center justify-center shadow-sm">
                                <UserRound className="h-[20px] w-[20px]" />
                              </div>
                            </div>
                            <p className="text-[13px] font-[800] text-client-secondary uppercase tracking-tight">Thực đơn & Lịch riêng</p>
                            <p className="mt-[4px] text-[12px] leading-[1.6] text-[#697384]">
                              Vui lòng chuẩn bị sẵn thức ăn và để lại hướng dẫn chi tiết trong phần <span className="text-client-primary font-[800]">Ghi chú</span> phía dưới.
                            </p>
                          </div>

                          <div className="h-px bg-[#f1e6dc] mx-2" />

                          <div>
                            <p className="text-[11px] font-[800] text-[#4f46e5] flex items-center gap-1 mb-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]"></span> LỊCH VẬN ĐỘNG (HỖ TRỢ)
                            </p>
                            <ul className="text-[12px] text-[#596372] space-y-2 pl-2">
                              {(() => {
                                const selectedPets = (selectedPetIds || [])
                                  .map(id => (myPets || []).find((p: any) => normalizeId(p._id) === id))
                                  .filter(Boolean);
                                const primaryPet = selectedPets[0];
                                let exercise = [
                                  { time: "09:00 - 10:30", content: "Vui chơi tại sân vườn" },
                                  { time: "16:30 - 17:30", content: "Tương tác nhân viên & Snack" }
                                ];
                                if (primaryPet?.type === "cat") {
                                  exercise = [
                                    { time: "10:00 - 11:30", content: "Leo trèo Cat-tree" },
                                    { time: "15:30 - 16:30", content: "Tương tác (Laser/Cần câu)" }
                                  ];
                                }
                                return exercise.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 bg-white/50 p-2 rounded-lg border border-[#f1e6dc]/40">
                                    <span className="font-[800] text-[#4f46e5] whitespace-nowrap">{item.time}:</span>
                                    <span>{item.content}</span>
                                  </li>
                                ));
                              })()}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-[12px]">
                          {(() => {
                            const selectedPets = (selectedPetIds || [])
                              .map(id => (myPets || []).find((p: any) => normalizeId(p._id) === id))
                              .filter(Boolean);
                            const primaryPet = selectedPets[0];
                            const isYoung = primaryPet?.age && primaryPet.age < 1;
                            const isSenior = primaryPet?.age && primaryPet.age > 7;

                            let feeding = [
                              { time: "07:30", label: "Sáng", content: customFeeding["Sáng"] || (isYoung ? "Hạt ngâm mềm & Canxi" : "Bữa chính dinh dưỡng") },
                              { time: "12:00", label: "Trưa", content: customFeeding["Trưa"] || "Snack & Bổ sung nước" },
                              { time: "18:00", label: "Tối", content: customFeeding["Tối"] || (isSenior ? "Cơm trộn nhẹ bụng" : "Hạt trộn thịt/Pate") }
                            ];
                            let exercise = [
                              { time: "09:00 - 10:30", content: customExercise["slot1"] || "Vận động & Vui chơi ngoài trời" },
                              { time: "16:30 - 17:30", content: customExercise["slot2"] || "Tương tác & Huấn luyện cơ bản" }
                            ];

                            if (primaryPet?.type === "cat") {
                              feeding = [
                                { time: "08:00", label: "Sáng", content: customFeeding["Sáng"] || (isYoung ? "Pate con & Sữa" : "Hạt cao cấp & Pate") },
                                { time: "13:00", label: "Trưa", content: customFeeding["Trưa"] || "Súp thưởng bổ sung nước" },
                                { time: "19:00", label: "Tối", content: customFeeding["Tối"] || (isSenior ? "Bữa nhẹ dễ tiêu" : "Hạt & Gà xé") }
                              ];
                              exercise = [
                                { time: "10:00 - 11:30", content: customExercise["slot1"] || "Leo trèo khu vực Cat-tree" },
                                { time: "15:30 - 16:30", content: customExercise["slot2"] || "Tương tác (Laser/Cần câu)" }
                              ];
                            }

                            return (
                              <>
                                <div>
                                  <p className="text-[11px] font-[800] text-client-primary flex items-center gap-1 mb-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-client-primary"></span> LỊCH ĂN UỐNG {primaryPet ? `(${primaryPet.name})` : ""}
                                  </p>
                                  <ul className="text-[12px] text-[#596372] space-y-2 pl-2">
                                    {feeding.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2 bg-white/50 p-2 rounded-lg border border-[#f1e6dc]/40">
                                        <span className="font-[800] text-client-primary whitespace-nowrap">{item.label} ({item.time}):</span>
                                        <span>{item.content}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-[11px] font-[800] text-[#4f46e5] flex items-center gap-1 mb-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]"></span> LỊCH VẬN ĐỘNG
                                  </p>
                                  <ul className="text-[12px] text-[#596372] space-y-2 pl-2">
                                    {exercise.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2 bg-white/50 p-2 rounded-lg border border-[#f1e6dc]/40">
                                        <span className="font-[800] text-[#4f46e5] whitespace-nowrap">{item.time}:</span>
                                        <span>{item.content}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  {primaryPet && (
                                    <p className="mt-[12px] text-[10px] italic text-[#9aa3b2] text-center border-t border-[#efe3d8] pt-2">
                                      * {Object.keys(customFeeding).length > 0 || Object.keys(customExercise).length > 0 ? "Lịch trình đã được tùy chỉnh." : `Lịch trình tự động cho ${primaryPet?.type === "cat" ? "mèo" : "chó"} ${isYoung ? "nhỏ" : isSenior ? "lớn tuổi" : "trưởng thành"}.`}
                                    </p>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule Customization Modal */}
                  {showScheduleModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-300">
                      <div className="w-full max-w-[550px] overflow-hidden rounded-[32px] border border-[#eadfd4] bg-white shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="relative border-b border-[#f1e6dc] bg-[#fffaf7] px-[24px] py-[20px]">
                          <div className="flex items-center gap-[12px]">
                            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-client-primary/10 text-client-primary">
                              <Sparkles className="h-[20px] w-[20px]" />
                            </div>
                            <div>
                              <h3 className="text-[20px] font-[800] text-client-secondary">Tùy chỉnh lịch trình</h3>
                              <p className="text-[12px] text-[#6b7582]">Cá nhân hóa bữa ăn và vận động cho bé</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowScheduleModal(false)}
                            className="absolute right-[20px] top-[24px] rounded-full p-2 text-[#a1a9b4] hover:bg-black/5 hover:text-client-secondary transition-default"
                          >
                            <X className="h-[20px] w-[20px]" />
                          </button>
                        </div>

                        <div className="flex border-b border-[#f1e6dc]">
                          <button
                            type="button"
                            onClick={() => setScheduleTab("food")}
                            className={`flex flex-1 items-center justify-center gap-2 py-[14px] text-[13px] font-[800] transition-all ${scheduleTab === "food" ? "border-b-2 border-client-primary bg-white text-client-primary" : "text-[#7b8591] hover:bg-[#fffcfb]"}`}
                          >
                            <Utensils className="h-[16px] w-[16px]" />
                            DINH DƯỠNG
                          </button>
                          <button
                            type="button"
                            onClick={() => setScheduleTab("exercise")}
                            className={`flex flex-1 items-center justify-center gap-2 py-[14px] text-[13px] font-[800] transition-all ${scheduleTab === "exercise" ? "border-b-2 border-client-primary bg-white text-client-primary" : "text-[#7b8591] hover:bg-[#fffcfb]"}`}
                          >
                            <Dumbbell className="h-[16px] w-[16px]" />
                            VẬN ĐỘNG
                          </button>
                        </div>

                        {/* Search Bar */}
                        <div className="border-b border-[#f1e6dc] bg-white px-[24px] py-[14px]">
                          <div className="relative">
                            <Search className="absolute left-[12px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#a1a9b4]" />
                            <input
                              type="text"
                              value={scheduleSearch}
                              onChange={(e) => setScheduleSearch(e.target.value)}
                              placeholder={`Tìm kiếm ${scheduleTab === "food" ? "món ăn" : "hoạt động"}...`}
                              className="h-[42px] w-full rounded-[14px] border border-[#efe2d8] bg-[#fbfaf8] pl-[38px] pr-[12px] text-[13px] font-[700] text-client-secondary outline-none transition-all focus:border-client-primary focus:bg-white"
                            />
                            {scheduleSearch && (
                              <button
                                type="button"
                                onClick={() => setScheduleSearch("")}
                                className="absolute right-[12px] top-1/2 -translate-y-1/2 rounded-full p-1 text-[#a1a9b4] hover:bg-black/5 hover:text-rose-500"
                              >
                                <X className="h-[14px] w-[14px]" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-[24px]">
                          {(() => {
                            const selectedPets = (selectedPetIds || [])
                              .map(id => (myPets || []).find((p: any) => normalizeId(p._id) === id))
                              .filter(Boolean);
                            const primaryPet = selectedPets[0];
                            const petType = primaryPet?.type || "dog";

                            if (scheduleTab === "food") {
                              return (
                                <ScheduleFoodCustomizer
                                  petType={petType}
                                  choices={customFeeding}
                                  onChange={setCustomFeeding}
                                  searchQuery={scheduleSearch}
                                />
                              );
                            } else {
                              return (
                                <ScheduleExerciseCustomizer
                                  petType={petType}
                                  choices={customExercise}
                                  onChange={setCustomExercise}
                                  searchQuery={scheduleSearch}
                                />
                              );
                            }
                          })()}
                        </div>

                        <div className="flex items-center justify-between gap-[12px] border-t border-[#f1e6dc] bg-[#fffaf7] px-[24px] py-[18px]">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomFeeding({});
                              setCustomExercise({});
                            }}
                            className="text-[13px] font-[700] text-[#6b7582] hover:text-rose-500 transition-default"
                          >
                            Đặt lại mặc định
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowScheduleModal(false)}
                            className="rounded-[16px] bg-client-primary px-[28px] py-[12px] text-[14px] font-[800] text-white shadow-lg shadow-client-primary/20 transition-all hover:bg-client-secondary active:scale-95"
                          >
                            Lưu cấu hình
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-[8px]">
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full resize-none rounded-[16px] border border-[#e7ddd3] bg-[#fbfaf8] px-[12px] py-[10px] text-[13px] outline-none focus:border-client-primary" placeholder="Lưu ý khẩu phần, tính cách, thuốc hoặc các yêu cầu đặc biệt." />
                  </div>
                  <div className="rounded-[18px] border border-[#eee2d7] bg-[#fffaf7] px-[14px] py-[12px]">
                    <div className="flex items-center justify-between text-[14px] text-[#596372]">
                      <span>Phòng {(cage as any).cageCode} ({Math.max(totalDays, 1)} đêm)</span>
                      <span className="font-[800] text-client-secondary">{estimatedTotal.toLocaleString()}đ</span>
                    </div>
                    <div className="mt-[8px] flex items-center justify-between text-[14px] text-[#596372]">
                      <span>Số lượng phòng</span>
                      <span className="font-[800] text-client-secondary">{quantity}</span>
                    </div>
                    <div className="mt-[8px] flex items-center justify-between border-t border-[#efe3d8] pt-[8px]">
                      <span className="text-[16px] font-[800] text-client-secondary">Tổng cộng</span>
                      <span className="text-[30px] font-[900] tracking-[-0.03em] text-client-primary">{estimatedTotal.toLocaleString()}đ</span>
                    </div>
                  </div>
                  <button type="button" onClick={handleBookNow} disabled={isSoldOut} className="h-[56px] w-full rounded-[18px] bg-client-primary text-[18px] font-[800] text-white shadow-[0_18px_34px_rgba(237,104,34,0.25)] transition-default hover:bg-client-secondary disabled:cursor-not-allowed disabled:bg-[#d1d5db] disabled:text-[#6b7280]">
                    {isSoldOut ? "HẾT PHÒNG" : "ĐẶT PHÒNG NGAY"}
                  </button>
                </div>
              </div>
              <div className="rounded-[24px] border border-[#eadfd4] bg-white px-[18px] py-[16px] shadow-[0_20px_40px_rgba(36,24,14,0.05)]">
                <p className="text-[22px] font-[800] text-client-secondary">Thông tin giá</p>
                <div className="mt-[12px] space-y-[10px] text-[14px] text-[#596372]">
                  <div className="flex items-center justify-between"><span>Giá cơ bản / đêm</span><span className="font-[800] text-client-secondary">{Number((cage as any).dailyPrice || 0).toLocaleString()}đ</span></div>
                  <div className="flex items-center justify-between"><span>Phụ thu cuối tuần</span><span className="font-[800] text-client-secondary">+{WEEKEND_SURCHARGE.toLocaleString()}đ</span></div>
                  <div className="flex items-center justify-between"><span>Còn trống trong ngày</span><span className="font-[800] text-client-secondary">{remainingRooms}/{totalRooms}</span></div>
                  <div className="flex items-center justify-between"><span>Tải trọng tối đa</span><span className="font-[800] text-client-secondary">{(cage as any).maxWeightCapacity ? `${(cage as any).maxWeightCapacity}kg` : "Chưa cập nhật"}</span></div>
                  <div className="flex items-center justify-between">
                    <span>Trạng thái</span>
                    <span className={`rounded-full border px-[10px] py-[4px] text-[12px] font-[800] ${status.className}`}>{status.label}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <FooterSub />
    </>
  );
};

// ══════════════════════════════════════════════════
// HELPER COMPONENTS
// ══════════════════════════════════════════════════

const ScheduleFoodCustomizer = ({ petType, choices, onChange, searchQuery }: { petType: string, choices: Record<string, string>, onChange: any, searchQuery: string }) => {
  const { data: foodTemplates = [], isLoading } = useFoodTemplates(petType);

  const meals = [
    { id: "Sáng", label: "Bữa Sáng", icon: <Utensils className="h-4 w-4" />, time: "07:30 - 08:30" },
    { id: "Trưa", label: "Bữa Trưa", icon: <Utensils className="h-4 w-4 text-amber-500" />, time: "12:00 - 13:00" },
    { id: "Tối", label: "Bữa Tối", icon: <Utensils className="h-4 w-4 text-indigo-500" />, time: "18:00 - 19:30" },
  ];

  const filteredTemplates = foodTemplates.filter((f: any) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) return <div className="flex py-10 justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-client-primary"></div></div>;

  return (
    <div className="space-y-6">
      {meals.map((meal) => (
        <div key={meal.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg border border-[#f1e6dc] shadow-sm">{meal.icon}</div>
              <span className="text-[14px] font-[800] text-client-secondary uppercase tracking-tight">{meal.label}</span>
            </div>
            <span className="text-[11px] font-[700] text-[#9aa3b2] bg-black/5 px-2 py-0.5 rounded-full">{meal.time}</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((food: any) => (
                <button
                  key={food._id}
                  type="button"
                  onClick={() => onChange({ ...choices, [meal.id]: food.name })}
                  className={`flex items-start gap-3 p-3 text-left rounded-[16px] border transition-all ${choices[meal.id] === food.name ? "border-client-primary bg-[#fffbf9] shadow-sm" : "border-[#efe2d8] bg-white hover:border-client-primary/50"}`}
                >
                  <div className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${choices[meal.id] === food.name ? "border-client-primary bg-client-primary text-white" : "border-[#cbd5e1]"}`}>
                    {choices[meal.id] === food.name && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <div>
                    <p className={`text-[13px] font-[700] ${choices[meal.id] === food.name ? "text-client-secondary" : "text-[#51606d]"}`}>{food.name}</p>
                    {food.description && <p className="text-[11px] text-[#8a94a1] leading-relaxed mt-0.5">{food.description}</p>}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center py-4 text-[13px] text-[#9aa3b2]">Không tìm thấy món ăn nào phù hợp.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const ScheduleExerciseCustomizer = ({ petType, choices, onChange, searchQuery }: { petType: string, choices: Record<string, string>, onChange: any, searchQuery: string }) => {
  const { data: exerciseTemplates = [], isLoading } = useExerciseTemplates(petType);

  const slots = [
    { id: "slot1", label: "Ca Sáng", icon: <Dumbbell className="h-4 w-4" />, time: "09:00 - 10:30" },
    { id: "slot2", label: "Ca Chiều", icon: <Dumbbell className="h-4 w-4 text-indigo-500" />, time: "16:30 - 17:30" },
  ];

  const filteredTemplates = exerciseTemplates.filter((ex: any) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) return <div className="flex py-10 justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-client-primary"></div></div>;

  return (
    <div className="space-y-6">
      {slots.map((slot) => (
        <div key={slot.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg border border-[#f1e6dc] shadow-sm">{slot.icon}</div>
              <span className="text-[14px] font-[800] text-client-secondary uppercase tracking-tight">{slot.label}</span>
            </div>
            <span className="text-[11px] font-[700] text-[#9aa3b2] bg-black/5 px-2 py-0.5 rounded-full">{slot.time}</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((ex: any) => (
                <button
                  key={ex._id}
                  type="button"
                  onClick={() => onChange({ ...choices, [slot.id]: ex.name })}
                  className={`flex items-start gap-3 p-3 text-left rounded-[16px] border transition-all ${choices[slot.id] === ex.name ? "border-client-primary bg-[#fffbf9] shadow-sm" : "border-[#efe2d8] bg-white hover:border-client-primary/50"}`}
                >
                  <div className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${choices[slot.id] === ex.name ? "border-client-primary bg-client-primary text-white" : "border-[#cbd5e1]"}`}>
                    {choices[slot.id] === ex.name && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[13px] font-[700] ${choices[slot.id] === ex.name ? "text-client-secondary" : "text-[#51606d]"}`}>{ex.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${ex.intensity === 'high' ? 'bg-rose-100 text-rose-600' : ex.intensity === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                        {ex.intensity === 'high' ? 'Mạnh' : ex.intensity === 'medium' ? 'Vừa' : 'Nhẹ'}
                      </span>
                    </div>
                    {ex.description && <p className="text-[11px] text-[#8a94a1] leading-relaxed mt-0.5">{ex.description}</p>}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center py-4 text-[13px] text-[#9aa3b2]">Không tìm thấy hoạt động nào phù hợp.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoardingCageDetailPage;
