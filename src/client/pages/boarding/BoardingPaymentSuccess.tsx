import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Home, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { getBoardingBookingDetail } from "../../api/dashboard.api";

export const BoardingPaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";
  const paymentResult = (searchParams.get("payment") || "").toLowerCase();
  const isCodFlow = paymentResult === "cod" || paymentResult === "pay_at_site";

  const { data, isLoading } = useQuery<any>({
    queryKey: ["boarding-payment-success", bookingId],
    queryFn: () => getBoardingBookingDetail(bookingId),
    enabled: !!bookingId,
    refetchInterval: (query) => {
      const paid = query.state.data?.booking?.paymentStatus === "paid";
      return paid ? false : 2000;
    },
    retry: 1,
  });

  const paid = data?.booking?.paymentStatus === "paid";
  const failed = paymentResult === "failed";
  const waiting = !!bookingId && !paid && !failed && !isCodFlow;

  return (
    <div className="min-h-[70vh] bg-[#fffdf9] py-[80px] px-[16px]">
      <div className="max-w-[720px] mx-auto bg-white border border-[#f1e4d6] rounded-[20px] p-[28px] shadow-[0_20px_50px_-38px_rgba(0,0,0,0.35)] text-center">
        <div className="w-[82px] h-[82px] rounded-full bg-[#ecfdf3] text-[#16a34a] flex items-center justify-center mx-auto mb-[14px]">
          {waiting || (isLoading && bookingId) ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <CheckCircle2 className="w-10 h-10" />
          )}
        </div>

        <h1 className="text-[30px] font-secondary text-client-secondary">
          {isLoading && bookingId
            ? "Dang xac nhan thanh toan..."
            : paid || !bookingId || isCodFlow
              ? "Ban da dat phong thanh cong"
              : failed
                ? "Thanh toan chua thanh cong"
                : "Don dat phong da tao, dang cho xac nhan thanh toan"}
        </h1>

        <p className="text-[14px] text-[#606060] mt-[10px]">
          {paid || !bookingId || isCodFlow
            ? "Cam on ban da dat khach san cho thu cung. Ban co the xem lai thong tin trong tai khoan."
            : failed
              ? "Giao dich bi huy hoac khong thanh cong. Ban co the thuc hien lai thanh toan."
              : "He thong dang dong bo giao dich tu cong thanh toan. Vui long cho vai giay roi kiem tra lai."}
        </p>

        {!!bookingId && (
          <p className="text-[12px] text-[#6b7280] mt-[8px]">
            Trang thai hien tai: {isCodFlow ? "thanh toan tai quay" : (data?.booking?.paymentStatus || (failed ? "failed" : "pending"))} / {data?.booking?.boardingStatus || "-"}
          </p>
        )}

        <div className="mt-[22px] flex items-center justify-center gap-[10px] flex-wrap">
          <Link
            to="/dashboard/pet-cages"
            className="inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] bg-client-primary text-white text-[14px] font-[700] hover:bg-client-secondary transition-default"
          >
            Xem chuong thu cung
          </Link>
          <Link
            to="/hotels"
            className="inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] border border-[#d8d8d8] text-[14px] font-[700] text-client-secondary hover:border-client-primary transition-default"
          >
            <Home className="w-4 h-4" />
            Ve trang khach san
          </Link>
        </div>
      </div>
    </div>
  );
};
