import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Types
interface Option {
    value: string;
    label: string;
}

interface SelectMultiProps {
    label: string;
    options: Option[];
    sx?: any;
}

// CSS
const FORM_CONTROL_STYLE = { width: "200px" };

const LABEL_STYLE = {
    fontSize: "1.5rem",
    color: "rgb(28, 37, 46)",

    "&.MuiInputLabel-shrink": {
        color: "#919eab", // Màu của chữ khi đã nằm trên viền
        fontWeight: 600,
    },
};

const SELECT_SX = {
    fontSize: "1.5rem",
    borderRadius: "8px"
};

const MENU_PROPS = {
    PaperProps: {
        sx: {
            borderRadius: '10px',
            boxShadow:
                '0px 5px 5px -3px rgba(145 158 171 / 20%), ' +
                '0px 8px 10px 1px rgba(145 158 171 / 14%), ' +
                '0px 3px 14px 2px rgba(145 158 171 / 12%)',
            color: "#1C252E",
            backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfNDQ2NF81NTMzOCkiIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxkZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfNDQ2NF81NTMzOCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgxMjAgMS44MTgxMmUtMDUpIHJvdGF0ZSgtNDUpIHNjYWxlKDEyMy4yNSkiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMDBCOEQ5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwQjhEOSIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==), url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfNDQ2NF81NTMzNykiIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxkZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfNDQ2NF81NTMzNyIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwIDEyMCkgcm90YXRlKDEzNSkgc2NhbGUoMTIzLjI1KSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjU2MzAiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY1NjMwIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K)",
            backgroundSize: '50%, 50%',
            backgroundRepeat: 'no-repeat',
            backdropFilter: 'blur(20px)',
            backgroundColor: '#ffffffe6',
            backgroundPosition: 'right top, left bottom',
        },
    },
};

const APPLY_BUTTON = {
    marginBottom: "0px",
    backgroundColor: "#919eab14",
    fontWeight: "600",
    justifyContent: "center",
    border: "1px solid #919eab29"
}

const CHECKBOX_STYLE = {
    marginLeft: "-4px",
    marginRight: "4px",
}

export const SelectMulti = memo(({ label, options, sx }: SelectMultiProps) => {
    const { t } = useTranslation();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const handleChange = useCallback((event: SelectChangeEvent<string[]>) => {
        const { target: { value } } = event;
        setSelectedValues(typeof value === 'string' ? value.split(',') : value);
    }, []);

    const handleClose = useCallback(() => {
        setTimeout(() => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }, 0);
    }, []);

    const displayValue = useMemo(() => (selected: string[]) =>
        options
            .filter(opt => selected.includes(opt.value))
            .map(opt => opt.label)
            .join(', ')
        , [options]);

    return (
        <FormControl
            sx={{ ...FORM_CONTROL_STYLE, ...sx }}
        >
            <InputLabel
                id="demo-simple-select-label"
                sx={LABEL_STYLE}
            >
                {label}
            </InputLabel>
            <Select
                multiple
                value={selectedValues}
                label={label}
                onChange={handleChange}
                onClose={handleClose}
                renderValue={displayValue}
                sx={SELECT_SX}
                MenuProps={MENU_PROPS}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value} sx={{
                        fontWeight: selectedValues.includes(option.value) ? 550 : 400,
                    }}>
                        <Checkbox
                            size="small"
                            checked={selectedValues.includes(option.value)}
                            sx={CHECKBOX_STYLE}
                        />
                        {option.label}
                    </MenuItem>
                ))}
                <MenuItem
                    sx={APPLY_BUTTON}
                    onClick={(e) => {
                        e.stopPropagation(); // QUAN TRỌNG
                        if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                    }}
                >
                    {t("admin.common.apply")}
                </MenuItem>
            </Select>
        </FormControl>
    )
})