import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock3,
  Expand,
  ImageIcon,
  PawPrint,
  PlayCircle,
  ShieldCheck,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import { getBoardingBookingDetail, getBoardingBookingList } from "../../api/dashboard.api";
import { ClientBoardingPetDiary } from "./ClientBoardingPetDiary";

const normalizeStatus = (value?: string) => String(value || "").toLowerCase().replace(/_/g, "-");
const normalizeTime = (value?: string) => String(value || "").trim();

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

const CARE_STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Chưa thực hiện", className: "bg-gray-100 text-gray-600 border border-gray-200" },
  done: { label: "Đã hoàn thành", className: "bg-green-50 text-green-700 border border-green-200" },
  skipped: { label: "Bỏ qua", className: "bg-slate-100 text-slate-500 border border-slate-200" },
};

const BOARDING_STATUS_META: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Đã xác nhận", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  "checked-in": { label: "Đang lưu trú", className: "bg-purple-50 text-purple-700 border border-purple-200" },
  "checked-out": { label: "Đã trả chuồng", className: "bg-green-50 text-green-700 border border-green-200" },
  held: { label: "Đang giữ chuồng", className: "bg-orange-50 text-orange-700 border border-orange-200" },
  pending: { label: "Chờ xử lý", className: "bg-gray-100 text-gray-600 border border-gray-200" },
  cancelled: { label: "Đã hủy", className: "bg-red-50 text-red-700 border border-red-200" },
};

const isBookingEligibleForPetCages = (booking: any) => {
  const status = normalizeStatus(booking?.boardingStatus || booking?.status || booking?.bookingStatus);
  const paymentMethod = String(booking?.paymentMethod || "").toLowerCase();
  const paymentStatus = normalizeStatus(booking?.paymentStatus || "unpaid");

  // Only show confirmed (upcoming) and currently checked-in stays
  // Hide checked-out immediately to keep dashboard relevant
  if (status !== "confirmed" && status !== "checked-in") {
    return false;
  }

  if (paymentMethod === "prepaid") return paymentStatus === "paid";
  return true;
};

const sortCareItems = (a: any, b: any) => normalizeTime(a?.time).localeCompare(normalizeTime(b?.time));

const getCareStatusMeta = (status?: string) => CARE_STATUS_META[String(status || "pending")] || CARE_STATUS_META.pending;

const filterCareSchedule = (schedule: any[], petId: any) => {
  if (!Array.isArray(schedule)) return [];
  const targetId = String(petId || "").trim();
  return schedule.filter((item: any) => {
    if (!item.petId) return true; // Legacy fallback
    return String(item.petId || "").trim() === targetId;
  });
};

const getBoardingStatusMeta = (status?: string) => {
  const key = normalizeStatus(status);
  return BOARDING_STATUS_META[key] || { label: status || "Không rõ", className: "bg-slate-200 text-slate-700" };
};

const getPetKey = (pet: any) => String(pet?._id || pet?.id || pet?.petId || pet?.name || "").trim();
const getPetLabel = (pet: any) => String(pet?.name || pet?.petName || pet?.code || "Thú cưng").trim();

const getBoardingPaymentLabel = (booking: any) => {
  const paymentStatus = normalizeStatus(booking?.paymentStatus || "unpaid");
  if (paymentStatus === "paid") return "Đã thanh toán";
  if (paymentStatus === "partial") return `Đã cọc ${Number(booking?.depositPercent || 20)}%`;
  if (paymentStatus === "refunded") return "Đã hoàn tiền";
  return "Chưa thanh toán";
};

const getBoardingDisplaySlots = (detail: any) => {
  if (!detail?.booking) return [];

  const booking = detail.booking;
  const pets = Array.isArray(detail?.pets) ? detail.pets : [];

  if (Array.isArray(booking.items) && booking.items.length > 0) {
    return booking.items.flatMap((item: any, index: number) => {
      const itemCage = (typeof item.cageId === 'object' && item.cageId !== null) ? item.cageId : detail.cage;
      if (!itemCage) return [];
      
      const petIdStr = item.petIds?.[0] ? 
        (typeof item.petIds[0] === 'object' ? item.petIds[0]._id : item.petIds[0]) 
        : item.petId;
        
      const pet = pets.find((p: any) => String(p._id) === String(petIdStr)) || pets[index] || null;
      
      const slotLabel = booking.items.length > 1 ? `Phòng ${index + 1}` : "";
      const displayCode = [itemCage?.cageCode || "CHUỒNG", slotLabel].filter(Boolean).join(" • ");
      
      const images: any[] = [];
      if (itemCage?.avatar) images.push(itemCage.avatar);
      if (Array.isArray(itemCage?.gallery)) images.push(...itemCage.gallery);
      
      return {
        ...itemCage,
        images: images.length > 0 ? images : itemCage?.images || [],
        _id: `${booking?._id || "cage"}-item-${index}-${pet?._id || "nopet"}`,
        sourceCageId: itemCage?._id,
        bookingId: booking?._id,
        slotIndex: index + 1,
        slotCount: booking.items.length,
        slotLabel,
        displayCode,
        lastBooking: booking,
        pet,
        pets: pet ? [pet] : [],
      };
    });
  }

  // Pre-batch booking fallback
  if (!detail.cage) return [];
  const cage = detail.cage;
  const requestedQuantity = Math.max(1, Number(booking?.quantity || 0) || pets.length || 1);
  const slotCount = Math.max(requestedQuantity, pets.length || 0, 1);

  return Array.from({ length: slotCount }).map((_, index) => {
    const pet = pets[index] || null;
    const slotLabel = slotCount > 1 ? `Phòng ${index + 1}` : "";
    const displayCode = [cage?.cageCode || "CHUỒNG", slotLabel].filter(Boolean).join(" • ");

    const images: any[] = [];
    if (cage?.avatar) images.push(cage.avatar);
    if (Array.isArray(cage?.gallery)) images.push(...cage.gallery);

    return {
      ...cage,
      images: images.length > 0 ? images : cage?.images || [],
      _id: `${booking?._id || cage?._id || "cage"}-${pet?._id || `slot-${index + 1}`}`,
      sourceCageId: cage?._id,
      bookingId: booking?._id,
      slotIndex: index + 1,
      slotCount,
      slotLabel,
      displayCode,
      lastBooking: booking,
      pet,
      pets: pet ? [pet] : [],
    };
  });
};
const normalizeProofMedia = (items: any): Array<{ url: string; kind: "image" | "video" }> => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item: any) => ({
      url: String(item?.url || item || "").trim(),
      kind: (String(item?.kind || "").toLowerCase() === "video" ? "video" : "image") as "image" | "video",
    }))
    .filter((item) => Boolean(item.url));
};
const getPetGenderLabel = (gender?: string) => {
  if (gender === "male") return "Đực";
  if (gender === "female") return "Cái";
  return "Chưa rõ";
};

