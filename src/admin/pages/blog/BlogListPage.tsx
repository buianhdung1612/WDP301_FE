import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Search } from "../../components/ui/Search";
import { SortButton } from "../../components/ui/SortButton";
import { TabList } from "../../components/ui/TabList";
import { BlogList } from "./sections/BlogList";
import { useBlogs } from "./hooks/useBlog";
import { useState, useMemo } from "react";


import { useTranslation } from "react-i18next";

export const BlogListPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: allBlogs = [], isLoading } = useBlogs();


    const [sortBy, setSortBy] = useState("latest");
    const [tabStatus, setTabStatus] = useState(0); // 0: All, 1: Published, 2: Draft, 3: Archived

    // Filter Logic
    const filteredBlogs = useMemo(() => {
        let result = [...allBlogs];

        // 1. Filter by Status
        if (tabStatus === 1) {
            result = result.filter(blog => blog.status === 'published');
        } else if (tabStatus === 2) {
            result = result.filter(blog => blog.status === 'draft');
        } else if (tabStatus === 3) {
            result = result.filter(blog => blog.status === 'archived');
        }



        // 3. Sort
        result.sort((a, b) => {
            if (sortBy === 'latest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === 'oldest') {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortBy === 'popular') {
                return (b.viewCount || 0) - (a.viewCount || 0);
            }
            return 0;
        });

        return result;
    }, [allBlogs, tabStatus, sortBy]);

    // Counts Logic
    const counts = useMemo(() => {
        return {
            all: allBlogs.length,
            published: allBlogs.filter((b: any) => b.status === 'published').length,
            draft: allBlogs.filter((b: any) => b.status === 'draft').length,
            archived: allBlogs.filter((b: any) => b.status === 'archived').length,
        };
    }, [allBlogs]);

    // Inline removeVietnameseTones if not available globally


    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title={t("admin.blog.title.list")} />
                    <Breadcrumb
                        items={[
                            { label: t("admin.dashboard"), to: "/" },
                            { label: t("admin.blog.title.list"), to: `/${prefixAdmin}/blog/list` },
                            { label: t("admin.common.list") }
                        ]}
                    />
                </div>
                <Button
                    onClick={() => navigate(`/${prefixAdmin}/blog/create`)}
                    sx={{
                        background: '#1C252E',
                        minHeight: "3.6rem",
                        minWidth: "6.4rem",
                        fontWeight: 700,
                        fontSize: "1.4rem",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                            background: "#454F5B",
                            boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                        }
                    }}
                    variant="contained"
                    startIcon={<AddIcon />}
                >

                    {t("admin.blog.title.create")}
                </Button>
            </div>

            <Box sx={{ mb: "40px", display: 'flex', justifyContent: "space-between" }}>
                <Search />
                <SortButton
                    value={sortBy}
                    onChange={setSortBy}
                />
            </Box>

            <TabList
                value={tabStatus}
                onChange={(_, newVal) => setTabStatus(newVal)}
                counts={counts}
            />

            <BlogList
                blogs={filteredBlogs}
                isLoading={isLoading}
            />
        </>
    )
}
