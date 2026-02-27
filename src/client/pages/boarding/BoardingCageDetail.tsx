import { useParams, Link } from "react-router-dom";
import { Check, ChevronLeft } from "lucide-react";
import { useBoardingCageDetail } from "../../hooks/useBoarding";
import { FooterSub } from "../../components/layouts/FooterSub";

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

export const BoardingCageDetailPage = () => {
  const { id } = useParams();
  const { data: cage, isLoading } = useBoardingCageDetail(id);

  if (isLoading) {
    return <div className="app-container py-[60px] text-[14px]">Đang tải...</div>;
  }

  if (!cage) {
    return <div className="app-container py-[60px] text-[14px]">Không tìm thấy chuồng.</div>;
  }

  const statusKey = String(cage.status || "available");
  const status = STATUS_META[statusKey] || {
    label: statusKey,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <>
      <div className="bg-[#fcfcfc]">
        <div className="app-container py-[30px]">
          <Link
            to="/hotels"
            className="inline-flex items-center gap-[6px] text-[13px] text-[#555] hover:text-client-secondary transition-default"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>

          <div className="mt-[14px] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-[18px]">
            <div className="bg-white rounded-[16px] border border-[#f1e4d6] overflow-hidden">
              <div className="h-[320px] bg-[#f4f4f4]">
                {cage.avatar ? (
                  <img src={cage.avatar} alt={cage.cageCode} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#999] text-[13px]">
                    Không có hình
                  </div>
                )}
              </div>

              <div className="p-[16px]">
                <div className="flex flex-wrap items-center gap-[8px]">
                  <div className="text-[24px] font-secondary text-client-secondary">
                    {cage.cageCode || "Chuồng"} - {cage.type?.toUpperCase()}
                  </div>
                  <span className={`px-[10px] py-[4px] rounded-full border text-[11px] font-[700] ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-[8px] grid grid-cols-1 md:grid-cols-3 gap-[8px]">
                  <div className="rounded-[10px] border border-[#f1e4d6] bg-[#fffaf5] p-[10px]">
                    <p className="text-[11px] text-[#637381] uppercase tracking-[0.4px]">Kích thước</p>
                    <p className="text-[13px] font-[700] text-client-secondary mt-[2px]">Size {SIZE_LABELS[cage.size] || cage.size}</p>
                  </div>

                  <div className="rounded-[10px] border border-[#f1e4d6] bg-[#fff7ef] p-[10px]">
                    <p className="text-[11px] text-[#637381] uppercase tracking-[0.4px]">Giá / ngày</p>
                    <p className="text-[16px] font-[800] text-client-primary mt-[2px]">
                      {Number(cage.dailyPrice || 0).toLocaleString()}đ
                    </p>
                  </div>

                  <div className="rounded-[10px] border border-[#f1e4d6] bg-[#f8fbff] p-[10px]">
                    <p className="text-[11px] text-[#637381] uppercase tracking-[0.4px]">Sức chứa tối đa</p>
                    <p className="text-[13px] font-[700] text-client-secondary mt-[2px]">
                      {cage.maxWeightCapacity ? `${cage.maxWeightCapacity} kg` : "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="text-[13px] leading-[1.6] text-[#505050] mt-[12px]">
                  {cage.description || "Chưa có mô tả cho chuồng này."}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[16px] border border-[#f1e4d6] p-[16px] h-fit">
              <div className="flex items-center justify-between mb-[10px]">
                <div className="text-[16px] font-[800] text-client-secondary">Tiện nghi</div>
                <div className="text-[11px] text-[#64748b]">{Array.isArray(cage.amenities) ? cage.amenities.length : 0} mục</div>
              </div>

              {Array.isArray(cage.amenities) && cage.amenities.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
                  {cage.amenities.map((item: string, idx: number) => (
                    <li
                      key={`${item}-${idx}`}
                      className="flex items-center gap-[8px] rounded-[10px] border border-[#e8edf3] bg-[#fbfdff] px-[10px] py-[8px] text-[12px] font-[600] text-[#334155]"
                    >
                      <span className="inline-flex w-[20px] h-[20px] items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="line-clamp-1">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-[10px] border border-dashed border-[#e2e8f0] px-[12px] py-[14px] text-[12px] text-[#64748b]">
                  Chưa có tiện nghi.
                </div>
              )}

              <div className="mt-[14px] rounded-[10px] border border-[#f1e4d6] bg-[#fffaf5] p-[10px]">
                <p className="text-[11px] uppercase tracking-[0.4px] text-[#637381] mb-[4px]">Trạng thái vận hành</p>
                <span className={`inline-flex px-[10px] py-[4px] rounded-full border text-[11px] font-[700] ${status.className}`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterSub />
    </>
  );
};