const getExerciseMinutesTotal = (exerciseSchedule: any[]) =>
  (Array.isArray(exerciseSchedule) ? exerciseSchedule : []).reduce(
    (sum, item) => sum + Number(item?.durationMinutes || 0),
    0
  );

const getCareProgress = (feedingSchedule: any[], exerciseSchedule: any[]) => {
  const feeding = Array.isArray(feedingSchedule) ? feedingSchedule : [];
  const exercise = Array.isArray(exerciseSchedule) ? exerciseSchedule : [];
  const total = feeding.length + exercise.length;
  const done = [...feeding, ...exercise].filter((item: any) => normalizeStatus(item?.status) === "done").length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, percent };
};

const ProgressRing = ({ percent, size = 60, stroke = 6 }: { percent: number; size?: number; stroke?: number }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="fill-none stroke-slate-200" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="fill-none stroke-client-primary transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[12px] font-[800] text-client-secondary">{clamped}%</div>
    </div>
  );
};

const ProofGalleryOverlay = ({
  items,
  index,
  title,
  onClose,
  onChangeIndex,
}: {
  items: Array<{ url: string; kind: "image" | "video" }>;
  index: number;
  title: string;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}) => {
  const currentItem = items[index];

  if (!currentItem) return null;

  return (
    <div className="fixed inset-0 z-[140] bg-[#020617]/92 px-[18px] py-[24px] backdrop-blur-[4px]">
      <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col">
        <div className="flex items-center justify-between gap-[16px] pb-[14px] text-white">
          <div>
            <p className="text-[22px] font-[800] leading-tight">{title || "Gallery minh chứng"}</p>
            <p className="mt-[4px] text-[13px] text-white/65">
              {index + 1}/{items.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border border-white/15 bg-white/10 transition duration-300 hover:bg-white/15"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[24px] bg-black/45">
          {currentItem.kind === "video" ? (
            <video
              src={currentItem.url}
              controls
              className="max-h-full w-full object-contain"
            />
          ) : (
            <img
              src={currentItem.url}
              alt={`proof-${index + 1}`}
              className="max-h-full w-full object-contain"
            />
          )}

          {items.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => onChangeIndex(index === 0 ? items.length - 1 : index - 1)}
                className="absolute left-[14px] top-1/2 inline-flex h-[46px] w-[46px] -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white transition duration-300 hover:bg-white/18"
              >
                <ChevronLeft className="h-[22px] w-[22px]" />
              </button>
              <button
                type="button"
                onClick={() => onChangeIndex(index === items.length - 1 ? 0 : index + 1)}
                className="absolute right-[14px] top-1/2 inline-flex h-[46px] w-[46px] -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white transition duration-300 hover:bg-white/18"
              >
                <ChevronRight className="h-[22px] w-[22px]" />
              </button>
            </>
          ) : null}
        </div>

        {items.length > 1 ? (
          <div className="mt-[14px] flex flex-wrap gap-[10px]">
            {items.map((media, mediaIndex) => (
              <button
                key={`${media.url}-${mediaIndex}-thumb`}
                type="button"
                onClick={() => onChangeIndex(mediaIndex)}
                className={`relative h-[78px] w-[78px] overflow-hidden rounded-[14px] border transition duration-300 ${mediaIndex === index ? "border-[#fb7185]" : "border-white/10 opacity-70 hover:opacity-100"
                  }`}
              >
                {media.kind === "video" ? (
                  <video src={media.url} muted className="h-full w-full object-cover" />
                ) : (
                  <img src={media.url} alt={`thumb-${mediaIndex + 1}`} className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const DetailScheduleCard = ({
  item,
  type,
  onOpenGallery,
}: {
  item: any;
  type: "feeding" | "exercise";
  onOpenGallery?: (items: Array<{ url: string; kind: "image" | "video" }>, index: number, title: string) => void;
}) => {
  const statusMeta = getCareStatusMeta(item?.status);
  const proofMedia = normalizeProofMedia(item?.proofMedia);

  return (
    <div className="rounded-[20px] bg-white border border-[#eee] p-[20px] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-[15px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className="inline-flex items-center gap-[6px] rounded-full bg-client-primary/10 px-[12px] py-[5px] text-[13px] font-bold text-client-primary">
              <Clock3 className="h-[14px] w-[14px]" />
              {item?.time || "--:--"}
            </span>
            <span className={`inline-flex rounded-full px-[12px] py-[5px] text-[12px] font-bold ${statusMeta.className}`}>
              {statusMeta.label}
            </span>
          </div>
          <p className="mt-[12px] text-[16px] font-bold text-client-secondary">
            {type === "feeding" ? item?.food || "Khẩu phần ăn" : item?.activity || "Hoạt động"}
          </p>
          <p className="mt-[5px] text-[14px] font-medium text-[#7d7b7b]">
            {type === "feeding"
              ? `Khẩu phần: ${item?.amount || "Đang cập nhật"}`
              : `Thời lượng: ${item?.durationMinutes || 0} phút`}
          </p>
          {item?.staffName || item?.staffId?.fullName ? (
            <p className="mt-[5px] text-[12px] text-[#9ca3af] font-medium italic">
              Thực hiện bởi: {item?.staffName || item?.staffId?.fullName}
            </p>
          ) : null}
          {item?.note ? (
            <div className="mt-[10px] p-[10px] rounded-[10px] bg-[#f8fbff] text-[13px] text-[#64748b] border border-[#dbeafe] leading-relaxed">
              {item.note}
            </div>
          ) : null}

          {proofMedia.length > 0 && (
            <div className="mt-[15px] pt-[15px] border-t border-[#eee]">
              <div className="mb-[10px] flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#9ca3af]">Minh chứng</p>
                <button
                  type="button"
                  onClick={() =>
                    onOpenGallery?.(
                      proofMedia,
                      0,
                      `${type === "feeding" ? "Gallery lịch ăn" : "Gallery lịch vận động"}`
                    )
                  }
                  className="flex items-center gap-[6px] rounded-full border border-client-primary/30 bg-white px-[12px] py-[5px] text-[12px] font-bold text-client-primary hover:bg-client-primary hover:text-white transition-all shadow-sm"
                >
                  <Expand className="h-[13px] w-[13px]" />
                  Xem tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-[10px]">
                {proofMedia.map((media: any, index: number) => (
                  <div
                    key={`${media.url}-${index}`}
                    onClick={() =>
                      onOpenGallery?.(
                        proofMedia,
                        index,
                        `${type === "feeding" ? "Gallery lịch ăn" : "Gallery lịch vận động"}`
                      )
                    }
                    className="relative h-[94px] w-[94px] cursor-zoom-in overflow-hidden rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc]"
                  >
                    {media.kind === "video" ? (
                      <video
                        src={media.url}
                        controls
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt={`proof-${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <span className="absolute bottom-[6px] left-[6px] inline-flex items-center gap-[4px] rounded-full bg-[#0f172a]/75 px-[7px] py-[3px] text-[10px] font-[800] text-white">
                      {media.kind === "video" ? <PlayCircle className="h-[11px] w-[11px]" /> : <ImageIcon className="h-[11px] w-[11px]" />}
                      {media.kind === "video" ? "Video" : "Ảnh"}
                    </span>
                    <span className="absolute right-[6px] top-[6px] inline-flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white/85 text-client-secondary shadow-sm">
                      <Expand className="h-[12px] w-[12px]" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CageCareDetailModal = ({
  cage,
  onClose,
}: {
  cage: any;
  onClose: () => void;
}) => {
  const [galleryState, setGalleryState] = useState<{
    open: boolean;
    items: Array<{ url: string; kind: "image" | "video" }>;
    index: number;
    title: string;
  }>({
    open: false,
    items: [],
    index: 0,
    title: "",
  });

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const primaryPet = cage?.pet || (Array.isArray(cage?.pets) && cage.pets.length > 0 ? cage.pets[0] : null);
  const currentPetId = primaryPet?._id;
  const feedingSchedule = filterCareSchedule(cage?.lastBooking?.feedingSchedule, currentPetId).sort(sortCareItems);
  const exerciseSchedule = filterCareSchedule(cage?.lastBooking?.exerciseSchedule, currentPetId).sort(sortCareItems);
  const careProgress = getCareProgress(feedingSchedule, exerciseSchedule);
  const petMeta = [
    primaryPet?.age ? `${primaryPet.age} tuổi` : null,
    typeof primaryPet?.weight === "number" ? `${primaryPet.weight}kg` : null,
    getPetGenderLabel(primaryPet?.gender),
  ]
    .filter(Boolean)
    .join(" • ");
  const totalExerciseMinutes = getExerciseMinutesTotal(exerciseSchedule);
  const boardingStatusMeta = getBoardingStatusMeta(cage?.lastBooking?.boardingStatus);

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#0f172a]/60 px-[18px] py-[40px] backdrop-blur-[4px]">
      <div className="mx-auto w-full max-w-[1240px] rounded-[30px] bg-[#f8fbff] p-[30px] shadow-[0_30px_100px_rgba(15,23,42,0.3)] xl:max-w-[1000px] lg:p-[20px]">
        <div className="flex items-center justify-between gap-[15px] border-b border-[#e2e8f0] pb-[25px]">
          <div className="flex items-center gap-[15px]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-[14px] border border-[#e2e8f0] bg-white text-client-secondary transition-all hover:border-client-primary hover:text-client-primary hover:shadow-sm shadow-inner"
            >
              <ArrowLeft className="h-[20px] w-[20px]" />
            </button>
            <div>
              <h3 className="text-[28px] font-secondary font-bold text-client-secondary leading-tight">Lịch chăm sóc chi tiết</h3>
              <p className="mt-[5px] text-[14px] text-[#7d7b7b] font-medium uppercase tracking-wide">
                Chuồng {cage?.displayCode || cage?.cageCode || "CHUỒNG"} • {dayjs().format("DD/MM/YYYY")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border border-[#eee] bg-white text-[#9ca3af] transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100"
          >
            <X className="h-[20px] w-[20px]" />
          </button>
        </div>

        <div className="mt-[25px] rounded-[24px] bg-white p-[25px] shadow-[0px_8px_24px_#959da51a] border border-[#eee]">
          <div className="flex items-center justify-between gap-[25px] lg:flex-col lg:items-start">
            <div className="flex min-w-0 items-center gap-[25px]">
              <div className="h-[120px] w-[120px] shrink-0 overflow-hidden rounded-[20px] bg-gray-100 border border-[#eee] shadow-sm">
                {primaryPet?.avatar || cage?.avatar ? (
                  <img
                    src={primaryPet?.avatar || cage?.avatar}
                    alt={primaryPet?.name || cage?.displayCode || cage?.cageCode}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[14px] text-[#9ca3af]">Không có ảnh</div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-[12px]">
                  <h4 className="text-[32px] font-secondary font-bold text-client-secondary leading-none">
                    {primaryPet?.name || cage?.displayCode || cage?.cageCode || "Thú cưng"}
                  </h4>
                  {primaryPet?.breed && (
                    <span className="rounded-full bg-client-primary/10 px-[12px] py-[6px] text-[12px] font-bold text-client-primary border border-client-primary/20">
                      {primaryPet.breed}
                    </span>
                  )}
                  <span className={`rounded-full px-[12px] py-[6px] text-[12px] font-bold shadow-sm ${boardingStatusMeta.className}`}>
                    {boardingStatusMeta.label}
                  </span>
                </div>
                <p className="mt-[10px] text-[16px] text-[#7d7b7b] font-medium">{petMeta || "Chưa có hồ sơ thú cưng chi tiết"}</p>
                <div className="mt-[15px] flex flex-wrap gap-[10px]">
                  <span className="rounded-[10px] bg-[#f8f9fa] border border-[#eee] px-[12px] py-[6px] text-[13px] font-bold text-client-secondary">{SIZE_LABELS[String(cage?.size || "")] || cage?.size || "Kích thước chưa rõ"}</span>
                  <span className="rounded-[10px] bg-[#f8f9fa] border border-[#eee] px-[12px] py-[6px] text-[13px] font-bold text-client-secondary">{Array.isArray(cage?.pets) ? cage.pets.length : 0} thú cưng</span>
                  <span className="rounded-[10px] bg-[#f8f9fa] border border-[#eee] px-[12px] py-[6px] text-[13px] font-bold text-client-primary">
                    {getBoardingPaymentLabel(cage?.lastBooking)}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[380px] rounded-[24px] bg-[#f8fbff] border border-[#dbeafe] px-[20px] py-[20px] lg:max-w-full shadow-sm">
              <div className="flex items-center justify-between gap-[15px]">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#9ca3af]">Tiến độ trong ngày</p>
                  <p className="mt-[5px] text-[32px] font-secondary font-bold text-client-primary">{careProgress.percent}%</p>
                </div>
                <ProgressRing percent={careProgress.percent} size={88} stroke={8} />
              </div>
              <div className="mt-[15px] h-[12px] overflow-hidden rounded-full bg-gray-100 border border-[#eee]">
                <div
                  className="h-full rounded-full bg-client-primary shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all duration-1000"
                  style={{ width: `${careProgress.percent}%` }}
                />
              </div>
              <p className="mt-[10px] text-right text-[13px] font-medium text-[#7d7b7b]">
                {careProgress.done}/{careProgress.total} công việc đã hoàn thành
              </p>
            </div>
          </div>
        </div>

        <div className="mt-[25px] grid grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] gap-[25px] xl:grid-cols-1">
          <section className="rounded-[24px] border border-[#eee] bg-white p-[25px] shadow-[0px_8px_24px_#959da514]">
            <div className="flex items-center gap-[15px] mb-[20px] border-b border-[#f8f9fa] pb-[15px]">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-client-primary/10 text-client-primary shadow-sm">
                <UtensilsCrossed className="h-[24px] w-[24px]" />
              </div>
              <div>
                <h4 className="text-[22px] font-secondary font-bold text-client-secondary">Lịch ăn uống</h4>
                <p className="text-[14px] text-[#7d7b7b] font-medium">{feedingSchedule.length} mục chăm sóc</p>
              </div>
            </div>

            <div className="mt-[16px] space-y-[12px]">
              {feedingSchedule.length > 0 ? (
                feedingSchedule.map((item: any, index: number) => (
                  <DetailScheduleCard
                    key={`detail-feed-${index}`}
                    item={item}
                    type="feeding"
                    onOpenGallery={(items, selectedIndex, title) =>
                      setGalleryState({ open: true, items, index: selectedIndex, title })
                    }
                  />
                ))
              ) : (
                <div className="rounded-[18px] border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-[16px] py-[18px] text-[14px] text-[#94a3b8]">
                  Chưa có lịch ăn uống cho ngày này.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#eee] bg-white p-[25px] shadow-[0px_8px_24px_#959da514]">
            <div className="flex items-center gap-[15px] mb-[20px] border-b border-[#f8f9fa] pb-[15px]">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-blue-50 text-blue-600 shadow-sm">
                <CalendarDays className="h-[24px] w-[24px]" />
              </div>
              <div>
                <h4 className="text-[22px] font-secondary font-bold text-client-secondary">Thông tin lưu trú</h4>
                <p className="text-[14px] text-[#7d7b7b] font-medium">Tổng quan lưu trú và ghi chú</p>
              </div>
            </div>

            <div className="space-y-[15px]">
              <div className="rounded-[20px] bg-[#f8fbff] border border-[#dbeafe] p-[20px]">
                <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#9ca3af]">Thời gian lưu trú</p>
                <p className="mt-[10px] text-[18px] font-bold text-client-secondary">
                  {cage?.lastBooking?.checkInDate
                    ? `${dayjs(cage.lastBooking.checkInDate).format("DD/MM/YYYY")} - ${dayjs(cage.lastBooking.checkOutDate).format("DD/MM/YYYY")}`
                    : "Chưa cập nhật"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-[15px] lg:grid-cols-1">
                <div className="rounded-[20px] border border-[#eee] bg-[#fcfdff] p-[20px]">
                  <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#9ca3af]">Giá lưu trú</p>
                  <p className="mt-[8px] text-[22px] font-secondary font-bold text-client-primary">
                    {Number(cage?.dailyPrice || 0).toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div className="rounded-[20px] border border-[#eee] bg-[#fcfdff] p-[20px]">
                  <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#9ca3af]">Tiện nghi</p>
                  <p className="mt-[8px] text-[22px] font-secondary font-bold text-client-secondary">
                    {Array.isArray(cage?.amenities) ? cage.amenities.length : 0} dịch vụ
                  </p>
                </div>
              </div>

              <div className="rounded-[20px] border border-[#eee] bg-white p-[20px]">
                <div className="flex items-center gap-[10px]">
                  <ShieldCheck className="h-[20px] w-[20px] text-emerald-500" />
                  <p className="text-[15px] font-bold text-client-secondary">Ghi chú chăm sóc</p>
                </div>
                <p className="mt-[10px] text-[14px] leading-relaxed text-[#7d7b7b] font-medium">
                  {cage?.lastBooking?.specialCare || cage?.lastBooking?.notes || primaryPet?.notes || "Chưa có ghi chú chăm sóc đặc biệt."}
                </p>
              </div>

              <div className="rounded-[20px] border border-dashed border-[#dbeafe] bg-[#f8fbff] p-[20px]">
                <div className="flex items-center gap-[10px]">
                  <PawPrint className="h-[20px] w-[20px] text-client-primary" />
                  <p className="text-[15px] font-bold text-client-secondary">Thú cưng đang lưu trú</p>
                </div>
                <div className="mt-[15px] flex flex-wrap gap-[10px]">
                  {Array.isArray(cage?.pets) && cage.pets.length > 0 ? (
                    cage.pets.map((pet: any) => (
                      <span
                        key={getPetKey(pet)}
                        className="inline-flex items-center gap-[8px] rounded-full bg-white border border-[#dbeafe] px-[12px] py-[8px] text-[13px] font-bold text-client-secondary shadow-sm"
                      >
                        {getPetLabel(pet)}
                      </span>
                    ))
                  ) : (
                    <span className="text-[14px] text-[#9ca3af] italic">Chưa cập nhật thú cưng</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-[25px] rounded-[24px] border border-[#eee] bg-white p-[25px] shadow-[0px_8px_24px_#959da514]">
          <div className="flex items-center justify-between gap-[15px] mb-[20px] border-b border-[#f8f9fa] pb-[15px]">
            <div className="flex items-center gap-[15px]">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-green-50 text-green-600 shadow-sm">
                <Activity className="h-[24px] w-[24px]" />
              </div>
              <div>
                <h4 className="text-[22px] font-secondary font-bold text-client-secondary">Hoạt động vận động</h4>
                <p className="text-[14px] text-[#7d7b7b] font-medium">Chi tiết vận động trong ngày</p>
              </div>
            </div>
            <span className="rounded-[12px] bg-[#f8f9fa] border border-[#eee] px-[15px] py-[8px] text-[14px] font-bold text-client-secondary">
              Tổng: {totalExerciseMinutes} phút
            </span>
          </div>

          <div className="grid grid-cols-2 gap-[20px] xl:grid-cols-1">
            {exerciseSchedule.length > 0 ? (
              exerciseSchedule.map((item: any, index: number) => (
                <DetailScheduleCard
                  key={`detail-exercise-${index}`}
                  item={item}
                  type="exercise"
                  onOpenGallery={(items, selectedIndex, title) =>
                    setGalleryState({ open: true, items, index: selectedIndex, title })
                  }
                />
              ))
            ) : (
              <div className="col-span-full rounded-[20px] border border-dashed border-[#dbeafe] bg-[#f8fbff] px-[20px] py-[30px] text-[15px] text-[#9ca3af] text-center font-medium italic">
                Chưa có lịch vận động cho ngày này.
              </div>
            )}
          </div>
        </section>

        {/* Nhật ký lưu trú hàng ngày */}
        {cage?.lastBooking?._id && (
          <div className="mt-[25px]">
            <ClientBoardingPetDiary bookingId={cage.lastBooking._id} />
          </div>
        )}

        <div className="mt-[30px] flex justify-end gap-[15px] border-t border-[#eee] pt-[25px]">
          <button
            type="button"
            onClick={onClose}
            className="px-[25px] py-[12px] rounded-[14px] border border-[#eee] bg-white text-client-secondary font-bold text-[15px] hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
          >
            Đóng
          </button>
          <Link
            to={`/hotels/${cage?.sourceCageId || cage?._id}`}
            className="px-[30px] py-[12px] rounded-[14px] bg-client-primary text-white font-bold text-[15px] hover:shadow-[0_8px_24px_rgba(249,115,22,0.4)] transition-all shadow-md active:scale-[0.98]"
          >
            Xem chi tiết chuồng
          </Link>
        </div>

        {galleryState.open ? (
          <ProofGalleryOverlay
            items={galleryState.items}
            index={galleryState.index}
            title={galleryState.title}
            onClose={() => setGalleryState((prev) => ({ ...prev, open: false }))}
            onChangeIndex={(nextIndex) => setGalleryState((prev) => ({ ...prev, index: nextIndex }))}
          />
        ) : null}
      </div>
    </div>
  );
};

export const PetCagesPage = () => {
  const [loading, setLoading] = useState(true);
  const [cages, setCages] = useState<any[]>([]);
  const [waitingPaymentCount, setWaitingPaymentCount] = useState(0);
  const [selectedCageId, setSelectedCageId] = useState("all");
  const [selectedPetId, setSelectedPetId] = useState("all");
  const [activeCareTab, setActiveCareTab] = useState<"feeding" | "exercise">("feeding");
  const [selectedCageDetail, setSelectedCageDetail] = useState<any | null>(null);

  const breadcrumbs = [
    { label: "Trang chủ", to: "/" },
    { label: "Tài khoản", to: "/dashboard/profile" },
    { label: "Chuồng thú cưng", to: "/dashboard/pet-cages" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listRes = await getBoardingBookingList();
        const bookings = Array.isArray(listRes)
          ? listRes
          : Array.isArray(listRes?.data)
            ? listRes.data
            : [];

        const eligibleBookings = bookings.filter(isBookingEligibleForPetCages);
        setWaitingPaymentCount(Math.max(bookings.length - eligibleBookings.length, 0));

        const details = await Promise.all(
          eligibleBookings.map((b: any) => getBoardingBookingDetail(b._id).catch(() => null))
        );

        setCages(details.flatMap((detail: any) => getBoardingDisplaySlots(detail)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterOptions = useMemo(() => {
    const cageOptions = cages.map((cage: any) => ({
      id: cage._id,
      label: `${cage.displayCode || cage.cageCode || "Chuồng"} - ${SIZE_LABELS[String(cage.size || "")] || cage.size || "-"}`,
    }));

    const petMap = new Map<string, { id: string; label: string }>();
    cages.forEach((cage: any) => {
      const pets = Array.isArray(cage?.pets) ? cage.pets : [];
      pets.forEach((pet: any) => {
        const key = getPetKey(pet);
        if (!key || petMap.has(key)) return;
        petMap.set(key, { id: key, label: getPetLabel(pet) });
      });
    });

    return {
      cageOptions,
      petOptions: Array.from(petMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
    };
  }, [cages]);

  useEffect(() => {
    if (selectedCageId !== "all" && !filterOptions.cageOptions.some((item) => item.id === selectedCageId)) {
      setSelectedCageId("all");
    }
  }, [filterOptions.cageOptions, selectedCageId]);

  useEffect(() => {
    if (selectedPetId !== "all" && !filterOptions.petOptions.some((item) => item.id === selectedPetId)) {
      setSelectedPetId("all");
    }
  }, [filterOptions.petOptions, selectedPetId]);

  const filteredCages = useMemo(() => {
    return cages.filter((cage: any) => {
      if (selectedCageId !== "all" && cage?._id !== selectedCageId) return false;
      if (selectedPetId !== "all") {
        const pets = Array.isArray(cage?.pets) ? cage.pets : [];
        const hasPet = pets.some((pet: any) => getPetKey(pet) === selectedPetId);
        if (!hasPet) return false;
      }
      return true;
    });
  }, [cages, selectedCageId, selectedPetId]);

  const summary = useMemo(() => {
    const totalCages = filteredCages.length;
    const totalFeeding = filteredCages.reduce((sum, cage) => {
      const petId = cage.pet?._id;
      return sum + filterCareSchedule(cage?.lastBooking?.feedingSchedule, petId).length;
    }, 0);
    const totalExercise = filteredCages.reduce((sum, cage) => {
      const petId = cage.pet?._id;
      return sum + filterCareSchedule(cage?.lastBooking?.exerciseSchedule, petId).length;
    }, 0);
    const doneFeeding = filteredCages.reduce((sum, cage) => {
      const petId = cage.pet?._id;
      const list = filterCareSchedule(cage?.lastBooking?.feedingSchedule, petId);
      return sum + list.filter((item: any) => normalizeStatus(item?.status) === "done").length;
    }, 0);
    const doneExercise = filteredCages.reduce((sum, cage) => {
      const petId = cage.pet?._id;
      const list = filterCareSchedule(cage?.lastBooking?.exerciseSchedule, petId);
      return sum + list.filter((item: any) => normalizeStatus(item?.status) === "done").length;
    }, 0);
    const totalCareItems = totalFeeding + totalExercise;
    const doneCareItems = doneFeeding + doneExercise;
    const completionPercent = totalCareItems > 0 ? Math.round((doneCareItems / totalCareItems) * 100) : 0;

    return {
      totalCages,
      totalFeeding,
      totalExercise,
      doneFeeding,
      doneExercise,
      totalCareItems,
      doneCareItems,
      completionPercent,
    };
  }, [filteredCages]);

  const isFiltered = selectedCageId !== "all" || selectedPetId !== "all";

  useEffect(() => {
    if (!selectedCageDetail) return;
    const stillVisible = filteredCages.some((cage: any) => cage?._id === selectedCageDetail?._id);
    if (!stillVisible) setSelectedCageDetail(null);
  }, [filteredCages, selectedCageDetail]);

  return (
    <>
      <ProductBanner
        pageTitle="Chuồng thú cưng"
        breadcrumbs={breadcrumbs}
        url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
        className="bg-top shadow-inner"
      />

      <div className="mt-[-150px] mb-[100px] app-container flex items-stretch">
        <div className="w-[25%] px-[12px] flex">
          <Sidebar />
        </div>

        <div className="w-[75%] px-[12px] py-[100px]">
          <div className="rounded-[20px] bg-white p-[35px] shadow-[0px_8px_24px_#959da533]">
            <div className="flex items-center justify-between gap-[15px] md:flex-col md:items-start border-b border-[#eee] pb-[30px]">
              <div>
                <h3 className="text-[28px] font-secondary text-client-secondary">Chuồng thú cưng của bạn</h3>
                <p className="text-[15px] text-[#7d7b7b] mt-[8px]">Theo dõi thông tin chuồng và tiến độ chăm sóc trong ngày.</p>
              </div>
              <div className="flex items-center gap-[20px] rounded-[15px] border border-[#eee] bg-[#f9f9f9] px-[25px] py-[15px]">
                <ProgressRing percent={summary.completionPercent} size={68} stroke={7} />
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#7d7b7b]">Tiến độ chăm sóc</p>
                  <p className="text-[24px] font-bold text-client-secondary font-secondary">{summary.doneCareItems}/{summary.totalCareItems}</p>
                </div>
              </div>
            </div>
            <div className="mt-[30px] flex flex-wrap gap-[15px]">
              <span className="px-[15px] py-[10px] rounded-[12px] text-[14px] font-bold bg-[#f8f9fa] text-[#495057] border border-[#e9ecef] shadow-sm">Tổng Chuồng: {summary.totalCages}</span>
              <span className="px-[15px] py-[10px] rounded-[12px] text-[14px] font-bold bg-client-primary/10 text-client-primary border border-client-primary/20 shadow-sm">Lịch ăn: {summary.totalFeeding}</span>
              <span className="px-[15px] py-[10px] rounded-[12px] text-[14px] font-bold bg-[#e7f5ff] text-[#228be6] border border-[#d0ebff] shadow-sm">Vận động: {summary.totalExercise}</span>
              <span className="px-[15px] py-[10px] rounded-[12px] text-[14px] font-bold bg-[#ebfbee] text-[#40c057] border border-[#d3f9d8] shadow-sm">Hoàn thành: {summary.doneCareItems}</span>
            </div>
          </div>

          {waitingPaymentCount > 0 && (
            <div className="mt-[20px] rounded-[12px] border border-[#ffecb2] bg-[#fff9db] px-[20px] py-[12px] text-[14px] text-[#a67c00] font-medium shadow-sm">
              Có {waitingPaymentCount} lịch khách sạn chưa đủ điều kiện hiển thị (thường do chưa thanh toán hoặc chưa xác nhận).
            </div>
          )}

          <div className="mt-[25px] rounded-[24px] bg-white p-[25px] shadow-[0px_8px_24px_#959da51a] border border-[#eee]">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-[20px] items-end xl:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-[8px]">
                <label className="text-[14px] font-bold text-client-secondary block">Lọc theo chuồng</label>
                <select
                  value={selectedCageId}
                  onChange={(e) => setSelectedCageId(e.target.value)}
                  className="w-full rounded-[14px] border border-[#eee] bg-[#f8f9fa] px-[15px] py-[12px] text-[15px] font-medium text-client-secondary focus:border-client-primary outline-none transition-all shadow-inner"
                >
                  <option value="all">Tất cả chuồng ({summary.totalCages})</option>
                  {filterOptions.cageOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-[8px]">
                <label className="text-[14px] font-bold text-client-secondary block">Lọc theo thú cưng</label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full rounded-[14px] border border-[#eee] bg-[#f8f9fa] px-[15px] py-[12px] text-[15px] font-medium text-client-secondary focus:border-client-primary outline-none transition-all shadow-inner"
                >
                  <option value="all">Tất cả thú cưng</option>
                  {filterOptions.petOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="self-end pb-[2px]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCageId("all");
                    setSelectedPetId("all");
                  }}
                  disabled={!isFiltered}
                  className="h-[48px] rounded-[14px] border border-[#eee] px-[25px] text-[15px] font-bold text-client-secondary disabled:cursor-not-allowed disabled:opacity-40 hover:bg-client-primary hover:text-white hover:border-client-primary transition-all shadow-sm active:scale-[0.98]"
                >
                  Bỏ lọc
                </button>
              </div>
            </div>

            <div className="mt-[25px] pt-[20px] border-t border-[#eee] flex items-center justify-between gap-[10px] md:flex-col md:items-start">
              <p className="text-[14px] text-[#7d7b7b]">
                Đang hiển thị <span className="font-bold text-client-secondary">{filteredCages.length}</span> / {cages.length} chuồng
              </p>
              <div className="inline-flex rounded-[12px] border border-[#eee] bg-[#f9f9f9] p-[5px] shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveCareTab("feeding")}
                  className={`rounded-[10px] px-[20px] py-[8px] text-[14px] font-bold transition-all ${activeCareTab === "feeding" ? "bg-client-primary text-white shadow-md shadow-client-primary/30" : "text-[#7d7b7b] hover:bg-white hover:text-client-secondary"
                    }`}
                >
                  Lịch ăn
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCareTab("exercise")}
                  className={`rounded-[10px] px-[20px] py-[8px] text-[14px] font-bold transition-all ${activeCareTab === "exercise" ? "bg-client-primary text-white shadow-md shadow-client-primary/30" : "text-[#7d7b7b] hover:bg-white hover:text-client-secondary"
                    }`}
                >
                  Lịch vận động
                </button>
              </div>
            </div>
          </div>

          <div className="mt-[25px]">
            {loading ? (
              <div className="rounded-[20px] bg-white p-[50px] text-center shadow-[0px_8px_24px_#959da533]">
                <p className="text-[16px] text-[#7d7b7b] italic font-medium">Đang tải dữ liệu chuồng thú cưng...</p>
              </div>
            ) : filteredCages.length === 0 ? (
              <div className="rounded-[20px] bg-white p-[50px] text-center shadow-[0px_8px_24px_#959da533]">
                <p className="text-[16px] text-[#7d7b7b] italic font-medium">Bạn chưa có lịch khách sạn nào phù hợp.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-[30px] xl:grid-cols-1">
                {filteredCages.map((cage: any) => {
                  const currentPetId = cage.pet?._id;
                  const feedingSchedule = filterCareSchedule(cage?.lastBooking?.feedingSchedule, currentPetId).sort(sortCareItems);
                  const exerciseSchedule = filterCareSchedule(cage?.lastBooking?.exerciseSchedule, currentPetId).sort(sortCareItems);
                  const boardingStatusMeta = getBoardingStatusMeta(cage?.lastBooking?.boardingStatus);
                  const careProgress = getCareProgress(feedingSchedule, exerciseSchedule);

                  return (
                    <article
                      key={cage._id}
                      role="button"
                      onClick={() => setSelectedCageDetail(cage)}
                      className="rounded-[20px] bg-white overflow-hidden shadow-[0px_8px_24px_#959da533] hover:translate-y-[-5px] transition-all duration-300 cursor-pointer group border border-transparent hover:border-client-primary/20"
                    >
                      <div className="relative h-[200px] bg-gray-100">
                        {cage.avatar ? (
                          <img src={cage.avatar} alt={cage.displayCode || cage.cageCode} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[14px] text-gray-400">Không có hình</div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-[80px] bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-[15px] left-[15px] px-[12px] py-[6px] rounded-full text-[12px] font-bold bg-white/95 text-client-secondary shadow-sm">
                          {(cage.type || "").toUpperCase() || "STANDARD"}
                        </div>
                        <div className={`absolute top-[15px] right-[15px] px-[12px] py-[6px] rounded-full text-[12px] font-bold shadow-sm ${boardingStatusMeta.className}`}>
                          {boardingStatusMeta.label}
                        </div>
                        <div className="absolute left-[15px] bottom-[15px] text-white">
                          <div className="text-[22px] font-secondary font-bold tracking-wide">{cage.displayCode || cage.cageCode || "CHUỒNG"}</div>
                          <div className="text-[14px] opacity-90 font-medium">{SIZE_LABELS[String(cage.size || "")] || cage.size || "-"}</div>
                        </div>
                      </div>

                      <div className="p-[25px]">
                        <div className="flex items-start justify-between gap-[15px]">
                          <div>
                            <div className="text-[14px] text-[#7d7b7b] line-clamp-1">
                              {Array.isArray(cage.pets) && cage.pets.length > 0
                                ? `Thú cưng: ${cage.pets.map((pet: any) => getPetLabel(pet)).filter(Boolean).join(", ")}`
                                : "Thú cưng: chưa cập nhật"}
                            </div>
                            {cage.slotCount > 1 && (
                              <div className="mt-[5px] text-[13px] font-bold text-client-secondary"> Khu lưu trú: {cage.slotLabel}</div>
                            )}
                            <div className="mt-[15px] flex items-center gap-[12px]">
                              <ProgressRing percent={careProgress.percent} size={56} stroke={6} />
                              <div>
                                <div className="text-[13px] font-bold text-client-secondary">Tiến độ chăm sóc</div>
                                <div className="text-[12px] text-[#7d7b7b] font-medium">{careProgress.done}/{careProgress.total} mục hoàn thành</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-[16px] font-secondary font-bold text-client-primary bg-client-primary/5 px-3 py-1.5 rounded-lg border border-client-primary/10">
                            {Number(cage.dailyPrice || 0).toLocaleString("vi-VN")}đ
                          </div>
                        </div>

                        <div className="mt-[20px] pt-[20px] border-t border-[#eee] space-y-[8px]">
                          {cage.lastBooking?.checkInDate && (
                            <div className="flex items-center gap-2 text-[13px] text-client-secondary">
                              <CalendarDays className="w-4 h-4 text-client-primary" />
                              <span className="font-medium text-[#7d7b7b]">Lưu trú:</span>
                              <span className="font-bold">{dayjs(cage.lastBooking.checkInDate).format("DD/MM/YYYY")} - {dayjs(cage.lastBooking.checkOutDate).format("DD/MM/YYYY")}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[13px] text-client-secondary">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-[#7d7b7b]">Thanh toán:</span>
                            <span className="font-bold text-client-primary">{getBoardingPaymentLabel(cage.lastBooking)}</span>
                          </div>
                        </div>

                        {activeCareTab === "feeding" ? (
                          <div className="mt-[20px] rounded-[15px] bg-[#f9f9f9] border border-[#eee] p-[15px]">
                            <div className="mb-[10px] flex items-center justify-between">
                              <p className="text-[14px] font-bold text-client-secondary">Lịch ăn uống</p>
                              <span className="text-[12px] text-client-primary font-bold px-2 py-0.5 bg-client-primary/10 rounded-full">{feedingSchedule.length} mục</span>
                            </div>
                            {feedingSchedule.length > 0 ? (
                              <div className="space-y-[8px]">
                                {feedingSchedule.slice(0, 3).map((item: any, idx: number) => {
                                  const statusMeta = getCareStatusMeta(item?.status);
                                  return (
                                    <div key={`feed-${idx}`} className="rounded-[12px] bg-white border border-[#eee] p-[12px] shadow-sm">
                                      <div className="flex justify-between items-center mb-[5px]">
                                        <span className="font-bold text-client-secondary text-[13px]">{item?.time || "--:--"}</span>
                                        <span className={`px-[8px] py-[3px] rounded-full text-[10px] font-bold ${statusMeta.className}`}>{statusMeta.label}</span>
                                      </div>
                                      <p className="text-[13px] text-[#505050] font-medium">{item?.food || "Thức ăn"} {item?.amount ? `(${item.amount})` : ""}</p>
                                      {(item?.staffName || item?.staffId?.fullName) && (
                                        <div className="mt-[5px] text-[11px] text-[#7d7b7b] italic font-medium">Người thực hiện: {item?.staffName || item?.staffId?.fullName}</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[13px] text-[#7d7b7b] italic text-center py-2">Chưa có lịch ăn uống.</p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-[20px] rounded-[15px] bg-[#f0f7ff] border border-[#dbeafe] p-[15px]">
                            <div className="mb-[10px] flex items-center justify-between">
                              <p className="text-[14px] font-bold text-[#0f172a]">Lịch vận động</p>
                              <span className="text-[12px] text-blue-600 font-bold px-2 py-0.5 bg-blue-100 rounded-full">{exerciseSchedule.length} mục</span>
                            </div>
                            {exerciseSchedule.length > 0 ? (
                              <div className="space-y-[8px]">
                                {exerciseSchedule.slice(0, 3).map((item: any, idx: number) => {
                                  const statusMeta = getCareStatusMeta(item?.status);
                                  return (
                                    <div key={`exercise-${idx}`} className="rounded-[12px] bg-white border border-[#dbeafe] p-[12px] shadow-sm">
                                      <div className="flex justify-between items-center mb-[5px]">
                                        <span className="font-bold text-[#0f172a] text-[13px]">{item?.time || "--:--"}</span>
                                        <span className={`px-[8px] py-[3px] rounded-full text-[10px] font-bold ${statusMeta.className}`}>{statusMeta.label}</span>
                                      </div>
                                      <p className="text-[13px] text-[#505050] font-medium">{item?.activity || "Vận động"}{item?.durationMinutes ? ` (${item.durationMinutes} phút)` : ""}</p>
                                      {(item?.staffName || item?.staffId?.fullName) && (
                                        <div className="mt-[5px] text-[11px] text-[#7d7b7b] italic font-medium">Người thực hiện: {item?.staffName || item?.staffId?.fullName}</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[13px] text-[#7d7b7b] italic text-center py-2">Chưa có lịch vận động.</p>
                            )}
                          </div>
                        )}

                        <div className="mt-[20px]">
                          <Link
                            to={`/hotels/${cage?.sourceCageId || cage?._id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="w-full flex items-center justify-center gap-[8px] rounded-[12px] border border-client-primary text-client-primary bg-white py-[10px] text-[14px] font-bold hover:bg-client-primary hover:text-white transition-all shadow-sm active:scale-[0.98]"
                          >
                            Xem chi tiết chuồng
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCageDetail ? (
        <CageCareDetailModal
          cage={selectedCageDetail}
          onClose={() => setSelectedCageDetail(null)}
        />
      ) : null}
    </>
  );
};
