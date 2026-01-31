import { Toolbar } from "@mui/material";
import { Search } from "../../../components/ui/Search";
import { toolbarStyles } from "../configs/styles.config";
import { ExportImport } from "../../../components/ui/ExportImport";

export const ProductAttributeToolbar = () => {
    return (
        <Toolbar style={toolbarStyles.root}>
            <div className='flex gap-[16px] w-full'>
                <div className="flex flex-1 items-center gap-[16px]">
                    <div className="flex-1">
                        <Search maxWidth="100%" placeholder="Tìm kiếm thuộc tính..." />
                    </div>
                    <ExportImport />
                </div>
            </div>
        </Toolbar>
    );
};
