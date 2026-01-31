export const SaleOff = ({ content, textColor, backgroundColor, position }: { content: string, textColor: string, backgroundColor: string, position?: string }) => {
    return (
        <div className={`sale-off ${backgroundColor} ${position} w-[136px] h-[133px] text-[3.2rem] font-secondary ${textColor} flex items-center justify-center`}>
            {content}
        </div>
    )
}