import { useTranslation } from 'react-i18next';
import { GridColDef } from '@mui/x-data-grid';
import { RenderActionsCell, RenderCreatedAtCell, RenderProductCell, RenderStatusCell, RenderStockCell } from '../utils/render-cells';
import { IProduct } from '../configs/types';
import { useMemo } from 'react';

export const useProductColumns = () => {
    const { t } = useTranslation();

    const columns: GridColDef<IProduct>[] = useMemo(() => [
        {
            field: "product",
            headerName: t("admin.product.fields.name"),
            flex: 1,
            hideable: false,
            filterable: true,
            renderCell: RenderProductCell,
        },
        {
            field: "createdAt",
            headerName: t("admin.common.created_at") || "Created At",
            width: 160,
            filterable: true,
            type: "date",
            renderCell: RenderCreatedAtCell,
        },
        {
            field: "stock",
            headerName: t("admin.product.fields.stock") || "Stock",
            width: 160,
            filterable: false,
            renderCell: (params) => <RenderStockCell {...params} />,
        },
        {
            field: "price",
            headerName: t("admin.product.fields.price"),
            width: 120,
            filterable: true,
        },
        {
            field: "status",
            headerName: t("admin.common.status"),
            width: 120,
            filterable: false,
            renderCell: (params) => <RenderStatusCell {...params} />,
        },
        {
            field: 'actions',
            headerName: '',
            sortable: false,
            filterable: false,
            hideable: false,
            disableColumnMenu: true,
            width: 64,
            align: 'right',
            renderCell: (params) => <RenderActionsCell {...params} />,
        },
    ], [t]);

    return columns;
};
