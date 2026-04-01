import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertCircle,
  BedSingle,
  CalendarRange,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  Mail,
  PawPrint,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { FooterSub } from "../../components/layouts/FooterSub";
import { ProductBanner } from "../product/sections/ProductBanner";
import { useCreateBoardingBooking, usePayBoardingBooking, useBoardingConfig } from "../../hooks/useBoarding";
import { useMyPets } from "../../hooks/usePet";

type BoardingCheckoutDraft = {
  cageId: string;
  cageCode: string;
  cageType: string;
  cageSize: string;
  dailyPrice: number;
  avatar?: string;
  checkInDate: string;
  checkOutDate: string;
  petIds: string[];
  quantity: number;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  paymentGateway: "vnpay";
  paymentMode: "full" | "deposit";
  customFeeding?: Record<string, string>;
  customExercise?: Record<string, string>;
};

type DetailInfoItemProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  className?: string;
};

type PaymentOptionCardProps = {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
};

const DRAFT_STORAGE_KEY = "boarding-checkout-draft";
const MAX_ROOMS_PER_CAGE = 4;

const breadcrumbs = [
  { label: "Trang chủ", to: "/" },
  { label: "Khách sạn", to: "/hotels" },
  { label: "Thanh toán", to: "/hotels/checkout" },
];

const formatVnd = (value: number) => `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))}đ`;

