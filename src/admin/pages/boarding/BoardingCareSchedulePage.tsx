import dayjs from "dayjs";
import { Fragment, useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    Card,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tabs,
    TextField,
    Typography,
    Collapse,
    Tooltip,
    Autocomplete,
    Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { BoardingPetDiaryManager } from "./BoardingPetDiaryManager";
import { BoardingTaskDashboard } from "./BoardingTaskDashboard";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { Search } from "../../components/ui/Search";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";
import {
    getBoardingBookingDetail,
    getBoardingBookings,
    getBoardingHotelStaffs,
    updateBoardingCareSchedule,
    type BoardingExerciseItem,
    type BoardingFeedingItem,
    type BoardingProofMediaItem,
} from "../../api/boarding-booking.api";
import { getFoodTemplates, getExerciseTemplates } from "../../api/pet-care-template.api";
import { uploadMediaToCloudinary } from "../../api/uploadCloudinary.api";

const trangThaiChamSocOptions: Array<{ value: "pending" | "done" | "skipped"; label: string }> = [
    { value: "pending", label: "Chưa thực hiện" },
    { value: "done", label: "Đã hoàn thành" },
    { value: "skipped", label: "Bỏ qua" },
];

const MAX_PROOF_MEDIA_PER_ROW = 5;
const MAX_IMAGE_PROOF_SIZE_MB = 5;

const calculateRecommendedPortion = (pets: any[]) => {
    if (!pets.length) return "";
    const totalWeight = pets.reduce((sum, p) => sum + Number(p.weight || 0), 0);
    const isYoung = pets.some(p => p.age && Number(p.age) < 1);
    const ratio = isYoung ? 0.05 : 0.025;
    const mealsPerDay = isYoung ? 3 : 2;
    const gramPerMeal = Math.round((totalWeight * 1000 * ratio) / mealsPerDay);
    return gramPerMeal > 0 ? `${gramPerMeal}g` : "";
};

const taoDongLichAn = (petType: "dog" | "cat" | "all" = "all"): BoardingFeedingItem => ({
    time: "", food: "", amount: "", note: "", proofMedia: [], staffId: "", staffName: "", status: "pending", petType,
});

const taoDongVanDong = (petType: "dog" | "cat" | "all" = "all"): BoardingExerciseItem => ({
    time: "", activity: "", durationMinutes: 0, note: "", proofMedia: [], staffId: "", staffName: "", status: "pending", petType,
});

export const BoardingCareSchedulePage = () => {
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [careDate, setCareDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [onlyMyAssign, setOnlyMyAssign] = useState(false);
    const [careDialogOpen, setCareDialogOpen] = useState(false);
    const [careLoading, setCareLoading] = useState(false);
    const [editingBooking, setEditingBooking] = useState<any>(null);
    const [feedingDraft, setFeedingDraft] = useState<BoardingFeedingItem[]>([]);
    const [exerciseDraft, setExerciseDraft] = useState<BoardingExerciseItem[]>([]);
    const [uploadingProofKey, setUploadingProofKey] = useState<string>("");
    const [proofViewer, setProofViewer] = useState<{ open: boolean; items: BoardingProofMediaItem[]; index: number; title: string; }>({ open: false, items: [], index: 0, title: "" });
    const [careTab, setCareTab] = useState(0);
    const [speciesFilter, setSpeciesFilter] = useState("all");
    const [openRows, setOpenRows] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"room" | "task">("room");

    const canAssignHotelStaff = useMemo(() => {
        const p = Array.isArray(user?.permissions) ? user.permissions : [];
        return p.includes("account_admin_view") || p.includes("account_admin_edit") || p.includes("role_permissions");
    }, [user]);

    const { data, isLoading } = useQuery({ queryKey: ["admin-boarding-bookings"], queryFn: () => getBoardingBookings({ limit: 1000 }) });
    const { data: hotelStaffRes } = useQuery({ queryKey: ["admin-boarding-hotel-staffs", careDate], queryFn: () => getBoardingHotelStaffs(careDate || undefined), enabled: true });

    // Fetch Food & Exercise Templates
    const petTypeForTemplates = useMemo(() => {
        const types = (editingBooking?.petIds || []).map((p: any) => (p.type || p.petType || "").toLowerCase());
        if (types.includes("dog") && types.includes("cat")) return "all";
        if (types.includes("dog")) return "dog";
        if (types.includes("cat")) return "cat";
        return "all";
    }, [editingBooking]);

    const { data: foodTemplatesRes } = useQuery({
        queryKey: ["admin-pet-food-templates", petTypeForTemplates],
        queryFn: () => getFoodTemplates({ petType: petTypeForTemplates }),
        enabled: careDialogOpen
    });

    const { data: exerciseTemplatesRes } = useQuery({
        queryKey: ["admin-pet-exercise-templates", petTypeForTemplates],
        queryFn: () => getExerciseTemplates({ petType: petTypeForTemplates }),
        enabled: careDialogOpen
    });

    const foodOptions = useMemo(() => {
        const list = Array.isArray(foodTemplatesRes?.data) ? foodTemplatesRes.data : [];
        return list.filter((f: any) => f.isActive).map((f: any) => f.name);
    }, [foodTemplatesRes]);

    const exerciseOptions = useMemo(() => {
        const list = Array.isArray(exerciseTemplatesRes?.data) ? exerciseTemplatesRes.data : [];
        return list.filter((e: any) => e.isActive).map((e: any) => e.name);
    }, [exerciseTemplatesRes]);

    const hotelStaffOptions = useMemo(() => {
        const res = hotelStaffRes as any;
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        return list.map((s: any) => ({ value: s._id, label: s.fullName || "NV" }));
    }, [hotelStaffRes]);

    const suggestedPortion = useMemo(() => calculateRecommendedPortion(editingBooking?.petIds || []), [editingBooking]);

    const getStaffId = (v: any) => (v && typeof v === "object" ? String(v._id || "") : String(v || ""));
    const getStaffName = (sid: string, fb?: string) => hotelStaffOptions.find(i => i.value === sid)?.label || String(fb || "");

    const normalizeProofMedia = (items: any): BoardingProofMediaItem[] => (Array.isArray(items) ? items : []).map(i => ({ url: String(i?.url || i || "").trim(), kind: (String(i?.kind || "").toLowerCase() === "video" ? "video" : "image") as "video" | "image" })).filter(i => !!i.url);

    const capNhatDongLichAn = (i: number, p: Partial<BoardingFeedingItem>) => setFeedingDraft(prev => prev.map((item, idx) => idx === i ? { ...item, ...p } : item));
    const capNhatDongVanDong = (i: number, p: Partial<BoardingExerciseItem>) => setExerciseDraft(prev => prev.map((item, idx) => idx === i ? { ...item, ...p } : item));

    const xoaMinhChung = (t: "f" | "e", ri: number, mi: number) => {
        const setter = t === "f" ? setFeedingDraft : setExerciseDraft;
        setter(prev => prev.map((item, idx) => idx === ri ? { ...item, proofMedia: normalizeProofMedia(item.proofMedia).filter((_, i) => i !== mi) } : item));
    };

    const taiMinhChung = async (t: "f" | "e", ri: number, files: FileList | null) => {
        if (!files?.length) return;
        const list = Array.from(files);
        if (list.some(f => !f.type.startsWith("image/") && !f.type.startsWith("video/"))) { toast.error("Chỉ hỗ trợ ảnh/video"); return; }
        const current = normalizeProofMedia((t === "f" ? feedingDraft : exerciseDraft)[ri]?.proofMedia).length;
        if (current + list.length > MAX_PROOF_MEDIA_PER_ROW) { toast.error("Vượt quá số lượng minh chứng cho phép"); return; }
        try {
            setUploadingProofKey(`${t}-${ri}`);
            const uploaded = await uploadMediaToCloudinary(list);
            const setter = t === "f" ? setFeedingDraft : setExerciseDraft;
            setter(prev => prev.map((item, idx) => idx === ri ? { ...item, proofMedia: [...normalizeProofMedia(item.proofMedia), ...uploaded] } : item));
            toast.success("Đã tải minh chứng");
        } catch (e: any) { toast.error("Lỗi tải file"); } finally { setUploadingProofKey(""); }
    };

    const validateProof = (items: any[], label: string) => {
        const fail = items.findIndex(i => i.status === "done" && !normalizeProofMedia(i.proofMedia).length);
        if (fail !== -1) { toast.error(`${label} dòng ${fail + 1} cần minh chứng để hoàn thành`); return false; }
        return true;
    };

    const apDungDuLieu = (b: any, opts?: { kDate?: boolean }) => {
        setEditingBooking(b);
        setFeedingDraft((b.feedingSchedule || []).map((i: any) => ({ ...i, proofMedia: normalizeProofMedia(i.proofMedia), staffId: getStaffId(i.staffId), staffName: i.staffName || i.staffId?.fullName || "" })));
        setExerciseDraft((b.exerciseSchedule || []).map((i: any) => ({ ...i, proofMedia: normalizeProofMedia(i.proofMedia), staffId: getStaffId(i.staffId), staffName: i.staffName || i.staffId?.fullName || "" })));
        if (!opts?.kDate) setCareDate(dayjs(b.checkInDate).isValid() ? dayjs(b.checkInDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"));
    };

    const updateCareMut = useMutation({
        mutationFn: ({ id, payload }: any) => updateBoardingCareSchedule(id, payload),
        onSuccess: () => { toast.success("Đã cập nhật"); queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] }); setCareDialogOpen(false); },
        onError: (e: any) => toast.error(e?.response?.data?.message || "Lỗi cập nhật"),
    });

    const allRows = useMemo(() => (data as any)?.data?.recordList || (data as any)?.data || [], [data]);
    const eligibleRows = useMemo(() => allRows.filter((i: any) => i.paymentStatus === "paid" || ["confirmed", "checked-in"].includes(i.boardingStatus)), [allRows]);

    const filteredRows = useMemo(() => {
        let l = eligibleRows;
        if (speciesFilter !== "all") l = l.filter((i: any) => (i.petIds || []).some((p: any) => (p.type || p.petType) === speciesFilter));
        if (onlyMyAssign && user?.id) l = l.filter((i: any) => !!i.scheduleSummary?.hasMyAssigned);
        const q = searchQuery.trim().toLowerCase();
        if (q) l = l.filter((i: any) => String(i.code).toLowerCase().includes(q) || String(i.fullName || i.userId?.fullName).toLowerCase().includes(q));
        return l;
    }, [eligibleRows, searchQuery, speciesFilter, onlyMyAssign, user]);

    const moDialog = async (row: any) => {
        try { setCareLoading(true); setEditingBooking(row); setCareDialogOpen(true); const res = await getBoardingBookingDetail(row._id); if (res?.data) apDungDuLieu(res.data); } catch { toast.error("Lỗi tải dữ liệu"); setCareDialogOpen(false); } finally { setCareLoading(false); }
    };

    const hasOpened = useRef(false);
    useEffect(() => {
        const c = searchParams.get("search");
        if (c && !isLoading && allRows.length && !hasOpened.current) { const m = allRows.find((r: any) => r.code === c); if (m) { moDialog(m); hasOpened.current = true; } }
    }, [isLoading, allRows, searchParams]);

    const luuCare = () => {
        if (!editingBooking?._id || !validateProof(feedingDraft, "Lịch ăn") || !validateProof(exerciseDraft, "Lịch vận động")) return;
        const payload = {
            feedingSchedule: feedingDraft.map(i => ({ ...i, staffId: getStaffId(i.staffId), staffName: getStaffName(getStaffId(i.staffId), i.staffName) })),
            exerciseSchedule: exerciseDraft.map(i => ({ ...i, staffId: getStaffId(i.staffId), staffName: getStaffName(getStaffId(i.staffId), i.staffName) })),
            careDate
        };
        updateCareMut.mutate({ id: editingBooking._id, payload });
    };

    const renderProof = (t: "f" | "e", ri: number, item: any) => {
        const pm = normalizeProofMedia(item.proofMedia);
        const loading = uploadingProofKey === `${t}-${ri}`;
        return (
            <Box sx={{ mt: 1, p: 1, border: "1px dashed #ddd", borderRadius: 1.5, bgcolor: "#f9f9f9" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button component="label" variant="outlined" size="small" startIcon={<CloudUploadOutlinedIcon />} disabled={loading}>{loading ? "..." : "Tải minh chứng"}<input hidden type="file" multiple onChange={e => { taiMinhChung(t, ri, e.target.files); e.target.value = ""; }} /></Button>
                    <Typography variant="caption" color="textSecondary">Tối đa {MAX_PROOF_MEDIA_PER_ROW} file, dưới {MAX_IMAGE_PROOF_SIZE_MB}MB/file</Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    {pm.map((m, mi) => (
                        <Box key={mi} sx={{ position: "relative", width: 60, height: 60, borderRadius: 1, overflow: "hidden", border: "1px solid #eee" }} onClick={() => setProofViewer({ open: true, items: pm, index: mi, title: "Minh chứng" })}>
                            {m.kind === "video" ? <video src={m.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={m.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                            <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); xoaMinhChung(t, ri, mi); }} sx={{ position: "absolute", top: 0, right: 0, p: 0.2, bgcolor: "rgba(255,255,255,0.7)" }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                        </Box>
                    ))}
                </Stack>
            </Box>
        );
    };

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                    <Title title="Lịch chăm sóc nội trú" />
                    <Breadcrumb items={[
                        { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                        { label: "Lịch chăm sóc nội trú" },
                    ]} />
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    {canAssignHotelStaff && (
                        <Button
                            component={Link}
                            to={`/${prefixAdmin}/boarding/care-templates`}
                            variant="outlined"
                            startIcon={<Icon icon="solar:settings-bold" />}
                            sx={{
                                borderRadius: "var(--shape-borderRadius)",
                                fontWeight: 700,
                                textTransform: "none",
                                minHeight: "2.5rem",
                                color: "var(--palette-text-primary)",
                                borderColor: "var(--palette-divider)",
                                "&:hover": { bgcolor: "var(--palette-action-hover)", borderColor: "var(--palette-text-primary)" }
                            }}
                        >
                            Quản lý mẫu
                        </Button>
                    )}
                    <Box sx={{ bgcolor: "var(--palette-background-neutral)", p: 0.5, borderRadius: "var(--shape-borderRadius)", display: 'flex' }}>
                        <Button
                            size="small"
                            variant={viewMode === "room" ? "contained" : "text"}
                            onClick={() => setViewMode("room")}
                            sx={{
                                px: 2,
                                fontWeight: 700,
                                textTransform: "none",
                                color: viewMode === "room" ? "var(--palette-common-white)" : "var(--palette-text-secondary)",
                                bgcolor: viewMode === "room" ? "var(--palette-text-primary)" : "transparent",
                                "&:hover": { bgcolor: viewMode === "room" ? "var(--palette-grey-700)" : "var(--palette-action-hover)" }
                            }}
                        >
                            Phòng
                        </Button>
                        <Button
                            size="small"
                            variant={viewMode === "task" ? "contained" : "text"}
                            onClick={() => setViewMode("task")}
                            sx={{
                                px: 2,
                                fontWeight: 700,
                                textTransform: "none",
                                color: viewMode === "task" ? "var(--palette-common-white)" : "var(--palette-text-secondary)",
                                bgcolor: viewMode === "task" ? "var(--palette-text-primary)" : "transparent",
                                "&:hover": { bgcolor: viewMode === "task" ? "var(--palette-grey-700)" : "var(--palette-action-hover)" }
                            }}
                        >
                            Công việc
                        </Button>
                    </Box>
                </Stack>
            </Box>

            {viewMode === "task" ? (
                <BoardingTaskDashboard bookings={filteredRows} careDate={careDate} />
            ) : (
                <Card
                    sx={{
                        borderRadius: "var(--shape-borderRadius-lg)",
                        bgcolor: "var(--palette-background-paper)",
                        boxShadow: "var(--customShadows-card)",
                        overflow: "hidden",
                    }}
                >
                    <Tabs
                        value={speciesFilter}
                        onChange={(_, v) => setSpeciesFilter(v)}
                        sx={{
                            px: "20px",
                            minHeight: "48px",
                            borderBottom: "1px solid var(--palette-background-neutral)",
                            "& .MuiTabs-indicator": { backgroundColor: "var(--palette-text-primary)", height: 2 },
                        }}
                    >
                        <Tab value="all" label="Tất cả" sx={{ textTransform: "none", fontWeight: 700, minWidth: 80 }} />
                        <Tab value="dog" label="Chó" sx={{ textTransform: "none", fontWeight: 700, minWidth: 80 }} />
                        <Tab value="cat" label="Mèo" sx={{ textTransform: "none", fontWeight: 700, minWidth: 80 }} />
                    </Tabs>

                    <Box sx={{ p: "20px", display: "flex", alignItems: "center", gap: 2, borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                        <Search
                            placeholder="Tìm kiếm mã đơn hoặc khách hàng..."
                            value={searchQuery}
                            onChange={v => { setSearchQuery(v); setPage(0); }}
                            maxWidth="24rem"
                        />
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Checkbox
                                checked={onlyMyAssign}
                                onChange={e => setOnlyMyAssign(e.target.checked)}
                                sx={{ color: "var(--palette-text-disabled)" }}
                            />
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--palette-text-secondary)" }}>
                                Việc của tôi
                            </Typography>
                        </Stack>
                    </Box>

                    <TableContainer sx={{ position: "relative" }}>
                        <Table sx={{ minWidth: 1000 }}>
                            <TableHead sx={{ bgcolor: "var(--palette-background-neutral)" }}>
                                <TableRow>
                                    <TableCell width={60} />
                                    <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Đơn đặt</TableCell>
                                    <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Khách hàng</TableCell>
                                    <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Thời gian</TableCell>
                                    <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Lịch trình</TableCell>
                                    <TableCell sx={{ color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }} align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <CircularProgress size={32} thickness={5} sx={{ color: "var(--palette-text-primary)" }} />
                                        </TableCell>
                                    </TableRow>
                                ) : !filteredRows.length ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <Typography sx={{ color: "var(--palette-text-secondary)" }}>Không có dữ liệu</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r: any) => (
                                        <Fragment key={r._id}>
                                            <TableRow
                                                hover
                                                sx={{
                                                    "&:hover": { bgcolor: "var(--palette-action-hover)" },
                                                    transition: "background-color 0.2s"
                                                }}
                                            >
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setOpenRows(p => p.includes(r._id) ? p.filter(id => id !== r._id) : [...p, r._id])}
                                                    >
                                                        <Icon icon={openRows.includes(r._id) ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"} width={20} />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                        #{r.code?.toUpperCase().slice(-6)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: "var(--palette-text-secondary)", display: "block", fontSize: "0.75rem", fontWeight: 500 }}>
                                                        {dayjs(r.createdAt).format("DD/MM/YYYY HH:mm")}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Avatar src={r.userId?.avatar} variant="rounded" sx={{ width: 36, height: 36 }} />
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.fullName || r.userId?.fullName}</Typography>
                                                            <Typography sx={{ variant: "caption", color: "var(--palette-text-secondary)", fontSize: "0.75rem" }}>{r.phone}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ fontSize: "0.875rem" }}>
                                                        {dayjs(r.checkInDate).format("DD/MM")} - {dayjs(r.checkOutDate).format("DD/MM")}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Stack direction="row" spacing={1}>
                                                        <Box sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: "var(--palette-warning-lighter)", color: "var(--palette-warning-dark)", display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.75rem", fontWeight: 700 }}>
                                                            <Icon icon="fluent:food-24-filled" width={14} /> {r.scheduleSummary?.feedingCount || 0}
                                                        </Box>
                                                        <Box sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: "var(--palette-success-lighter)", color: "var(--palette-success-dark)", display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.75rem", fontWeight: 700 }}>
                                                            <Icon icon="solar:run-bold" width={14} /> {r.scheduleSummary?.exerciseCount || 0}
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => moDialog(r)}
                                                        sx={{
                                                            bgcolor: "var(--palette-text-primary)",
                                                            color: "var(--palette-common-white)",
                                                            fontWeight: 700,
                                                            minHeight: "2rem",
                                                            textTransform: "none",
                                                            "&:hover": { bgcolor: "var(--palette-grey-700)" }
                                                        }}
                                                    >
                                                        Quản lý
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ p: 0, bgcolor: "var(--palette-background-neutral)" }}>
                                                    <Collapse in={openRows.includes(r._id)}>
                                                        <Box p={3}>
                                                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 800 }}>Dịch vụ bổ sung & Ghi chú khách hàng</Typography>
                                                            <Typography variant="body2" color="textSecondary">Đơn hàng hiện đang ở trạng thái {r.boardingStatus}. Khách hàng đã thanh toán đầy đủ.</Typography>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={filteredRows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    />
                </Card>
            )}

            <Dialog
                open={careDialogOpen}
                onClose={() => setCareDialogOpen(false)}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: { borderRadius: "var(--shape-borderRadius-lg)", boxShadow: "var(--customShadows-z24)" }
                }}
            >
                <DialogTitle sx={{ p: 3, pb: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Quản lý lịch trình nội trú</Typography>
                            <Typography variant="caption" sx={{ color: "var(--palette-text-secondary)", fontWeight: 600 }}>Mã đơn: #{editingBooking?.code?.toUpperCase()}</Typography>
                        </Box>
                        <IconButton onClick={() => setCareDialogOpen(false)} size="small">
                            <Icon icon="eva:close-fill" width={24} />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {careLoading ? (
                        <Box sx={{ py: 10, textAlign: 'center' }}>
                            <CircularProgress size={32} thickness={5} sx={{ color: "var(--palette-text-primary)" }} />
                        </Box>
                    ) : (
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ bgcolor: "var(--palette-background-neutral)", p: 2, borderRadius: "var(--shape-borderRadius-md)" }}>
                                <TextField
                                    label="Ngày chăm sóc"
                                    type="date"
                                    value={careDate}
                                    onChange={e => setCareDate(e.target.value)}
                                    size="small"
                                    sx={{ width: 180, bgcolor: 'white' }}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                                {careTab === 0 && suggestedPortion && (
                                    <Box sx={{ px: 2, py: 1, bgcolor: "var(--palette-primary-lighter)", borderRadius: 1.5, color: "var(--palette-primary-dark)", display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Khẩu phần mỗi bữa khuyến nghị: {suggestedPortion}</Typography>
                                        <Tooltip title="Dựa trên 2.5% trọng lượng cho thú trưởng thành hoặc 5% cho thú nhỏ.">
                                            <HelpOutlineIcon sx={{ fontSize: 16, cursor: "help" }} />
                                        </Tooltip>
                                    </Box>
                                )}
                                <Box flexGrow={1} />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="warning"
                                    startIcon={<Icon icon="solar:refresh-bold" />}
                                    sx={{ borderRadius: "var(--shape-borderRadius)", textTransform: 'none', fontWeight: 700 }}
                                    onClick={() => {
                                        if (window.confirm("Thông tin lịch ăn và vận động hiện tại sẽ bị xóa và tạo lại từ mẫu chuẩn. Bạn có chắc không?")) {
                                            updateCareMut.mutate({ id: editingBooking._id, payload: { resetTemplate: true, careDate } });
                                        }
                                    }}
                                >
                                    Tạo lại từ mẫu
                                </Button>
                            </Stack>

                            <Tabs
                                value={careTab}
                                onChange={(_, v) => setCareTab(v)}
                                sx={{
                                    "& .MuiTabs-indicator": { backgroundColor: "var(--palette-text-primary)", height: 3 },
                                    borderBottom: "1px solid var(--palette-divider)"
                                }}
                            >
                                <Tab label={`Lịch ăn (${feedingDraft.length})`} sx={{ textTransform: 'none', fontWeight: 800 }} />
                                <Tab label={`Vận động (${exerciseDraft.length})`} sx={{ textTransform: 'none', fontWeight: 800 }} />
                                <Tab label="Nhật ký hàng ngày" sx={{ textTransform: 'none', fontWeight: 800 }} />
                            </Tabs>

                            {careTab === 0 && (
                                <Box sx={{ spaceY: 2 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => setFeedingDraft(p => [...p, taoDongLichAn()])}
                                        sx={{
                                            mb: 2,
                                            fontWeight: 700,
                                            borderRadius: "var(--shape-borderRadius)",
                                            bgcolor: "var(--palette-primary-lighter)",
                                            borderColor: "transparent",
                                            color: "var(--palette-primary-dark)",
                                            "&:hover": { bgcolor: "var(--palette-primary-light)", borderColor: "transparent" }
                                        }}
                                    >
                                        Thêm bữa ăn mới
                                    </Button>
                                    <Stack spacing={2}>
                                        {feedingDraft.map((i, idx) => (
                                            <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: "var(--shape-borderRadius-md)", position: 'relative', bgcolor: '#fcfcfc', borderStyle: 'solid', borderColor: 'var(--palette-divider)' }}>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                                    <TextField size="small" type="time" label="Giờ" value={i.time} onChange={e => capNhatDongLichAn(idx, { time: e.target.value })} sx={{ width: 120, flexShrink: 0, '& .MuiInputBase-root': { fontWeight: 700 } }} slotProps={{ inputLabel: { shrink: true } }} />
                                                    <Autocomplete
                                                        fullWidth
                                                        size="small"
                                                        freeSolo
                                                        options={foodOptions}
                                                        value={i.food || ""}
                                                        onChange={(_, newValue) => capNhatDongLichAn(idx, { food: newValue || "" })}
                                                        onInputChange={(_, newInputValue) => capNhatDongLichAn(idx, { food: newInputValue })}
                                                        renderInput={(params) => <TextField {...params} label="Loại thức ăn" sx={{ '& .MuiInputBase-root': { fontWeight: 700 } }} />}
                                                        sx={{ flexGrow: 1 }}
                                                    />
                                                    <TextField size="small" label="Khẩu phần" value={i.amount} onChange={e => capNhatDongLichAn(idx, { amount: e.target.value })} sx={{ width: 120, flexShrink: 0, '& .MuiInputBase-root': { fontWeight: 700 } }} />
                                                    <TextField size="small" select label="Nhân viên" value={i.staffId} onChange={e => capNhatDongLichAn(idx, { staffId: e.target.value })} sx={{ width: 180, flexShrink: 0 }}>
                                                        {hotelStaffOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                                    </TextField>
                                                    <TextField size="small" select label="Trạng thái" value={i.status} onChange={e => capNhatDongLichAn(idx, { status: e.target.value as any })} sx={{ width: 150, flexShrink: 0 }}>
                                                        {trangThaiChamSocOptions.map(o => <MenuItem key={o.value} value={o.value} sx={{ fontWeight: 600 }}>{o.label}</MenuItem>)}
                                                    </TextField>
                                                    <IconButton color="error" size="small" onClick={() => setFeedingDraft(p => p.filter((_, x) => x !== idx))} sx={{ mt: 0.5 }}><Icon icon="solar:trash-bin-trash-bold" width={20} /></IconButton>
                                                </Box>
                                                <TextField fullWidth size="small" label="Ghi chú cho bữa ăn" value={i.note} onChange={e => capNhatDongLichAn(idx, { note: e.target.value })} sx={{ mt: 2 }} />
                                                {renderProof("f", idx, i)}
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            {careTab === 1 && (
                                <Box sx={{ spaceY: 2 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => setExerciseDraft(p => [...p, taoDongVanDong()])}
                                        sx={{
                                            mb: 2,
                                            fontWeight: 700,
                                            borderRadius: "var(--shape-borderRadius)",
                                            bgcolor: "var(--palette-primary-lighter)",
                                            borderColor: "transparent",
                                            color: "var(--palette-primary-dark)",
                                            "&:hover": { bgcolor: "var(--palette-primary-light)", borderColor: "transparent" }
                                        }}
                                    >
                                        Thêm hoạt động mới
                                    </Button>
                                    <Stack spacing={2}>
                                        {exerciseDraft.map((i, idx) => (
                                            <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: "var(--shape-borderRadius-md)", position: 'relative', bgcolor: '#fcfcfc', borderStyle: 'solid', borderColor: 'var(--palette-divider)' }}>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                                    <TextField size="small" type="time" label="Giờ" value={i.time} onChange={e => capNhatDongVanDong(idx, { time: e.target.value })} sx={{ width: 120, flexShrink: 0, '& .MuiInputBase-root': { fontWeight: 700 } }} slotProps={{ inputLabel: { shrink: true } }} />
                                                    <Autocomplete
                                                        fullWidth
                                                        size="small"
                                                        freeSolo
                                                        options={exerciseOptions}
                                                        value={i.activity || ""}
                                                        onChange={(_, newValue) => capNhatDongVanDong(idx, { activity: newValue || "" })}
                                                        onInputChange={(_, newInputValue) => capNhatDongVanDong(idx, { activity: newInputValue })}
                                                        renderInput={(params) => <TextField {...params} label="Hoạt động" sx={{ '& .MuiInputBase-root': { fontWeight: 700 } }} />}
                                                        sx={{ flexGrow: 1 }}
                                                    />
                                                    <TextField size="small" label="Thời lượng (p)" type="number" value={i.durationMinutes} onChange={e => capNhatDongVanDong(idx, { durationMinutes: Number(e.target.value) })} sx={{ width: 100, flexShrink: 0, '& .MuiInputBase-root': { fontWeight: 700 } }} />
                                                    <TextField size="small" select label="Nhân viên" value={i.staffId} onChange={e => capNhatDongVanDong(idx, { staffId: e.target.value })} sx={{ width: 180, flexShrink: 0 }}>
                                                        {hotelStaffOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                                    </TextField>
                                                    <TextField size="small" select label="Trạng thái" value={i.status} onChange={e => capNhatDongVanDong(idx, { status: e.target.value as any })} sx={{ width: 150, flexShrink: 0 }}>
                                                        {trangThaiChamSocOptions.map(o => <MenuItem key={o.value} value={o.value} sx={{ fontWeight: 600 }}>{o.label}</MenuItem>)}
                                                    </TextField>
                                                    <IconButton color="error" size="small" onClick={() => setExerciseDraft(p => p.filter((_, x) => x !== idx))} sx={{ mt: 0.5 }}><Icon icon="solar:trash-bin-trash-bold" width={20} /></IconButton>
                                                </Box>
                                                <TextField fullWidth size="small" label="Ghi chú vận động" value={i.note} onChange={e => capNhatDongVanDong(idx, { note: e.target.value })} sx={{ mt: 2 }} />
                                                {renderProof("e", idx, i)}
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                            {careTab === 2 && <BoardingPetDiaryManager bookingId={editingBooking?._id} pets={editingBooking?.petIds || []} date={careDate} />}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={() => setCareDialogOpen(false)}
                        sx={{ fontWeight: 700, color: "var(--palette-text-secondary)" }}
                    >
                        Đóng
                    </Button>
                    <Button
                        variant="contained"
                        onClick={luuCare}
                        disabled={updateCareMut.isPending}
                        sx={{
                            bgcolor: "var(--palette-text-primary)",
                            color: "var(--palette-common-white)",
                            fontWeight: 700,
                            minHeight: "2.5rem",
                            px: 3,
                            textTransform: "none",
                            "&:hover": { bgcolor: "var(--palette-grey-700)" }
                        }}
                    >
                        {updateCareMut.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={proofViewer.open} onClose={() => setProofViewer(p => ({ ...p, open: false }))} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "var(--shape-borderRadius-lg)" } }}>
                <DialogContent sx={{ p: 0, bgcolor: "#000", textAlign: "center", position: 'relative' }}>
                    <IconButton onClick={() => setProofViewer(p => ({ ...p, open: false }))} sx={{ position: 'absolute', top: 10, right: 10, color: '#fff', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}><Icon icon="eva:close-fill" /></IconButton>
                    {proofViewer.items[proofViewer.index]?.kind === "video" ? <video src={proofViewer.items[proofViewer.index]?.url} controls style={{ maxWidth: "100%", maxHeight: "85vh" }} /> : <img src={proofViewer.items[proofViewer.index]?.url} style={{ maxWidth: "100%", maxHeight: "85vh" }} />}
                </DialogContent>
            </Dialog>
        </Box>
    );
};
