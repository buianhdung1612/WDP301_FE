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
  M: "M",
  L: "L",
  XL: "XL",
  C: "C",
  B: "B",
  A: "A",
};

const TYPE_OPTIONS = [
  { value: "", label: "Tat ca loai" },
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" },
];

const SIZE_OPTIONS = [
  { value: "", label: "Tat ca size" },
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

    if (!user) return toast.error("Vui long dang nhap de dat khach san!");
    if (totalDays <= 0) return toast.error("Ngay tra phai sau ngay nhan!");
    if (!selectedCageId) return toast.error("Vui long chon chuong/phong!");
    if (!selectedPetIds.length) return toast.error("Vui long chon thu cung!");
    if (paymentMethod === "prepaid" && !paymentGateway) return toast.error("Vui long chon cong thanh toan!");

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
      toast.success(created?.data?.message || "Dat khach san thanh cong!");

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
      toast.error(err?.response?.data?.message || "Dat khach san that bai!");
    }
  };

  return (
    <div className="bg-[#fffdf9]">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#fff1e6] via-[#fff8ef] to-[#fff]">
        <img
          src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/10/shape1-17.png"
          alt=""
          className="absolute top-[15%] left-[3%] w-[56px] opacity-35 animation-shake"
        />
        <img
          src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/10/shape1-5.png"
          alt=""
          className="absolute bottom-[10%] right-[4%] w-[56px] opacity-35 animation-jumpReverseAni"
        />

        <div className="app-container py-[60px]">
          <div className="flex flex-col lg:flex-row items-center gap-[30px]">
            <div className="w-full lg:w-[55%]">
              <div className="inline-flex items-center gap-[8px] py-[8px] px-[14px] rounded-full bg-[#fff0e2] text-client-primary text-[1.3rem] uppercase tracking-[1.2px] font-[700] mb-[14px]">
                <Sparkles className="w-4 h-4" />
                Luu tru an tam
              </div>
              <div className="text-[4.4rem] font-secondary text-client-secondary leading-[1.05]">Khach san thu cung</div>
              <p className="text-[1.7rem] text-[#505050] mt-[12px]">
                Trai nghiem luu tru an toan, sach se va chuyen nghiep voi quy trinh cham soc rieng cho tung be.
              </p>
              <div className="flex items-center gap-[10px] mt-[18px] text-[1.4rem] text-[#637381]">
                <MapPin className="w-4 h-4 text-client-secondary" />
                64 Ung Van Khiem, Pleiku, Gia Lai
              </div>
            </div>

            <div className="w-full lg:w-[45%] bg-white rounded-[24px] shadow-[0_18px_45px_-28px_rgba(230,126,32,0.5)] p-[18px] border border-[#f1e4d6]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                <div>
                  <label className="block text-[1.3rem] font-[700] mb-[6px] text-client-secondary">Nhan</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={dayjs().format("YYYY-MM-DD")}
                    className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] focus:outline-none focus:border-client-primary"
                  />
                </div>
                <div>
                  <label className="block text-[1.3rem] font-[700] mb-[6px] text-client-secondary">Tra</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={dayjs(checkInDate).add(1, "day").format("YYYY-MM-DD")}
                    className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] focus:outline-none focus:border-client-primary"
                  />
                </div>
              </div>

              <div className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] focus:outline-none focus:border-client-primary"
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
                  className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] focus:outline-none focus:border-client-primary"
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
                className="w-full mt-[12px] py-[12px] rounded-[12px] bg-client-primary text-white text-[1.4rem] font-[700] flex items-center justify-center gap-[8px] hover:bg-client-secondary transition-default"
              >
                <Search className="w-4 h-4" />
                Tim phong trong
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="app-container py-[50px]">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-[24px]">
          <div className="bg-white rounded-[24px] border border-[#f1e4d6] p-[18px] h-fit shadow-[0_18px_45px_-34px_rgba(230,126,32,0.5)]">
            <div className="text-[2.1rem] font-secondary text-client-secondary mb-[10px]">Thong tin dat phong</div>
            <div className="grid grid-cols-1 gap-[10px] mb-[14px]">
              <input type="text" placeholder="Ho va ten" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] focus:outline-none focus:border-client-primary" />
              <input type="text" placeholder="So dien thoai" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] focus:outline-none focus:border-client-primary" />
              <input type="email" placeholder="Email (tuy chon)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] focus:outline-none focus:border-client-primary" />
            </div>

            <div className="mb-[14px]">
              <div className="text-[1.5rem] font-[700] mb-[8px] text-client-secondary">Chon thu cung</div>
              <div className="grid grid-cols-1 gap-[8px]">
                {isLoadingPets && <div className="text-[1.3rem] text-[#637381]">Dang tai thu cung...</div>}
                {!isLoadingPets && myPets.length === 0 && (
                  <div className="text-[1.3rem] text-[#637381]">
                    Ban chua co thu cung nao. <Link to="/dashboard/pet" className="text-client-secondary font-[700]">Them moi</Link>
                  </div>
                )}
                {myPets.map((pet: any) => (
                  <button type="button" key={pet._id} onClick={() => togglePet(pet._id)} className={`w-full flex items-center gap-[10px] p-[8px] rounded-[12px] border text-left transition-default ${selectedPetIds.includes(pet._id) ? "border-client-primary bg-[#fff4eb]" : "border-[#f0f0f0] hover:border-[#f2d5bb]"}`}>
                    <div className="w-[34px] h-[34px] rounded-full bg-[#f4f4f4] overflow-hidden flex items-center justify-center">
                      {pet.avatar ? <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" /> : <PawPrint className="w-4 h-4 text-[#888]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-[1.3rem] font-[700]">{pet.name}</div>
                      <div className="text-[1.2rem] text-[#637381]">{pet.breed || "Khong ro giong"}</div>
                    </div>
                    {selectedPetIds.includes(pet._id) && <Check className="w-4 h-4 text-client-secondary" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-[14px]">
              <div className="text-[1.5rem] font-[700] mb-[8px] text-client-secondary">Thanh toan</div>
              <div className="flex flex-col gap-[6px] text-[1.3rem]">
                <label className="flex items-center gap-[8px]">
                  <input type="radio" name="paymentMethod" checked={paymentMethod === "pay_at_site"} onChange={() => setPaymentMethod("pay_at_site")} />
                  Thanh toan tai quay
                </label>
                <label className="flex items-center gap-[8px]">
                  <input type="radio" name="paymentMethod" checked={paymentMethod === "prepaid"} onChange={() => setPaymentMethod("prepaid")} />
                  Thanh toan truoc
                </label>
              </div>
              {paymentMethod === "prepaid" && (
                <div className="mt-[8px]">
                  <div className="text-[1.2rem] text-[#d97706] mb-[6px]">
                    Chon thanh toan truoc se giu phong tam thoi trong 15 phut.
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

            <textarea placeholder="Ghi chu them..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] mb-[10px] focus:outline-none focus:border-client-primary" />
            <input type="text" placeholder="Cham soc dac biet (tuy chon)" value={specialCare} onChange={(e) => setSpecialCare(e.target.value)} className="w-full py-[10px] px-[14px] border border-[#eee] rounded-[12px] text-[1.3rem] mb-[12px] focus:outline-none focus:border-client-primary" />

            <div className="p-[12px] rounded-[12px] bg-gradient-to-r from-[#fff7ef] to-[#fffaf5] border border-[#f1e4d6] mb-[12px] text-[1.3rem]">
              <div className="flex items-center justify-between"><span>So dem</span><span className="font-[700]">{totalDays}</span></div>
              <div className="flex items-center justify-between"><span>Tam tinh</span><span className="font-[700] text-client-secondary">{totalPrice.toLocaleString()}d</span></div>
            </div>

            {user ? (
              <button onClick={handleSubmit} className="w-full py-[12px] rounded-[12px] bg-client-primary text-white text-[1.4rem] font-[700] hover:bg-client-secondary transition-default">
                Xac nhan dat phong
              </button>
            ) : (
              <Link to="/auth/login" className="block w-full text-center py-[12px] rounded-[12px] bg-gray-200 text-[#181818] font-[700] text-[1.4rem]">
                Vui long dang nhap
              </Link>
            )}
          </div>

          <div>
            <div className="text-[2.8rem] font-secondary text-client-secondary mb-[12px]">Phong trong</div>
            {isLoadingCages && <div className="text-[1.4rem] text-[#637381]">Dang tai...</div>}
            {!isLoadingCages && cagesSafe.length === 0 && <div className="text-[1.4rem] text-[#637381]">Khong co phong trong phu hop.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              {cagesSafe.map((c: any) => (
                <div key={c._id} className={`bg-white rounded-[20px] border overflow-hidden transition-all duration-300 ${selectedCageId === c._id ? "border-client-primary shadow-[0_18px_35px_-25px_rgba(230,126,32,0.6)] translate-y-[-2px]" : "border-[#f1e4d6] hover:border-[#f2d5bb]"}`}>
                  <div className="h-[160px] bg-[#f4f4f4]">
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.cageCode} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#999] text-[1.3rem]">No image</div>
                    )}
                  </div>
                  <div className="p-[12px]">
                    <div className="text-[1.6rem] font-[700] text-client-secondary">{c.cageCode || "Chuong"} - {c.type?.toUpperCase()}</div>
                    <div className="text-[1.3rem] text-[#637381] mb-[8px]">Size {SIZE_LABELS[c.size] || c.size} • {Number(c.dailyPrice || 0).toLocaleString()}d/ngay</div>
                    <div className="text-[1.3rem] text-[#505050] line-clamp-2 min-h-[38px]">{c.description || "Phong sach se, an toan, day du tien nghi co ban."}</div>
                    <div className="flex items-center gap-[8px] mt-[10px]">
                      <Link to={`/hotels/${c._id}`} className="px-[12px] py-[6px] rounded-[10px] border border-[#18181820] text-[1.2rem] inline-flex">
                        Chi tiet
                      </Link>
                      <button type="button" onClick={() => setSelectedCageId(c._id)} className="px-[12px] py-[6px] rounded-[10px] bg-client-primary text-white text-[1.2rem] hover:bg-client-secondary transition-default">
                        {selectedCageId === c._id ? "Da chon" : "Chon"}
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
