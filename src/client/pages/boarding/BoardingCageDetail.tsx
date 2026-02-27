import { useParams, Link } from "react-router-dom";
import { useBoardingCageDetail } from "../../hooks/useBoarding";
import { Check, ChevronLeft } from "lucide-react";

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

export const BoardingCageDetailPage = () => {
  const { id } = useParams();
  const { data: cage, isLoading } = useBoardingCageDetail(id);

  if (isLoading) {
    return <div className="app-container py-[60px] text-[1.6rem]">Đang tải...</div>;
  }

  if (!cage) {
    return <div className="app-container py-[60px] text-[1.6rem]">Không tìm thấy chuồng.</div>;
  }

  return (
    <div className="bg-[#fcfcfc]">
      <div className="app-container py-[40px]">
        <Link to="/hotels" className="inline-flex items-center gap-[6px] text-[1.4rem] text-[#555]">
          <ChevronLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>

        <div className="mt-[20px] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-[24px]">
          <div className="bg-white rounded-[18px] border border-[#f1e4d6] overflow-hidden">
            <div className="h-[320px] bg-[#f4f4f4]">
              {cage.avatar ? (
                <img src={cage.avatar} alt={cage.cageCode} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#999] text-[1.3rem]">
                  No image
                </div>
              )}
            </div>
            <div className="p-[18px]">
              <div className="text-[2.2rem] font-bold">
                {cage.cageCode || "Chuồng"} - {cage.type?.toUpperCase()}
              </div>
              <div className="text-[1.4rem] text-[#637381] mt-[6px]">
                Size {SIZE_LABELS[cage.size] || cage.size} • {Number(cage.dailyPrice || 0).toLocaleString()}đ/ngày
              </div>
              <div className="text-[1.5rem] text-[#505050] mt-[12px]">
                {cage.description || "Chưa có mô tả cho chuồng này."}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[18px] border border-[#f1e4d6] p-[18px] h-fit">
            <div className="text-[1.8rem] font-bold mb-[10px]">Tiện nghi</div>
            {Array.isArray(cage.amenities) && cage.amenities.length > 0 ? (
              <ul className="space-y-[8px]">
                {cage.amenities.map((item: string, idx: number) => (
                  <li key={`${item}-${idx}`} className="flex items-center gap-[8px] text-[1.4rem]">
                    <Check className="w-4 h-4 text-client-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-[1.4rem] text-[#637381]">Chưa có tiện nghi.</div>
            )}

            <div className="mt-[18px] text-[1.4rem]">
              <div className="font-bold">Sức chứa tối đa</div>
              <div className="text-[#637381]">
                {cage.maxWeightCapacity ? `${cage.maxWeightCapacity} kg` : "Chưa cập nhật"}
              </div>
            </div>

            <div className="mt-[18px] text-[1.4rem]">
              <div className="font-bold">Trạng thái</div>
              <div className="text-[#637381]">{cage.status || "available"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
