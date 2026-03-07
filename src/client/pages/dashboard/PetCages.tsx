import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BedDouble,
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

const normalizeStatus = (value?: string) => String(value || "").toLowerCase().replace(/_/g, "-");
const normalizeTime = (value?: string) => String(value || "").trim();

const SIZE_LABELS: Record<string, string> = {
  S: "S (duoi 8kg)",
  M: "M (8-15kg)",
  L: "L (15-20kg)",
  XL_XXL: "XL/XXL (tren 20kg)",
  C: "S",
  B: "M",
  A: "L",
  XL: "XL/XXL",
};

const CARE_STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Chưa thực hiện", className: "bg-amber-100 text-amber-700" },
  done: { label: "Đã hoàn thành", className: "bg-emerald-100 text-emerald-700" },
  skipped: { label: "Bỏ qua", className: "bg-slate-200 text-slate-700" },
};

const BOARDING_STATUS_META: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700" },
  "checked-in": { label: "Đang lưu trú", className: "bg-violet-100 text-violet-700" },
  "checked-out": { label: "Đã trả chuồng", className: "bg-emerald-100 text-emerald-700" },
  held: { label: "Đang giữ chỗ", className: "bg-orange-100 text-orange-700" },
  pending: { label: "Chờ xử lý", className: "bg-slate-200 text-slate-700" },
  cancelled: { label: "Đã hủy", className: "bg-rose-100 text-rose-700" },
};

const isBookingEligibleForPetCages = (booking: any) => {
  const status = normalizeStatus(booking?.boardingStatus || booking?.status || booking?.bookingStatus);
  const paymentMethod = String(booking?.paymentMethod || "").toLowerCase();
  const paymentStatus = normalizeStatus(booking?.paymentStatus || "unpaid");

  const allowedStatuses = new Set(["confirmed", "checked-in", "checked-out"]);
  if (!allowedStatuses.has(status)) return false;

  if (paymentMethod === "prepaid") return paymentStatus === "paid";
  return true;
};

const sortCareItems = (a: any, b: any) => normalizeTime(a?.time).localeCompare(normalizeTime(b?.time));

const getCareStatusMeta = (status?: string) => CARE_STATUS_META[String(status || "pending")] || CARE_STATUS_META.pending;

const getBoardingStatusMeta = (status?: string) => {
  const key = normalizeStatus(status);
  return BOARDING_STATUS_META[key] || { label: status || "Không rõ", className: "bg-slate-200 text-slate-700" };
};

