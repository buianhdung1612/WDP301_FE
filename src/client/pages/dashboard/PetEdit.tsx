import { Link, useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "./sections/Sidebar";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getPetDetail, updatePet } from "../../api/pet.api";
import { ProductBanner } from "../product/sections/ProductBanner";
import { ArrowRight, Camera } from "lucide-react";
import { uploadImagesToCloudinary } from "../../../admin/api/uploadCloudinary.api";
import CreatableSelect from 'react-select/creatable';
import { useBreeds, useCreateBreed } from "../../../admin/pages/account-user/hooks/useBreed";
import { Icon } from "@iconify/react";

interface BreedOption {
    label: string;
    value: string;
    __isNew__?: boolean;
}

const schema = z.object({
    name: z.string()
        .min(2, "Tên thú cưng phải có ít nhất 2 ký tự!")
        .nonempty("Vui lòng nhập tên thú cưng!"),
    type: z.enum(["dog", "cat"]),
    breed: z.string().optional(),
    weight: z.number().min(0.1, "Cân nặng phải lớn hơn 0!"),
    avatar: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const PetEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const petType = watch("type");
    const petBreed = watch("breed");
    const { data: breeds = [] } = useBreeds(petType);
    const { mutate: createBreedMutate } = useCreateBreed();

    const breedOptions: BreedOption[] = breeds.map((b: any) => ({
        label: b.name,
        value: b.name
    }));

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                const response = await getPetDetail(id);
                if (response.code === 200) {
                    reset(response.data);
                    setPreview(response.data.avatar);
                } else {
                    toast.error("Không tìm thấy thông tin thú cưng!");
                    navigate("/dashboard/pet");
                }
            } catch (error) {
                toast.error("Lỗi lấy thông tin thú cưng!");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, reset, navigate]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setUploading(true);
            try {
                const urls = await uploadImagesToCloudinary(Array.from(files));
                if (urls && urls.length > 0) {
                    setValue("avatar", urls[0], { shouldDirty: true });
                    setPreview(urls[0]);
                    toast.success("Tải ảnh lên thành công!");
                }
            } catch (err) {
                toast.error("Lỗi tải ảnh!");
            } finally {
                setUploading(false);
            }
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!id) return;
        try {
            const response = await updatePet(id, data);
            if (response.code === 200) {
                toast.success(response.message || "Đã cập nhật thông tin thành công!");
                navigate("/dashboard/pet");
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra!");
        }
    };

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/overview" },
        { label: "Danh sách thú cưng", to: "/dashboard/pet" },
        { label: "Chỉnh sửa thông tin", to: `/dashboard/pet/edit/${id}` },
    ];

    if (loading) return null;

    return (
        <>
            <ProductBanner
                pageTitle="Chỉnh sửa thông tin bé"
                breadcrumbs={breadcrumbs}
                url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
                className="bg-top"
            />

            <div className="mt-[-150px] mb-[100px] app-container flex items-stretch">
                <div className="w-[25%] px-[12px] flex">
                    <Sidebar />
                </div>
                <div className="w-[75%] px-[12px]">
                    <div className="mt-[100px] p-[35px] bg-white shadow-[0px_8px_24px_#959da533] rounded-[12px]">
                        <h3 className="text-[24px] font-[700] text-client-secondary mb-[25px] flex items-center justify-between uppercase">
                            Chỉnh sửa thông tin
                            <Link className="relative overflow-hidden group bg-orange-400 rounded-full px-[25px] py-[10px] font-[600] text-[14px] text-white" to={"/dashboard/pet"}>
                                <span className="relative z-10">Quay lại</span>
                                <div className="absolute top-0 left-0 w-full h-full bg-orange-500 transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                            </Link>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px]">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-[20px]">
                                <div className="group relative">
                                    <div className="w-[160px] h-[160px] rounded-full border-4 border-white shadow-[0_8px_20px_rgba(0,0,0,0.1)] overflow-hidden relative transition-transform duration-500 hover:scale-[1.02]">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                className={`w-full h-full object-cover transition-all duration-500 ${uploading ? 'scale-110 blur-[2px]' : 'group-hover:scale-110'}`}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-[#f8f9fa] flex flex-col items-center justify-center text-[#919eab]">
                                                <Camera className="w-[32px] h-[32px] mb-1" />
                                                <span className="text-[12px] font-bold uppercase tracking-wider">Tải ảnh lên</span>
                                            </div>
                                        )}

                                        <label className="absolute inset-0 bg-client-secondary/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]">
                                            <Camera className="w-[32px] h-[32px] mb-1 animate-bounce" />
                                            <span className="text-[11px] font-bold tracking-wider uppercase">{preview ? "Đổi ảnh bé" : "Tải ảnh lên"}</span>
                                            <input type="file" hidden accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                                        </label>

                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center backdrop-blur-[4px]">
                                                <div className="w-10 h-10 border-[3px] border-client-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                                                <span className="text-[10px] font-bold text-client-secondary uppercase animate-pulse">Đang tải...</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Badge */}
                                    {!uploading && (
                                        <div className="absolute bottom-2 right-2 w-[42px] h-[42px] bg-client-primary rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg pointer-events-none transform transition-transform duration-300 group-hover:scale-110">
                                            <Icon icon="solar:pen-bold" width={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center w-full">
                                    <p className="text-[14px] text-client-secondary font-bold mb-1">Ảnh của bé cưng</p>
                                    <p className="text-[12px] text-[#7d7b7b] leading-tight italic max-w-[180px] mx-auto">Một tấm ảnh thật xinh <br /> sẽ giúp tụi mình nhận biết nhanh hơn!</p>
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="md:col-span-2">
                                <form className="space-y-[25px]" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="grid grid-cols-2 gap-[20px]">
                                        <div className="flex flex-col gap-[8px]">
                                            <label className="text-[15px] font-[700] text-client-secondary">Tên bé cưng <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                {...register("name")}
                                                className={`border rounded-[15px] px-[20px] py-[12px] text-[15px] focus:outline-none focus:border-client-primary transition-all bg-[#fcfcfc] hover:bg-white ${errors.name ? "border-red-500" : "border-[#eee]"}`}
                                                placeholder="Ví dụ: Lucky, Mimi..."
                                            />
                                            {errors.name && <span className="text-red-500 text-[13px] font-medium">{errors.name.message}</span>}
                                        </div>

                                        <div className="flex flex-col gap-[8px]">
                                            <label className="text-[15px] font-[700] text-client-secondary">Loài <span className="text-red-500">*</span></label>
                                            <select
                                                {...register("type")}
                                                className={`border rounded-[15px] px-[20px] py-[12px] text-[15px] focus:outline-none focus:border-client-primary transition-all bg-[#fcfcfc] hover:bg-white ${errors.type ? "border-red-500" : "border-[#eee]"}`}
                                            >
                                                <option value="dog">Chó</option>
                                                <option value="cat">Mèo</option>
                                            </select>
                                            {errors.type && <span className="text-red-500 text-[13px] font-medium">{errors.type.message}</span>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-[20px]">
                                        <div className="flex flex-col gap-[8px]">
                                            <label className="text-[15px] font-[700] text-client-secondary">Giống bé (Breed)</label>
                                            <CreatableSelect
                                                isClearable
                                                options={breedOptions}
                                                value={petBreed ? { label: petBreed, value: petBreed } : null}
                                                onChange={(newValue) => {
                                                    const val = (newValue as BreedOption)?.value || "";
                                                    setValue("breed", val);

                                                    // If it's a new option, create it in backend
                                                    if ((newValue as any)?.__isNew__) {
                                                        createBreedMutate({ name: val, type: petType });
                                                    }
                                                }}
                                                placeholder="Ví dụ: Poodle, Golden..."
                                                formatCreateLabel={(inputValue) => `Thêm giống "${inputValue}"`}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        borderRadius: '15px',
                                                        padding: '4px 8px',
                                                        fontSize: '15px',
                                                        backgroundColor: '#fcfcfc',
                                                        borderColor: '#eee',
                                                        boxShadow: 'none',
                                                        '&:hover': {
                                                            borderColor: '#F8721F',
                                                            backgroundColor: 'white'
                                                        }
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        borderRadius: '15px',
                                                        fontSize: '15px',
                                                        overflow: 'hidden',
                                                        zIndex: 100, // Fix z-index issue
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused ? '#F8721F1a' : 'white',
                                                        color: state.isFocused ? '#F8721F' : 'inherit',
                                                        padding: '10px 20px',
                                                        '&:active': {
                                                            backgroundColor: '#F8721F33'
                                                        }
                                                    })
                                                }}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-[8px]">
                                            <label className="text-[15px] font-[700] text-client-secondary">Cân nặng (kg) <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                {...register("weight", { valueAsNumber: true })}
                                                className={`border rounded-[15px] px-[20px] py-[12px] text-[15px] focus:outline-none focus:border-client-primary transition-all bg-[#fcfcfc] hover:bg-white ${errors.weight ? "border-red-500" : "border-[#eee]"}`}
                                            />
                                            {errors.weight && <span className="text-red-500 text-[13px] font-medium">{errors.weight.message}</span>}
                                        </div>
                                    </div>

                                    <div className="pt-[15px] flex items-center gap-[10px]">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || uploading}
                                            className="relative overflow-hidden group bg-client-primary rounded-[50px] px-[40px] py-[15px] font-[700] text-[16px] text-white cursor-pointer flex items-center gap-[12px] disabled:opacity-50 transition-all hover:shadow-lg active:scale-95"
                                        >
                                            <span className="relative z-10">{isSubmitting ? "Đang lưu..." : "Cập nhật thông tin"}</span>
                                            {!isSubmitting && <ArrowRight className="relative z-10 w-[20px] h-[20px] transition-transform duration-300 rotate-[-45deg] group-hover:rotate-0" />}
                                            <div className="absolute top-0 left-0 w-full h-full bg-client-secondary transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                                        </button>
                                        <p className="text-[13px] text-[#7d7b7b] font-medium italic">* Thông tin bắt buộc</p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
