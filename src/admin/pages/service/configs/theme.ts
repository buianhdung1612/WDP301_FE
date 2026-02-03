import { createTheme, Theme } from "@mui/material";

export const getServiceTheme = (outerTheme: Theme) => createTheme(outerTheme, {
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: "none !important",
                    backdropFilter: "none !important",
                    backgroundColor: "#fff !important",
                    boxShadow: "0 0 2px 0 #919eab33, 0 12px 24px -4px #919eab1f",
                    borderRadius: "16px",
                    color: "#1C252E",
                },
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    color: "#1C252E",
                    borderRadius: "8px",
                    fontSize: "1.5rem",
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: "#919eab33",
                    },
                },
                input: {
                    padding: "16px 14px",
                }
            }
        },
    }
});
