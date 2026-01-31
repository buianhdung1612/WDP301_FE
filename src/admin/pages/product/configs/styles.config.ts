import { SxProps, Theme } from '@mui/material/styles';
import { COLORS } from './constants';

export const dataGridStyles: SxProps<Theme> = {
    color: COLORS.primary,
    borderWidth: "0",

    // HEADER
    '& .MuiDataGrid-columnHeaders': {
        borderRadius: "0", position: 'sticky',
        top: 70,
        zIndex: 3,
        background: COLORS.backgroundLight,
        '& .MuiDataGrid-columnHeader': {
            color: COLORS.secondary,
            fontSize: "1.4rem",
            border: "none",
            borderBottom: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.backgroundLight
        },

        '& .MuiDataGrid-columnHeader--withRightBorder': {
            borderRight: `1px solid ${COLORS.border}`
        },

        '& .MuiDataGrid-menuIcon': {
            '& .MuiButtonBase-root': {
                color: "#637381",
                rotate: '90deg'
            }

        },

        '& .MuiButtonBase-root': {
            fontSize: "1.8rem"
        }
    },

    // Footer
    '& .MuiDataGrid-footerContainer': {
        borderTop: "1px dashed",
        minHeight: "auto",
        fontSize: "1.4rem",
        color: "inherit",

        '& .MuiTablePagination-selectLabel': {
            fontSize: "1.4rem",
            color: "inherit",
            marginBottom: "-2px"
        },

        '& .MuiSelect-select': {
            minHeight: "21.5625px",
            lineHeight: "2.4rem",
            fontSize: "1.5rem",
        },

        '& .MuiSelect-icon': {
            top: "6px"
        },

        '& .MuiTablePagination-displayedRows': {
            fontSize: "1.4rem",
            color: "inherit"
        },

        '& .MuiTablePaginationActions-root': {
            marginRight: "8px",

            '& .MuiButtonBase-root': {
                padding: "5px",

                '& .MuiSvgIcon-root': {
                    width: "2.4rem",
                    height: "2.4rem",
                }
            }
        },
    },

    '& .MuiDataGrid-withBorderColor': {
        borderColor: COLORS.border
    },

    // CELL
    '& .MuiDataGrid-cell': {
        color: 'inherit',
        fontSize: "1.4rem",
        display: 'flex',
        alignItems: 'center',
        borderRightStyle: "dashed"
    },

    // TOOLBAR
    '& .MuiDataGrid-toolbarContainer': {
        color: 'inherit',
        position: 'sticky',
        top: 0,
        zIndex: 4,
        background: COLORS.background,
        borderBottom: `none`,
    },

    // CHECKBOX
    '& .MuiCheckbox-root': {
        '&.Mui-checked .MuiSvgIcon-root': {
            color: COLORS.success,
        },
        '&.MuiCheckbox-indeterminate .MuiSvgIcon-root': {
            color: COLORS.success,
        },
        '& .MuiSvgIcon-root': {
            color: COLORS.secondary,
        },
    },

    // SELECT / INPUT trong toolbar
    '& .MuiFormControl-root': {
        color: 'inherit',
    },

    '& .MuiInputLabel-root': {
        color: COLORS.secondary,
    },

    '& .MuiInputLabel-root.Mui-focused': {
        color: COLORS.primary,
    },

    '& .MuiOutlinedInput-root': {
        color: COLORS.primary,
        '& fieldset': {
            borderColor: COLORS.borderLight,
        },
        '&:hover fieldset': {
            borderColor: COLORS.borderMedium,
        },
        '&.Mui-focused fieldset': {
            borderColor: COLORS.primary,
        },
    },

    '& .MuiDataGrid-cell:hover': {
        // Đổi màu Title sản phẩm
        '& .product-title': {
            color: `${COLORS.success} !important`,
        },
        // Đổi màu Ngày
        '& .date-text': {
            color: `${COLORS.success} !important`,
        }
    },

    '& .MuiDataGrid-actionsCell .MuiIconButton-root': {
        color: '#637381',
    },

    '& .MuiDataGrid-actionsCell .MuiSvgIcon-root': {
        fontSize: '2rem',
    },

    '&.MuiDataGrid-root': {
        '--DataGrid-t-color-interactive-focus': COLORS.success,
        '--DataGrid-t-color-border-base': COLORS.border,
        overflow: 'auto',

        '& .MuiDataGrid-overlay': {
            fontSize: '1.8rem',
            color: COLORS.secondary,
        },
    },
};
// Toolbar
export const toolbarStyles = {
    root: {
        padding: '16px',
        gap: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        minHeight: 'auto',
    } as const,
};

