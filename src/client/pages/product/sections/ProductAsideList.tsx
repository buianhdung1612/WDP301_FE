import { Link } from "react-router-dom";
import PetsIcon from "@mui/icons-material/Pets";
import { memo } from "react";

interface Category {
    name: string;
    count: number;
    to: string;
}

interface ProductAsideListProps {
    categories: Category[];
}

export const ProductAsideList = memo(({ categories }: ProductAsideListProps) => {
    return (
        <ul className="py-[10px]">
            {categories.map((cat) => (
                <li
                    key={cat.name}
                    className="mb-[10px] flex items-center relative group"
                >
                    <Link
                        to={cat.to}
                        className="w-full px-[30px] py-[15px] bg-[#fff0f066] pr-[60px] rounded-[40px] 
                        flex items-center text-client-secondary transition-default 
                        group-hover:bg-client-secondary group-hover:text-white"
                    >
                        <PetsIcon sx={{ fontSize: "2rem", marginRight: "10px" }} />
                        {cat.name}
                    </Link>
                    <span className="absolute right-[30px] top-[50%] translate-y-[-50%] text-client-text group-hover:text-white transition-default">
                        ({cat.count})
                    </span>
                </li>
            ))}
        </ul>
    );
});
