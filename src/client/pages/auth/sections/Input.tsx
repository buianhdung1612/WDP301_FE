import { forwardRef } from "react";

interface InputProps {
    name: string;
    placeholder: string;
    type?: string;
    error?: string;
    errorColor?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (props, ref) => {
        const { name, placeholder, type = "text", error, errorColor = "text-client-primary", ...rest } = props;

        return (
            <p className="mb-[20px] font-[300] text-client-text">
                <input
                    ref={ref}
                    name={name}
                    placeholder={placeholder}
                    type={type}
                    className="w-full mb-[5px] bg-white text-client-text outline-none border border-[#d7d7d7] px-[32px] py-[16px] rounded-[40px] focus:border focus:border-client-primary transition-default"
                    {...rest}
                />
                {error && <span className={`${errorColor} ml-[32px] text-[1.4rem]`}>{error}</span>}
            </p>
        )
    }
);