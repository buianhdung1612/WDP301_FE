import { Toolbar } from "@mui/material";
import { SelectMulti } from "../../../components/ui/SelectMulti";
import { Search } from "../../../components/ui/Search";
import { STATUS_OPTIONS } from "../configs/constants";
import { toolbarStyles } from "../configs/styles.config";
import { ExportImport } from "../../../components/ui/ExportImport";

export const BrandToolbar = () => {
    return (
        <Toolbar style={toolbarStyles.root}>
            <div className='flex gap-[16px] w-full'>
                <SelectMulti label="Trạng thái" options={STATUS_OPTIONS} />
                <div className="flex flex-1 items-center gap-[16px]">
                    <div className="flex-1">
                        <Search maxWidth="100%" />
                    </div>
                    <ExportImport />
                </div>
            </div>
        </Toolbar>
    );
};
