import { Link } from "react-router-dom";

interface SocialItem {
    icon: React.ElementType;
    to: string;
}

interface SocialIconProps {
    items: SocialItem[];
}

export const SocialIcon = ({ items }: SocialIconProps) => {
    return (
        <ul className="flex gap-[10px]">
            {items.map(({ icon: Icon, to }, index) => (
                <li
                    key={index}
                    className="w-[36px] h-[36px] bg-client-secondary text-white p-[10px] 
                     rounded-[10px] flex items-center justify-center cursor-pointer 
                     hover:text-client-secondary hover:bg-white transition-default"
                >
                    <Link to={to}>
                        <Icon strokeWidth={2} className="w-[1.6rem] h-[1.6rem]" />
                    </Link>
                </li>
            ))}
        </ul>
    );
};
