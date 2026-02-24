import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import { Pet, PetPayload } from "../../api/pet.api";
import { useCreateMyPet, useMyPets, useUpdateMyPet } from "../../hooks/usePet";

type PetFormState = PetPayload;

const defaultForm: PetFormState = {
  name: "",
  type: "dog",
  breed: "",
  weight: undefined,
  age: undefined,
  color: "",
  gender: "unknown",
  healthStatus: "accepted",
  notes: "",
  avatar: ""
};

export const PetManagementPage = () => {
  const breadcrumbs = [
    { label: "Trang chủ", to: "/" },
    { label: "Tài khoản", to: "/dashboard/profile" },
    { label: "Thú cưng", to: "/dashboard/pets" }
  ];

  const { data: pets = [], isLoading } = useMyPets(true);
  const createMutation = useCreateMyPet();
  const updateMutation = useUpdateMyPet();

  const [isOpen, setIsOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [form, setForm] = useState<PetFormState>(defaultForm);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isEditMode = !!editingPetId;

  const selectedPet = useMemo(() => {
    if (!editingPetId) return null;
    return pets.find((pet: Pet) => pet._id === editingPetId) || null;
  }, [editingPetId, pets]);

  useEffect(() => {
    if (!selectedPet) return;
    setForm({
      name: selectedPet.name || "",
      type: selectedPet.type || "dog",
      breed: selectedPet.breed || "",
      weight: selectedPet.weight,
      age: selectedPet.age,
      color: selectedPet.color || "",
      gender: selectedPet.gender || "unknown",
      healthStatus: selectedPet.healthStatus || "accepted",
      notes: selectedPet.notes || "",
      avatar: selectedPet.avatar || ""
    });
  }, [selectedPet]);

  const openCreateModal = () => {
    setEditingPetId(null);
    setForm(defaultForm);
    setIsOpen(true);
  };

  const openEditModal = (pet: Pet) => {
    setEditingPetId(pet._id);
    setIsOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    setEditingPetId(null);
    setForm(defaultForm);
  };

  const onChangeField = <K extends keyof PetFormState>(key: K, value: PetFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên thú cưng");
      return;
    }

    try {
      const payload: PetPayload = {
        ...form,
        name: form.name.trim(),
        breed: form.breed?.trim() || "",
        color: form.color?.trim() || "",
        notes: form.notes?.trim() || "",
        avatar: form.avatar?.trim() || "",
        weight: form.weight ? Number(form.weight) : undefined,
        age: form.age ? Number(form.age) : undefined
      };

      if (isEditMode && editingPetId) {
        await updateMutation.mutateAsync({ id: editingPetId, data: payload });
        toast.success("Cập nhật thú cưng thành công");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Thêm thú cưng thành công");
      }
      closeModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể lưu thông tin thú cưng");
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "dog") return "Chó";
    if (type === "cat") return "Mèo";
    return type;
  };

  const getGenderLabel = (gender?: string) => {
    if (gender === "male") return "Đực";
    if (gender === "female") return "Cái";
    return "Không rõ";
  };

  return (
    <>
      <ProductBanner
        pageTitle="Quản lý thú cưng"
        breadcrumbs={breadcrumbs}
        url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
        className="bg-top"
      />

      <div className="mt-[-150px] mb-[100px] w-[1600px] mx-auto flex items-stretch">
        <div className="w-[25%] px-[12px] flex">
          <Sidebar />
        </div>

        <div className="w-[75%] px-[12px]">
          <div className="mt-[100px] p-[35px] bg-white shadow-[0px_8px_24px_#959da533] rounded-[12px]">
            <div className="flex items-center justify-between mb-[25px]">
              <h3 className="text-[2.4rem] font-[600] text-client-secondary">Danh sách thú cưng của tôi</h3>
              <button
                onClick={openCreateModal}
                className="rounded-[8px] bg-client-primary text-white px-[18px] py-[10px] text-[1.4rem] font-[500] hover:bg-client-secondary transition-all"
              >
                Thêm thú cưng
              </button>
            </div>

            {isLoading ? (
              <div className="text-[1.5rem] text-[#666]">Đang tải dữ liệu...</div>
            ) : pets.length === 0 ? (
              <div className="p-[20px] border border-dashed border-[#ddd] rounded-[10px] text-[1.5rem] text-[#666]">
                Bạn chưa có thú cưng nào. Hãy thêm thú cưng đầu tiên.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-[14px]">
                {pets.map((pet: Pet) => (
                  <div key={pet._id} className="border border-[#eee] rounded-[12px] p-[16px]">
                    <div className="flex items-start gap-[12px]">
                      <div className="w-[72px] h-[72px] rounded-[10px] overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                        {pet.avatar ? (
                          <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[1.3rem] text-[#888]">No image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[1.8rem] font-[600] text-client-secondary truncate">{pet.name}</h4>
                        <p className="text-[1.4rem] text-[#666]">
                          {getTypeLabel(pet.type)} - {pet.breed || "Không rõ giống"}
                        </p>
                        <p className="text-[1.3rem] text-[#7d7b7b] mt-[2px]">
                          Giới tính: {getGenderLabel(pet.gender)}
                          {typeof pet.weight === "number" ? ` | ${pet.weight}kg` : ""}
                          {typeof pet.age === "number" ? ` | ${pet.age} tuổi` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-[12px] flex items-center gap-[8px]">
                      <button
                        onClick={() => openEditModal(pet)}
                        className="rounded-[8px] px-[14px] py-[8px] text-[1.3rem] bg-[#fff0f0] text-client-primary hover:bg-client-primary hover:text-white transition-all"
                      >
                        Chỉnh sửa
                      </button>
                      <Link
                        to="/khach-san"
                        className="rounded-[8px] px-[14px] py-[8px] text-[1.3rem] bg-[#f7f7f7] text-[#555] hover:text-client-primary transition-all"
                      >
                        Đặt khách sạn
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/45 flex items-center justify-center p-[20px]">
          <div className="w-full max-w-[720px] bg-white rounded-[12px] shadow-xl p-[24px]">
            <div className="flex items-center justify-between mb-[16px]">
              <h4 className="text-[2rem] font-[600] text-client-secondary">
                {isEditMode ? "Chỉnh sửa thú cưng" : "Thêm thú cưng"}
              </h4>
              <button onClick={closeModal} className="text-[1.6rem] text-[#888] hover:text-[#333]" disabled={isSubmitting}>
                Đóng
              </button>
            </div>

            <form onSubmit={submitForm} className="grid grid-cols-2 gap-[12px]">
              <div className="col-span-2">
                <label className="text-[1.4rem] text-[#444]">Tên thú cưng *</label>
                <input
                  className="mt-[6px] w-full rounded-[8px] border border-[#ddd] px-[12px] py-[10px] text-[1.4rem]"
                  value={form.name}
                  onChange={(e) => onChangeField("name", e.target.value)}
                  placeholder="Ví dụ: Milo"
                />
              </div>

              <div>
                <label className="text-[1.4rem] text-[#444]">Loài</label>
                <select
                  className="mt-[6px] w-full rounded-[8px] border border-[#ddd] px-[12px] py-[10px] text-[1.4rem]"
                  value={form.type}
                  onChange={(e) => onChangeField("type", e.target.value as "dog" | "cat")}
                >
                  <option value="dog">Chó</option>
                  <option value="cat">Mèo</option>
                </select>
              </div>

              <div>
                <label className="text-[1.4rem] text-[#444]">Giống</label>
                <input
                  className="mt-[6px] w-full rounded-[8px] border border-[#ddd] px-[12px] py-[10px] text-[1.4rem]"
                  value={form.breed || ""}
                  onChange={(e) => onChangeField("breed", e.target.value)}
                />
              </div>

              <div>
                <label className="text-[1.4rem] text-[#444]">Cân nặng (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="mt-[6px] w-full rounded-[8px] border border-[#ddd] px-[12px] py-[10px] text-[1.4rem]"
                  value={form.weight ?? ""}
                  onChange={(e) => onChangeField("weight", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <label className="text-[1.4rem] text-[#444]">Tuổi</label>
                <input
                  type="number"
                  min="0"
                  className="mt-[6px] w-full rounded-[8px] border border-[#ddd] px-[12px] py-[10px] text-[1.4rem]"
                  value={form.age ?? ""}
                  onChange={(e) => onChangeField("age", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <label className="text-[1.4rem] text-[#444]">Giới tính</label>
                <select
                  className="mt-[6px] w-full rounded-[8px] border border-[#ddd] px-[12px] py-[10px] text-[1.4rem]"
                  value={form.gender || "unknown"}
                  onChange={(e) => onChangeField("gender", e.target.value as "male" | "female" | "unknown")}
                >
                  <option value="unknown">Không rõ</option>
                  <option value="male">Đực</option>
                  <option value="female">Cái</option>
                </select>
              </div>

              <div>
                <label className="text-[1.4rem] text-[#444]">Màu lông</label>
                <input
                  className="mt-[6px] w-full rounded-[8px] border border-[#ddd] px-[12px] py-[10px] text-[1.4rem]"
                  value={form.color || ""}
                  onChange={(e) => onChangeField("color", e.target.value)}
                />
              </div>

              <div>
                <label className="text-[1.4rem] text-[#444]">Tình trạng sức khỏe</label>
                <select
                  className="mt-[6px] w-full rounded-[8px] border border-[#ddd] px-[12px] py-[10px] text-[1.4rem]"
                  value={form.healthStatus || "accepted"}
                  onChange={(e) => onChangeField("healthStatus", e.target.value as "accepted" | "rejected")}
                >
                  <option value="accepted">Bình thường</option>
                  <option value="rejected">Cần theo dõi</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[1.4rem] text-[#444]">Ảnh đại diện (URL)</label>
                <input
                  className="mt-[6px] w-full rounded-[8px] border border-[#ddd] px-[12px] py-[10px] text-[1.4rem]"
                  value={form.avatar || ""}
                  onChange={(e) => onChangeField("avatar", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="col-span-2">
                <label className="text-[1.4rem] text-[#444]">Ghi chú</label>
                <textarea
                  className="mt-[6px] w-full rounded-[8px] border border-[#ddd] px-[12px] py-[10px] text-[1.4rem] min-h-[90px]"
                  value={form.notes || ""}
                  onChange={(e) => onChangeField("notes", e.target.value)}
                />
              </div>

              <div className="col-span-2 mt-[4px] flex justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-[8px] px-[16px] py-[10px] text-[1.4rem] bg-[#f2f2f2] text-[#555] hover:bg-[#e7e7e7]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-[8px] px-[16px] py-[10px] text-[1.4rem] bg-client-primary text-white hover:bg-client-secondary disabled:opacity-70"
                >
                  {isSubmitting ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Thêm thú cưng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
