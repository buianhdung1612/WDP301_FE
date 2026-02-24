import { useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPet } from "../../../api/pet.api";
import { Camera, X, ArrowRight } from "lucide-react";
import { uploadImagesToCloudinary } from "../../../../admin/api/uploadCloudinary.api";
import CreatableSelect from 'react-select/creatable';
import { useBreeds, useCreateBreed } from "../../../../admin/pages/account-user/hooks/useBreed";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

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

interface PetCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newPet: any) => void;
}

export const PetCreateModal = ({ isOpen, onClose, onSuccess }: PetCreateModalProps) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string>("");

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: "dog",
            weight: 1,
            avatar: ""
        }
    });

    const petType = watch("type");
    const petBreed = watch("breed");
    const { data: breeds = [] } = useBreeds(petType);
    const { mutate: createBreedMutate } = useCreateBreed();

    const breedOptions: BreedOption[] = breeds.map((b: any) => ({
        label: b.name,
        value: b.name
    }));

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setUploading(true);
            try {
                const urls = await uploadImagesToCloudinary(Array.from(files));
                if (urls && urls.length > 0) {
                    setValue("avatar", urls[0]);
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
        try {
            const response = await createPet(data);
            if (response.code === 200) {
                toast.success(response.message || "Đã thêm thú cưng thành công!");

                // Pass the new pet data back to parent
                if (response.data) {
                    onSuccess(response.data);
                }

                // Close the modal
                handleClose();
            } else {
                toast.error(response.message || "Không thể tạo thú cưng");
            }
        } catch (error: any) {
            console.error("Create pet error:", error);
            toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra!");
        }
    };

    const handleClose = () => {
        reset();
        setPreview("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-[20px]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-[#102937]/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white w-full max-w-[850px] rounded-[40px] shadow-[0px_40px_100px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* Left Side - Visual / Info */}
                        <div className="hidden md:flex md:w-[35%] bg-client-primary/10 p-10 flex-col justify-between items-center text-center">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-client-primary shadow-sm mx-auto">
                                    <Icon icon="solar:cat-bold" width={32} />
                                </div>
                                <h3 className="text-[24px] font-third text-client-secondary">Đăng ký <br /> thành viên mới</h3>
                                <p className="text-[14px] text-gray-500">Thêm bé cưng của bạn vào danh sách chăm sóc của TeddyPet ngay!</p>
                            </div>

                            <div className="space-y-6 w-full">
                                {/* Avatar Section Overlayed */}
                                <div className="group relative mx-auto w-[140px]">
                                    <div className="w-[140px] h-[140px] rounded-full border-4 border-white shadow-lg overflow-hidden relative transition-all duration-500 bg-white">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                className={`w-full h-full object-cover transition-all duration-500 ${uploading ? 'scale-110 blur-[2px]' : 'group-hover:scale-110'}`}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-[#f8f9fa] flex flex-col items-center justify-center text-[#919eab]">
                                                <Camera className="w-[28px] h-[28px] mb-1" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Tải ảnh</span>
                                            </div>
                                        )}

                                        <label className="absolute inset-0 bg-client-secondary/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]">
                                            <Camera className="w-[24px] h-[24px] mb-1" />
                                            <span className="text-[10px] font-bold">{preview ? "Đổi ảnh" : "Tải ảnh"}</span>
                                            <input type="file" hidden accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                                        </label>

                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center backdrop-blur-[4px]">
                                                <div className="w-8 h-8 border-2 border-client-primary border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    {!uploading && (
                                        <div className="absolute bottom-1 right-1 w-10 h-10 bg-client-primary rounded-full border-4 border-white flex items-center justify-center text-white shadow-md">
                                            <Icon icon="solar:camera-bold" width={18} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[12px] text-gray-400 font-medium italic">Ảnh bé cưng sẽ giúp tụi mình <br /> phục vụ chu đáo hơn!</p>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="flex-1 p-8 lg:p-12">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-[28px] font-third text-[#181818]">Thông tin bé cưng</h2>
                                    <p className="text-gray-400 text-[14px]">Vui lòng điền đủ các mục có dấu (*)</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 bg-gray-50 text-gray-400 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-client-secondary ml-1">Tên bé cưng <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            {...register("name")}
                                            className={`border-2 rounded-2xl px-5 py-3.5 text-[15px] focus:outline-none focus:border-client-primary transition-all bg-gray-50 hover:bg-white ${errors.name ? "border-red-200" : "border-transparent"}`}
                                            placeholder="Gâu Gâu, Meo Meo..."
                                        />
                                        {errors.name && <span className="text-red-500 text-[12px] font-medium ml-1">{errors.name.message}</span>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-client-secondary ml-1">Loài <span className="text-red-500">*</span></label>
                                        <select
                                            {...register("type")}
                                            className="border-2 border-transparent rounded-2xl px-5 py-3.5 text-[15px] focus:outline-none focus:border-client-primary transition-all bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                                        >
                                            <option value="dog">Chú cún</option>
                                            <option value="cat">Bé mèo</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-client-secondary ml-1">Giống bé (Breed)</label>
                                        <CreatableSelect
                                            isClearable
                                            options={breedOptions}
                                            value={petBreed ? { label: petBreed, value: petBreed } : null}
                                            onChange={(newValue) => {
                                                const val = (newValue as BreedOption)?.value || "";
                                                setValue("breed", val);
                                                if ((newValue as any)?.__isNew__) {
                                                    createBreedMutate({ name: val, type: petType });
                                                }
                                            }}
                                            placeholder="Poodle, Corgi..."
                                            formatCreateLabel={(inputValue) => `Thêm giống "${inputValue}"`}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderRadius: '16px',
                                                    padding: '3px 8px',
                                                    fontSize: '15px',
                                                    backgroundColor: '#F9FAFB',
                                                    border: '2px solid transparent',
                                                    boxShadow: 'none',
                                                    '&:hover': {
                                                        borderColor: '#F8721F',
                                                        backgroundColor: 'white'
                                                    }
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    borderRadius: '16px',
                                                    fontSize: '15px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                                    border: '1px solid #eee'
                                                })
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-client-secondary ml-1">Cân nặng (kg) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            {...register("weight", { valueAsNumber: true })}
                                            className={`border-2 rounded-2xl px-5 py-3.5 text-[15px] focus:outline-none focus:border-client-primary transition-all bg-gray-50 hover:bg-white ${errors.weight ? "border-red-200" : "border-transparent"}`}
                                        />
                                        {errors.weight && <span className="text-red-500 text-[12px] font-medium ml-1">{errors.weight.message}</span>}
                                    </div>
                                </div>

                                <div className="pt-6 flex flex-col sm:flex-row items-center gap-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || uploading}
                                        className="w-full sm:w-auto relative overflow-hidden group bg-client-primary rounded-full px-10 py-4 font-bold text-[16px] text-white cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:shadow-xl active:scale-95 shadow-lg shadow-client-primary/20"
                                    >
                                        <span className="relative z-10">{isSubmitting ? "Đang lưu..." : "Đăng ký ngay"}</span>
                                        {!isSubmitting && <ArrowRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />}
                                        <div className="absolute top-0 left-0 w-full h-full bg-client-secondary transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                                    </button>
                                    <p className="text-[13px] text-gray-400 font-medium italic"> TeddyPet cam kết bảo mật thông tin!</p>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
