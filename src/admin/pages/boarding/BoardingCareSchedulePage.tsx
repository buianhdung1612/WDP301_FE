import { ChangeEvent, useMemo, useState } from "react";
import {
    Avatar,
    Autocomplete,
    Box,
    Button,
    Card,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { Search } from "../../components/ui/Search";
import { useAuthStore } from "../../../stores/useAuthStore";
import {
    BoardingExerciseItem,
    BoardingFeedingItem,
    BoardingProofMediaItem,
    getBoardingBookingDetail,
    getBoardingBookings,
    getBoardingHotelStaffs,
    updateBoardingCareSchedule,
} from "../../api/boarding-booking.api";
import { uploadMediaToCloudinary } from "../../api/uploadCloudinary.api";

const trangThaiChamSocOptions: Array<{ value: "pending" | "done" | "skipped"; label: string }> = [
    { value: "pending", label: "Chưa thực hiện" },
    { value: "done", label: "Đã hoàn thành" },
    { value: "skipped", label: "Bỏ qua" },
];

const MAX_PROOF_MEDIA_PER_ROW = 5;
const MAX_IMAGE_PROOF_SIZE_MB = 5;
const MAX_VIDEO_PROOF_SIZE_MB = 20;

const DOG_FOOD_OPTIONS = [
    "Hạt (Royal Canin)",
    "Hạt + Pate",
    "Gà luộc + Cơm",
    "Thịt bò + Rau củ",
    "Bánh thưởng / Snack",
    "Theo chế độ cung cấp",
];

const CAT_FOOD_OPTIONS = [
    "Hạt (Royal Canin)",
    "Pate (Gói/Lon)",
    "Hạt + Pate",
    "Súp thưởng (Churu)",
    "Cá luộc / Gà xé",
    "Theo chế độ cung cấp",
];

const GENERAL_FOOD_OPTIONS = [
    "Hạt khô",
    "Thức ăn ướt (Pate)",
    "Thức ăn tự nấu",
    "Theo chế độ cung cấp",
];

const getFoodOptions = (petType: string) => {
    if (petType === "dog") return DOG_FOOD_OPTIONS;
    if (petType === "cat") return CAT_FOOD_OPTIONS;
    return GENERAL_FOOD_OPTIONS;
};

const calculateRecommendedPortion = (pets: any[], petType: "dog" | "cat" | "all", ratio: number = 0.02) => {
    const targetPets = pets.filter(p => petType === "all" || p.type === petType);
    if (!targetPets.length) return "";

    const totalWeight = targetPets.reduce((sum, p) => sum + Number(p.weight || 0), 0);
    const gramPerMeal = Math.round((totalWeight * 1000 * ratio) / 2); // Gi? s? an 2 b?a ch�nh

    if (gramPerMeal <= 0) return "";
    return `${gramPerMeal}g`;
};

const taoDongLichAn = (petType: "dog" | "cat" | "all" = "all"): BoardingFeedingItem => ({
    time: "",
    food: "",
    amount: "",
    note: "",
    proofMedia: [],
    staffId: "",
    staffName: "",
    status: "pending",
    petType,
});

const taoDongVanDong = (petType: "dog" | "cat" | "all" = "all"): BoardingExerciseItem => ({
    time: "",
    activity: "",
    durationMinutes: 0,
    note: "",
    proofMedia: [],
    staffId: "",
    staffName: "",
    status: "pending",
    petType,
});

export const BoardingCareSchedulePage = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [careDate, setCareDate] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [careDialogOpen, setCareDialogOpen] = useState(false);
    const [careLoading, setCareLoading] = useState(false);
    const [editingBooking, setEditingBooking] = useState<any>(null);

    const [feedingDraft, setFeedingDraft] = useState<BoardingFeedingItem[]>([]);
    const [exerciseDraft, setExerciseDraft] = useState<BoardingExerciseItem[]>([]);
    const [uploadingProofKey, setUploadingProofKey] = useState<string>("");
    const [proofViewer, setProofViewer] = useState<{
        open: boolean;
        items: BoardingProofMediaItem[];
        index: number;
        title: string;
    }>({
        open: false,
        items: [],
        index: 0,
        title: "",
    });

    const canAssignHotelStaff = useMemo(() => {
        const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
        return (
            permissions.includes("account_admin_view") ||
            permissions.includes("account_admin_edit") ||
            permissions.includes("role_permissions")
        );
    }, [user]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-boarding-bookings"],
        queryFn: () => getBoardingBookings({ limit: 1000 }),
    });

    const { data: hotelStaffRes } = useQuery({
        queryKey: ["admin-boarding-hotel-staffs", careDate],
        queryFn: () => getBoardingHotelStaffs(careDate || undefined),
        enabled: canAssignHotelStaff,
    });

    const hotelStaffOptions = useMemo(() => {
        if (!hotelStaffRes) return [];
        const data = hotelStaffRes as any;
        const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        return list.map((staff: any) => ({
            value: staff._id,
            label: `${staff.fullName || "Nhân viên"}${staff.employeeCode ? ` - ${staff.employeeCode}` : ""}`,
        }));
    }, [hotelStaffRes]);

    const getStaffId = (value: any) => {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (typeof value === "object") return String(value._id || "");
        return "";
    };

    const getStaffName = (staffId: string, fallback?: string) => {
        const found = hotelStaffOptions.find((item) => item.value === staffId);
        if (found) return found.label;
        return String(fallback || "");
    };

    const normalizeProofMedia = (items: any): BoardingProofMediaItem[] => {
        if (!Array.isArray(items)) return [];
        return items
            .map((item: any) => {
                const kindStr = String(item?.kind || "").toLowerCase();
                const kind: "video" | "image" = kindStr === "video" ? "video" : "image";
                return {
                    url: String(item?.url || item || "").trim(),
                    kind,
                };
            })
            .filter((item) => Boolean(item.url));
    };

    const capNhatDongLichAn = (index: number, patch: Partial<BoardingFeedingItem>) => {
        setFeedingDraft((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
    };

    const capNhatDongVanDong = (index: number, patch: Partial<BoardingExerciseItem>) => {
        setExerciseDraft((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
    };

    const xoaMinhChung = (type: "feeding" | "exercise", rowIndex: number, mediaIndex: number) => {
        if (type === "feeding") {
            setFeedingDraft((prev) =>
                prev.map((item, idx) =>
                    idx === rowIndex
                        ? { ...item, proofMedia: normalizeProofMedia(item.proofMedia).filter((_, index) => index !== mediaIndex) }
                        : item
                )
            );
            return;
        }

        setExerciseDraft((prev) =>
            prev.map((item, idx) =>
                idx === rowIndex
                    ? { ...item, proofMedia: normalizeProofMedia(item.proofMedia).filter((_, index) => index !== mediaIndex) }
                    : item
            )
        );
    };

    const taiMinhChung = async (type: "feeding" | "exercise", rowIndex: number, files: FileList | null) => {
        if (!files || files.length === 0) return;
        const fileList = Array.from(files);
        const invalidFiles = fileList.filter((file) => !file.type.startsWith("image/") && !file.type.startsWith("video/"));
        if (invalidFiles.length > 0) {
            toast.error("Chỉ hỗ trợ tải ảnh hoặc video minh chứng");
            return;
        }

        const currentProofCount = type === "feeding"
            ? normalizeProofMedia(feedingDraft[rowIndex]?.proofMedia).length
            : normalizeProofMedia(exerciseDraft[rowIndex]?.proofMedia).length;

        if (currentProofCount >= MAX_PROOF_MEDIA_PER_ROW) {
            toast.error(`Mỗi dòng chỉ được tải tối đa ${MAX_PROOF_MEDIA_PER_ROW} minh chứng`);
            return;
        }

        if (currentProofCount + fileList.length > MAX_PROOF_MEDIA_PER_ROW) {
            toast.error(`Bạn chỉ có thể tải thêm ${MAX_PROOF_MEDIA_PER_ROW - currentProofCount} file cho dòng này`);
            return;
        }

        const oversizedImage = fileList.find(
            (file) => file.type.startsWith("image/") && file.size > MAX_IMAGE_PROOF_SIZE_MB * 1024 * 1024
        );
        if (oversizedImage) {
            toast.error(`Ảnh minh chứng không được vượt quá ${MAX_IMAGE_PROOF_SIZE_MB}MB`);
            return;
        }

        const oversizedVideo = fileList.find(
            (file) => file.type.startsWith("video/") && file.size > MAX_VIDEO_PROOF_SIZE_MB * 1024 * 1024
        );
        if (oversizedVideo) {
            toast.error(`Video minh chứng không được vượt quá ${MAX_VIDEO_PROOF_SIZE_MB}MB`);
            return;
        }

        const uploadKey = `${type}-${rowIndex}`;
        try {
            setUploadingProofKey(uploadKey);
            const uploaded = await uploadMediaToCloudinary(fileList);

            if (type === "feeding") {
                setFeedingDraft((prev) =>
                    prev.map((item, idx) =>
                        idx === rowIndex
                            ? { ...item, proofMedia: [...normalizeProofMedia(item.proofMedia), ...uploaded] }
                            : item
                    )
                );
            } else {
                setExerciseDraft((prev) =>
                    prev.map((item, idx) =>
                        idx === rowIndex
                            ? { ...item, proofMedia: [...normalizeProofMedia(item.proofMedia), ...uploaded] }
                            : item
                    )
                );
            }
            toast.success("Đã tải minh chứng lên");
        } catch (error: any) {
            toast.error(error?.message || "Không thể tải minh chứng");
        } finally {
            setUploadingProofKey("");
        }
    };

    const validateCompletedRowsProof = (
        items: Array<BoardingFeedingItem | BoardingExerciseItem>,
        label: string,
        getTitle: (item: BoardingFeedingItem | BoardingExerciseItem) => string
    ) => {
        for (let index = 0; index < items.length; index += 1) {
            const item = items[index];
            if (item.status !== "done") continue;
            const proofMedia = normalizeProofMedia(item.proofMedia);
            if (proofMedia.length > 0) continue;
            const title = getTitle(item);
            toast.error(`${label} dng ${index + 1}${title ? ` (${title})` : ""} phải có ảnh hoặc video minh chứng trước khi hoàn thành`);
            return false;
        }

        return true;
    };

    const apDungDuLieuLichChamSoc = (booking: any, options?: { keepCareDate?: boolean }) => {
        setEditingBooking(booking);
        setFeedingDraft(
            Array.isArray(booking.feedingSchedule) && booking.feedingSchedule.length > 0
                ? booking.feedingSchedule.map((item: any) => ({
                    ...item,
                    proofMedia: normalizeProofMedia(item?.proofMedia),
                    staffId: getStaffId(item?.staffId),
                    staffName: item?.staffName || item?.staffId?.fullName || "",
                }))
                : [taoDongLichAn()]
        );
        setExerciseDraft(
            Array.isArray(booking.exerciseSchedule) && booking.exerciseSchedule.length > 0
                ? booking.exerciseSchedule.map((item: any) => ({
                    ...item,
                    proofMedia: normalizeProofMedia(item?.proofMedia),
                    staffId: getStaffId(item?.staffId),
                    staffName: item?.staffName || item?.staffId?.fullName || "",
                }))
                : [taoDongVanDong()]
        );
        if (!options?.keepCareDate) {
            const nextCareDate = dayjs(booking.checkInDate).isValid()
                ? dayjs(booking.checkInDate).format("YYYY-MM-DD")
                : dayjs().format("YYYY-MM-DD");
            setCareDate(nextCareDate);
        }
    };

    const updateCareMut = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: {
                feedingSchedule: BoardingFeedingItem[];
                exerciseSchedule: BoardingExerciseItem[];
                careDate?: string;
            };
        }) => updateBoardingCareSchedule(id, payload),
        onSuccess: () => {
            toast.success("Đã cập nhật lịch chăm sóc");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
            setCareDialogOpen(false);
            setEditingBooking(null);
        },
    });

    const resetCareTemplateMut = useMutation({
        mutationFn: (id: string) =>
            updateBoardingCareSchedule(id, {
                resetTemplate: true,
                careDate,
            }),
        onSuccess: (response: any) => {
            const booking = response?.data;
            if (booking?._id) {
                apDungDuLieuLichChamSoc(booking, { keepCareDate: true });
            }
            toast.success("Đã tạo lại lịch mẫu theo loại thú cưng");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
        },
    });

    const allRows = useMemo(() => {
        return (data as any)?.data?.recordList || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
    }, [data]);

    const eligibleRows = useMemo(() => {
        return allRows.filter((item: any) => {
            const paymentStatus = String(item?.paymentStatus || "");
            const boardingStatus = String(item?.boardingStatus || "");
            const daThanhToan = paymentStatus === "paid";
            const daXacNhan = ["confirmed", "checked-in", "checked-out"].includes(boardingStatus);
            return daThanhToan || daXacNhan;
        });
    }, [allRows]);

    const filteredRows = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return eligibleRows.filter((item: any) => {
            if (!q) return true;
            return (
                String(item.code || "").toLowerCase().includes(q) ||
                String(item.fullName || item.userId?.fullName || "").toLowerCase().includes(q) ||
                String(item.phone || item.userId?.phone || "").toLowerCase().includes(q)
            );
        });
    }, [eligibleRows, searchQuery]);

    const moDialogChamSoc = async (bookingId: string) => {
        try {
            setCareLoading(true);
            const res = await getBoardingBookingDetail(bookingId);
            const booking = res?.data || res;
            if (!booking?._id) {
                toast.error("Không tải được chi tiết booking");
                return;
            }

            apDungDuLieuLichChamSoc(booking);
            setCareDialogOpen(true);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi tải dữ liệu lịch chăm sóc");
        } finally {
            setCareLoading(false);
        }
    };

    const dongDialogChamSoc = () => {
        setCareDialogOpen(false);
        setEditingBooking(null);
        setFeedingDraft([]);
        setExerciseDraft([]);
    };

    const luuLichChamSoc = () => {
        if (!editingBooking?._id) return;

        if (!validateCompletedRowsProof(feedingDraft, "Lịch ăn", (item) => String((item as BoardingFeedingItem).food || "").trim())) {
            return;
        }
        if (!validateCompletedRowsProof(exerciseDraft, "Lịch vận động", (item) => String((item as BoardingExerciseItem).activity || "").trim())) {
            return;
        }

        const feedingSchedule = feedingDraft
            .map((item) => ({
                time: String(item.time || "").trim(),
                food: String(item.food || "").trim(),
                amount: String(item.amount || "").trim(),
                note: String(item.note || "").trim(),
                proofMedia: normalizeProofMedia(item.proofMedia),
                staffId: String(getStaffId(item.staffId) || "").trim(),
                staffName: getStaffName(String(getStaffId(item.staffId) || "").trim(), item.staffName),
                status: (item.status || "pending") as "pending" | "done" | "skipped",
            }))
            .filter((item) => item.time || item.food || item.amount || item.note || item.staffId || item.proofMedia.length > 0);

        const exerciseSchedule = exerciseDraft
            .map((item) => ({
                time: String(item.time || "").trim(),
                activity: String(item.activity || "").trim(),
                durationMinutes: Number(item.durationMinutes || 0),
                note: String(item.note || "").trim(),
                proofMedia: normalizeProofMedia(item.proofMedia),
                staffId: String(getStaffId(item.staffId) || "").trim(),
                staffName: getStaffName(String(getStaffId(item.staffId) || "").trim(), item.staffName),
                status: (item.status || "pending") as "pending" | "done" | "skipped",
            }))
            .filter((item) => item.time || item.activity || item.durationMinutes > 0 || item.note || item.staffId || item.proofMedia.length > 0);

        updateCareMut.mutate({
            id: editingBooking._id,
            payload: {
                feedingSchedule,
                exerciseSchedule,
                careDate,
            },
        });
    };

    const taoLaiLichMau = () => {
        if (!editingBooking?._id) return;
        resetCareTemplateMut.mutate(editingBooking._id);
    };

    const getCareSummary = (row: any) => {
        const soLichAn = Array.isArray(row?.feedingSchedule) ? row.feedingSchedule.length : 0;
        const soVanDong = Array.isArray(row?.exerciseSchedule) ? row.exerciseSchedule.length : 0;
        const soNhanVienLichAn = Array.isArray(row?.feedingSchedule)
            ? row.feedingSchedule.filter((item: any) => Boolean(item?.staffId)).length
            : 0;
        const soNhanVienVanDong = Array.isArray(row?.exerciseSchedule)
            ? row.exerciseSchedule.filter((item: any) => Boolean(item?.staffId)).length
            : 0;
        return { soLichAn, soVanDong, soNhanVienLichAn, soNhanVienVanDong };
    };

    const xuLyDoiTrangThai = (
        type: "feeding" | "exercise",
        rowIndex: number,
        nextStatus: "pending" | "done" | "skipped"
    ) => {
        if (nextStatus === "done") {
            const targetItem = type === "feeding" ? feedingDraft[rowIndex] : exerciseDraft[rowIndex];
            const proofMedia = normalizeProofMedia(targetItem?.proofMedia);
            if (proofMedia.length === 0) {
                toast.error("Phải tải ít nhất 1 ảnh hoặc video minh chứng trước khi chuyển sang đã hoàn thành");
                return;
            }
        }

        if (type === "feeding") {
            capNhatDongLichAn(rowIndex, { status: nextStatus });
            return;
        }

        capNhatDongVanDong(rowIndex, { status: nextStatus });
    };

    const renderProofMediaSection = (
        type: "feeding" | "exercise",
        rowIndex: number,
        item: BoardingFeedingItem | BoardingExerciseItem
    ) => {
        const proofMedia = normalizeProofMedia(item.proofMedia);
        const uploadKey = `${type}-${rowIndex}`;
        const isUploading = uploadingProofKey === uploadKey;

        return (
            <Box
                sx={{
                    mt: 1.5,
                    ml: { xs: 0, md: "140px" },
                    border: "1px dashed var(--palette-divider)",
                    borderRadius: "12px",
                    p: 1.5,
                    bgcolor: "var(--palette-background-neutral)",
                }}
            >
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", md: "center" }}>
                    <Button
                        component="label"
                        variant="outlined"
                        color={proofMedia.length > 0 ? "success" : "primary"}
                        size="small"
                        startIcon={<CloudUploadOutlinedIcon />}
                        disabled={isUploading}
                    >
                        {isUploading ? "Đang tải..." : "Tải ảnh/video minh chứng"}
                        <input
                            hidden
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => {
                                const files = e.target.files;
                                void taiMinhChung(type, rowIndex, files);
                                e.target.value = "";
                            }}
                        />
                    </Button>
                    <Typography sx={{ fontSize: "0.75rem", color: "var(--palette-text-secondary)" }}>
                        Cần ít nhất 1 ảnh hoặc video để chuyển trạng thái sang "Đã hoàn thành". Tối đa {MAX_PROOF_MEDIA_PER_ROW} file, ảnh = {MAX_IMAGE_PROOF_SIZE_MB}MB, video = {MAX_VIDEO_PROOF_SIZE_MB}MB.
                    </Typography>
                </Stack>

                {proofMedia.length > 0 ? (
                    <>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5, mb: 1 }}>
                            <Button
                                size="small"
                                variant="text"
                                startIcon={<OpenInFullIcon />}
                                onClick={() => setProofViewer({
                                    open: true,
                                    items: proofMedia,
                                    index: 0,
                                    title: `${type === "feeding" ? "Minh chứng lịch ăn" : "Minh chứng lịch vận động"} - dòng ${rowIndex + 1}`,
                                })}
                            >
                                Xem gallery
                            </Button>
                            <Typography sx={{ fontSize: "0.75rem", color: "var(--palette-text-secondary)" }}>
                                {proofMedia.length} file d� t?i
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {proofMedia.map((media, mediaIndex) => (
                                <Box
                                    key={`${media.url}-${mediaIndex}`}
                                    sx={{
                                        position: "relative",
                                        width: 88,
                                        height: 88,
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        border: "1px solid var(--palette-divider)",
                                        bgcolor: "#fff",
                                        cursor: "zoom-in",
                                    }}
                                    onClick={() => setProofViewer({
                                        open: true,
                                        items: proofMedia,
                                        index: mediaIndex,
                                        title: `${type === "feeding" ? "Minh chứng lịch ăn" : "Minh chứng lịch vận động"} - dòng ${rowIndex + 1}`,
                                    })}
                                >
                                    {media.kind === "video" ? (
                                        <video src={media.url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <img src={media.url} alt="proof" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    )}

                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            xoaMinhChung(type, rowIndex, mediaIndex);
                                        }}
                                        sx={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            bgcolor: "rgba(255,255,255,0.9)",
                                            "&:hover": { bgcolor: "#fff" },
                                        }}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>

                                    <IconButton
                                        size="small"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setProofViewer({
                                                open: true,
                                                items: proofMedia,
                                                index: mediaIndex,
                                                title: `${type === "feeding" ? "Minh chứng lịch ăn" : "Minh chứng lịch vận động"} - dòng ${rowIndex + 1}`,
                                            });
                                        }}
                                        sx={{
                                            position: "absolute",
                                            top: 4,
                                            left: 4,
                                            bgcolor: "rgba(255,255,255,0.9)",
                                            "&:hover": { bgcolor: "#fff" },
                                        }}
                                    >
                                        <OpenInFullIcon fontSize="small" />
                                    </IconButton>

                                    <Box
                                        sx={{
                                            position: "absolute",
                                            left: 6,
                                            bottom: 6,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            px: 0.75,
                                            py: 0.25,
                                            borderRadius: "999px",
                                            bgcolor: "rgba(15,23,42,0.72)",
                                            color: "#fff",
                                            fontSize: "0.6875rem",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {media.kind === "video" ? <PlayCircleOutlineIcon sx={{ fontSize: 14 }} /> : <ImageOutlinedIcon sx={{ fontSize: 14 }} />}
                                        {media.kind === "video" ? "Video" : "Ảnh"}
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </>
                ) : null}
            </Box>
        );
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(0);
    };

    const currentProofMedia = proofViewer.items[proofViewer.index];

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                    <Title title="Lịch chăm sóc khách sạn" />
                    <Breadcrumb
                        items={[
                            { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                            { label: "Lịch chăm sóc khách sạn" },
                        ]}
                    />
                </Box>
            </Box>

            <Card
                sx={{
                    borderRadius: "var(--shape-borderRadius-lg)",
                    bgcolor: "var(--palette-background-paper)",
                    boxShadow: "var(--customShadows-card)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box sx={{ p: "20px", display: "flex", alignItems: "center", gap: 2, borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                    <Search
                        placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        maxWidth="26rem"
                    />
                </Box>

                <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                    <Table sx={{ minWidth: 860 }}>
                        <TableHead sx={{ bgcolor: "var(--palette-background-neutral)" }}>
                            <TableRow>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Mã đơn</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Khách hàng</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Tổng quan lịch</TableCell>
                                <TableCell sx={{ borderBottom: "none", width: 160 }} align="right">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <Typography sx={{ color: "var(--palette-text-secondary)" }}>Kh�ng c� d? li?u</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row: any) => {
                                        const summary = getCareSummary(row);
                                        return (
                                            <TableRow
                                                key={row._id}
                                                hover
                                                sx={{ "&:hover": { bgcolor: "var(--palette-action-hover)" }, transition: "background-color 0.2s" }}
                                            >
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)", textDecoration: "underline" }}>
                                                        #{row.code?.slice(-6).toUpperCase() || "N/A"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar src={row.userId?.avatar} sx={{ width: 40, height: 40, borderRadius: "var(--shape-borderRadius-sm)" }}>
                                                            {String(row.fullName || row.userId?.fullName || "?").slice(0, 1)}
                                                        </Avatar>
                                                        <Stack spacing={0.25}>
                                                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                                {row.fullName || row.userId?.fullName || "Kh�ch v�ng lai"}
                                                            </Typography>
                                                            <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.75rem" }}>
                                                                {row.phone || row.userId?.phone || row.userId?.email || "Kh�ng c� th�ng tin"}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.8125rem" }}>
                                                        {canAssignHotelStaff ? `Ăn: ${summary.soLichAn} (gắn NVKS: ${summary.soNhanVienLichAn}) | Vận động: ${summary.soVanDong} (gắn NVKS: ${summary.soNhanVienVanDong})` : `Ăn: ${summary.soLichAn} | Vận động: ${summary.soVanDong}`}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Button variant="outlined" size="small" onClick={() => moDialogChamSoc(row._id)} disabled={careLoading}>
                                                        Quản lý lịch
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 20, 50]}
                    component="div"
                    count={filteredRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>

            <Dialog open={careDialogOpen} onClose={dongDialogChamSoc} fullWidth maxWidth="lg">
                <DialogTitle>
                    Quản lý lịch chăm sóc: {editingBooking?.code || "-"}
                </DialogTitle>
                <DialogContent dividers>
                    {careLoading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                            <CircularProgress />
                        </Stack>
                    ) : (
                        <Stack spacing={3}>
                            <TextField
                                label="Ngày chăm sóc"
                                type="date"
                                size="small"
                                value={careDate}
                                onChange={(e) => setCareDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 220 }}
                            />

                            {editingBooking?.petIds?.length > 0 && (
                                <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: "var(--palette-background-neutral)", border: "1px solid var(--palette-divider)" }}>
                                    <Typography variant="overline" sx={{ color: "var(--palette-text-secondary)", mb: 1, display: "block" }}>
                                        Thông tin thú cưng trong đơn
                                    </Typography>
                                    <Stack direction="row" spacing={3} flexWrap="wrap">
                                        {editingBooking.petIds.map((pet: any) => (
                                            <Stack key={pet._id} direction="row" spacing={1.5} alignItems="center">
                                                <Avatar src={pet.avatar} sx={{ width: 48, height: 48, borderRadius: 1 }} />
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                        {pet.name} ({pet.type === "dog" ? "Chó" : pet.type === "cat" ? "Mèo" : pet.type})
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: "var(--palette-text-secondary)", display: "block" }}>
                                                        {pet.breed} - {pet.weight}kg
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                            {!canAssignHotelStaff ? (
                                <Box
                                    sx={{
                                        border: "1px solid var(--palette-warning-light)",
                                        backgroundColor: "rgba(245, 158, 11, 0.08)",
                                        color: "var(--palette-warning-dark)",
                                        px: 1.5,
                                        py: 1.25,
                                        borderRadius: "var(--shape-borderRadius-md)",
                                        fontSize: "0.8125rem",
                                        fontWeight: 500,
                                    }}
                                >
                                    {`Bạn có quyền thêm dòng, sửa nội dung và trạng thái. Trường "NVKS phụ trách" chỉ quản lý khách sạn mới được thay đổi.`}
                                </Box>
                            ) : null}


                            <Box>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <Typography variant="h6">Lịch ăn</Typography>
                                    <Typography variant="body2" sx={{ color: "var(--palette-text-secondary)", flexGrow: 1 }}>
                                        (Áp dụng mẫu nhanh để tiết kiệm thời gian)
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                            onClick={() => {
                                                const template = [
                                                    { time: "06:30", food: "Hạt (Royal Canin)", amount: calculateRecommendedPortion(editingBooking?.petIds || [], "dog", 0.012), note: "Ăn sáng. Sau ăn nghỉ 30p.", petType: "dog", status: "pending" },
                                                    { time: "12:00", food: "Snack nhẹ", amount: "10g", note: "Bữa phụ.", petType: "dog", status: "pending" },
                                                    { time: "18:00", food: "Hạt + Pate", amount: calculateRecommendedPortion(editingBooking?.petIds || [], "dog", 0.015), note: "Ăn tối.", petType: "dog", status: "pending" },
                                                ];
                                                setFeedingDraft(template as any);
                                            }}
                                        >
                                            Mẫu Chó Nhỏ
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                            onClick={() => {
                                                const template = [
                                                    { time: "07:00", food: "Hạt (Royal Canin)", amount: calculateRecommendedPortion(editingBooking?.petIds || [], "dog", 0.015), note: "Ăn sáng.", petType: "dog", status: "pending" },
                                                    { time: "17:00", food: "Hạt + Thịt luộc", amount: calculateRecommendedPortion(editingBooking?.petIds || [], "dog", 0.02), note: "Ăn tối.", petType: "dog", status: "pending" },
                                                ];
                                                setFeedingDraft(template as any);
                                            }}
                                        >
                                            Mẫu Chó Lớn
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="secondary"
                                            onClick={() => {
                                                const template = [
                                                    { time: "07:00", food: "Hạt (Royal Canin)", amount: "30g", note: "Sáng.", petType: "cat", status: "pending" },
                                                    { time: "14:00", food: "Súp thưởng/Snack", amount: "1 thanh", note: "Chiều.", petType: "cat", status: "pending" },
                                                    { time: "19:00", food: "Pate", amount: "1 gói", note: "Tối.", petType: "cat", status: "pending" },
                                                ];
                                                setFeedingDraft(template as any);
                                            }}
                                        >
                                            Mẫu Mèo
                                        </Button>
                                    </Stack>
                                </Stack>

                                {(() => {
                                    const groups = [
                                        { type: "dog" as const, label: "Chó", color: "#3b82f6" },
                                        { type: "cat" as const, label: "Mèo", color: "#ec4899" },
                                        { type: "all" as const, label: "Chung / Khác", color: "#64748b" },
                                    ];

                                    return groups.map((group) => {
                                        const itemsInGroup = feedingDraft
                                            .map((item, idx) => ({ item, idx }))
                                            .filter(({ item }) => (item.petType || "all") === group.type);

                                        if (itemsInGroup.length === 0 && !editingBooking?.petIds?.some((pAny: any) => pAny.type === group.type) && group.type !== "all") {
                                            return null;
                                        }

                                        return (
                                            <Box key={group.type} sx={{ mb: 3, p: 2, borderRadius: 2, border: `1px solid ${group.color}20`, bgcolor: `${group.color}05` }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: group.color }}>
                                                        {group.label}
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => setFeedingDraft((prev) => [...prev, taoDongLichAn(group.type)])}
                                                        sx={{ color: group.color }}
                                                    >
                                                        Thêm dòng
                                                    </Button>
                                                </Stack>

                                                <Stack spacing={1.5}>
                                                    {itemsInGroup.map(({ item, idx }) => (
                                                        <Box key={`feeding-${idx}`}>
                                                            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                                                                <TextField
                                                                    label="Gi?"
                                                                    type="time"
                                                                    size="small"
                                                                    value={item.time || ""}
                                                                    onChange={(e) => capNhatDongLichAn(idx, { time: e.target.value })}
                                                                    sx={{ width: 135 }}
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                                <TextField
                                                                    label="Dành cho"
                                                                    select
                                                                    size="small"
                                                                    value={item.petType || "all"}
                                                                    onChange={(e) => capNhatDongLichAn(idx, { petType: e.target.value as any })}
                                                                    sx={{ width: 100 }}
                                                                >
                                                                    <MenuItem value="dog">Chó</MenuItem>
                                                                    <MenuItem value="cat">Mèo</MenuItem>
                                                                    <MenuItem value="all">Tất cả</MenuItem>
                                                                </TextField>
                                                                <Autocomplete
                                                                    freeSolo
                                                                    size="small"
                                                                    options={getFoodOptions(item.petType || "all")}
                                                                    value={item.food || ""}
                                                                    onInputChange={(_e, val) => capNhatDongLichAn(idx, { food: val })}
                                                                    sx={{ minWidth: 200 }}
                                                                    renderInput={(params) => (
                                                                        <TextField {...params} label="Thức ăn" />
                                                                    )}
                                                                />
                                                                <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                                                                    <TextField
                                                                        label="Khẩu phần"
                                                                        size="small"
                                                                        value={item.amount || ""}
                                                                        onChange={(e) => capNhatDongLichAn(idx, { amount: e.target.value })}
                                                                        sx={{ width: 140 }}
                                                                    />
                                                                    <Tooltip title={`Gợi ý: ${calculateRecommendedPortion(editingBooking?.petIds || [], item.petType || "all")} (khoảng 1% trọng lượng cơ thể mỗi bữa). Click để áp dụng.`}>
                                                                        <IconButton
                                                                            size="small"
                                                                            sx={{ ml: 0.5 }}
                                                                            onClick={() => {
                                                                                const suggestion = calculateRecommendedPortion(editingBooking?.petIds || [], item.petType || "all");
                                                                                if (suggestion) capNhatDongLichAn(idx, { amount: suggestion });
                                                                            }}
                                                                        >
                                                                            <HelpOutlineIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                                {canAssignHotelStaff ? (
                                                                    <TextField
                                                                        label="NVKS phụ trách"
                                                                        select
                                                                        size="small"
                                                                        value={String(getStaffId(item.staffId) || "")}
                                                                        onChange={(e) => capNhatDongLichAn(idx, {
                                                                            staffId: e.target.value,
                                                                            staffName: getStaffName(e.target.value),
                                                                        })}
                                                                        sx={{ minWidth: 180 }}
                                                                    >
                                                                        <MenuItem value="">Chưa gắn</MenuItem>
                                                                        {hotelStaffOptions.map((staff) => (
                                                                            <MenuItem key={staff.value} value={staff.value}>{staff.label}</MenuItem>
                                                                        ))}
                                                                    </TextField>
                                                                ) : (
                                                                    <TextField
                                                                        label="NVKS phụ trách"
                                                                        size="small"
                                                                        value={
                                                                            String(
                                                                                item.staffName ||
                                                                                (getStaffId(item.staffId)
                                                                                    ? getStaffName(String(getStaffId(item.staffId) || ""), item.staffName)
                                                                                    : "Chưa gắn")
                                                                            )
                                                                        }
                                                                        InputProps={{ readOnly: true }}
                                                                        disabled
                                                                        sx={{ minWidth: 180 }}
                                                                    />
                                                                )}
                                                                <TextField
                                                                    label="Trạng thái"
                                                                    select
                                                                    size="small"
                                                                    value={item.status || "pending"}
                                                                    onChange={(e) => xuLyDoiTrangThai("feeding", idx, e.target.value as any)}
                                                                    sx={{ width: 140 }}
                                                                >
                                                                    {trangThaiChamSocOptions.map((opt) => (
                                                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                                    ))}
                                                                </TextField>
                                                                <TextField
                                                                    label="Ghi chú"
                                                                    size="small"
                                                                    value={item.note || ""}
                                                                    onChange={(e) => capNhatDongLichAn(idx, { note: e.target.value })}
                                                                    sx={{ flex: 1, minWidth: 200 }}
                                                                />
                                                                <IconButton color="error" size="small" onClick={() => setFeedingDraft((prev) => prev.filter((_, i) => i !== idx))}>
                                                                    <DeleteOutlineIcon fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                            {renderProofMediaSection("feeding", idx, item)}
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        );
                                    });
                                })()}
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>Lịch vận động</Typography>

                                {(() => {
                                    const groups = [
                                        { type: "dog" as const, label: "Chó", color: "#3b82f6" },
                                        { type: "cat" as const, label: "Mèo", color: "#ec4899" },
                                        { type: "all" as const, label: "Chung / Khác", color: "#64748b" },
                                    ];

                                    return groups.map((group) => {
                                        const itemsInGroup = exerciseDraft
                                            .map((item, idx) => ({ item, idx }))
                                            .filter(({ item }) => (item.petType || "all") === group.type);

                                        if (itemsInGroup.length === 0 && !editingBooking?.petIds?.some((pAny: any) => pAny.type === group.type) && group.type !== "all") {
                                            return null;
                                        }

                                        return (
                                            <Box key={group.type} sx={{ mb: 3, p: 2, borderRadius: 2, border: `1px solid ${group.color}20`, bgcolor: `${group.color}05` }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: group.color }}>
                                                        {group.label}
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => setExerciseDraft((prev) => [...prev, taoDongVanDong(group.type)])}
                                                        sx={{ color: group.color }}
                                                    >
                                                        Thêm Dòng
                                                    </Button>
                                                </Stack>

                                                <Stack spacing={1.5}>
                                                    {itemsInGroup.map(({ item, idx }) => (
                                                        <Box key={`exercise-${idx}`}>
                                                            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                                                                <TextField
                                                                    label="Gi?"
                                                                    type="time"
                                                                    size="small"
                                                                    value={item.time || ""}
                                                                    onChange={(e) => capNhatDongVanDong(idx, { time: e.target.value })}
                                                                    sx={{ width: 135 }}
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                                <TextField
                                                                    label="Dành cho"
                                                                    select
                                                                    size="small"
                                                                    value={item.petType || "all"}
                                                                    onChange={(e) => capNhatDongVanDong(idx, { petType: e.target.value as any })}
                                                                    sx={{ width: 100 }}
                                                                >
                                                                    <MenuItem value="dog">Chó</MenuItem>
                                                                    <MenuItem value="cat">Mèo</MenuItem>
                                                                    <MenuItem value="all">Tất cả</MenuItem>
                                                                </TextField>
                                                                <TextField
                                                                    label="Hoạt động"
                                                                    size="small"
                                                                    value={item.activity || ""}
                                                                    onChange={(e) => capNhatDongVanDong(idx, { activity: e.target.value })}
                                                                    sx={{ minWidth: 160 }}
                                                                />
                                                                <TextField
                                                                    label="Số phút"
                                                                    type="number"
                                                                    size="small"
                                                                    value={item.durationMinutes || 0}
                                                                    onChange={(e) => capNhatDongVanDong(idx, { durationMinutes: Number(e.target.value || 0) })}
                                                                    sx={{ width: 100 }}
                                                                />
                                                                {canAssignHotelStaff ? (
                                                                    <TextField
                                                                        label="NVKS phụ trách"
                                                                        select
                                                                        size="small"
                                                                        value={String(getStaffId(item.staffId) || "")}
                                                                        onChange={(e) => capNhatDongVanDong(idx, {
                                                                            staffId: e.target.value,
                                                                            staffName: getStaffName(e.target.value),
                                                                        })}
                                                                        sx={{ minWidth: 180 }}
                                                                    >
                                                                        <MenuItem value="">Chưa gắn</MenuItem>
                                                                        {hotelStaffOptions.map((staff) => (
                                                                            <MenuItem key={staff.value} value={staff.value}>{staff.label}</MenuItem>
                                                                        ))}
                                                                    </TextField>
                                                                ) : (
                                                                    <TextField
                                                                        label="NVKS phụ trách"
                                                                        size="small"
                                                                        value={
                                                                            String(
                                                                                item.staffName ||
                                                                                (getStaffId(item.staffId)
                                                                                    ? getStaffName(String(getStaffId(item.staffId) || ""), item.staffName)
                                                                                    : "Chưa gắn")
                                                                            )
                                                                        }
                                                                        InputProps={{ readOnly: true }}
                                                                        disabled
                                                                        sx={{ minWidth: 180 }}
                                                                    />
                                                                )}
                                                                <TextField
                                                                    label="Trạng thái"
                                                                    select
                                                                    size="small"
                                                                    value={item.status || "pending"}
                                                                    onChange={(e) => xuLyDoiTrangThai("exercise", idx, e.target.value as any)}
                                                                    sx={{ width: 140 }}
                                                                >
                                                                    {trangThaiChamSocOptions.map((opt) => (
                                                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                                    ))}
                                                                </TextField>
                                                                <TextField
                                                                    label="Ghi chú"
                                                                    size="small"
                                                                    value={item.note || ""}
                                                                    onChange={(e) => capNhatDongVanDong(idx, { note: e.target.value })}
                                                                    sx={{ flex: 1, minWidth: 200 }}
                                                                />
                                                                <IconButton color="error" size="small" onClick={() => setExerciseDraft((prev) => prev.filter((_, i) => i !== idx))}>
                                                                    <DeleteOutlineIcon fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                            {renderProofMediaSection("exercise", idx, item)}
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        );
                                    });
                                })()}
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={dongDialogChamSoc} disabled={updateCareMut.isPending || resetCareTemplateMut.isPending}>Đóng</Button>
                    {canAssignHotelStaff ? (
                        <Button
                            variant="outlined"
                            startIcon={<RestartAltIcon />}
                            onClick={taoLaiLichMau}
                            disabled={updateCareMut.isPending || resetCareTemplateMut.isPending || !editingBooking?._id}
                        >
                            {resetCareTemplateMut.isPending ? "Đang tạo lại..." : "Tạo lại lịch mẫu"}
                        </Button>
                    ) : null}
                    <Button variant="contained" onClick={luuLichChamSoc} disabled={updateCareMut.isPending || resetCareTemplateMut.isPending || !editingBooking?._id}>
                        {updateCareMut.isPending ? "Đang lưu..." : "Lưu lịch chăm sóc"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={proofViewer.open}
                onClose={() => setProofViewer((prev) => ({ ...prev, open: false }))}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        bgcolor: "#0f172a",
                        color: "#fff",
                        borderRadius: "20px",
                        overflow: "hidden",
                    },
                }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 700 }}>{proofViewer.title || "Gallery minh ch?ng"}</Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                            {proofViewer.items.length > 0 ? `${proofViewer.index + 1}/${proofViewer.items.length}` : "0/0"}
                        </Typography>
                    </Box>
                    <Button onClick={() => setProofViewer((prev) => ({ ...prev, open: false }))} sx={{ color: "#fff" }}>
                        ��ng
                    </Button>
                </DialogTitle>
                <DialogContent sx={{ pb: 3 }}>
                    {currentProofMedia ? (
                        <Box>
                            <Box
                                sx={{
                                    position: "relative",
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    bgcolor: "#020617",
                                    minHeight: 420,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {currentProofMedia.kind === "video" ? (
                                    <video
                                        src={currentProofMedia.url}
                                        controls
                                        style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
                                    />
                                ) : (
                                    <img
                                        src={currentProofMedia.url}
                                        alt={`proof-${proofViewer.index + 1}`}
                                        style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
                                    />
                                )}

                                {proofViewer.items.length > 1 ? (
                                    <>
                                        <IconButton
                                            onClick={() =>
                                                setProofViewer((prev) => ({
                                                    ...prev,
                                                    index: prev.index === 0 ? prev.items.length - 1 : prev.index - 1,
                                                }))
                                            }
                                            sx={{
                                                position: "absolute",
                                                left: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                bgcolor: "rgba(255,255,255,0.14)",
                                                color: "#fff",
                                            }}
                                        >
                                            <ArrowBackIosNewIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() =>
                                                setProofViewer((prev) => ({
                                                    ...prev,
                                                    index: prev.index === prev.items.length - 1 ? 0 : prev.index + 1,
                                                }))
                                            }
                                            sx={{
                                                position: "absolute",
                                                right: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                bgcolor: "rgba(255,255,255,0.14)",
                                                color: "#fff",
                                            }}
                                        >
                                            <ArrowForwardIosIcon />
                                        </IconButton>
                                    </>
                                ) : null}
                            </Box>

                            {proofViewer.items.length > 1 ? (
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                                    {proofViewer.items.map((media, index) => (
                                        <Box
                                            key={`${media.url}-${index}-thumb`}
                                            onClick={() => setProofViewer((prev) => ({ ...prev, index }))}
                                            sx={{
                                                width: 72,
                                                height: 72,
                                                borderRadius: "12px",
                                                overflow: "hidden",
                                                border: index === proofViewer.index ? "2px solid #fb7185" : "1px solid rgba(255,255,255,0.14)",
                                                cursor: "pointer",
                                                opacity: index === proofViewer.index ? 1 : 0.72,
                                            }}
                                        >
                                            {media.kind === "video" ? (
                                                <video src={media.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <img src={media.url} alt={`thumb-${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            ) : null}
                        </Box>
                    ) : null}
                </DialogContent>
            </Dialog>
        </Box >
    );

};

