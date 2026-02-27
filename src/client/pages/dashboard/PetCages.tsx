import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
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

export const PetCagesPage = () => {
  const [loading, setLoading] = useState(true);
  const [cages, setCages] = useState<any[]>([]);
  const [waitingPaymentCount, setWaitingPaymentCount] = useState(0);
  const [selectedCageId, setSelectedCageId] = useState("all");
  const [selectedPetId, setSelectedPetId] = useState("all");
  const [activeCareTab, setActiveCareTab] = useState<"feeding" | "exercise">("feeding");

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

  return (
    <>
      <ProductBanner
        pageTitle="chuồng thú cưng"
        breadcrumbs={breadcrumbs}
        url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
        className="bg-top"
      />

      <div className="mt-[-150px] mb-[100px] app-container">
        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-[20px] items-start">
          <div className="px-[12px]">
            <Sidebar />
          </div>

          <div className="px-[12px]">
            <div className="rounded-[16px] border border-[#f3d9bd] bg-gradient-to-r from-[#fff8ef] via-[#fffdf9] to-[#f8fbff] p-[20px] shadow-[0_10px_30px_rgba(149,157,165,0.2)]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-[12px]">
                <div>
                  <h3 className="text-[28px] leading-tight font-[700] text-client-secondary">Chương thú cưng của bạn</h3>
                  <p className="text-[14px] text-[#6b7280] mt-[4px]">Theo dõi thông tin chương và tiến độ chăm sóc trong ngày.</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-[12px]">
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

              <div className="mt-[12px] flex flex-col gap-[10px] md:flex-row md:items-center md:justify-between">
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
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-[16px]">
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
                      <article key={cage._id} className="rounded-[14px] border border-[#ebecef] bg-white overflow-hidden shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-all duration-300">
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
    </>
  );
};
