import { createTheme, Theme } from "@mui/material";

export const getProductAttributeTheme = (outerTheme: Theme) => createTheme(outerTheme, {
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
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: "#919EAB",
                    fontSize: "1.5rem",
                    '&.Mui-focused': {
                        color: "#1C252E",
                        fontWeight: "600",
                        fontSize: "1.5rem"
                    }
                }
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
                        transition: 'border-color 0.2s',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: "#1C252E",
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: "#1C252E",
                        borderWidth: "2px",
                    },

                },
                input: {
                    padding: "16px 14px",
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                listbox: {
                    padding: 0,
                },
                option: {
                    fontSize: '1.4rem',
                    padding: '6px',
                    marginBottom: '4px',
                    borderRadius: '6px',

                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(0, 184, 217, 0.16)",
                    color: "#006C9C",
                    fontSize: "1.3rem",
                    height: "24px",
                    borderRadius: "8px",
                },
                label: {
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    fontWeight: "600"
                },
                deleteIcon: {
                    color: "rgb(0, 108, 156)",
                    opacity: "0.48",
                    fontSize: "1.5rem",
                    marginRight: "4px",
                    marginLeft: "-4px",
                    '&:hover': {
                        color: "rgb(0, 108, 156)",
                        opacity: "0.8"
                    }
                }
            }
        }
    }
});
