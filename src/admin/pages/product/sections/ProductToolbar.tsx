import { Toolbar } from "@mui/material";
import React, { useMemo, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { IGridSettings } from "../configs/types";
import { SelectMulti } from "../../../components/ui/SelectMulti";
import { Search } from "../../../components/ui/Search";
import { Columns } from "../../../components/ui/Columns";
import { Filter } from "../../../components/ui/Filter";
import { ExportButton } from "../../../components/ui/ExportButton";
import { SettingsList } from "../../../components/ui/SettingsList";
import { toolbarStyles } from "../configs/styles.config";

interface ToolbarProps {
    settings: IGridSettings;
    onSettingsChange: Dispatch<SetStateAction<IGridSettings>>;
}

export const ProductToolbar = ({
    settings,
    onSettingsChange,
}: ToolbarProps) => {
    const { t } = useTranslation();
    const statusOptions = useMemo(() => [
        { value: 'active', label: t("admin.product.status.active") },
        { value: 'inactive', label: t("admin.product.status.inactive") },
        { value: 'draft', label: t("admin.product.status.draft") }
    ], [t]);

    const stockOptions = useMemo(() => [
        { value: 'instock', label: t("admin.product.stock_status.in_stock") },
        { value: 'lowstock', label: t("admin.product.stock_status.low_stock") },
        { value: 'outofstock', label: t("admin.product.stock_status.out_of_stock") }
    ], [t]);

    return (
        <Toolbar style={toolbarStyles.root}>
            <div className='flex gap-[16px]'>
                <SelectMulti label={t("admin.product.toolbar.status")} options={statusOptions} />
                <SelectMulti label={t("admin.product.toolbar.stock")} options={stockOptions} />
                <Search />
            </div>
            <div>
                <Columns />
                <Filter />
                <ExportButton />
                <SettingsList
                    settings={settings}
                    onSettingsChange={onSettingsChange}
                />
            </div>
        </Toolbar>
    );
};
