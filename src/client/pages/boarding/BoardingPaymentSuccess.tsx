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
      const paymentStatus = String(query.state.data?.booking?.paymentStatus || "");
      return paymentStatus === "paid" || paymentStatus === "partial" ? false : 2000;
    },
    retry: 1,
  });

  const paymentStatus = String(data?.booking?.paymentStatus || "");
  const paid = paymentStatus === "paid";
  const partial = paymentStatus === "partial";
  const failed = paymentResult === "failed";
  const waiting = !!bookingId && !paid && !partial && !failed && !isCodFlow;

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
            : paid || partial || !bookingId || isCodFlow
              ? partial
                ? "Bạn đã đặt cọc thành công"
                : "Bạn đã đặt phòng thành công"
              : failed
                ? "Thanh toán chưa thành công"
                : "Đơn đặt phòng đã tạo, đang chờ xác nhận thanh toán"}
        </h1>

        <p className="text-[14px] text-[#606060] mt-[10px]">
          {paid || partial || !bookingId || isCodFlow
            ? partial
              ? "Đơn lưu trú đã ghi nhận tiền cọc. Phần còn lại sẽ thanh toán tại quầy khi nhận chuồng."
              : "Cảm ơn bạn đã đặt khách sạn cho thú cưng. Bạn có thể xem lại thông tin trong tài khoản."
            : failed
              ? "Giao dịch bị hủy hoặc không thành công. Bạn có thể thực hiện lại thanh toán."
              : "Hệ thống đang đồng bộ giao dịch từ cổng thanh toán. Vui lòng chờ vài giây rồi kiểm tra lại."}
        </p>

        {!!bookingId && (
          <p className="text-[12px] text-[#6b7280] mt-[8px]">
            Trạng thái hiện tại: {isCodFlow ? "thanh toán tại quầy" : (paymentStatus || (failed ? "failed" : "pending"))} / {data?.booking?.boardingStatus || "-"}
          </p>
        )}

        <div className="mt-[22px] flex items-center justify-center gap-[10px] flex-wrap">
          <Link
            to="/dashboard/pet-cages"
            className="inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] bg-client-primary text-white text-[14px] font-[700] hover:bg-client-secondary transition-default"
          >
            Xem chuồng thú cưng
          </Link>
          <Link
            to="/hotels"
            className="inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] border border-[#d8d8d8] text-[14px] font-[700] text-client-secondary hover:border-client-primary transition-default"
          >
            <Home className="w-4 h-4" />
            Về trang khách sạn
          </Link>
        </div>
      </div>
    </div>
  );
};
