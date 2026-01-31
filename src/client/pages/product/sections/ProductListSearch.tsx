import TuneIcon from '@mui/icons-material/Tune';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useProductSort } from '../../../hooks/useProductSort';
import StarIcon from "@mui/icons-material/Star";
import { useMemo, useState } from 'react';

type OptionType = {
    value: string;
    label: string;
};

const options: OptionType[] = [
    { value: 'a', label: 'Sắp xếp mặc định' },
    { value: 'b', label: 'Theo độ phổ biến' },
    { value: 'd', label: 'Sản phẩm mới nhất' },
    { value: 'e', label: 'Giá: thấp đến cao' },
    { value: 'f', label: 'Giá: cao đến thấp' },
];

export const ProductListSearch = () => {
    const {
        selectedOption,
        hoveredOption,
        setHoveredOption,
        searchValue,
        setSearchValue,
        menuOpen,
        selectRef,
        filteredOptions,
        handleSelectChange,
        toggleMenu,
    } = useProductSort(options);

    // Hiển thị danh sách lọc
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const toggleFilter = () => setIsFilterOpen(prev => !prev);

    const filterClasses = useMemo(() => {
        return isFilterOpen
            ? 'max-h-[500px] opacity-100 py-[20px] mb-[30px]'
            : 'max-h-0 opacity-0 py-0 mb-0';
    }, [isFilterOpen]);
    // Hết Hiển thị danh sách lọc

    return (
        <>
            {/* Search */}
            <div className="px-[30px] py-[15px] mb-[40px] flex items-center justify-between bg-[#e67e201a] rounded-[192px]">
                <div className="text-client-secondary">Showing 1–12 of 18 results</div>
                <div className="flex items-center">
                    <div onClick={toggleFilter} className='cursor-pointer flex items-center'>
                        <div className="text-client-secondary">Bộ lọc</div>
                        <TuneIcon style={{
                            width: "1.6rem",
                            height: "1.6rem",
                            marginLeft: "10px",
                            cursor: "pointer",
                            transform: isFilterOpen ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                        }} />
                    </div>
                    <div
                        className="text-client-secondary relative cursor-pointer px-[15px] h-[55px] bg-white border border-[#aaa] flex items-center rounded-[40px] ml-[20px]"
                        onClick={() => {
                            toggleMenu();
                        }}
                        ref={selectRef}
                    >
                        {selectedOption?.label}
                        <ArrowDropDownIcon style={{
                            width: "2rem",
                            height: "2rem",
                            cursor: "pointer",
                            marginLeft: "15px",
                            transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }} />
                        {menuOpen && (
                            <div className="absolute z-20 bg-white left-0 top-[100%] w-full rounded-[10px] mt-[10px] border border-[#10293726] shadow-[0_4px_5px_#10293726,0_-1px_0_0_#10293726]">
                                <div
                                    className="p-[10px]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="px-[32px] py-[16px] border border-[#10293726] rounded-[40px]">
                                        <input
                                            type="text"
                                            className="w-full outline-none text-client-text"
                                            value={searchValue}
                                            onChange={(e) => setSearchValue(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                                <ul className="p-[10px] pt-0 max-h-[200px] overflow-auto">
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map((item) => (
                                            <li
                                                key={item.value}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectChange(item);
                                                }}
                                                onMouseEnter={() => setHoveredOption(item.value)}
                                                onMouseLeave={() => setHoveredOption(null)}
                                                className={`px-[10px] py-[8px] mt-[1px] rounded-[5px] transition-all cursor-pointer 
                    ${item.value === selectedOption.value
                                                        ? hoveredOption === item.value
                                                            ? "bg-[#DDDDDD] text-white"
                                                            : "bg-client-secondary text-white"
                                                        : hoveredOption === item.value
                                                            ? "bg-client-secondary text-white"
                                                            : "text-client-secondary hover:bg-client-secondary hover:text-white"
                                                    }`}
                                            >
                                                {item.label}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-[10px] py-[8px] text-[#999] text-center">
                                            Không có kết quả
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bộ lọc phụ */}
            <div
                className={`
                    border-t border-b border-[#d7d7d7] 
                    flex justify-center flex-wrap gap-[20px]
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${filterClasses}
                `}
            >
                <div className='m-[10px] p-[20px] bg-[#fff0f0] rounded-[20px]'>
                    <h2 className='mb-[15px] text-[2.1rem] font-secondary'>Đánh giá trung bình</h2>
                    <div className="flex items-center justify-between text-client-secondary hover:text-[#10293780] cursor-pointer transition-default mb-[15px]">
                        <div>
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    sx={{
                                        fontSize: "1.9rem !important",
                                        color: i < 4 ? "#ffbb00 !important" : "#ccc !important",
                                    }}
                                />
                            ))}
                        </div>
                        <span>(13)</span>
                    </div>
                    <div className="flex items-center justify-between text-client-secondary hover:text-[#10293780] cursor-pointer transition-default">
                        <div>
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    sx={{
                                        fontSize: "1.9rem !important",
                                        color: i < 3 ? "#ffbb00 !important" : "#ccc !important",
                                    }}
                                />
                            ))}
                        </div>
                        <span>(5)</span>
                    </div>
                </div>
                <div className='m-[10px] p-[20px] bg-[#fff0f0] rounded-[20px]'>
                    <h2 className='mb-[15px] text-[2.1rem] font-secondary'>Lọc theo gram</h2>
                    <ul className='grid gap-y-[10px]'>
                        <li className='text-client-secondary pb-[5px] flex justify-between'>
                            <div className='hover:text-[#10293780] cursor-pointer transition-default'>10 Gói</div>
                            <span>(5)</span>
                        </li>
                        <li className='text-client-secondary pb-[5px] flex justify-between'>
                            <div className='hover:text-[#10293780] cursor-pointer transition-default'>5 Gói</div>
                            <span>(6)</span>
                        </li>
                        <li className='text-client-secondary pb-[5px] flex justify-between'>
                            <div className='hover:text-[#10293780] cursor-pointer transition-default'>3 Gói</div>
                            <span>(6)</span>
                        </li>
                        <li className='text-client-secondary pb-[5px] flex justify-between'>
                            <div className='hover:text-[#10293780] cursor-pointer transition-default'>Đơn</div>
                            <span>(6)</span>
                        </li>
                    </ul>
                </div>
                <div className='m-[10px] p-[20px] bg-[#fff0f0] rounded-[20px]'>
                    <h2 className='mb-[15px] text-[2.1rem] font-secondary'>Lọc theo kích cỡ</h2>
                    <ul className='grid gap-y-[10px]'>
                        <li className='text-client-secondary pb-[5px] flex justify-between'>
                            <div className='hover:text-[#10293780] cursor-pointer transition-default'>Lớn</div>
                            <span>(8)</span>
                        </li>
                        <li className='text-client-secondary pb-[5px] flex justify-between'>
                            <div className='hover:text-[#10293780] cursor-pointer transition-default'>Trung bình</div>
                            <span>(8)</span>
                        </li>
                        <li className='text-client-secondary pb-[5px] flex justify-between'>
                            <div className='hover:text-[#10293780] cursor-pointer transition-default'>Nhỏ</div>
                            <span>(8)</span>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}