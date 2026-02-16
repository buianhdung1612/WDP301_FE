import { Box } from '@mui/material';
import { GridToolbarQuickFilter } from '@mui/x-data-grid';
import { toolbarStyles } from '../configs/styles.config';

export const CouponToolbar = () => {
    return (
        <Box sx={toolbarStyles.root}>
            <GridToolbarQuickFilter
                {...({
                    placeholder: "Tìm kiếm...",
                    sx: {
                        minWidth: '240px',
                        '& .MuiInputBase-root': {
                            fontSize: '0.875rem',
                            height: '40px',
                            borderRadius: '8px',
                        },
                        '& .MuiSvgIcon-root': {
                            fontSize: '1.25rem',
                            color: '#637381'
                        }
                    }
                } as any)}
            />
        </Box>
    );
};
