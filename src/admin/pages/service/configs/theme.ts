import { createTheme, Theme } from "@mui/material";

export const getServiceTheme = (outerTheme: Theme) => createTheme(outerTheme, {
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: "none !important",
                    backdropFilter: "none !important",
                    backgroundColor: "var(--palette-background-paper) !important",
                    boxShadow: "var(--customShadows-card)",
                    borderRadius: "var(--shape-borderRadius-lg)",
                    color: "var(--palette-text-primary)",
                },
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    color: "var(--palette-text-primary)",
                    borderRadius: "var(--shape-borderRadius)",
                    fontSize: "0.9375rem",
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: "var(--palette-text-disabled)33",
                    },
                },
                input: {
                    padding: "16px 14px",
                }
            }
        },
    }
});




