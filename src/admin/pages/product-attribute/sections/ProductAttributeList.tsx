import { DataGrid } from '@mui/x-data-grid';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { SortAscendingIcon, SortDescendingIcon, UnsortedIcon } from '../../../assets/icons';
import { ProductAttributeToolbar } from './ProductAttributeToolbar';
import { useDataGridLocale } from '../../../hooks/useDataGridLocale';
import { useTranslation } from 'react-i18next';
import { useProductAttributes } from '../hooks/useProductAttribute';
import { columnsConfig, columnsInitialState } from '../configs/column.config';
import {
    dataGridCardStyles,
    dataGridContainerStyles,
    dataGridStyles
} from '../configs/styles.config';

export const ProductAttributeList = () => {
    const { t } = useTranslation();
    const { data: attributes = [], isLoading } = useProductAttributes();
    const localeText = useDataGridLocale();

    return (
        <Card elevation={0} sx={dataGridCardStyles}>
            <div style={dataGridContainerStyles}>
                <DataGrid
                    rows={attributes}
                    getRowId={(row) => row._id}
                    showToolbar
                    loading={isLoading}
                    columns={columnsConfig}
                    density="comfortable"
                    slots={{
                        toolbar: ProductAttributeToolbar,
                        columnSortedAscendingIcon: SortAscendingIcon,
                        columnSortedDescendingIcon: SortDescendingIcon,
                        columnUnsortedIcon: UnsortedIcon,
                        noRowsOverlay: () => (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                {isLoading ? <CircularProgress size={32} /> : <span className='text-[1.8rem]'>{t("admin.common.no_data")}</span>}
                            </Box>
                        )
                    }}
                    localeText={localeText}
                    pagination
                    pageSizeOptions={[5, 10, 20, { value: -1, label: t("admin.common.tabs.all") }]}
                    initialState={columnsInitialState}
                    getRowHeight={() => 'auto'}
                    disableRowSelectionOnClick
                    sx={dataGridStyles}
                />
            </div>
        </Card>
    )
}
