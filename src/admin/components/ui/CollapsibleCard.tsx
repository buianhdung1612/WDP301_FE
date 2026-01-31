import {
    Card,
    CardHeader,
    Collapse,
    Divider,
    IconButton,
} from "@mui/material";
import { ArrowIcon } from "../../assets/icons";

type Props = {
    title: string;
    subheader?: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
};

export const CollapsibleCard = ({
    title,
    subheader,
    expanded,
    onToggle,
    children,
}: Props) => {
    return (
        <Card>
            <CardHeader
                title={title}
                subheader={subheader}
                slotProps={{
                    title: { sx: { fontWeight: 600, fontSize: "1.8rem" } },
                    subheader: {
                        sx: { color: "#637381", fontSize: "1.4rem", mt: 0.5 },
                    },
                }}
                action={
                    <IconButton
                        onClick={onToggle}
                        sx={{
                            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                            transition: "transform 0.3s",
                        }}
                    >
                        <ArrowIcon />
                    </IconButton>
                }
                sx={{ padding: "24px 24px 0", mb: "24px" }}
            />

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Divider sx={{ borderColor: "#919eab33" }} />
                {children}
            </Collapse>
        </Card>
    );
};
