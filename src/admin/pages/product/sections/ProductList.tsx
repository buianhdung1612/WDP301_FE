import {
    DataGrid,
    GridColDef,
} from '@mui/x-data-grid';
import Card from '@mui/material/Card';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SortAscendingIcon, SortDescendingIcon, UnsortedIcon } from '../../../assets/icons';
import { columnsInitialState } from '../configs/column.config';
import { IGridSettings } from '../configs/types';
import { ProductToolbar } from './ProductToolbar';
import { useDataGridLocale } from '../../../hooks/useDataGridLocale';
import { useSettings } from '../hooks/useSettings';
import { useProducts } from '../hooks/useProducts';
import { useProductColumns } from '../hooks/useProductColumns';
import {
    dataGridCardStyles,
    dataGridContainerStyles,
    columnsPanelStyles,
    filterPanelStyles,
    dataGridStyles,
} from '../configs/styles.config';

declare module '@mui/x-data-grid' {
    interface ToolbarPropsOverrides {
        settings: IGridSettings;
        onSettingsChange: import("react").Dispatch<import("react").SetStateAction<IGridSettings>>;
    }
}

export const ProductList = () => {
    const { t } = useTranslation();
    const { settings, setSettings } = useSettings();
    const { products, isLoading, error } = useProducts();
    const columns = useProductColumns();
    const localeText = useDataGridLocale();

    if (isLoading) {
        return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.8rem' }}>Đang tải danh sách sản phẩm...</div>;
    }

    if (error) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#FF5630', fontSize: '1.8rem' }}>Lỗi khi tải danh sách sản phẩm. Vui lòng thử lại.</div>;
    }

    return (
        <Card
            elevation={0}
            sx={dataGridCardStyles}
        >
            <div style={dataGridContainerStyles}>
                <DataGrid
                    rows={products}
                    columns={columns}
                    density={settings.density}
                    showCellVerticalBorder={settings.showCellBorders}
                    showColumnVerticalBorder={settings.showColumnBorders}
                    showToolbar
                    slots={{
                        toolbar: ProductToolbar,
                        columnSortedAscendingIcon: SortAscendingIcon,
                        columnSortedDescendingIcon: SortDescendingIcon,
                        columnUnsortedIcon: UnsortedIcon,
                    }}
                    slotProps={{
                        columnsManagement: {
                            getTogglableColumns: (columns: GridColDef[]) =>
                                columns.filter(col => col.field !== '__check__' && col.field !== 'actions')
                                    .map(col => col.field),
                        },
                        columnsPanel: {
                            sx: columnsPanelStyles,
                        },
                        filterPanel: {
                            sx: filterPanelStyles,
                        },
                        toolbar: {
                            settings,
                            onSettingsChange: setSettings,
                        },
                    }}
                    localeText={localeText}
                    pagination
                    pageSizeOptions={[5, 10, 20, { value: -1, label: t("admin.common.tabs.all") }]}
                    initialState={columnsInitialState}
                    getRowHeight={() => 'auto'}
                    checkboxSelection
                    disableRowSelectionOnClick
                    sx={dataGridStyles}
                />
            </div>
        </Card>
    )
}
