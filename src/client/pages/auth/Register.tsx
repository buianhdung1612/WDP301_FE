import { Link, useNavigate } from "react-router-dom";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Input } from "./sections/Input";
import { FooterSub } from "../../components/layouts/FooterSub";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { register as registerApi } from "../../api/auth.api";
import { toast } from "react-toastify";
import { useAuthStore } from "../../../stores/useAuthStore";

const breadcrumbs = [
    { label: "Trang chủ", to: "/" },
    { label: "Đăng ký", to: "/auth/register" }
];

const schema = z.object({
    fullName: z
        .string()
        .nonempty("Vui lòng nhập họ tên!")
        .min(5, "Họ tên phải có ít nhất 5 ký tự!")
        .max(50, "Họ tên không được vượt quá 50 ký tự!"),
    email: z
        .string()
        .nonempty("Vui lòng nhập email!")
        .email("Email không đúng định dạng!"),
    phone: z
        .string()
        .nonempty("Vui lòng nhập số điện thoại!")
        .regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0|6-9]|9[0-4|6-9])[0-9]{7}$/, "Số điện thoại không đúng định dạng!"),
    password: z
        .string()
        .nonempty("Vui lòng nhập mật khẩu!")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự!")
        .regex(/[A-Z]/, "Mật khẩu phải có ít nhất một chữ cái viết hoa!")
        .regex(/[a-z]/, "Mật khẩu phải có ít nhất một chữ cái viết thường!")
        .regex(/\d/, "Mật khẩu phải có ít nhất một chữ số!")
        .regex(/[~!@#$%^&*]/, "Mật khẩu phải có ít nhất một ký tự đặc biệt! (~!@#$%^&*)"),
    confirmPassword: z.string().nonempty("Vui lòng xác nhận mật khẩu!")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp!",
    path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof schema>;

export const RegisterPage = () => {
    const navigate = useNavigate();
    const loginStore = useAuthStore((state) => state.login);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const submitData = {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                password: data.password
            };

            const response = await registerApi(submitData);
            if (response.code === "success") {
                toast.success(response.message || "Đăng ký thành công! Vui lòng đăng nhập.");
                navigate("/auth/login");
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
        }
    };

    return (
        <>
            <ProductBanner pageTitle="Đăng ký" breadcrumbs={breadcrumbs} url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg" className="bg-top" />
            <div className="app-container">
                <div className="flex gap-[40px] mx-[160px] 2xl:mx-[50px] mb-[120px] 2xl:mb-[100px] p-[20px] max-w-[1200px] rounded-[20px] bg-[#e67e20]">
                    <div className="flex-1">
                        <img
                            src="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Pet-Daycare-img.jpg"
                            alt=""
                            width={560}
                            height={788}
                            className="w-full h-full object-cover rounded-[20px]"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="py-[30px] pr-[20px]">
                            <h2 className="text-center font-secondary text-[4rem] 2xl:text-[3.5rem] text-white mt-[24px] mb-[12px]">Đăng ký</h2>
                            <p className="text-center text-white">Bạn chưa có tài khoản?</p>
                            <form onSubmit={handleSubmit(onSubmit)} className="mt-[30px] w-full flex flex-col gap-[12px]">
                                <Input
                                    placeholder="Họ tên*"
                                    {...register("fullName")}
                                    error={errors.fullName?.message}
                                    errorColor="text-client-secondary"
                                />
                                <Input
                                    placeholder="Email *"
                                    type="email"
                                    {...register("email")}
                                    error={errors.email?.message}
                                    errorColor="text-client-secondary"
                                />
                                <Input
                                    placeholder="Số điện thoại *"
                                    {...register("phone")}
                                    error={errors.phone?.message}
                                    errorColor="text-client-secondary"
                                />
                                <Input
                                    placeholder="Mật khẩu *"
                                    type="password"
                                    {...register("password")}
                                    error={errors.password?.message}
                                    errorColor="text-client-secondary"
                                />
                                <Input
                                    placeholder="Xác nhận mật khẩu *"
                                    type="password"
                                    {...register("confirmPassword")}
                                    error={errors.confirmPassword?.message}
                                    errorColor="text-client-secondary"
                                />
                                <button
                                    disabled={isSubmitting}
                                    className="w-full mt-[10px] mb-[20px] py-[16px] px-[30px] bg-client-secondary text-white font-secondary text-[1.8rem] rounded-[40px] transition-default cursor-pointer hover:bg-white hover:text-client-secondary disabled:opacity-50"
                                >
                                    {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
                                </button>
                            </form>
                            <p className="text-center text-white">Bạn đã có tài khoản? <Link className="underline decoration-transparent hover:decoration-white transition-all duration-300 ease-linear" to={"/auth/login"}>Đăng nhập</Link></p>
                        </div>
                    </div>
                </div>
            </div>
            <FooterSub />
        </>
    )
}