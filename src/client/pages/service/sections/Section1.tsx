export const Section1 = () => {
    return (
        <div className="app-container w-[1320px]">
            <ul className="flex justify-center gap-[15px] mb-[55px]">
                <li className="item-service active">
                    <img src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/09/service-tab-icon-1-1.1.svg" alt="" width={49} height={48} />
                    <div className="font-[600] mt-[10px]">Chăm sóc chó</div>
                </li>
                <li className="item-service">
                    <img src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/09/service-tab-icon-1-1.6.svg" alt="" width={49} height={48} />
                    <div className="font-[600] mt-[10px]">Chăm sóc mèo</div>
                </li>
            </ul>
        </div>
    )
}