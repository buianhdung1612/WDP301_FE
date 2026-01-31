type TitleProps = {
    title: string;
};

export const Title = ({ title }: TitleProps) => {
    return (
        <h6 className="text-[2.3rem] font-[700] mb-[16px]">
            {title}
        </h6>
    );
};