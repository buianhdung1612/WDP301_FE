import { Link, useNavigate } from "react-router-dom";
import { Input } from "./sections/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { login as loginApi } from "../../api/auth.api";
import { toast } from "react-toastify";
import { useAuthStore } from "../../../stores/useAuthStore";

const schema = z.object({
    email: z
        .string()
        .nonempty("Vui lòng nhập email!")
        .email("Email không đúng định dạng!"),
    password: z
        .string()
        .nonempty("Vui lòng nhập mật khẩu!"),
    rememberPassword: z.boolean()
});

type LoginFormData = z.infer<typeof schema>;

export const LoginPage = () => {
    const navigate = useNavigate();
    const loginStore = useAuthStore((state) => state.login);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        defaultValues: {
            email: "",
            password: "",
            rememberPassword: false
        },
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await loginApi(data);
            if (response.success) {
                toast.success(response.message);
                loginStore(response.user, response.token);
                navigate("/");
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] py-[50px]">
            <div className="bg-[#e67e2026] p-[70px] 2xl:p-[50px] rounded-[20px] max-w-[615px] w-full mx-[20px]">
                <h2 className="text-[4rem] text-client-secondary font-[700] text-center mb-[12px]">
                    Đăng nhập
                </h2>
                <p className="text-client-text text-center mb-[40px]">
                    Vui lòng nhập thông tin đăng nhập của bạn
                </p>

                {/* Ẩn đăng nhập Google/Facebook theo yêu cầu */}
                {/* 
                <div className="m-[10px] py-[10px] px-[40px] text-[#000] rounded-[20px] border border-client-secondary text-[1.4rem] font-[500] text-center shadow-[0_0_0px_#ff6262] hover:text-white hover:bg-client-secondary transition-default cursor-pointer">
                    Google
                </div>
                <p className="mt-[30px] mb-[40px] text-client-text text-center">Hoặc đăng nhập với</p> 
                */}

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mb-[30px] gap-[20px]">
                    <Input
                        placeholder="Email"
                        {...register("email")}
                        error={errors.email?.message}
                    />
                    <Input
                        placeholder="Mật khẩu"
                        type="password"
                        {...register("password")}
                        error={errors.password?.message}
                    />
                    <div className="flex items-center justify-center checkbox">
                        <input type="checkbox" id="rememberPassword" {...register("rememberPassword")} hidden />
                        <label htmlFor="rememberPassword" className="text-client-text pl-[12px] ml-[-12px] cursor-pointer">Nhớ mật khẩu</label>
                    </div>
                    <button
                        disabled={isSubmitting}
                        className="mt-[10px] text-white bg-client-primary rounded-[40px] py-[16px] px-[30px] cursor-pointer transition-default hover:bg-client-secondary disabled:opacity-50"
                    >
                        {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                </form>

                <Link to="/auth/forgot-password" className="block text-center text-client-secondary underline decoration-transparent hover:decoration-client-primary hover:text-client-primary transition-all duration-300 ease-linear text-[1.4rem]">Quên mật khẩu?</Link>

                <p className="text-center text-client-text mt-[10px]">Bạn chưa có tài khoản? <Link className="underline decoration-transparent hover:decoration-client-text transition-all duration-300 ease-linear font-bold text-client-secondary" to={"/auth/register"}>Đăng ký ngay</Link></p>
            </div>
        </div>
    )
}