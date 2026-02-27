import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { Check, MapPin, PawPrint, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useMyPets } from "../../hooks/usePet";
import {
  useAvailableCages,
  useCreateBoardingBooking,
  usePayBoardingBooking,
} from "../../hooks/useBoarding";

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

const TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại" },
  { value: "standard", label: "Tiêu chuẩn" },
  { value: "vip", label: "VIP" },
];

const SIZE_OPTIONS = [
  { value: "", label: "Tất cả kích thước" },
  { value: "S", label: "Size S - 50 x 35 x 35 cm (dưới 8kg)" },
  { value: "M", label: "Size M - 63 x 43 x 53 cm (8-15kg)" },
  { value: "L", label: "Size L - 83 x 63 x 63 cm (15-20kg)" },
  { value: "XL_XXL", label: "Size XL/XXL - 105 x 85 x 100 cm (trên 20kg)" },
];

export const BoardingBookingPage = () => {
  const { user } = useAuthStore();
  const { data: myPets = [], isLoading: isLoadingPets } = useMyPets(!!user);
  const { mutateAsync: createBoarding } = useCreateBoardingBooking();
  const { mutateAsync: payBoarding } = usePayBoardingBooking();

  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [petCageMap, setPetCageMap] = useState<Record<string, string>>({});

  const [checkInDate, setCheckInDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [type, setType] = useState<string>("");
  const [size, setSize] = useState<string>("");

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [specialCare, setSpecialCare] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "pay_at_site">("pay_at_site");
  const [paymentGateway, setPaymentGateway] = useState<"zalopay" | "vnpay">("zalopay");
  const [pendingPaymentLinks, setPendingPaymentLinks] = useState<
    { bookingId: string; petName: string; paymentUrl: string }[]
  >([]);

  const { data: cages = [], isLoading: isLoadingCages } = useAvailableCages(
    checkInDate,
    checkOutDate,
    type || undefined,
    size || undefined
  );
  const cagesSafe = useMemo(() => (Array.isArray(cages) ? cages : []), [cages]);

  const totalDays = useMemo(() => {
    const start = dayjs(checkInDate);
    const end = dayjs(checkOutDate);
    const diff = end.diff(start, "day");
    return diff > 0 ? diff : 0;
  }, [checkInDate, checkOutDate]);

  const cageMapById = useMemo(() => {
    const map: Record<string, any> = {};
    cagesSafe.forEach((c: any) => {
      map[c._id] = c;
    });
    return map;
  }, [cagesSafe]);

  const selectedPets = useMemo(() => {
    return myPets.filter((pet: any) => selectedPetIds.includes(pet._id));
  }, [myPets, selectedPetIds]);

  const totalPrice = useMemo(() => {
    if (!totalDays) return 0;
    return selectedPetIds.reduce((sum, petId) => {
      const cageId = petCageMap[petId];
      const cage = cageMapById[cageId];
      return sum + (cage?.dailyPrice || 0) * totalDays;
    }, 0);
  }, [selectedPetIds, petCageMap, cageMapById, totalDays]);

  const togglePet = (petId: string) => {
    setSelectedPetIds((prev) => {
      const exists = prev.includes(petId);
      if (exists) {
        setPetCageMap((old) => {
          const next = { ...old };
          delete next[petId];
          return next;
        });
        return prev.filter((id) => id !== petId);
      }
      return [...prev, petId];
    });
  };

  const setPetCage = (petId: string, cageId: string) => {
    setPetCageMap((prev) => ({ ...prev, [petId]: cageId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return toast.error("Vui lòng đăng nhập để đặt khách sạn!");
    if (totalDays <= 0) return toast.error("Ngày trả phải sau ngày nhận!");
    if (!selectedPetIds.length) return toast.error("Vui lòng chọn thú cưng!");

    const missingCagePets = selectedPetIds.filter((petId) => !petCageMap[petId]);
    if (missingCagePets.length > 0) {
      return toast.error("Vui lòng chọn chuồng cho từng thú cưng!");
    }

    const assignedCageIds = selectedPetIds.map((petId) => petCageMap[petId]);
    if (new Set(assignedCageIds).size !== assignedCageIds.length) {
      return toast.error("Mỗi thú cưng phải ở một chuồng riêng!");
    }

    setPendingPaymentLinks([]);

    try {
      const createdBookings: { bookingId: string; petId: string; petName: string }[] = [];

      for (const petId of selectedPetIds) {
        const petName = myPets.find((pet: any) => pet._id === petId)?.name || "Thú cưng";
        const created = await createBoarding({
          cageId: petCageMap[petId],
          checkInDate,
          checkOutDate,
          petIds: [petId],
          fullName,
          phone,
          email,
          notes,
          specialCare,
          paymentMethod,
          paymentGateway,
        });
        const bookingId = created?.data?.data?._id;
        if (bookingId) {
          createdBookings.push({ bookingId, petId, petName });
        }
      }

      if (paymentMethod === "prepaid" && createdBookings.length > 0) {
        const links: { bookingId: string; petName: string; paymentUrl: string }[] = [];
        for (const item of createdBookings) {
          const payRes = await payBoarding({ id: item.bookingId, gateway: paymentGateway });
          const paymentUrl = payRes?.data?.paymentUrl;
          if (!paymentUrl) {
            throw new Error(`Không tạo được link thanh toán cho ${item.petName}`);
          }
          links.push({
            bookingId: item.bookingId,
            petName: item.petName,
            paymentUrl,
          });
        }

        if (links.length === 1) {
          window.location.href = links[0].paymentUrl;
          return;
        }

        setPendingPaymentLinks(links);
        links.forEach((item) => window.open(item.paymentUrl, "_blank", "noopener,noreferrer"));
        toast.success(`Đã tạo ${links.length} link thanh toán. Nếu trình duyệt chặn popup, hãy bấm mở thủ công bên dưới.`);

        setSelectedPetIds([]);
        setPetCageMap({});
        setNotes("");
        setSpecialCare("");
        return;
      }

      toast.success(
        selectedPetIds.length > 1
          ? `Đặt thành công ${selectedPetIds.length} lịch cho ${selectedPetIds.length} thú cưng.`
          : "Đặt khách sạn thành công!"
      );

      setSelectedPetIds([]);
      setPetCageMap({});
      setNotes("");
      setSpecialCare("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Đặt khách sạn thất bại!");
    }
  };

  return (
    <div className="bg-[#fffdf9]">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#fff1e6] via-[#fff8ef] to-[#fff]">
        <div className="app-container py-[44px]">
          <div className="flex flex-col lg:flex-row items-center gap-[24px]">
            <div className="w-full lg:w-[55%]">
              <div className="inline-flex items-center gap-[8px] py-[6px] px-[12px] rounded-full bg-[#fff0e2] text-client-primary text-[12px] uppercase tracking-[1px] font-[700] mb-[10px]">
                <Sparkles className="w-3.5 h-3.5" />
                Lưu trú an tâm
              </div>
              <div className="text-[34px] font-secondary text-client-secondary leading-[1.1]">Khách sạn thú cưng</div>
              <p className="text-[14px] text-[#505050] mt-[8px]">
                Trải nghiệm lưu trú an toàn, sạch sẽ và chuyên nghiệp với quy trình chăm sóc riêng cho từng bé.
              </p>
              <div className="flex items-center gap-[8px] mt-[14px] text-[13px] text-[#637381]">
                <MapPin className="w-4 h-4 text-client-secondary" />
                64 Ung Văn Khiêm, Pleiku, Gia Lai
              </div>
            </div>

            <div className="w-full lg:w-[45%] bg-white rounded-[18px] shadow-[0_18px_45px_-28px_rgba(230,126,32,0.5)] p-[14px] border border-[#f1e4d6]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                <div>
                  <label className="block text-[12px] font-[700] mb-[6px] text-client-secondary">Ngày nhận</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={dayjs().format("YYYY-MM-DD")}
                    className="w-full py-[9px] px-[12px] border border-[#eee] rounded-[10px] text-[12px] focus:outline-none focus:border-client-primary"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-[700] mb-[6px] text-client-secondary">Ngày trả</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={dayjs(checkInDate).add(1, "day").format("YYYY-MM-DD")}
                    className="w-full py-[9px] px-[12px] border border-[#eee] rounded-[10px] text-[12px] focus:outline-none focus:border-client-primary"
                  />
                </div>
              </div>

              <div className="mt-[10px] grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full py-[9px] px-[12px] border border-[#eee] rounded-[10px] text-[12px] focus:outline-none focus:border-client-primary"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full py-[9px] px-[12px] border border-[#eee] rounded-[10px] text-[12px] focus:outline-none focus:border-client-primary"
                >
                  {SIZE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="w-full mt-[10px] py-[10px] rounded-[10px] bg-client-primary text-white text-[13px] font-[700] flex items-center justify-center gap-[8px] hover:bg-client-secondary transition-default"
              >
                <Search className="w-4 h-4" />
                Tìm phòng trống
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="app-container py-[36px]">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-[20px]">
          <div className="bg-white rounded-[18px] border border-[#f1e4d6] p-[16px] h-fit shadow-[0_18px_45px_-34px_rgba(230,126,32,0.5)]">
            <div className="text-[20px] font-secondary text-client-secondary mb-[10px]">Thông tin đặt phòng</div>

            <div className="grid grid-cols-1 gap-[8px] mb-[12px]">
              <input type="text" placeholder="Họ và tên" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full py-[9px] px-[12px] border border-[#eee] rounded-[10px] text-[13px] focus:outline-none focus:border-client-primary" />
              <input type="text" placeholder="Số điện thoại" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full py-[9px] px-[12px] border border-[#eee] rounded-[10px] text-[13px] focus:outline-none focus:border-client-primary" />
              <input type="email" placeholder="Email (tùy chọn)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-[9px] px-[12px] border border-[#eee] rounded-[10px] text-[13px] focus:outline-none focus:border-client-primary" />
            </div>

            <div className="mb-[12px]">
              <div className="text-[14px] font-[700] mb-[8px] text-client-secondary">Chọn thú cưng</div>
              <div className="grid grid-cols-1 gap-[8px]">
                {isLoadingPets && <div className="text-[12px] text-[#637381]">Đang tải thú cưng...</div>}
                {!isLoadingPets && myPets.length === 0 && (
                  <div className="text-[12px] text-[#637381]">
                    Bạn chưa có thú cưng nào. <Link to="/dashboard/pet" className="text-client-secondary font-[700]">Thêm mới</Link>
                  </div>
                )}
                {myPets.map((pet: any) => (
                  <button
                    type="button"
                    key={pet._id}
                    onClick={() => togglePet(pet._id)}
                    className={`w-full flex items-center gap-[10px] p-[8px] rounded-[10px] border text-left transition-default ${selectedPetIds.includes(pet._id) ? "border-client-primary bg-[#fff4eb]" : "border-[#f0f0f0] hover:border-[#f2d5bb]"}`}
                  >
                    <div className="w-[32px] h-[32px] rounded-full bg-[#f4f4f4] overflow-hidden flex items-center justify-center">
                      {pet.avatar ? <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" /> : <PawPrint className="w-4 h-4 text-[#888]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-[700]">{pet.name}</div>
                      <div className="text-[12px] text-[#637381]">{pet.breed || "Không rõ giống"}</div>
                    </div>
                    {selectedPetIds.includes(pet._id) && <Check className="w-4 h-4 text-client-secondary" />}
                  </button>
                ))}
              </div>
            </div>

            {selectedPets.length > 0 && (
              <div className="mb-[12px]">
                <div className="text-[14px] font-[700] mb-[8px] text-client-secondary">Gán chuồng cho từng thú cưng</div>
                <div className="space-y-[8px]">
                  {selectedPets.map((pet: any) => {
                    const selectedCageId = petCageMap[pet._id] || "";
                    const usedByOtherPets = selectedPetIds
                      .filter((id) => id !== pet._id)
                      .map((id) => petCageMap[id])
                      .filter(Boolean);

                    return (
                      <div key={pet._id} className="rounded-[10px] border border-[#f1e4d6] p-[8px] bg-[#fffaf5]">
                        <div className="text-[12px] font-[700] mb-[6px]">{pet.name}</div>
                        <select
                          value={selectedCageId}
                          onChange={(e) => setPetCage(pet._id, e.target.value)}
                          className="w-full py-[8px] px-[10px] border border-[#eee] rounded-[8px] text-[12px] focus:outline-none focus:border-client-primary"
                        >
                          <option value="">Chọn chuồng</option>
                          {cagesSafe.map((c: any) => {
                            const isUsedByOther = usedByOtherPets.includes(c._id);
                            return (
                              <option key={c._id} value={c._id} disabled={isUsedByOther}>
                                {`${c.cageCode || "Chuồng"} - ${c.type?.toUpperCase()} - ${Number(c.dailyPrice || 0).toLocaleString()}đ/ngày`}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-[12px]">
              <div className="text-[14px] font-[700] mb-[8px] text-client-secondary">Thanh toán</div>
              <div className="flex flex-col gap-[6px] text-[13px]">
                <label className="flex items-center gap-[8px]">
                  <input type="radio" name="paymentMethod" checked={paymentMethod === "pay_at_site"} onChange={() => setPaymentMethod("pay_at_site")} />
                  Thanh toán tại quầy
                </label>
                <label className="flex items-center gap-[8px]">
                  <input type="radio" name="paymentMethod" checked={paymentMethod === "prepaid"} onChange={() => setPaymentMethod("prepaid")} />
                  Thanh toán trước
                </label>
              </div>
              {paymentMethod === "prepaid" && (
                <div className="mt-[8px]">
                  <div className="text-[12px] text-[#d97706] mb-[6px]">Thanh toán trước giữ phòng trong 15 phút. Nếu đặt nhiều thú cưng, hệ thống sẽ tạo nhiều link thanh toán.</div>
                  <div className="flex items-center gap-[16px] text-[13px]">
                    <label className="flex items-center gap-[6px]">
                      <input type="radio" name="paymentGateway" checked={paymentGateway === "zalopay"} onChange={() => setPaymentGateway("zalopay")} />
                      ZaloPay
                    </label>
                    <label className="flex items-center gap-[6px]">
                      <input type="radio" name="paymentGateway" checked={paymentGateway === "vnpay"} onChange={() => setPaymentGateway("vnpay")} />
                      VNPay
                    </label>
                  </div>
                </div>
              )}

              {pendingPaymentLinks.length > 1 && (
                <div className="mt-[10px] rounded-[10px] border border-[#f2d5bb] bg-[#fff8ef] p-[10px]">
                  <div className="text-[12px] font-[700] text-client-secondary mb-[6px]">Link thanh toán đã tạo</div>
                  <div className="space-y-[6px]">
                    {pendingPaymentLinks.map((item, index) => (
                      <a
                        key={item.bookingId}
                        href={item.paymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-[8px] border border-[#ead8c8] bg-white px-[8px] py-[6px] text-[12px] hover:border-client-primary transition-default"
                      >
                        <span>{index + 1}. {item.petName}</span>
                        <span className="font-[700] text-client-primary">Mở thanh toán</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <textarea placeholder="Ghi chú thêm..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full py-[9px] px-[12px] border border-[#eee] rounded-[10px] text-[13px] mb-[8px] focus:outline-none focus:border-client-primary" />
            <input type="text" placeholder="Chăm sóc đặc biệt (tùy chọn)" value={specialCare} onChange={(e) => setSpecialCare(e.target.value)} className="w-full py-[9px] px-[12px] border border-[#eee] rounded-[10px] text-[13px] mb-[10px] focus:outline-none focus:border-client-primary" />

            <div className="p-[10px] rounded-[10px] bg-gradient-to-r from-[#fff7ef] to-[#fffaf5] border border-[#f1e4d6] mb-[10px] text-[13px]">
              <div className="flex items-center justify-between"><span>Số đêm</span><span className="font-[700]">{totalDays}</span></div>
              <div className="flex items-center justify-between"><span>Tạm tính</span><span className="font-[700] text-client-secondary">{totalPrice.toLocaleString()}đ</span></div>
            </div>

            {user ? (
              <button onClick={handleSubmit} className="w-full py-[10px] rounded-[10px] bg-client-primary text-white text-[13px] font-[700] hover:bg-client-secondary transition-default">
                Xác nhận đặt phòng
              </button>
            ) : (
              <Link to="/auth/login" className="block w-full text-center py-[10px] rounded-[10px] bg-gray-200 text-[#181818] font-[700] text-[13px]">
                Vui lòng đăng nhập
              </Link>
            )}
          </div>

          <div>
            <div className="text-[24px] font-secondary text-client-secondary mb-[10px]">Danh sách chuồng trống</div>
            {isLoadingCages && <div className="text-[13px] text-[#637381]">Đang tải...</div>}
            {!isLoadingCages && cagesSafe.length === 0 && <div className="text-[13px] text-[#637381]">Không có phòng trống phù hợp.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
              {cagesSafe.map((c: any) => {
                const assignedPet = selectedPets.find((pet: any) => petCageMap[pet._id] === c._id);
                return (
                  <div key={c._id} className="bg-white rounded-[16px] border border-[#f1e4d6] overflow-hidden hover:border-[#f2d5bb] transition-all duration-300">
                    <div className="h-[150px] bg-[#f4f4f4]">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.cageCode} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#999] text-[12px]">Không có hình</div>
                      )}
                    </div>
                    <div className="p-[10px]">
                      <div className="text-[14px] font-[700] text-client-secondary">{c.cageCode || "Chuồng"} - {c.type?.toUpperCase()}</div>
                      <div className="text-[12px] text-[#637381] mb-[6px]">Size {SIZE_LABELS[c.size] || c.size} • {Number(c.dailyPrice || 0).toLocaleString()}đ/ngày</div>
                      <div className="text-[12px] text-[#505050] line-clamp-2 min-h-[34px]">{c.description || "Phòng sạch sẽ, an toàn, đầy đủ tiện nghi cơ bản."}</div>
                      <div className="flex items-center justify-between mt-[8px]">
                        <Link to={`/hotels/${c._id}`} className="px-[10px] py-[5px] rounded-[8px] border border-[#18181820] text-[11px] inline-flex">
                          Chi tiết
                        </Link>
                        <div className="text-[11px] font-[700] text-client-primary">
                          {assignedPet ? `Đã gán: ${assignedPet.name}` : "Chưa gán"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
