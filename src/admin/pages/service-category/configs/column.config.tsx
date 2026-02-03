import { GridColDef } from "@mui/x-data-grid";
import {
    RenderActionsCell,
    RenderTitleCell,
    RenderStatusCell,
    RenderCreatedAtCell,
    RenderPetTypesCell
} from '../utils/render-cells';
import { IServiceCategory } from "./types";

export const columnsConfig: GridColDef<IServiceCategory>[] = [
    {
        field: "name",
        headerName: "Tên danh mục",
        flex: 1,
        minWidth: 200,
        hideable: false,
        renderCell: RenderTitleCell,
    },
    {
        field: "parentId",
        headerName: "Danh mục cha",
        width: 180,
    },
    {
        field: "petTypes",
        headerName: "Loại Pet",
        width: 150,
        renderCell: RenderPetTypesCell,
    },
    {
        field: "bookingTypes",
        headerName: "Loại đặt chỗ",
        width: 140,
    },
    {
        field: "createdAt",
        headerName: "Thời gian tạo",
        width: 160,
        filterable: true,
        type: "dateTime",
        valueGetter: (value) => value ? new Date(value) : null,
        renderCell: (params) => <RenderCreatedAtCell value={params.value} />,
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
        filterable: false,
        align: 'right',
        renderCell: RenderActionsCell,
    },
];

export const columnsInitialState = {
    pagination: {
        paginationModel: { page: 0, pageSize: 10 },
    },
};
