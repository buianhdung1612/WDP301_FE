interface SectionHeaderProps {
    subtitle?: string;
    title: string;
    desc?: string;
    align?: "left" | "center";
    widthSubTitle?: string;
    widthTitle?: string;
    widthDesc?: string;
}

export const SectionHeader = ({
    subtitle,
    title,
    desc,
    align = "center",
    widthSubTitle,
    widthTitle,
    widthDesc,
}: SectionHeaderProps) => {
    return (
        <div className={`mb-10 ${align === "center" ? "text-center" : "text-left"}`}>
            {subtitle && (
                <p
                    className={`uppercase text-client-primary mb-[15px] ${widthSubTitle ?? ""}`}
                >
                    {subtitle}
                </p>
            )}
            <h2
                className={`text-[5rem] 2xl:text-[4.5rem] 2xl:font-[500] leading-[1.2] font-secondary mb-[20px] ${widthTitle ?? ""}`}
            >
                {title}
            </h2>
            {desc && (
                <p
                    className={`text-[#505050] font-[500] inline-block mb-[70px] ${widthDesc ?? ""}`}
                >
                    {desc}
                </p>
            )}
        </div>
    );
};