const DetailInfoItem = ({ icon, label, value, className }: DetailInfoItemProps) => (
  <div className={`rounded-[18px] border border-[#f2e6de] bg-white px-[16px] py-[14px] shadow-[0_10px_24px_rgba(42,27,17,0.04)] ${className || ""}`}>
    <div className="flex items-center gap-[14px]">
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[#fff2eb] text-client-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-[800] uppercase tracking-[0.2em] text-[#9aa3b2] mb-0.5">{label}</p>
        <div className="text-[15px] font-[700] leading-tight text-client-secondary">{value}</div>
      </div>
    </div>
  </div>
);

const PaymentOptionCard = ({ active, icon, title, description, onClick }: PaymentOptionCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center justify-between gap-[18px] rounded-[24px] border px-[20px] py-[22px] text-left transition-all duration-300 ${active
      ? "border-client-primary bg-[#fff7f2] shadow-[0_16px_34px_rgba(237,104,34,0.12)]"
      : "border-[#ebe7e3] bg-white hover:border-[#f1c9b5] hover:shadow-[0_14px_30px_rgba(42,27,17,0.06)]"
      }`}
  >
    <div className="flex items-center gap-[16px]">
      <div
        className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[18px] ${active ? "bg-[#fff0e6] text-client-primary" : "bg-[#f7f8fb] text-[#92a0b2]"
          }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[22px] font-[800] tracking-[-0.02em] text-client-secondary">{title}</p>
        <p className="mt-[4px] text-[14px] leading-[1.6] text-[#7a8493]">{description}</p>
      </div>
    </div>
    <span
      className={`flex h-[24px] w-[24px] items-center justify-center rounded-full border transition-all ${active ? "border-client-primary bg-client-primary text-white" : "border-[#d7dde7] bg-white text-transparent"
        }`}
    >
      <CheckCircle2 className="h-[14px] w-[14px]" />
    </span>
  </button>
);

export const BoardingCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { data: myPets = [] } = useMyPets(!!user);
  const { mutateAsync: createBoarding } = useCreateBoardingBooking();
  const { mutateAsync: payBoarding } = usePayBoardingBooking();

  const stateDraft = (location.state as { draft?: BoardingCheckoutDraft } | null)?.draft;
  const initialDraft = useMemo(() => {
    if (stateDraft) {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(stateDraft));
      return stateDraft;
    }
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as BoardingCheckoutDraft;
    } catch {
      return null;
    }
  }, [stateDraft]);

  const { data: config } = useBoardingConfig();
  const [draft] = useState<BoardingCheckoutDraft | null>(initialDraft);
  const [paymentMode, setPaymentMode] = useState<"full" | "deposit">(initialDraft?.paymentMode || "full");
  const [paymentGateway, setPaymentGateway] = useState<"vnpay">(initialDraft?.paymentGateway === "vnpay" ? "vnpay" : "vnpay");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalDepositMinDays = config?.minDaysForDeposit ?? 2;
  const finalDepositPercent = config?.depositPercentage ?? 20;

  const safeQuantity = Math.max(1, Math.min(MAX_ROOMS_PER_CAGE, Number(draft?.quantity || 1)));

  const stayNights = useMemo(() => {
    if (!draft || !config) return 0;
    const [inH, inM] = (config.checkInTime || "14:00").split(":").map(Number);
    const [outH, outM] = (config.checkOutTime || "12:00").split(":").map(Number);

    const start = dayjs(draft.checkInDate).startOf("day").set("hour", inH).set("minute", inM);
    const end = dayjs(draft.checkOutDate).startOf("day").set("hour", outH).set("minute", outM);

    // Match backend logic: Math.ceil of fractional days
    const diff = Math.ceil(end.diff(start, "hour") / 24);
    return diff > 0 ? diff : 0;
  }, [draft, config]);

  const displayNights = Math.max(stayNights, 1);

  const petNames = useMemo(() => {
    if (!draft) return [];
    return draft.petIds.map((petId) => {
      const pet = myPets.find((item: any) => String(item._id) === String(petId));
      return pet ? `${pet.name}${pet.breed ? ` (${pet.breed})` : ""}` : `Thú cưng ${petId.slice(-4)}`;
    });
  }, [draft, myPets]);

  const subtotal = useMemo(() => {
    if (!draft) return 0;
    return Number(draft.dailyPrice || 0) * displayNights * safeQuantity;
  }, [draft, displayNights, safeQuantity]);

  const serviceFee = 0;
  const taxFee = 0;
  const grandTotal = subtotal + serviceFee + taxFee;
  const requiresCounterDeposit = paymentMode === "deposit" && displayNights >= finalDepositMinDays;
  const depositAmount = requiresCounterDeposit ? Math.round(subtotal * (finalDepositPercent / 100)) : 0;
  const toPay = paymentMode === "full" ? grandTotal : depositAmount;
  const remaining = paymentMode === "full" ? 0 : Math.max(grandTotal - toPay, 0);
  const supportPhone = "1900-PETCARE";

  const paymentMethodLabel =
    paymentMode === "full"
      ? "Thanh toán online toàn bộ"
      : requiresCounterDeposit
        ? `Thanh toán tại quầy + cọc ${finalDepositPercent}%`
        : "Thanh toán tại quầy";

  const handleConfirmCheckout = async () => {
    if (!draft) {
      toast.error("Thiếu dữ liệu checkout. Vui lòng quay lại trang đặt phòng.");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/auth/login");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const paymentMethod = paymentMode === "full" ? "prepaid" : "pay_at_site";
      const created = await createBoarding({
        cageId: draft.cageId,
        checkInDate: draft.checkInDate,
        checkOutDate: draft.checkOutDate,
        petIds: draft.petIds,
        quantity: safeQuantity,
        fullName: draft.fullName,
        phone: draft.phone,
        email: draft.email || "",
        notes: draft.notes || "",
        specialCare: "",
        paymentMethod,
        paymentGateway,
        customFeeding: draft.customFeeding,
        customExercise: draft.customExercise,
      });

      const bookingId = created?.data?.data?._id;
      if (!bookingId) {
        toast.error("Không thể tạo đơn đặt phòng.");
        return;
      }

      if (paymentMethod === "prepaid" || requiresCounterDeposit) {
        const payRes = await payBoarding({ id: bookingId, gateway: paymentGateway });
        const paymentUrl = payRes?.data?.paymentUrl;
        if (!paymentUrl) {
          toast.error("Không tạo được link thanh toán.");
          return;
        }
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        window.location.href = paymentUrl;
        return;
      }

      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      navigate(`/hotels/success?bookingId=${bookingId}&payment=cod`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Không thể xử lý thanh toán.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ProductBanner
        pageTitle="Thanh toán khách sạn"
        breadcrumbs={breadcrumbs}
        url="https://i.pinimg.com/1200x/c1/f4/49/c1f44969b4eab486fb51b9501792fdc1.jpg"
        className="banner-hotel bg-top"
      />

      <div className="bg-[#fffaf7] pb-[90px]">
        <div className="app-container relative z-[4] -mt-[100px]">
          {!draft ? (
            <div className="rounded-[24px] border border-[#ece4de] bg-white px-[24px] py-[28px] text-center shadow-[0_22px_45px_rgba(42,27,17,0.05)]">
              <p className="text-[16px] text-[#5f6670]">Không có dữ liệu checkout.</p>
              <Link to="/hotels" className="mt-[12px] inline-flex text-[15px] font-[700] text-client-primary hover:text-client-secondary">
                Quay lại danh sách khách sạn
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-[28px] 2xl:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-1">
              <div className="space-y-[24px]">
                <section className="rounded-[30px] border border-[#f0e4dd] bg-white px-[30px] py-[32px] shadow-[0_24px_56px_rgba(42,27,17,0.06)]">
                  <div className="flex items-start justify-between gap-[20px] md:flex-col">
                    <div>
                      <p className="text-[15px] font-[700] uppercase tracking-[0.28em] text-client-primary/80">Xem lại đơn hàng</p>
                      <h1 className="mt-[10px] text-[46px] font-[800] leading-[1.04] tracking-[-0.04em] text-client-secondary 2xl:text-[40px] md:text-[32px]">
                        Kiểm tra thông tin lưu trú trước khi thanh toán
                      </h1>
                      <p className="mt-[10px] max-w-[720px] text-[16px] leading-[1.75] text-[#6e7784]">
                        Xác nhận lại chuồng, thú cưng và phương thức thanh toán. Nếu chọn thanh toán tại quầy từ {finalDepositMinDays} đêm trở lên,
                        hệ thống sẽ yêu cầu cọc trước {finalDepositPercent}% để giữ chuồng.
                      </p>
                    </div>
                    <div className="inline-flex h-[42px] items-center rounded-full border border-[#f4d6c7] bg-[#fff4ee] px-[16px] text-[13px] font-[800] uppercase tracking-[0.18em] text-client-primary">
                      Sẵn sàng xác nhận
                    </div>
                  </div>

                  <div className="mt-[28px] rounded-[28px] border border-[#f3e4dc] bg-[#fffaf7] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                    <div className="grid grid-cols-[240px_minmax(0,1fr)] gap-[22px] lg:grid-cols-1">
                      <div className="relative overflow-hidden rounded-[22px] bg-[#f4ede6]">
                        {draft.avatar ? (
                          <img src={draft.avatar} alt={draft.cageCode} className="h-full min-h-[250px] w-full object-cover" />
                        ) : (
                          <div className="flex min-h-[250px] items-center justify-center bg-[linear-gradient(135deg,#fff0e6_0%,#f6ede8_100%)] text-client-primary">
                            <BedSingle className="h-[54px] w-[54px]" />
                          </div>
                        )}
                        <div className="absolute left-[14px] top-[14px] inline-flex items-center rounded-full bg-white/92 px-[12px] py-[6px] text-[11px] font-[800] uppercase tracking-[0.16em] text-client-primary shadow-[0_10px_24px_rgba(42,27,17,0.12)]">
                          {draft.cageCode}
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-start justify-between gap-[14px] lg:flex-col">
                          <div>
                            <h2 className="text-[40px] font-[800] leading-[1.05] tracking-[-0.04em] text-client-secondary 2xl:text-[34px] md:text-[28px]">
                              {draft.cageCode} - {draft.cageType}
                            </h2>
                            <p className="mt-[8px] text-[16px] text-[#697384]">
                              {safeQuantity} phòng x {displayNights} đêm x {formatVnd(draft.dailyPrice)}
                            </p>
                          </div>
                          <div className="inline-flex h-[38px] items-center rounded-full border border-[#d8f1dc] bg-[#effaf1] px-[14px] text-[12px] font-[800] uppercase tracking-[0.16em] text-[#1c8c4a]">
                            {paymentMethodLabel}
                          </div>
                        </div>

                        <div className="mt-[20px] grid grid-cols-2 gap-[14px] lg:grid-cols-1">
                          <DetailInfoItem
                            icon={<CalendarRange className="h-[20px] w-[20px]" />}
                            label="Kỳ lưu trú"
                            value={
                              <>
                                <span>
                                  {dayjs(draft.checkInDate).format("DD/MM/YYYY")} - {dayjs(draft.checkOutDate).format("DD/MM/YYYY")}
                                </span>
                                <p className="mt-[4px] text-[13px] font-[600] text-[#8a94a3]">{displayNights} đêm lưu trú</p>
                              </>
                            }
                          />
                          <DetailInfoItem
                            icon={<PawPrint className="h-[20px] w-[20px]" />}
                            label="Thú cưng"
                            value={
                              <>
                                <span>{petNames.join(", ") || "-"}</span>
                                <p className="mt-[4px] text-[13px] font-[600] text-[#8a94a3]">
                                  {draft.petIds.length} bé được gán vào {safeQuantity} phòng
                                </p>
                              </>
                            }
                          />
                          <DetailInfoItem
                            icon={<UserRound className="h-[20px] w-[20px]" />}
                            label="Người đặt"
                            value={
                              <>
                                <span>{draft.fullName}</span>
                                <p className="mt-[4px] text-[13px] font-[600] text-[#8a94a3]">{draft.phone}</p>
                              </>
                            }
                          />
                          <DetailInfoItem
                            icon={<BedSingle className="h-[20px] w-[20px]" />}
                            label="Loại chuồng"
                            value={
                              <>
                                <span>
                                  {draft.cageType} - {draft.cageSize}
                                </span>
                                <p className="mt-[4px] text-[13px] font-[600] text-[#8a94a3]">{safeQuantity} phòng đã chọn</p>
                              </>
                            }
                          />
                          <DetailInfoItem
                            icon={<Mail className="h-[20px] w-[20px]" />}
                            label="Email"
                            value={<span className="break-all">{draft.email}</span>}
                            className="col-span-2"
                          />
                          {draft.notes ? (
                            <DetailInfoItem
                              icon={<AlertCircle className="h-[20px] w-[20px]" />}
                              label="Ghi chú"
                              value={<span className="line-clamp-2">{draft.notes}</span>}
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[30px] border border-[#f0e4dd] bg-white px-[30px] py-[30px] shadow-[0_24px_56px_rgba(42,27,17,0.06)]">
                  <div className="flex items-start justify-between gap-[16px] md:flex-col">
                    <div>
                      <p className="text-[15px] font-[700] uppercase tracking-[0.28em] text-client-primary/80">Phương thức thanh toán</p>
                      <h2 className="mt-[10px] text-[36px] font-[800] leading-[1.08] tracking-[-0.04em] text-client-secondary md:text-[30px]">
                        Chọn cách thanh toán phù hợp
                      </h2>
                    </div>
                    <div className="rounded-[18px] border border-[#eceef3] bg-[#f7f8fb] px-[16px] py-[12px] text-[13px] font-[600] leading-[1.6] text-[#6f7a88]">
                      Nếu thanh toán online hoặc cần cọc 20%, hệ thống sẽ chuyển sang VNPay ngay sau khi xác nhận.
                    </div>
                  </div>

                  <div className="mt-[24px] grid grid-cols-2 gap-[16px] md:grid-cols-1">
                    <PaymentOptionCard
                      active={paymentMode === "full"}
                      icon={<WalletCards className="h-[26px] w-[26px]" />}
                      title="Thanh toán online ngay"
                      description="Thanh toán toàn bộ đơn lưu trú bằng ví điện tử hoặc cổng thanh toán."
                      onClick={() => setPaymentMode("full")}
                    />
                    <PaymentOptionCard
                      active={paymentMode === "deposit"}
                      icon={<Store className="h-[26px] w-[26px]" />}
                      title="Thanh toán tại quầy"
                      description={`Thanh toán khi nhận chuồng. Đơn từ ${finalDepositMinDays} đêm trở lên phải cọc ${finalDepositPercent}% trước.`}
                      onClick={() => setPaymentMode("deposit")}
                    />
                  </div>

                  {requiresCounterDeposit ? (
                    <div className="mt-[16px] rounded-[20px] border border-[#fed7aa] bg-[#fff7ed] px-[18px] py-[14px] text-[14px] leading-[1.7] text-[#9a3412]">
                      Đơn lưu trú từ {finalDepositMinDays} đêm trở lên chọn thanh toán tại quầy sẽ cần cọc trước{" "}
                      <span className="font-[800]">{finalDepositPercent}%</span>, tương đương{" "}
                      <span className="font-[800]">{formatVnd(depositAmount)}</span>. Phần còn lại{" "}
                      <span className="font-[800]">{formatVnd(remaining)}</span> thanh toán khi nhận chuồng.
                    </div>
                  ) : paymentMode === "deposit" ? (
                    <div className="mt-[16px] rounded-[20px] border border-[#e6ebf2] bg-[#f8fafc] px-[18px] py-[14px] text-[14px] leading-[1.7] text-[#677384]">
                      Đơn này chưa cần đặt cọc trước. Bạn có thể xác nhận đơn và thanh toán toàn bộ tại quầy khi nhận chuồng.
                    </div>
                  ) : null}

                  {paymentMode === "full" || requiresCounterDeposit ? (
                    <div className="mt-[20px] rounded-[24px] border border-[#f1dfd4] bg-[#fff9f5] p-[20px]">
                      <div className="flex items-center gap-[10px]">
                        <CreditCard className="h-[20px] w-[20px] text-client-primary" />
                        <p className="text-[16px] font-[800] text-client-secondary">Chọn cổng thanh toán</p>
                      </div>
                      <div className="mt-[16px] flex flex-wrap gap-[12px]">
                        {[
                          { value: "vnpay" as const, label: "VNPay" },
                        ].map((gateway) => {
                          const active = paymentGateway === gateway.value;
                          return (
                            <button
                              key={gateway.value}
                              type="button"
                              onClick={() => setPaymentGateway(gateway.value)}
                              className={`inline-flex items-center gap-[8px] rounded-full border px-[16px] py-[10px] text-[14px] font-[700] transition-all ${active
                                ? "border-client-primary bg-client-primary text-white shadow-[0_12px_24px_rgba(237,104,34,0.18)]"
                                : "border-[#dddfe4] bg-white text-client-secondary hover:border-client-primary/50"
                                }`}
                            >
                              <span className={`h-[8px] w-[8px] rounded-full ${active ? "bg-white" : "bg-client-primary"}`} />
                              {gateway.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-[22px] flex items-start gap-[10px] rounded-[20px] border border-[#e8edf5] bg-[#f8fafc] px-[18px] py-[16px] text-[14px] leading-[1.7] text-[#667281]">
                    <ShieldCheck className="mt-[2px] h-[18px] w-[18px] shrink-0 text-[#6d8cb2]" />
                    Dữ liệu cá nhân của bạn chỉ được dùng để xử lý đơn đặt chuồng và hỗ trợ dịch vụ theo chính sách của TeddyPet.
                  </div>

                  <div className="mt-[24px] flex items-center gap-[12px] md:flex-col">
                    <Link
                      to={`/hotels/${draft.cageId}`}
                      className="inline-flex h-[56px] items-center justify-center rounded-[18px] border border-[#dadcdf] px-[22px] text-[15px] font-[700] text-client-secondary transition-all hover:border-client-primary/40 hover:bg-[#fff8f4] md:w-full"
                    >
                      Quay lại chỉnh sửa
                    </Link>
                    <button
                      type="button"
                      onClick={handleConfirmCheckout}
                      disabled={isSubmitting}
                      className="inline-flex h-[56px] flex-1 items-center justify-center rounded-[18px] bg-client-primary px-[24px] text-[16px] font-[800] text-white shadow-[0_18px_35px_rgba(237,104,34,0.28)] transition-all hover:bg-client-secondary disabled:cursor-not-allowed disabled:opacity-70 md:w-full md:flex-none"
                    >
                      {isSubmitting ? "Đang xử lý..." : paymentMode === "full" || requiresCounterDeposit ? "Xác nhận và thanh toán" : "Xác nhận đặt phòng"}
                    </button>
                  </div>
                </section>
              </div>

              <aside className="space-y-[16px]">
                <div className="sticky top-[24px] space-y-[16px] xl:static">
                  <div className="rounded-[30px] border border-[#f0e4dd] bg-white px-[28px] py-[28px] shadow-[0_24px_56px_rgba(42,27,17,0.06)]">
                    <p className="text-[15px] font-[700] uppercase tracking-[0.28em] text-client-primary/80">Tóm tắt đơn hàng</p>
                    <h2 className="mt-[10px] text-[34px] font-[800] leading-[1.08] tracking-[-0.04em] text-client-secondary">Tóm tắt thanh toán</h2>

                    <div className="mt-[22px] space-y-[14px] rounded-[22px] border border-[#f2e7de] bg-[#fffaf7] p-[18px]">
                      <div className="flex items-start justify-between gap-[12px] text-[15px]">
                        <span className="text-[#6f7885]">Tạm tính</span>
                        <span className="font-[800] text-client-secondary">{formatVnd(subtotal)}</span>
                      </div>
                      <div className="flex items-start justify-between gap-[12px] text-[15px]">
                        <span className="text-[#6f7885]">Phí dịch vụ</span>
                        <span className="font-[700] text-client-secondary">{formatVnd(serviceFee)}</span>
                      </div>
                      <div className="flex items-start justify-between gap-[12px] text-[15px]">
                        <span className="text-[#6f7885]">VAT</span>
                        <span className="font-[700] text-client-secondary">{formatVnd(taxFee)}</span>
                      </div>
                      <div className="h-px bg-[#ece3dc]" />
                      <div className="flex items-start justify-between gap-[12px] text-[15px]">
                        <span className="text-[#6f7885]">Số đêm</span>
                        <span className="font-[700] text-client-secondary">{displayNights}</span>
                      </div>
                      <div className="flex items-start justify-between gap-[12px] text-[15px]">
                        <span className="text-[#6f7885]">Số phòng</span>
                        <span className="font-[700] text-client-secondary">{safeQuantity}</span>
                      </div>
                      <div className="flex items-start justify-between gap-[12px] text-[15px]">
                        <span className="text-[#6f7885]">Phương thức</span>
                        <span className="font-[700] text-right text-client-secondary">{paymentMethodLabel}</span>
                      </div>
                      {requiresCounterDeposit ? (
                        <div className="flex items-start justify-between gap-[12px] text-[15px]">
                          <span className="text-[#6f7885]">Tiền cọc bắt buộc</span>
                          <span className="font-[700] text-client-secondary">{formatVnd(depositAmount)}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-[24px] space-y-[10px]">
                      <div className="flex items-end justify-between gap-[14px]">
                        <span className="text-[17px] font-[700] text-client-secondary">Tổng cộng</span>
                        <span className="text-[24px] font-[800] text-client-secondary">{formatVnd(grandTotal)}</span>
                      </div>
                      <div className="flex items-end justify-between gap-[14px]">
                        <span className="text-[15px] font-[700] text-[#6f7885]">{paymentMode === "full" ? "Thanh toán ngay" : requiresCounterDeposit ? "Cần thanh toán trước" : "Thanh toán ngay"}</span>
                        <span className="text-[32px] font-[900] leading-none tracking-[-0.03em] text-client-primary">{formatVnd(toPay)}</span>
                      </div>
                      {remaining > 0 ? (
                        <div className="flex items-end justify-between gap-[14px]">
                          <span className="text-[15px] font-[700] text-[#6f7885]">Còn lại khi check-in</span>
                          <span className="text-[18px] font-[800] text-client-secondary">{formatVnd(remaining)}</span>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmCheckout}
                      disabled={isSubmitting}
                      className="mt-[24px] inline-flex h-[58px] w-full items-center justify-center rounded-[18px] bg-client-primary px-[20px] text-[16px] font-[800] text-white shadow-[0_18px_35px_rgba(237,104,34,0.28)] transition-all hover:bg-client-secondary disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? "Đang xử lý..." : paymentMode === "full" || requiresCounterDeposit ? "Xác nhận và thanh toán" : "Xác nhận đặt phòng"}
                    </button>

                    <p className="mt-[14px] text-center text-[12px] leading-[1.65] text-[#8a94a3]">
                      Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách đặt phòng của TeddyPet.
                    </p>
                  </div>

                  <div className="rounded-[26px] border border-[#f1e6de] bg-white px-[22px] py-[20px] shadow-[0_18px_40px_rgba(42,27,17,0.05)]">
                    <div className="flex items-start gap-[12px]">
                      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[#fff3eb] text-client-primary">
                        <CircleHelp className="h-[20px] w-[20px]" />
                      </div>
                      <div>
                        <p className="text-[15px] font-[800] text-client-secondary">Cần hỗ trợ ngay?</p>
                        <p className="mt-[6px] text-[14px] leading-[1.7] text-[#667281]">
                          Liên hệ chuyên viên khách sạn thú cưng qua hotline <span className="font-[800] text-client-secondary">{supportPhone}</span> để được hỗ trợ nhanh.
                        </p>
                        <div className="mt-[12px] flex flex-wrap gap-[8px] text-[13px] font-[700] text-[#7b8796]">
                          <span className="inline-flex items-center gap-[6px] rounded-full bg-[#f7f8fb] px-[10px] py-[6px]">
                            <Phone className="h-[14px] w-[14px] text-client-primary" />
                            {draft.phone}
                          </span>
                          {draft.email ? (
                            <span className="inline-flex items-center gap-[6px] rounded-full bg-[#f7f8fb] px-[10px] py-[8px]">
                              <Mail className="h-[14px] w-[14px] text-client-primary" />
                              {draft.email}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-[18px] rounded-[20px] border border-[#f0e6df] bg-white px-[20px] py-[16px] text-[12px] font-[800] uppercase tracking-[0.18em] text-[#94a0ae] shadow-[0_12px_30px_rgba(42,27,17,0.04)]">
                    <span className="inline-flex items-center gap-[8px]">
                      <ShieldCheck className="h-[14px] w-[14px] text-client-primary" />
                      Bảo mật SSL
                    </span>
                    <span className="inline-flex items-center gap-[8px]">
                      <CheckCircle2 className="h-[14px] w-[14px] text-client-primary" />
                      Đảm bảo
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>

      <FooterSub />
    </>
  );
};
