import StarIcon from "@mui/icons-material/Star";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Link } from "react-router-dom";
import type { Product } from "../../../types/products.type";

export const BlogCard = ({ product }: { product: Product }) => {
    return (
        <div className="bg-[#e67e2026] rounded-[20px] overflow-hidden product-item transition-all duration-300 ease-linear hover:bg-client-primary group">
            <div className="p-[15px]">
                <Link to={product.url} className="block relative rounded-[20px] overflow-hidden aspect-[327/343]">
                    {/*Primary Image */}
                    <img
                        className="primary-image-item w-full h-full object-cover rounded-[20px] transition-opacity duration-700 opacity-100 cursor-pointer absolute top-0 left-0"
                        src={product.primaryImage}
                        alt={product.title}
                    />
                    {/* Secondary Image */}
                    <img
                        className="secondary-image-item w-full h-full object-cover rounded-[20px] transition-opacity duration-700 opacity-0 cursor-pointer absolute top-0 left-0"
                        src={product.secondaryImage}
                        alt={product.title}
                    />
                    {product.isSale && (
                        <div className="px-[10px] absolute right-[20px] top-[20px] inline-flex text-[1.2rem] uppercase tracking-normal text-white bg-client-primary rounded-[30px] min-h-[25px] min-w-[50px] items-center justify-center">
                            SALE
                        </div>
                    )}
                </Link>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-[20px]">
                <div className="pl-[30px]">
                    {/* Rating */}
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                sx={{
                                    fontSize: "2rem !important",
                                    color: i < product.rating ? "#ffbb00 !important" : "#ccc !important",
                                }}
                            />
                        ))}
                    </div>

                    {/* Title */}
                    <Link
                        to={product.url}
                        className="inline-block text-client-secondary text-[2.4rem] 2xl:text-[2.3rem] line-clamp-1 font-secondary leading-[1.8] transition-all duration-[350ms] ease-in-out my-[10px] group-hover:text-white hover:opacity-70"
                    >
                        {product.title}
                    </Link>

                    {/* Price */}
                    <p className="text-client-secondary group-hover:text-white transition-default">
                        {product.price}
                    </p>
                </div>

                {/* Cart Button */}
                <div className="mt-[15px]">
                    <div className="mt-[53px]">
                        <div className="w-[61px] h-[61px] pt-[10px] pr-[1px] pb-[1px] pl-[10px] relative rounded-tl-[30px] bg-white cart-button">
                            <div className="w-[50px] h-[50px] rounded-full bg-client-primary flex items-center justify-center duration-[375ms] ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:bg-client-secondary">
                                <ShoppingCartOutlinedIcon
                                    className="text-white"
                                    sx={{ fontSize: "2.5rem" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
