import { NewProduct } from "./NewProduct"

export const CartEmpty = () => {
    return (
        <div className="app-container pb-[150px] 2xl:pb-[100px]">
            <h2 className="cart-title-empty text-center font-secondary text-[4rem] 2xl:text-[3.5rem]">
                Giỏ hàng của bạn hiện đang trống!
            </h2>

            <NewProduct />
        </div>
    )
}