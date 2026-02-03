import { GridColDef } from "@mui/x-data-grid";
import {
    RenderActionsCell,
    RenderTitleCell,
    RenderStatusCell,
    RenderPricingCell,
    RenderPetTypesCell,
    RenderCategoryCell
} from '../utils/render-cells';
import { IService } from "./types";

export const columnsConfig: GridColDef<IService>[] = [
    {
        field: "name",
        headerName: "Tên dịch vụ",
        flex: 1,
        minWidth: 200,
        renderCell: RenderTitleCell,
    },
    {
        field: "categoryId",
        headerName: "Danh mục",
        width: 150,
        renderCell: RenderCategoryCell,
    },
    {
        field: "pricingType",
        headerName: "Giá",
        width: 180,
        renderCell: RenderPricingCell,
    },
    {
        field: "duration",
        headerName: "Thời lượng",
        width: 120,
        valueFormatter: (value) => `${value} phút`,
    },
    {
        field: "petTypes",
        headerName: "Loại Pet",
        width: 150,
        renderCell: RenderPetTypesCell,
    },
    {
        field: "status",
        headerName: "Trạng thái",
        width: 120,
        renderCell: RenderStatusCell,
    },
    {
        field: 'actions',
        headerName: '',
        width: 80,
        sortable: false,
        align: 'right',
        renderCell: RenderActionsCell,
    },
];

export const columnsInitialState = {
    pagination: {
        paginationModel: { page: 0, pageSize: 10 },
    },
};
