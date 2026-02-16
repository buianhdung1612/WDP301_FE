import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { Calendar, Check, MapPin, PawPrint, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useMyPets } from "../../hooks/usePet";
import {
  useAvailableCages,
  useCreateBoardingBooking,
  usePayBoardingBooking,
} from "../../hooks/useBoarding";

const SIZE_LABELS: Record<string, string> = {
  M: "M",
  L: "L",
  XL: "XL",
  C: "C",
  B: "B",
  A: "A",
};

const TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại" },
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" },
];

const SIZE_OPTIONS = [
  { value: "", label: "Tất cả size" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "C", label: "C" },
  { value: "B", label: "B" },
  { value: "A", label: "A" },
];

export const BoardingBookingPage = () => {
  const { user } = useAuthStore();
  const { data: myPets = [], isLoading: isLoadingPets } = useMyPets(!!user);
  const { mutateAsync: createBoarding } = useCreateBoardingBooking();
  const { mutateAsync: payBoarding } = usePayBoardingBooking();

  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [checkInDate, setCheckInDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [type, setType] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [selectedCageId, setSelectedCageId] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [specialCare, setSpecialCare] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "pay_at_site">("pay_at_site");
  const [paymentGateway, setPaymentGateway] = useState<"zalopay" | "vnpay">("zalopay");

  const { data: cages = [], isLoading: isLoadingCages } = useAvailableCages(
    checkInDate,
    checkOutDate,
    type || undefined,
    size || undefined
  );
  const cagesSafe = Array.isArray(cages) ? cages : [];

  const totalDays = useMemo(() => {
    const start = dayjs(checkInDate);
    const end = dayjs(checkOutDate);
    const diff = end.diff(start, "day");
    return diff > 0 ? diff : 0;
  }, [checkInDate, checkOutDate]);

  const selectedCage = useMemo(
    () => cagesSafe.find((c: any) => c._id === selectedCageId),
    [cagesSafe, selectedCageId]
  );

  const totalPrice = useMemo(
    () => (!selectedCage || !totalDays ? 0 : (selectedCage.dailyPrice || 0) * totalDays),
    [selectedCage, totalDays]
  );

  const togglePet = (petId: string) => {
    setSelectedPetIds((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return toast.error("Vui lòng đăng nhập để đặt khách sạn!");
    if (totalDays <= 0) return toast.error("Ngày trả phải sau ngày nhận!");
    if (!selectedCageId) return toast.error("Vui lòng chọn chuồng/phòng!");
    if (!selectedPetIds.length) return toast.error("Vui lòng chọn thú cưng!");
    if (paymentMethod === "prepaid" && !paymentGateway) return toast.error("Vui lòng chọn cổng thanh toán!");

    try {
      const created = await createBoarding({
        cageId: selectedCageId,
        checkInDate,
        checkOutDate,
        petIds: selectedPetIds,
        fullName,
        phone,
        email,
        notes,
        specialCare,
        paymentMethod,
        paymentGateway,
      });

      const bookingId = created?.data?.data?._id;
      toast.success(created?.data?.message || "Đặt khách sạn thành công!");

      if (paymentMethod === "prepaid" && bookingId) {
        const payRes = await payBoarding({ id: bookingId, gateway: paymentGateway });
        const paymentUrl = payRes?.data?.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
      }

      setSelectedCageId(null);
      setSelectedPetIds([]);
      setNotes("");
      setSpecialCare("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đặt khách sạn thất bại!");
    }
  };

  return (
    <div className="bg-[#fcfcfc]">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#fff3ea] via-[#fffaf2] to-[#fff]">
        <div className="app-container py-[60px]">
          <div className="flex flex-col lg:flex-row items-center gap-[30px]">
            <div className="w-full lg:w-[55%]">
              <div className="text-[4.2rem] font-third text-[#181818] leading-[1.1]">Khách sạn thú cưng</div>
              <p className="text-[1.7rem] text-[#505050] mt-[12px]">
                Trải nghiệm lưu trú an toàn, sạch sẽ và chuyên nghiệp.
              </p>
              <div className="flex items-center gap-[10px] mt-[18px] text-[1.4rem] text-[#637381]">
                <MapPin className="w-4 h-4 text-client-secondary" />
                64 Ung Văn Khiêm, Pleiku, Gia Lai
              </div>
            </div>
            <div className="w-full lg:w-[45%] bg-white rounded-[18px] shadow-sm p-[18px] border border-[#f1e4d6]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                <div>
                  <label className="block text-[1.3rem] font-bold mb-[6px]">Nhận</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={dayjs().format("YYYY-MM-DD")}
                    className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem]"
                  />
                </div>
                <div>
                  <label className="block text-[1.3rem] font-bold mb-[6px]">Trả</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={dayjs(checkInDate).add(1, "day").format("YYYY-MM-DD")}
                    className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem]"
                  />
                </div>
              </div>
              <div className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem]"
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
                  className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem]"
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
                className="w-full mt-[12px] py-[12px] rounded-[12px] bg-client-secondary text-white text-[1.4rem] font-bold flex items-center justify-center gap-[8px]"
              >
                <Search className="w-4 h-4" />
                Tìm phòng trống
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="app-container py-[50px]">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-[24px]">
          <div className="bg-white rounded-[18px] border border-[#f1e4d6] p-[18px] h-fit">
            <div className="text-[1.8rem] font-bold mb-[10px]">Thông tin đặt phòng</div>
            <div className="grid grid-cols-1 gap-[10px] mb-[14px]">
              <input type="text" placeholder="Họ và tên" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem]" />
              <input type="text" placeholder="Số điện thoại" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem]" />
              <input type="email" placeholder="Email (tùy chọn)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem]" />
            </div>

            <div className="mb-[14px]">
              <div className="text-[1.4rem] font-bold mb-[8px]">Chọn thú cưng</div>
              <div className="grid grid-cols-1 gap-[8px]">
                {isLoadingPets && <div className="text-[1.3rem] text-[#637381]">Đang tải thú cưng...</div>}
                {!isLoadingPets && myPets.length === 0 && (
                  <div className="text-[1.3rem] text-[#637381]">
                    Bạn chưa có thú cưng nào. <Link to="/ca-nhan/thu-cung" className="text-client-secondary font-bold">Thêm mới</Link>
                  </div>
                )}
                {myPets.map((pet: any) => (
                  <button type="button" key={pet._id} onClick={() => togglePet(pet._id)} className={`w-full flex items-center gap-[10px] p-[8px] rounded-[12px] border text-left ${selectedPetIds.includes(pet._id) ? "border-client-secondary bg-[#fff7f0]" : "border-[#f0f0f0]"}`}>
                    <div className="w-[34px] h-[34px] rounded-full bg-[#f4f4f4] overflow-hidden flex items-center justify-center">
                      {pet.avatar ? <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" /> : <PawPrint className="w-4 h-4 text-[#888]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-[1.3rem] font-bold">{pet.name}</div>
                      <div className="text-[1.2rem] text-[#637381]">{pet.breed || "Không rõ giống"}</div>
                    </div>
                    {selectedPetIds.includes(pet._id) && <Check className="w-4 h-4 text-client-secondary" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-[14px]">
              <div className="text-[1.4rem] font-bold mb-[8px]">Thanh toán</div>
              <div className="flex flex-col gap-[6px] text-[1.3rem]">
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
                  <div className="text-[1.2rem] text-[#d97706] mb-[6px]">
                    Chọn thanh toán trước sẽ giữ phòng tạm thời trong 15 phút.
                  </div>
                  <div className="flex items-center gap-[16px] text-[1.3rem]">
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
            </div>

            <textarea placeholder="Ghi chú thêm..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] mb-[10px]" />
            <input type="text" placeholder="Chăm sóc đặc biệt (tùy chọn)" value={specialCare} onChange={(e) => setSpecialCare(e.target.value)} className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] mb-[12px]" />

            <div className="p-[12px] rounded-[12px] bg-[#fff7f0] border border-[#f1e4d6] mb-[12px] text-[1.3rem]">
              <div className="flex items-center justify-between"><span>Số đêm</span><span className="font-bold">{totalDays}</span></div>
              <div className="flex items-center justify-between"><span>Tạm tính</span><span className="font-bold text-client-secondary">{totalPrice.toLocaleString()}đ</span></div>
            </div>

            {user ? (
              <button onClick={handleSubmit} className="w-full py-[12px] rounded-[12px] bg-client-secondary text-white text-[1.4rem] font-bold">
                Xác nhận đặt phòng
              </button>
            ) : (
              <Link to="/auth/login" className="block w-full text-center py-[12px] rounded-[12px] bg-gray-200 text-[#181818] font-bold text-[1.4rem]">
                Vui lòng đăng nhập
              </Link>
            )}
          </div>

          <div>
            <div className="text-[2rem] font-bold mb-[12px]">Phòng trống</div>
            {isLoadingCages && <div className="text-[1.4rem] text-[#637381]">Đang tải...</div>}
            {!isLoadingCages && cagesSafe.length === 0 && <div className="text-[1.4rem] text-[#637381]">Không có phòng trống phù hợp.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              {cagesSafe.map((c: any) => (
                <div key={c._id} className="bg-white rounded-[16px] border border-[#f1e4d6] overflow-hidden">
                  <div className="h-[160px] bg-[#f4f4f4]">
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.cageCode} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#999] text-[1.3rem]">No image</div>
                    )}
                  </div>
                  <div className="p-[12px]">
                    <div className="text-[1.5rem] font-bold">{c.cageCode || "Chuồng"} - {c.type?.toUpperCase()}</div>
                    <div className="text-[1.3rem] text-[#637381] mb-[8px]">Size {SIZE_LABELS[c.size] || c.size} • {Number(c.dailyPrice || 0).toLocaleString()}đ/ngày</div>
                    <div className="text-[1.3rem] text-[#505050] line-clamp-2 min-h-[38px]">{c.description || "Phòng sạch sẽ, an toàn, đầy đủ tiện nghi cơ bản."}</div>
                    <div className="flex items-center gap-[8px] mt-[10px]">
                      <Link to={`/khach-san/${c._id}`} className="px-[12px] py-[6px] rounded-[10px] border border-[#18181820] text-[1.2rem] inline-flex">
                        Chi tiết
                      </Link>
                      <button type="button" onClick={() => setSelectedCageId(c._id)} className="px-[12px] py-[6px] rounded-[10px] bg-client-secondary text-white text-[1.2rem]">
                        {selectedCageId === c._id ? "Đã chọn" : "Chọn"}
                      </button>
                      {selectedCageId === c._id && <Check className="w-4 h-4 text-client-secondary" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
