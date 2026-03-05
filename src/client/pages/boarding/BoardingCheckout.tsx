import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../../../stores/useAuthStore";
import { FooterSub } from "../../components/layouts/FooterSub";
import { ProductBanner } from "../product/sections/ProductBanner";
import { useCreateBoardingBooking, usePayBoardingBooking } from "../../hooks/useBoarding";
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
  paymentGateway: "zalopay" | "vnpay";
  paymentMode: "full" | "deposit";
};

const DRAFT_STORAGE_KEY = "boarding-checkout-draft";

const breadcrumbs = [
  { label: "Trang chủ", to: "/" },
  { label: "Khách sạn", to: "/hotels" },
  { label: "Thanh toán", to: "/hotels/checkout" },
];

const formatVnd = (value: number) => `${Number(value || 0).toLocaleString()}đ`;
const MAX_ROOMS_PER_CAGE = 4;

export const BoardingCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { data: myPets = [] } = useMyPets(!!user);
  const { mutateAsync: createBoarding } = useCreateBoardingBooking();
  const { mutateAsync: payBoarding } = usePayBoardingBooking();

  const stateDraft = (location.state as any)?.draft as BoardingCheckoutDraft | undefined;
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

  const [draft] = useState<BoardingCheckoutDraft | null>(initialDraft);
  const [paymentMode, setPaymentMode] = useState<"full" | "deposit">(initialDraft?.paymentMode || "full");
  const [paymentGateway, setPaymentGateway] = useState<"zalopay" | "vnpay">(initialDraft?.paymentGateway || "zalopay");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const safeQuantity = Math.max(1, Math.min(MAX_ROOMS_PER_CAGE, Number(draft?.quantity || 1)));

  const totalDays = useMemo(() => {
    if (!draft) return 0;
    const start = dayjs(draft.checkInDate);
    const end = dayjs(draft.checkOutDate);
    const diff = end.diff(start, "day");
    return diff > 0 ? diff : 0;
  }, [draft]);

  const subtotal = useMemo(() => {
    if (!draft) return 0;
    return Number(draft.dailyPrice || 0) * Math.max(totalDays, 1) * safeQuantity;
  }, [draft, totalDays, safeQuantity]);

  const toPay = paymentMode === "full" ? subtotal : 0;
  const remaining = paymentMode === "full" ? 0 : subtotal;

  const petNames = useMemo(() => {
    if (!draft) return [];
    return draft.petIds.map((petId) => {
      const pet = myPets.find((p: any) => String(p._id) === String(petId));
      return pet ? `${pet.name}${pet.breed ? ` (${pet.breed})` : ""}` : `Pet ${petId.slice(-4)}`;
    });
  }, [draft, myPets]);

  const handleConfirmCheckout = async () => {
    if (!draft) {
      toast.error("Thiếu dữ liệu checkout. Vui lòng đặt phòng lại.");
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
      });

      const bookingId = created?.data?.data?._id;
      if (!bookingId) {
        toast.error("Không tạo được đơn đặt phòng.");
        return;
      }

      if (paymentMethod === "prepaid") {
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
      toast.error(error?.response?.data?.message || error?.message || "Thanh toán thất bại.");
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

      <div className="bg-[#fffdf9] pb-[80px]">
        <div className="app-container -mt-[100px] relative z-[4]">
          {!draft ? (
            <div className="rounded-[12px] border border-[#dedede] bg-white p-[24px] text-center">
              <p className="text-[16px] text-[#5f6670]">Không có dữ liệu checkout.</p>
              <Link to="/hotels" className="inline-block mt-[10px] text-client-primary font-[700]">
                Quay lại danh sách khách sạn
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-[8px] border border-[#dfe2e8] bg-white overflow-hidden">
                <div className="grid grid-cols-[1.45fr_0.55fr] xl:grid-cols-1 border-b border-[#e4e7ed] bg-[#f6f7fb]">
                  <div className="px-[16px] py-[14px] text-[18px] font-[700] text-client-secondary">Sản phẩm</div>
                  <div className="px-[16px] py-[14px] text-[18px] font-[700] text-client-secondary border-l border-[#e4e7ed] xl:border-l-0 xl:border-t">Tạm tính</div>
                </div>

                <div className="grid grid-cols-[1.45fr_0.55fr] xl:grid-cols-1 border-b border-[#e4e7ed]">
                  <div className="px-[16px] py-[14px] text-[15px] text-[#505b66]">
                    <p className="text-[30px] font-secondary text-client-secondary leading-[1.1]">
                      {draft.cageCode} - {draft.cageType} {Math.max(totalDays, 1)} ngày
                    </p>
                    <div className="mt-[10px] space-y-[6px] text-[14px]">
                      <p>Ngày nhận phòng: {dayjs(draft.checkInDate).format("DD-MM-YYYY")}</p>
                      <p>Ngày trả phòng: {dayjs(draft.checkOutDate).format("DD-MM-YYYY")}</p>
                      <p>Số phòng: {safeQuantity}</p>
                      <p>Kích thước: {draft.cageSize}</p>
                      <p>Thú cưng: {petNames.join(", ") || "-"}</p>
                      <p>Khách hàng: {draft.fullName} - {draft.phone}</p>
                      {draft.email ? <p>Email: {draft.email}</p> : null}
                    </div>
                  </div>
                  <div className="px-[16px] py-[14px] border-l border-[#e4e7ed] xl:border-l-0 xl:border-t flex items-center">
                    <p className="text-[34px] font-[800] text-client-primary">{formatVnd(subtotal)}</p>
                  </div>
                </div>

                <div className="divide-y divide-[#e4e7ed]">
                  <div className="px-[16px] py-[12px] grid grid-cols-[1fr_auto] text-[16px]">
                    <span className="font-[700] text-[#4b5563]">Tạm tính</span>
                    <span className="font-[700] text-[#4b5563]">{formatVnd(subtotal)}</span>
                  </div>
                  <div className="px-[16px] py-[12px] grid grid-cols-[1fr_auto] text-[16px]">
                    <span className="font-[700] text-[#4b5563]">Tổng cộng</span>
                    <span className="font-[700] text-[#4b5563]">{formatVnd(subtotal)}</span>
                  </div>
                  <div className="px-[16px] py-[12px] grid grid-cols-[1fr_auto] text-[16px]">
                    <span className="font-[700] text-[#4b5563]">Cần thanh toán</span>
                    <span className="font-[700] text-[#4b5563]">{formatVnd(toPay)}</span>
                  </div>
                  <div className="px-[16px] py-[12px] grid grid-cols-[1fr_auto] text-[16px]">
                    <span className="font-[700] text-[#4b5563]">Còn lại</span>
                    <span className="font-[700] text-[#4b5563]">{formatVnd(remaining)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-[18px] rounded-[8px] border border-[#dfe2e8] bg-[#dfe3ea] overflow-hidden">
                <div className="px-[16px] py-[14px] text-[36px] font-secondary text-client-secondary leading-[1]">Phương thức thanh toán</div>
                <div className="m-[16px] bg-white rounded-[4px] border border-[#e5e7eb] p-[14px] space-y-[10px] text-[14px] text-[#4b5563]">
                  <label className="flex items-center gap-[8px]">
                    <input
                      type="radio"
                      name="boardingPaymentMode"
                      checked={paymentMode === "deposit"}
                      onChange={() => setPaymentMode("deposit")}
                    />
                    Thanh toán tại quầy
                  </label>

                  <label className="flex items-center gap-[8px]">
                    <input
                      type="radio"
                      name="boardingPaymentMode"
                      checked={paymentMode === "full"}
                      onChange={() => setPaymentMode("full")}
                    />
                    Thanh toán trước
                  </label>

                  {paymentMode === "full" && (
                    <div className="pl-[24px] flex items-center gap-[18px]">
                      <label className="flex items-center gap-[6px]">
                        <input
                          type="radio"
                          name="boardingGateway"
                          checked={paymentGateway === "zalopay"}
                          onChange={() => setPaymentGateway("zalopay")}
                        />
                        ZaloPay
                      </label>
                      <label className="flex items-center gap-[6px]">
                        <input
                          type="radio"
                          name="boardingGateway"
                          checked={paymentGateway === "vnpay"}
                          onChange={() => setPaymentGateway("vnpay")}
                        />
                        VNPay
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-[16px] text-[14px] text-[#5f6670]">
                Dữ liệu cá nhân của bạn được dùng để xử lý đơn đặt phòng và hỗ trợ trải nghiệm dịch vụ theo chính sách bảo mật của hệ thống.
              </p>

              <div className="mt-[16px] flex items-center gap-[10px]">
                <Link
                  to={`/hotels/${draft.cageId}`}
                  className="h-[46px] px-[16px] inline-flex items-center rounded-[8px] border border-[#d8d8d8] text-[14px] font-[700] text-client-secondary"
                >
                  Quay lại chỉnh sửa
                </Link>
                <button
                  type="button"
                  onClick={handleConfirmCheckout}
                  disabled={isSubmitting}
                  className="h-[46px] px-[20px] rounded-[8px] bg-client-primary text-white text-[14px] font-[700] hover:bg-client-secondary transition-default disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Đang xử lý..."
                    : paymentMode === "full"
                      ? "Thanh toán"
                      : "Xác nhận đặt phòng"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <FooterSub />
    </>
  );
};
