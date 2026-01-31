import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';


interface SearchProps {
    maxWidth?: string | number;
    placeholder?: string;
}

export const Search = ({ maxWidth = 260, placeholder }: SearchProps) => {
    const { t } = useTranslation();
    const displayPlaceholder = placeholder || t("admin.common.search");

    return (
        <Box sx={{ width: '100%', maxWidth: maxWidth }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder={displayPlaceholder}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icon icon="eva:search-fill" width="20" height="20" color="#637381" />
                            </InputAdornment>
                        ),
                    },
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        fontSize: "1.6rem",
                        paddingLeft: "14px",
                        paddingRight: "14px",
                    },
                }}
            />
        </Box>
    )
}