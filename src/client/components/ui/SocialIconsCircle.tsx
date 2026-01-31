import { Link } from "react-router-dom"
import { Facebook, Instagram } from "iconoir-react";

export const SocialIconCircle = ({ className }: { className?: string }) => {
    return (
        <ul className={`flex gap-[10px] ${className}`}>
            <li
                className="w-[38px] h-[38px] bg-transparent border border-client-secondary text-client-secondary p-[10px] 
                                             rounded-full flex items-center justify-center cursor-pointer 
                                             hover:text-white hover:bg-client-primary hover:border-client-primary transition-default"
            >
                <Link to={"#"}>
                    <Instagram strokeWidth={2} className="w-[1.6rem] h-[1.6rem]" />
                </Link>
            </li>
            <li
                className="w-[38px] h-[38px] bg-transparent border border-client-secondary text-client-secondary p-[10px] 
                                                                rounded-full flex items-center justify-center cursor-pointer 
                                                                hover:text-white hover:bg-client-primary hover:border-client-primary transition-default"
            >
                <Link to={"#"}>
                    <Facebook strokeWidth={2} className="w-[1.6rem] h-[1.6rem]" />
                </Link>
            </li>
        </ul>
    )
}