// DataGrid Card
export const dataGridCardStyles = {
    background: COLORS.background,
    color: COLORS.primary,
    borderRadius: '16px',
    height: '640px',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: COLORS.shadow,
};

/**
 * DataGrid Container styling
 */
export const dataGridContainerStyles = {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden' as const,
};

/**
 * Columns Panel styling
 */
export const columnsPanelStyles: SxProps<Theme> = {
    '& .MuiDataGrid-columnsManagement .MuiCheckbox-root.Mui-disabled': {
        color: COLORS.borderDisabled,
    },
    '& .MuiDataGrid-columnsManagement .MuiTypography-root.Mui-disabled': {
        color: COLORS.disabled,
    },
    '& .MuiDataGrid-columnsManagementHeader': {
        padding: '20px 16px',
        borderBottom: `1px solid ${COLORS.border}`,
    },
    '& .MuiDataGrid-columnsManagementSearchInput .MuiOutlinedInput-root': {
        fontSize: '1.6rem',
        padding: '0 14px',
        color: COLORS.primary,
        borderRadius: '8px',
        lineHeight: '24px',
        height: '56px',
    },
    '& fieldset': {
        borderColor: COLORS.borderLight,
    },
    '&:hover fieldset': {
        borderColor: COLORS.borderMedium,
    },
    '& .MuiDataGrid-columnsManagementSearchInput .MuiOutlinedInput-root.Mui-focused fieldset': {
        borderColor: COLORS.primary,
        borderWidth: '2px',
    },
    '& .MuiDataGrid-columnsManagementSearchInput .MuiSvgIcon-root': {
        fontSize: '2rem',
        color: COLORS.secondary,
    },
    '& .MuiDataGrid-columnsManagement': {
        padding: '4px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    '& .MuiTypography-root': {
        fontSize: '1.4rem !important',
    },
    '& .MuiDataGrid-columnsManagementFooter': {
        padding: '12px 8px 12px 12px',
        '& .MuiButton-text': {
            padding: '6px 8px',
            fontWeight: '700',
            fontSize: '1.4rem',
            textTransform: 'none',
            borderRadius: '8px',
            color: COLORS.primary,
            '&:hover': {
                background: COLORS.borderHover,
            },
            '&.Mui-disabled': {
                color: COLORS.disabled,
                opacity: 0.48,
            },
        },
    },
};

/**
 * Filter Panel styling
 */
export const filterPanelStyles: SxProps<Theme> = {
    '& .MuiDataGrid-panelContent': {
        padding: '24px 20px 24px 16px',
    },
    '& .MuiButtonBase-root': {
        color: COLORS.secondary,
        fontSize: '1.8rem',
        borderRadius: '50%',
        backgroundColor: COLORS.borderHover,
        padding: '5px',
    },
    '& .MuiFormLabel-root': {
        color: COLORS.secondary,
        fontSize: '1.6rem',
        fontWeight: '600',
        '&.Mui-focused': {
            color: COLORS.primary,
        },
    },
    '& .MuiInputBase-root': {
        color: COLORS.primary,
        fontSize: '1.6rem',
        borderRadius: '8px',
    },
};