const getPetKey = (pet: any) => String(pet?._id || pet?.id || pet?.petId || pet?.name || "").trim();
const getPetLabel = (pet: any) => String(pet?.name || pet?.petName || pet?.code || "Thú cưng").trim();
const normalizeProofMedia = (items: any) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item: any) => ({
      url: String(item?.url || item || "").trim(),
      kind: String(item?.kind || "").toLowerCase() === "video" ? "video" : "image",
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
                className={`relative h-[78px] w-[78px] overflow-hidden rounded-[14px] border transition duration-300 ${
                  mediaIndex === index ? "border-[#fb7185]" : "border-white/10 opacity-70 hover:opacity-100"
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
    <div className="rounded-[18px] border border-[#eef2f7] bg-white px-[14px] py-[12px] shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-[10px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-[8px]">
            <span className="inline-flex items-center gap-[6px] rounded-full bg-[#fff4f1] px-[10px] py-[4px] text-[12px] font-[800] text-[#f97316]">
              <Clock3 className="h-[13px] w-[13px]" />
              {item?.time || "--:--"}
            </span>
            <span className={`inline-flex rounded-full px-[10px] py-[4px] text-[11px] font-[800] ${statusMeta.className}`}>
              {statusMeta.label}
            </span>
          </div>
          <p className="mt-[10px] text-[15px] font-[800] text-client-secondary">
            {type === "feeding" ? item?.food || "Khẩu phần ăn" : item?.activity || "Hoạt động"}
          </p>
          <p className="mt-[4px] text-[13px] leading-[1.7] text-[#64748b]">
            {type === "feeding"
              ? `Khẩu phần: ${item?.amount || "Đang cập nhật"}`
              : `Thời lượng: ${item?.durationMinutes || 0} phút`}
          </p>
          {item?.staffName || item?.staffId?.fullName ? (
            <p className="mt-[4px] text-[12px] text-[#94a3b8]">
              NVKS: {item?.staffName || item?.staffId?.fullName}
            </p>
          ) : null}
          {item?.note ? (
            <p className="mt-[6px] text-[12px] leading-[1.65] text-[#94a3b8]">{item.note}</p>
          ) : null}

          {proofMedia.length > 0 ? (
            <div className="mt-[10px]">
              <div className="mb-[8px] flex items-center justify-between gap-[10px]">
                <p className="text-[11px] font-[800] uppercase tracking-[0.16em] text-[#94a3b8]">
                  Minh chứng thực hiện
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onOpenGallery?.(
                      proofMedia,
                      0,
                      `${type === "feeding" ? "Gallery lịch ăn" : "Gallery lịch vận động"}`
                    )
                  }
                  className="inline-flex items-center gap-[5px] rounded-full border border-[#e2e8f0] bg-white px-[8px] py-[4px] text-[11px] font-[800] text-client-secondary transition duration-300 hover:border-[#fb7185] hover:text-[#fb7185]"
                >
                  <Expand className="h-[11px] w-[11px]" />
                  Xem gallery
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
          ) : null}
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

  const feedingSchedule = Array.isArray(cage?.lastBooking?.feedingSchedule)
    ? [...cage.lastBooking.feedingSchedule].sort(sortCareItems)
    : [];
  const exerciseSchedule = Array.isArray(cage?.lastBooking?.exerciseSchedule)
    ? [...cage.lastBooking.exerciseSchedule].sort(sortCareItems)
    : [];
  const careProgress = getCareProgress(feedingSchedule, exerciseSchedule);
  const primaryPet = Array.isArray(cage?.pets) && cage.pets.length > 0 ? cage.pets[0] : null;
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
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#0f172a]/55 px-[18px] py-[28px] backdrop-blur-[3px]">
      <div className="mx-auto w-full max-w-[1180px] rounded-[32px] bg-[#f8fafc] p-[22px] shadow-[0_28px_90px_rgba(15,23,42,0.28)] xl:max-w-[980px] lg:p-[16px]">
        <div className="flex items-center justify-between gap-[14px] border-b border-[#e2e8f0] pb-[18px]">
          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[16px] border border-[#e2e8f0] bg-white text-client-secondary transition duration-300 hover:border-client-primary hover:text-client-primary"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
            </button>
            <div>
              <h3 className="text-[30px] font-[800] leading-tight text-client-secondary">Lịch chăm sóc chi tiết</h3>
              <p className="mt-[4px] text-[13px] text-[#64748b]">
                Chuồng {cage?.cageCode || "CHUỒNG"} • {dayjs().format("DD/MM/YYYY")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border border-[#e2e8f0] bg-white text-[#64748b] transition duration-300 hover:border-[#fda4af] hover:text-[#fb7185]"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="mt-[18px] rounded-[28px] border border-[#e7edf3] bg-white p-[20px] shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-[18px] lg:flex-col lg:items-start">
            <div className="flex min-w-0 items-center gap-[18px]">
              <div className="h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[24px] bg-[#fff7ed]">
                {primaryPet?.avatar || cage?.avatar ? (
                  <img
                    src={primaryPet?.avatar || cage?.avatar}
                    alt={primaryPet?.name || cage?.cageCode}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[12px] text-[#94a3b8]">Không có ảnh</div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-[8px]">
                  <h4 className="text-[30px] font-[800] leading-tight text-client-secondary">
                    {primaryPet?.name || cage?.cageCode || "Thú cưng"}
                  </h4>
                  {primaryPet?.breed ? (
                    <span className="rounded-full bg-[#fff2e8] px-[10px] py-[4px] text-[11px] font-[800] text-[#f97316]">
                      {primaryPet.breed}
                    </span>
                  ) : null}
                  <span className={`rounded-full px-[10px] py-[4px] text-[11px] font-[800] ${boardingStatusMeta.className}`}>
                    {boardingStatusMeta.label}
                  </span>
                </div>
                <p className="mt-[8px] text-[15px] text-[#64748b]">{petMeta || "Chưa có hồ sơ thú cưng chi tiết"}</p>
                <div className="mt-[10px] flex flex-wrap gap-[8px] text-[12px] font-[700] text-[#64748b]">
                  <span className="rounded-full bg-[#f8fafc] px-[10px] py-[6px]">{SIZE_LABELS[String(cage?.size || "")] || cage?.size || "Kích thước chưa rõ"}</span>
                  <span className="rounded-full bg-[#f8fafc] px-[10px] py-[6px]">{Array.isArray(cage?.pets) ? cage.pets.length : 0} thú cưng</span>
                  <span className="rounded-full bg-[#f8fafc] px-[10px] py-[6px]">
                    {cage?.lastBooking?.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[360px] rounded-[24px] bg-[#fff8f1] px-[18px] py-[16px] lg:max-w-full">
              <div className="flex items-center justify-between gap-[12px]">
                <div>
                  <p className="text-[12px] font-[800] uppercase tracking-[0.18em] text-[#94a3b8]">Tiến độ hôm nay</p>
                  <p className="mt-[8px] text-[28px] font-[800] text-[#f97316]">{careProgress.percent}%</p>
                </div>
                <ProgressRing percent={careProgress.percent} size={82} stroke={8} />
              </div>
              <div className="mt-[14px] h-[10px] overflow-hidden rounded-full bg-[#e2e8f0]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,_#f97316_0%,_#fb923c_100%)]"
                  style={{ width: `${careProgress.percent}%` }}
                />
              </div>
              <p className="mt-[8px] text-right text-[12px] text-[#94a3b8]">
                {careProgress.done}/{careProgress.total} nhiệm vụ hoàn thành
              </p>
            </div>
          </div>
        </div>

        <div className="mt-[18px] grid grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] gap-[18px] xl:grid-cols-1">
          <section className="rounded-[28px] border border-[#e7edf3] bg-white p-[20px] shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-[12px]">
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[16px] bg-[#fff3e9] text-[#f97316]">
                <UtensilsCrossed className="h-[22px] w-[22px]" />
              </div>
              <div>
                <h4 className="text-[24px] font-[800] text-client-secondary">Lịch ăn</h4>
                <p className="text-[13px] text-[#64748b]">{feedingSchedule.length} mục chăm sóc dinh dưỡng</p>
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

          <section className="rounded-[28px] border border-[#e7edf3] bg-white p-[20px] shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-[12px]">
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[16px] bg-[#ecfeff] text-[#0891b2]">
                <CalendarDays className="h-[22px] w-[22px]" />
              </div>
              <div>
                <h4 className="text-[24px] font-[800] text-client-secondary">Thông tin lưu trú</h4>
                <p className="text-[13px] text-[#64748b]">Tổng quan lưu trú và ghi chú chăm sóc</p>
              </div>
            </div>

            <div className="mt-[16px] space-y-[12px]">
              <div className="rounded-[20px] bg-[#f8fbff] p-[16px]">
                <p className="text-[12px] font-[800] uppercase tracking-[0.18em] text-[#94a3b8]">Nhận / trả chuồng</p>
                <p className="mt-[10px] text-[16px] font-[800] text-client-secondary">
                  {cage?.lastBooking?.checkInDate
                    ? `${dayjs(cage.lastBooking.checkInDate).format("DD/MM/YYYY")} - ${dayjs(cage.lastBooking.checkOutDate).format("DD/MM/YYYY")}`
                    : "Chưa cập nhật"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-[12px] lg:grid-cols-1">
                <div className="rounded-[20px] border border-[#eef2f7] bg-[#fcfdff] p-[16px]">
                  <p className="text-[12px] font-[800] uppercase tracking-[0.18em] text-[#94a3b8]">Giá / ngày</p>
                  <p className="mt-[8px] text-[20px] font-[800] text-[#fb7185]">
                    {Number(cage?.dailyPrice || 0).toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div className="rounded-[20px] border border-[#eef2f7] bg-[#fcfdff] p-[16px]">
                  <p className="text-[12px] font-[800] uppercase tracking-[0.18em] text-[#94a3b8]">Tiện nghi</p>
                  <p className="mt-[8px] text-[20px] font-[800] text-client-secondary">
                    {Array.isArray(cage?.amenities) ? cage.amenities.length : 0}
                  </p>
                </div>
              </div>

              <div className="rounded-[20px] border border-[#eef2f7] bg-white p-[16px]">
                <div className="flex items-center gap-[8px]">
                  <ShieldCheck className="h-[18px] w-[18px] text-emerald-500" />
                  <p className="text-[14px] font-[800] text-client-secondary">Ghi chú chăm sóc</p>
                </div>
                <p className="mt-[10px] text-[14px] leading-[1.75] text-[#64748b]">
                  {cage?.lastBooking?.specialCare || cage?.lastBooking?.notes || primaryPet?.notes || "Chưa có ghi chú chăm sóc đặc biệt."}
                </p>
              </div>

              <div className="rounded-[20px] border border-dashed border-[#d7e3f4] bg-[#f8fbff] p-[16px]">
                <div className="flex items-center gap-[8px]">
                  <BedDouble className="h-[18px] w-[18px] text-[#3b82f6]" />
                  <p className="text-[14px] font-[800] text-client-secondary">Thú cưng đang lưu trú</p>
                </div>
                <div className="mt-[10px] flex flex-wrap gap-[8px]">
                  {Array.isArray(cage?.pets) && cage.pets.length > 0 ? (
                    cage.pets.map((pet: any) => (
                      <span
                        key={getPetKey(pet)}
                        className="inline-flex items-center gap-[6px] rounded-full bg-white px-[10px] py-[6px] text-[12px] font-[700] text-[#475569]"
                      >
                        <PawPrint className="h-[13px] w-[13px] text-[#fb7185]" />
                        {getPetLabel(pet)}
                      </span>
                    ))
                  ) : (
                    <span className="text-[13px] text-[#94a3b8]">Chưa cập nhật thú cưng</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-[18px] rounded-[28px] border border-[#e7edf3] bg-white p-[20px] shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-[12px] lg:flex-col lg:items-start">
            <div className="flex items-center gap-[12px]">
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[16px] bg-[#ecfdf5] text-[#059669]">
                <Activity className="h-[22px] w-[22px]" />
              </div>
              <div>
                <h4 className="text-[24px] font-[800] text-client-secondary">Vận động</h4>
                <p className="text-[13px] text-[#64748b]">Chi tiết các hoạt động đã lên lịch</p>
              </div>
            </div>
            <span className="rounded-full bg-[#f8fafc] px-[12px] py-[7px] text-[12px] font-[800] text-[#64748b]">
              Tổng: {totalExerciseMinutes} phút
            </span>
          </div>

          <div className="mt-[16px] grid grid-cols-2 gap-[14px] xl:grid-cols-1">
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
              <div className="col-span-full rounded-[18px] border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-[16px] py-[18px] text-[14px] text-[#94a3b8]">
                Chưa có lịch vận động cho ngày này.
              </div>
            )}
          </div>
        </section>

        <div className="mt-[20px] flex justify-end gap-[12px]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-[16px] border border-[#f0b78b] bg-white px-[18px] py-[12px] text-[14px] font-[800] text-[#f97316] transition duration-300 hover:bg-[#fff7ed]"
          >
            Đóng
          </button>
          <Link
            to={`/hotels/${cage?._id}`}
            className="inline-flex items-center justify-center rounded-[16px] bg-[#f97316] px-[18px] py-[12px] text-[14px] font-[800] text-white shadow-[0_18px_35px_rgba(249,115,22,0.24)] transition duration-300 hover:bg-[#ea580c]"
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
    { label: "Trang chu", to: "/" },
    { label: "Tai khoan", to: "/dashboard/profile" },
    { label: "Chuong thu cung", to: "/dashboard/pet-cages" },
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

        const cageMap = new Map<string, any>();
        details.forEach((detail: any) => {
          if (!detail?.cage || !detail?.booking) return;
          const cage = detail.cage;
          const booking = detail.booking;

          if (!cageMap.has(cage._id)) {
            cageMap.set(cage._id, {
              ...cage,
              lastBooking: booking,
              pets: Array.isArray(detail?.pets) ? detail.pets : [],
            });
          }
        });

        setCages(Array.from(cageMap.values()));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterOptions = useMemo(() => {
    const cageOptions = cages.map((cage: any) => ({
      id: cage._id,
      label: `${cage.cageCode || "Chuong"} - ${SIZE_LABELS[String(cage.size || "")] || cage.size || "-"}`,
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
    const totalFeeding = filteredCages.reduce(
      (sum, cage) => sum + (Array.isArray(cage?.lastBooking?.feedingSchedule) ? cage.lastBooking.feedingSchedule.length : 0),
      0
    );
    const totalExercise = filteredCages.reduce(
      (sum, cage) => sum + (Array.isArray(cage?.lastBooking?.exerciseSchedule) ? cage.lastBooking.exerciseSchedule.length : 0),
      0
    );
    const doneFeeding = filteredCages.reduce((sum, cage) => {
      const list = Array.isArray(cage?.lastBooking?.feedingSchedule) ? cage.lastBooking.feedingSchedule : [];
      return sum + list.filter((item: any) => normalizeStatus(item?.status) === "done").length;
    }, 0);
    const doneExercise = filteredCages.reduce((sum, cage) => {
      const list = Array.isArray(cage?.lastBooking?.exerciseSchedule) ? cage.lastBooking.exerciseSchedule : [];
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
        pageTitle="chuồng thú cưng"
        breadcrumbs={breadcrumbs}
        url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
        className="bg-top"
      />

      <div className="mt-[-150px] mb-[100px] app-container">
        <div className="flex items-start gap-[20px] lg:flex-col">
          <div className="sticky top-[120px] w-[320px] shrink-0 px-[12px] xl:w-[300px] lg:static lg:w-full">
            <Sidebar />
          </div>

          <div className="min-w-0 flex-1 px-[12px] py-[40px]">
            <div className="rounded-[16px] border border-[#f3d9bd] bg-gradient-to-r from-[#fff8ef] via-[#fffdf9] to-[#f8fbff] p-[20px] shadow-[0_10px_30px_rgba(149,157,165,0.2)] ">
              <div className="flex items-center justify-between gap-[12px] md:flex-col md:items-start">
                <div>
                  <h3 className="text-[28px] leading-tight font-[700] text-client-secondary">Chuồng thú cưng của bạn</h3>
                  <p className="text-[14px] text-[#6b7280] mt-[4px]">Theo dõi thông tin chuồng và tiến độ chăm sóc trong ngày.</p>
                </div>
                <div className="flex items-center gap-[12px] rounded-[12px] border border-[#e2e8f0] bg-white/80 px-[12px] py-[8px]">
                  <ProgressRing percent={summary.completionPercent} size={68} stroke={7} />
                  <div>
                    <p className="text-[12px] font-[700] uppercase tracking-[0.4px] text-[#64748b]">Tiến độ chăm sóc</p>
                    <p className="text-[20px] font-[800] text-client-secondary">{summary.doneCareItems}/{summary.totalCareItems}</p>
                  </div>
                </div>
              </div>
              <div className="mt-[14px] flex flex-wrap gap-[8px]">
                <span className="px-[10px] py-[6px] rounded-full text-[12px] font-[700] bg-slate-100 text-slate-700">Tổng Chuồng: {summary.totalCages}</span>
                <span className="px-[10px] py-[6px] rounded-full text-[12px] font-[700] bg-amber-100 text-amber-700">Lịch ăn: {summary.totalFeeding}</span>
                <span className="px-[10px] py-[6px] rounded-full text-[12px] font-[700] bg-cyan-100 text-cyan-700">Lịch vận động: {summary.totalExercise}</span>
                <span className="px-[10px] py-[6px] rounded-full text-[12px] font-[700] bg-emerald-100 text-emerald-700">Đã hoàn thành: {summary.doneCareItems}</span>
              </div>
            </div>

            {waitingPaymentCount > 0 && (
              <div className="mt-[14px] rounded-[12px] border border-[#fde68a] bg-[#fffbeb] px-[14px] py-[10px] text-[13px] text-[#92400e]">
                Có {waitingPaymentCount} lịch khách sạn chưa đủ điều kiện hiển thị (thường do chưa thanh toán hoặc chưa xác nhận).
              </div>
            )}

            <div className="mt-[14px] rounded-[16px] border border-[#e2e8f0] bg-white p-[16px] shadow-[0_6px_20px_rgba(15,23,42,0.08)]">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-[12px] xl:grid-cols-2 lg:grid-cols-1">
                <label className="text-[12px] font-[700] text-[#64748b]">
                  Loc theo chuong
                  <select
                    value={selectedCageId}
                    onChange={(e) => setSelectedCageId(e.target.value)}
                    className="mt-[6px] h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-[10px] text-[14px] text-[#0f172a] outline-none focus:border-client-primary"
                  >
                    <option value="all">Tất cả Chuồng</option>
                    {filterOptions.cageOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-[12px] font-[700] text-[#64748b]">
                  Loc theo thu cung
                  <select
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    className="mt-[6px] h-[42px] w-full rounded-[10px] border border-[#d1d5db] px-[10px] text-[14px] text-[#0f172a] outline-none focus:border-client-primary"
                  >
                    <option value="all">Tất cả thú cưng</option>
                    {filterOptions.petOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="self-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCageId("all");
                      setSelectedPetId("all");
                    }}
                    disabled={!isFiltered}
                    className="h-[42px] rounded-[10px] border border-[#d1d5db] px-[14px] text-[13px] font-[700] text-[#334155] disabled:cursor-not-allowed disabled:opacity-60 hover:border-client-primary hover:text-client-primary transition-default"
                  >
                    Bộ lọc
                  </button>
                </div>
              </div>

              <div className="mt-[12px] flex items-center justify-between gap-[10px] md:flex-col md:items-start">
                <p className="text-[13px] text-[#64748b]">
                  Đang hiển thị {filteredCages.length}/{cages.length} chuồng
                </p>
                <div className="inline-flex rounded-[10px] border border-[#dbeafe] bg-[#f8fbff] p-[3px]">
                  <button
                    type="button"
                    onClick={() => setActiveCareTab("feeding")}
                    className={`rounded-[8px] px-[14px] py-[6px] text-[13px] font-[700] transition-default ${
                      activeCareTab === "feeding" ? "bg-client-primary text-white" : "text-[#0f172a] hover:bg-[#e2e8f0]"
                    }`}
                  >
                    Lịch ăn
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCareTab("exercise")}
                    className={`rounded-[8px] px-[14px] py-[6px] text-[13px] font-[700] transition-default ${
                      activeCareTab === "exercise" ? "bg-client-primary text-white" : "text-[#0f172a] hover:bg-[#e2e8f0]"
                    }`}
                  >
                    Lịch vận động
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-[14px] rounded-[16px] bg-white p-[20px] shadow-[0_8px_24px_#959da533]">
              {loading ? (
                <p className="text-[14px] text-[#6b7280]">Đang tải dữ liệu...</p>
              ) : filteredCages.length === 0 ? (
                <p className="text-[14px] text-[#6b7280]">Bạn chưa có lịch khách sạn nào.</p>
              ) : (
                <div className="grid grid-cols-2 gap-[16px] xl:grid-cols-1">
                  {filteredCages.map((cage: any) => {
                    const feedingSchedule = Array.isArray(cage?.lastBooking?.feedingSchedule)
                      ? [...cage.lastBooking.feedingSchedule].sort(sortCareItems)
                      : [];
                    const exerciseSchedule = Array.isArray(cage?.lastBooking?.exerciseSchedule)
                      ? [...cage.lastBooking.exerciseSchedule].sort(sortCareItems)
                      : [];
                    const boardingStatusMeta = getBoardingStatusMeta(cage?.lastBooking?.boardingStatus);
                    const careProgress = getCareProgress(feedingSchedule, exerciseSchedule);

                    return (
                      <article
                        key={cage._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCageDetail(cage)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedCageDetail(cage);
                          }
                        }}
                        className="rounded-[14px] border border-[#ebecef] bg-white overflow-hidden shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-all duration-300 cursor-pointer"
                      >
                        <div className="relative h-[168px] bg-[#f3f4f6]">
                          {cage.avatar ? (
                            <img src={cage.avatar} alt={cage.cageCode} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[12px] text-[#9ca3af]">Không có hình</div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 h-[68px] bg-gradient-to-t from-black/45 to-transparent" />
                          <div className="absolute top-[10px] left-[10px] px-[10px] py-[5px] rounded-full text-[11px] font-[700] bg-white/90 text-[#0f172a]">
                            {(cage.type || "").toUpperCase() || "STANDARD"}
                          </div>
                          <div className={`absolute top-[10px] right-[10px] px-[10px] py-[5px] rounded-full text-[11px] font-[700] ${boardingStatusMeta.className}`}>
                            {boardingStatusMeta.label}
                          </div>
                          <div className="absolute left-[12px] bottom-[10px] text-white">
                            <div className="text-[18px] font-[800] tracking-[0.4px]">{cage.cageCode || "CHUONG"}</div>
                            <div className="text-[12px] opacity-90">{SIZE_LABELS[String(cage.size || "")] || cage.size || "-"}</div>
                          </div>
                        </div>

                        <div className="p-[14px]">
                          <div className="flex items-start justify-between gap-[10px]">
                            <div>
                              <div className="text-[13px] text-[#6b7280]">
                                {Array.isArray(cage.pets) && cage.pets.length > 0
                                  ? `Thu cung: ${cage.pets.map((pet: any) => getPetLabel(pet)).filter(Boolean).join(", ")}`
                                  : "Thu cung: Chua cap nhat"}
                              </div>
                              <div className="mt-[7px] flex items-center gap-[8px]">
                                <ProgressRing percent={careProgress.percent} size={52} stroke={6} />
                                <div>
                                  <div className="text-[12px] font-[700] text-client-secondary">Chăm sóc hôm nay</div>
                                  <div className="text-[12px] text-[#64748b]">{careProgress.done}/{careProgress.total} mục hoàn thành</div>
                                </div>
                              </div>
                            </div>
                            <div className="text-[14px] font-[800] text-client-primary">
                              {Number(cage.dailyPrice || 0).toLocaleString("vi-VN")}d/ngày
                            </div>
                          </div>

                          {cage.lastBooking?.checkInDate && (
                            <div className="mt-[6px] text-[13px] text-[#6b7280]">
                              Lưu trú: {dayjs(cage.lastBooking.checkInDate).format("DD/MM/YYYY")} - {dayjs(cage.lastBooking.checkOutDate).format("DD/MM/YYYY")}
                            </div>
                          )}

                          <div className="mt-[6px] text-[13px] text-[#6b7280]">
                            Thanh toán: {cage.lastBooking?.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                          </div>

                          {activeCareTab === "feeding" ? (
                            <div className="mt-[12px] rounded-[10px] border border-[#f3e8d5] bg-[#fffdf8] p-[10px]">
                              <div className="mb-[6px] flex items-center justify-between">
                                <p className="text-[13px] font-[700] text-client-secondary">Lịch ăn uống</p>
                                <span className="text-[11px] text-[#6b7280]">{feedingSchedule.length} mục</span>
                              </div>
                              {feedingSchedule.length > 0 ? (
                                <div className="space-y-[6px]">
                                  {feedingSchedule.slice(0, 4).map((item: any, idx: number) => {
                                    const statusMeta = getCareStatusMeta(item?.status);
                                    return (
                                      <div key={`feed-${idx}`} className="rounded-[8px] border border-[#f1f5f9] bg-white px-[8px] py-[7px] text-[12px] text-[#475569]">
                                        <div className="flex flex-wrap items-center gap-[6px]">
                                          <span className="font-[700] text-[#0f172a]">{item?.time || "--:--"}</span>
                                          <span>{item?.food || "Thuc an"} {item?.amount ? `(${item.amount})` : ""}</span>
                                          <span className={`px-[6px] py-[2px] rounded-full text-[10px] font-[700] ${statusMeta.className}`}>{statusMeta.label}</span>
                                        </div>
                                        {(item?.staffName || item?.staffId?.fullName) && (
                                          <div className="mt-[4px] text-[11px] text-[#64748b]">NVKS: {item?.staffName || item?.staffId?.fullName}</div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-[12px] text-[#9ca3af]">Chưa có lịch ăn.</p>
                              )}
                            </div>
                          ) : (
                            <div className="mt-[10px] rounded-[10px] border border-[#dbeafe] bg-[#f8fbff] p-[10px]">
                              <div className="mb-[6px] flex items-center justify-between">
                                <p className="text-[13px] font-[700] text-client-secondary">Lịch vận động</p>
                                <span className="text-[11px] text-[#6b7280]">{exerciseSchedule.length} mục</span>
                              </div>
                              {exerciseSchedule.length > 0 ? (
                                <div className="space-y-[6px]">
                                  {exerciseSchedule.slice(0, 4).map((item: any, idx: number) => {
                                    const statusMeta = getCareStatusMeta(item?.status);
                                    return (
                                      <div key={`exercise-${idx}`} className="rounded-[8px] border border-[#e2e8f0] bg-white px-[8px] py-[7px] text-[12px] text-[#475569]">
                                        <div className="flex flex-wrap items-center gap-[6px]">
                                          <span className="font-[700] text-[#0f172a]">{item?.time || "--:--"}</span>
                                          <span>{item?.activity || "Van dong"}{item?.durationMinutes ? ` (${item.durationMinutes} phut)` : ""}</span>
                                          <span className={`px-[6px] py-[2px] rounded-full text-[10px] font-[700] ${statusMeta.className}`}>{statusMeta.label}</span>
                                        </div>
                                        {(item?.staffName || item?.staffId?.fullName) && (
                                          <div className="mt-[4px] text-[11px] text-[#64748b]">NVKS: {item?.staffName || item?.staffId?.fullName}</div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-[12px] text-[#9ca3af]">Chưa có lịch vận động.</p>
                              )}
                            </div>
                          )}

                          <div className="mt-[12px]">
                            <Link
                              to={`/hotels/${cage._id}`}
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center gap-[6px] rounded-[8px] border border-[#d4d4d8] bg-white px-[12px] py-[6px] text-[12px] font-[700] text-[#334155] hover:border-client-primary hover:text-client-primary transition-default"
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
