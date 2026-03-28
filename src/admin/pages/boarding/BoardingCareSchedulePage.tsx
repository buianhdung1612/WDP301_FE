import dayjs from "dayjs";
import { Fragment, useMemo, useState, useEffect, useRef, useCallback } from "react";
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
    LinearProgress,
    Grid,
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
    type BoardingExerciseItem as BaseBoardingExerciseItem,
    type BoardingFeedingItem as BaseBoardingFeedingItem,
    type BoardingProofMediaItem,
} from "../../api/boarding-booking.api";
import { getFoodTemplates, getExerciseTemplates } from "../../api/pet-care-template.api";
import { uploadMediaToCloudinary } from "../../api/uploadCloudinary.api";


const trangThaiChamSocOptions: Array<{ value: "pending" | "done" | "skipped"; label: string }> = [
    { value: "pending", label: "Chưa thực hiện" },
    { value: "done", label: "Đã hoàn thành" },
    { value: "skipped", label: "Bỏ qua" },
];

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

interface BoardingFeedingItem extends BaseBoardingFeedingItem {
    _autoSplit?: boolean;
}

interface BoardingExerciseItem extends BaseBoardingExerciseItem {
    _autoSplit?: boolean;
}

const taoDongLichAn = (petType: "dog" | "cat" | "all" = "all", petId?: string, petName?: string): BoardingFeedingItem => ({
    time: "", food: "", amount: "", note: "", proofMedia: [], staffId: "", staffName: "", status: "pending", petType, petId, petName,
});

const taoDongVanDong = (petType: "dog" | "cat" | "all" = "all", petId?: string, petName?: string): BoardingExerciseItem => ({
    time: "", activity: "", durationMinutes: 0, note: "", proofMedia: [], staffId: "", staffName: "", status: "pending", petType, petId, petName,
});

const getStaffIdFromObject = (s: any) => (typeof s === "string" ? s : s?._id || "");
const getStaffNameFromObject = (s: any) => (typeof s === "string" ? "" : s?.fullName || "");
const normalizeProofMedia = (p: any): BoardingProofMediaItem[] => (Array.isArray(p) ? p : []).map(i => ({
    url: typeof i === "string" ? i : i?.url || "",
    kind: (i?.kind || "image") as "image" | "video"
})).filter(i => !!i.url);

// Memoized Sub-components for better performance
const FeedingRow = ({
    item,
    foodOptions,
    staffOptions,
    statusOptions,
    onUpdate,
    onDelete,
    onAddMedia,
    onRemoveMedia,
    onViewMedia,
    isReadOnly = false
}: {
    item: BoardingFeedingItem;
    idx: number;
    foodOptions: string[];
    staffOptions: any[];
    statusOptions: any[];
    onUpdate: (data: Partial<BoardingFeedingItem>) => void;
    onDelete: () => void;
    onAddMedia: (files: FileList) => void;
    onRemoveMedia: (mIdx: number) => void;
    onViewMedia: (mIdx: number) => void;
    isReadOnly?: boolean;
}) => {
    const sVal = item.staffId ? (typeof item.staffId === "string" ? item.staffId : (item.staffId as any)?._id || "") : "";
    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "var(--shape-borderRadius-md)", position: 'relative', bgcolor: '#fcfcfc', borderStyle: 'solid', borderColor: 'var(--palette-divider)' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                <TextField size="small" type="time" label="Giờ" value={item.time || ""} onChange={e => !isReadOnly && onUpdate({ time: e.target.value })} disabled={isReadOnly} sx={{ width: 120, flexShrink: 0, '& .MuiInputBase-root': { fontWeight: 700 } }} slotProps={{ inputLabel: { shrink: true } }} />
                {item._autoSplit && (
                    <Box sx={{ px: 1, py: 0.25, bgcolor: "var(--palette-success-lighter)", color: "var(--palette-success-dark)", borderRadius: 1, fontSize: '0.7rem', fontWeight: 700 }}>
                        Đã tách riêng
                    </Box>
                )}
                {!item.petId && (
                    <Box sx={{ px: 1, py: 0.25, bgcolor: "var(--palette-info-lighter)", color: "var(--palette-info-dark)", borderRadius: 1, fontSize: '0.7rem', fontWeight: 700 }}>
                        Dùng chung
                    </Box>
                )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Autocomplete
                    fullWidth
                    size="small"
                    freeSolo
                    disabled={isReadOnly}
                    options={foodOptions}
                    value={item.food || ""}
                    onChange={(_, newValue) => !isReadOnly && onUpdate({ food: newValue || "" })}
                    onInputChange={(_, newInputValue) => !isReadOnly && onUpdate({ food: newInputValue })}
                    renderInput={(params) => <TextField {...params} label="Loại thức ăn" sx={{ '& .MuiInputBase-root': { fontWeight: 700 } }} />}
                    sx={{ flexGrow: 1 }}
                />
                <TextField size="small" label="Khẩu phần" value={item.amount || ""} onChange={e => !isReadOnly && onUpdate({ amount: e.target.value })} disabled={isReadOnly} sx={{ width: 120, flexShrink: 0, '& .MuiInputBase-root': { fontWeight: 700 } }} />
                <TextField size="small" select label="Nhân viên" value={sVal} onChange={e => !isReadOnly && onUpdate({ staffId: e.target.value })} disabled={isReadOnly} sx={{ width: 180, flexShrink: 0 }}>
                    {staffOptions.length > 0 ? staffOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>) : <MenuItem disabled value="">(Chưa có NV ca này)</MenuItem>}
                </TextField>
                <TextField size="small" select label="Trạng thái" value={item.status || "pending"} onChange={e => !isReadOnly && onUpdate({ status: e.target.value as any })} disabled={isReadOnly} sx={{ width: 150, flexShrink: 0 }}>
                    {statusOptions.map(o => <MenuItem key={o.value} value={o.value} sx={{ fontWeight: 600 }}>{o.label}</MenuItem>)}
                </TextField>
                {!isReadOnly && (
                    <IconButton color="error" size="small" onClick={onDelete} sx={{ mt: 0.5 }}><Icon icon="solar:trash-bin-trash-bold" width={20} /></IconButton>
                )}
            </Box>
            <TextField fullWidth size="small" label="Ghi chú cho bữa ăn" value={item.note || ""} onChange={e => !isReadOnly && onUpdate({ note: e.target.value })} disabled={isReadOnly} sx={{ mt: 2 }} />

            <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    {!isReadOnly && (
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadOutlinedIcon />}
                            sx={{ height: 80, width: 140, borderStyle: 'dashed', borderRadius: 1.5, textTransform: 'none', fontWeight: 700, flexDirection: 'column', gap: 0.5 }}
                        >
                            Tải minh chứng
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>Tối đa 5 file, dưới 5MB/file</Typography>
                            <input type="file" hidden multiple accept="image/*,video/*" onChange={e => e.target.files && onAddMedia(e.target.files)} />
                        </Button>
                    )}

                    {(item.proofMedia || []).map((m: any, mIdx: number) => (
                        <Box key={mIdx} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 1.5, overflow: 'hidden', border: '1px solid var(--palette-divider)' }}>
                            {m.kind === "video" ? (
                                <Box sx={{ width: '100%', height: '100%', bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => onViewMedia(mIdx)}>
                                    <Icon icon="solar:videocamera-record-bold" width={24} color="white" />
                                </Box>
                            ) : (
                                <img src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => onViewMedia(mIdx)} alt="Proof" />
                            )}
                            {!isReadOnly && (
                                <IconButton
                                    size="small"
                                    onClick={() => onRemoveMedia(mIdx)}
                                    sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.8)', padding: 0.25, '&:hover': { bgcolor: '#fff' } }}
                                >
                                    <DeleteOutlineIcon sx={{ fontSize: 14, color: 'error.main' }} />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Paper>
    );
};

const ExerciseRow = ({
    item,
    exerciseOptions,
    staffOptions,
    statusOptions,
    onUpdate,
    onDelete,
    onAddMedia,
    onRemoveMedia,
    onViewMedia,
    isReadOnly = false
}: {
    item: BoardingExerciseItem;
    idx: number;
    exerciseOptions: string[];
    staffOptions: any[];
    statusOptions: any[];
    onUpdate: (data: Partial<BoardingExerciseItem>) => void;
    onDelete: () => void;
    onAddMedia: (files: FileList) => void;
    onRemoveMedia: (mIdx: number) => void;
    onViewMedia: (mIdx: number) => void;
    isReadOnly?: boolean;
}) => {
    const sVal = item.staffId ? (typeof item.staffId === "string" ? item.staffId : (item.staffId as any)?._id || "") : "";
    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "var(--shape-borderRadius-md)", position: 'relative', bgcolor: '#fcfcfc', borderStyle: 'solid', borderColor: 'var(--palette-divider)' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                <TextField size="small" type="time" label="Giờ" value={item.time || ""} onChange={e => !isReadOnly && onUpdate({ time: e.target.value })} disabled={isReadOnly} sx={{ width: 120, flexShrink: 0, '& .MuiInputBase-root': { fontWeight: 700 } }} slotProps={{ inputLabel: { shrink: true } }} />
                {item._autoSplit && (
                    <Box sx={{ px: 1, py: 0.25, bgcolor: "var(--palette-success-lighter)", color: "var(--palette-success-dark)", borderRadius: 1, fontSize: '0.7rem', fontWeight: 700 }}>
                        Đã tách riêng
                    </Box>
                )}
                {!item.petId && (
                    <Box sx={{ px: 1, py: 0.25, bgcolor: "var(--palette-info-lighter)", color: "var(--palette-info-dark)", borderRadius: 1, fontSize: '0.7rem', fontWeight: 700 }}>
                        Dùng chung
                    </Box>
                )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Autocomplete
                    fullWidth
                    size="small"
                    freeSolo
                    disabled={isReadOnly}
                    options={exerciseOptions}
                    value={item.activity || ""}
                    onChange={(_, newValue) => !isReadOnly && onUpdate({ activity: newValue || "" })}
                    onInputChange={(_, newInputValue) => !isReadOnly && onUpdate({ activity: newInputValue })}
                    renderInput={(params) => <TextField {...params} label="Hoạt động" sx={{ '& .MuiInputBase-root': { fontWeight: 700 } }} />}
                    sx={{ flexGrow: 1 }}
                />
                <TextField size="small" label="Thời lượng (p)" type="number" value={item.durationMinutes || 0} onChange={e => !isReadOnly && onUpdate({ durationMinutes: Number(e.target.value) })} disabled={isReadOnly} sx={{ width: 100, flexShrink: 0, '& .MuiInputBase-root': { fontWeight: 700 } }} />
                <TextField size="small" select label="Nhân viên" value={sVal} onChange={e => !isReadOnly && onUpdate({ staffId: e.target.value })} disabled={isReadOnly} sx={{ width: 180, flexShrink: 0 }}>
                    {staffOptions.length > 0 ? staffOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>) : <MenuItem disabled value="">(Chưa có NV ca này)</MenuItem>}
                </TextField>
                <TextField size="small" select label="Trạng thái" value={item.status || "pending"} onChange={e => !isReadOnly && onUpdate({ status: e.target.value as any })} disabled={isReadOnly} sx={{ width: 150, flexShrink: 0 }}>
                    {statusOptions.map(o => <MenuItem key={o.value} value={o.value} sx={{ fontWeight: 600 }}>{o.label}</MenuItem>)}
                </TextField>
                {!isReadOnly && (
                    <IconButton color="error" size="small" onClick={onDelete} sx={{ mt: 0.5 }}><Icon icon="solar:trash-bin-trash-bold" width={20} /></IconButton>
                )}
            </Box>
            <TextField fullWidth size="small" label="Ghi chú vận động" value={item.note || ""} onChange={e => !isReadOnly && onUpdate({ note: e.target.value })} disabled={isReadOnly} sx={{ mt: 2 }} />

            <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    {!isReadOnly && (
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadOutlinedIcon />}
                            sx={{ height: 80, width: 140, borderStyle: 'dashed', borderRadius: 1.5, textTransform: 'none', fontWeight: 700, flexDirection: 'column', gap: 0.5 }}
                        >
                            Tải minh chứng
                            <input type="file" hidden multiple accept="image/*,video/*" onChange={e => e.target.files && onAddMedia(e.target.files)} />
                        </Button>
                    )}

                    {(item.proofMedia || []).map((m: any, mIdx: number) => (
                        <Box key={mIdx} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 1.5, overflow: 'hidden', border: '1px solid var(--palette-divider)' }}>
                            {m.kind === "video" ? (
                                <Box sx={{ width: '100%', height: '100%', bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => onViewMedia(mIdx)}>
                                    <Icon icon="solar:videocamera-record-bold" width={24} color="white" />
                                </Box>
                            ) : (
                                <img src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => onViewMedia(mIdx)} alt="Proof" />
                            )}
                            {!isReadOnly && (
                                <IconButton
                                    size="small"
                                    onClick={() => onRemoveMedia(mIdx)}
                                    sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.8)', padding: 0.25, '&:hover': { bgcolor: '#fff' } }}
                                >
                                    <DeleteOutlineIcon sx={{ fontSize: 14, color: 'error.main' }} />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Paper>
    );
};

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
    const [proofViewer, setProofViewer] = useState<{ open: boolean; items: BoardingProofMediaItem[]; index: number; }>({ open: false, items: [], index: 0 });
    const [careTab, setCareTab] = useState(0);
    const [speciesFilter, setSpeciesFilter] = useState("all");
    const [openRows, setOpenRows] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"room" | "task">("room");
    const [selectedPetId, setSelectedPetId] = useState<string>("");
    const [isReadOnly, setIsReadOnly] = useState(false);

    const selectedPetObj = useMemo(() => {
        const sid = String(selectedPetId || "");
        return (editingBooking?.petIds || []).find((p: any) => String(p._id) === sid);
    }, [editingBooking, selectedPetId]);

    const suggestedPortion = useMemo(() => {
        if (!selectedPetId) return calculateRecommendedPortion(editingBooking?.petIds || []);
        const pet = (editingBooking?.petIds || []).find((p: any) => p._id === selectedPetId);
        return calculateRecommendedPortion(pet ? [pet] : []);
    }, [editingBooking, selectedPetId]);

    const feedingCount = useMemo(() => {
        const sid = String(selectedPetId || "");
        return feedingDraft.filter(i => !i.petId || String(i.petId) === sid).length;
    }, [feedingDraft, selectedPetId]);

    const exerciseCount = useMemo(() => {
        const sid = String(selectedPetId || "");
        return exerciseDraft.filter(i => !i.petId || String(i.petId) === sid).length;
    }, [exerciseDraft, selectedPetId]);

    const canAssignHotelStaff = useMemo(() => {
        const p = Array.isArray(user?.permissions) ? user.permissions : [];
        return p.includes("account_admin_view") || p.includes("account_admin_edit") || p.includes("role_permissions");
    }, [user]);

    const { data: bookingsRes, isLoading } = useQuery({ queryKey: ["admin-boarding-bookings"], queryFn: () => getBoardingBookings({ limit: 1000 }) });
    const { data: hotelStaffRes } = useQuery({ queryKey: ["admin-boarding-hotel-staffs", careDate], queryFn: () => getBoardingHotelStaffs(careDate || undefined), enabled: true });

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

    const capNhatDongLichAn = useCallback((idx: number, p: Partial<BoardingFeedingItem>) => {
        setFeedingDraft(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], ...p };
            return next;
        });
    }, []);

    const capNhatDongVanDong = useCallback((idx: number, p: Partial<BoardingExerciseItem>) => {
        setExerciseDraft(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], ...p };
            return next;
        });
    }, []);

    const handleUploadMedia = useCallback(async (type: "f" | "e", idx: number, files: FileList) => {
        const loadingToast = toast.loading("Đang tải ảnh...");
        try {
            const validFiles = Array.from(files).filter(file => {
                if (file.size > MAX_IMAGE_PROOF_SIZE_MB * 1024 * 1024) throw new Error(`File ${file.name} quá lớn (>5MB)`);
                return true;
            });
            const results = await uploadMediaToCloudinary(validFiles);
            const mediaItems: BoardingProofMediaItem[] = results.map(res => ({ url: res.url, kind: res.kind }));

            if (type === "f") {
                setFeedingDraft(prev => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], proofMedia: [...normalizeProofMedia(next[idx].proofMedia), ...mediaItems] };
                    return next;
                });
            } else {
                setExerciseDraft(prev => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], proofMedia: [...normalizeProofMedia(next[idx].proofMedia), ...mediaItems] };
                    return next;
                });
            }
            toast.update(loadingToast, { render: "Đã tải lên", type: "success", isLoading: false, autoClose: 2000 });
        } catch (err: any) {
            toast.update(loadingToast, { render: err.message || "Lỗi tải ảnh", type: "error", isLoading: false, autoClose: 3000 });
        }
    }, []);

    const handleRemoveMedia = useCallback((type: "f" | "e", rowIdx: number, mediaIdx: number) => {
        const setter = type === "f" ? setFeedingDraft : setExerciseDraft;
        setter(prev => prev.map((item, idx) => idx === rowIdx ? { ...item, proofMedia: normalizeProofMedia(item.proofMedia).filter((_, i) => i !== mediaIdx) } : item));
    }, []);

    const handleViewMedia = useCallback((type: "f" | "e", rowIdx: number, mediaIdx: number) => {
        const list = type === "f" ? feedingDraft : exerciseDraft;
        const item = list[rowIdx];
        if (item?.proofMedia) setProofViewer({ open: true, items: normalizeProofMedia(item.proofMedia), index: mediaIdx });
    }, [feedingDraft, exerciseDraft]);

    const validateProof = (items: any[], label: string) => {
        const fail = items.findIndex(i => i.status === "done" && !normalizeProofMedia(i.proofMedia).length);
        if (fail !== -1) { toast.error(`${label} dòng ${fail + 1} cần minh chứng để hoàn thành`); return false; }
        return true;
    };

    const apDungDuLieu = useCallback((b: any, opts?: { kDate?: boolean; startPetId?: string }) => {
        setEditingBooking(b);
        const pets = b.petIds || [];
        if (opts?.startPetId) {
            setSelectedPetId(String(opts.startPetId));
        } else if (pets.length > 0) {
            setSelectedPetId(String(pets[0]._id));
        }

        const rawFeeding = b.feedingSchedule || [];
        const rawExercise = b.exerciseSchedule || [];

        const needsSplit = (pets.length > 1) && (rawFeeding.some((i: any) => !i.petId) || rawExercise.some((i: any) => !i.petId));

        let finalFeeding = [...rawFeeding];
        let finalExercise = [...rawExercise];

        if (needsSplit) {
            const nextF: any[] = [];
            rawFeeding.forEach((item: any) => {
                if (!item.petId) {
                    pets.forEach((p: any) => nextF.push({ ...item, petId: p._id, petName: p.name, _autoSplit: true }));
                } else {
                    nextF.push(item);
                }
            });
            finalFeeding = nextF;

            const nextE: any[] = [];
            rawExercise.forEach((item: any) => {
                if (!item.petId) {
                    pets.forEach((p: any) => nextE.push({ ...item, petId: p._id, petName: p.name, _autoSplit: true }));
                } else {
                    nextE.push(item);
                }
            });
            finalExercise = nextE;
        }

        setFeedingDraft(finalFeeding.map((i: any) => ({
            ...i,
            proofMedia: normalizeProofMedia(i.proofMedia),
            staffId: getStaffIdFromObject(i.staffId),
            staffName: i.staffName || getStaffNameFromObject(i.staffId)
        })));

        setExerciseDraft(finalExercise.map((i: any) => ({
            ...i,
            proofMedia: normalizeProofMedia(i.proofMedia),
            staffId: getStaffIdFromObject(i.staffId),
            staffName: i.staffName || getStaffNameFromObject(i.staffId)
        })));
        if (!opts?.kDate) setCareDate(dayjs(b.checkInDate).isValid() ? dayjs(b.checkInDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"));
    }, []);

    const updateCareMut = useMutation({
        mutationFn: ({ id, payload }: any) => updateBoardingCareSchedule(id, payload),
        onSuccess: () => { toast.success("Đã cập nhật"); queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] }); setCareDialogOpen(false); },
        onError: (e: any) => toast.error(e?.response?.data?.message || "Lỗi cập nhật"),
    });

    const allRows = useMemo(() => (bookingsRes as any)?.data?.recordList || (bookingsRes as any)?.data || [], [bookingsRes]);
    const eligibleRows = useMemo(() => allRows.filter((i: any) => i.paymentStatus === "paid" || ["confirmed", "checked-in"].includes(i.boardingStatus)), [allRows]);

    const filteredRows = useMemo(() => {
        let l = eligibleRows;
        if (speciesFilter !== "all") l = l.filter((i: any) => (i.petIds || []).some((p: any) => (p.type || p.petType) === speciesFilter));
        if (onlyMyAssign && user?.id) l = l.filter((i: any) => !!i.scheduleSummary?.hasMyAssigned);
        const q = searchQuery.trim().toLowerCase();
        if (q) l = l.filter((i: any) => String(i.code).toLowerCase().includes(q) || String(i.fullName || i.userId?.fullName).toLowerCase().includes(q));
        return l;
    }, [eligibleRows, searchQuery, speciesFilter, onlyMyAssign, user]);

    const moDialog = async (row: any, startPetId?: string) => {
        try {
            setCareLoading(true);
            setEditingBooking(row);
            setCareDialogOpen(true);

            // Calculate read-only status
            const isExpired = row.checkOutDate && dayjs().diff(dayjs(row.checkOutDate), 'day') > 2;
            const isStatusAllowed = ["confirmed", "checked-in", "checked-out"].includes(row.boardingStatus);
            setIsReadOnly(!isStatusAllowed || !!isExpired);

            const res = await getBoardingBookingDetail(row._id);
            if (res?.data) apDungDuLieu(res.data, { startPetId });
        } catch {
            toast.error("Lỗi tải dữ liệu");
            setCareDialogOpen(false);
        } finally {
            setCareLoading(false);
        }
    };

    const hasOpened = useRef(false);
    useEffect(() => {
        const c = searchParams.get("search");
        if (c && !isLoading && allRows.length && !hasOpened.current) { const m = allRows.find((r: any) => r.code === c); if (m) { moDialog(m); hasOpened.current = true; } }
    }, [isLoading, allRows, searchParams]);

    const luuCare = () => {
        if (!editingBooking?._id || !validateProof(feedingDraft, "Lịch ăn") || !validateProof(exerciseDraft, "Lịch vận động")) return;
        const payload = {
            feedingSchedule: feedingDraft.map(i => {
                const sid = getStaffIdFromObject(i.staffId);
                const sn = i.staffName || hotelStaffOptions.find(o => o.value === sid)?.label || "";
                return { ...i, staffId: sid, staffName: sn };
            }),
            exerciseSchedule: exerciseDraft.map(i => {
                const sid = getStaffIdFromObject(i.staffId);
                const sn = i.staffName || hotelStaffOptions.find(o => o.value === sid)?.label || "";
                return { ...i, staffId: sid, staffName: sn };
            }),
            careDate
        };
        updateCareMut.mutate({ id: editingBooking._id, payload });
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
                                    filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r: any) => {
                                        const isExpired = r.checkOutDate && dayjs().diff(dayjs(r.checkOutDate), 'day') > 2;
                                        const isStatusAllowed = ["confirmed", "checked-in", "checked-out"].includes(r.boardingStatus);
                                        const isLocked = !isStatusAllowed || (!!isExpired);
                                        return (
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
                                                        <Typography
                                                            onClick={() => setOpenRows(p => p.includes(r._id) ? p.filter(id => id !== r._id) : [...p, r._id])}
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: "0.875rem",
                                                                color: "var(--palette-primary-main)",
                                                                cursor: "pointer",
                                                                "&:hover": { textDecoration: "underline" }
                                                            }}
                                                        >
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
                                                            {isExpired ? "Đã khóa" : (!isStatusAllowed ? "Chờ xác nhận" : "Quản lý")}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell colSpan={6} sx={{ p: 0, bgcolor: "var(--palette-background-neutral)" }}>
                                                        <Collapse in={openRows.includes(r._id)}>
                                                            <Box p={3} sx={{ bgcolor: "var(--palette-background-neutral)", borderRadius: "var(--shape-borderRadius-md)", mx: 2, mb: 2 }}>
                                                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Icon icon="solar:paw-print-bold" width={20} />
                                                                    Danh sách thú cưng trong đơn
                                                                </Typography>
                                                                <Grid container spacing={2.5}>
                                                                    {(r.petIds || []).map((pet: any) => {
                                                                        const fList = (r.feedingSchedule || []).filter((i: any) => !i.petId || String(i.petId) === String(pet._id));
                                                                        const fDone = fList.filter((i: any) => i.status === 'done').length;
                                                                        const fTotal = fList.length;

                                                                        const eList = (r.exerciseSchedule || []).filter((i: any) => !i.petId || String(i.petId) === String(pet._id));
                                                                        const eDone = eList.filter((i: any) => i.status === 'done').length;
                                                                        const eTotal = eList.length;

                                                                        return (
                                                                            <Grid size={{ xs: 12, sm: 6 }} key={pet._id}>
                                                                                <Paper
                                                                                    sx={{
                                                                                        p: 2.5,
                                                                                        borderRadius: "var(--shape-borderRadius-lg)",
                                                                                        bgcolor: "var(--palette-common-white)",
                                                                                        border: "1px solid var(--palette-divider)",
                                                                                        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                                                                                        position: 'relative',
                                                                                        overflow: 'hidden',
                                                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                                        '&:hover': {
                                                                                            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                                                                            transform: 'translateY(-4px)',
                                                                                            borderColor: 'var(--palette-primary-main)'
                                                                                        },
                                                                                        '&::before': {
                                                                                            content: '""',
                                                                                            position: 'absolute',
                                                                                            left: 0, top: 0, bottom: 0, width: 4,
                                                                                            bgcolor: pet.type === 'dog' ? 'var(--palette-info-main)' : 'var(--palette-warning-main)'
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <Stack direction="row" spacing={2.5} alignItems="flex-start">
                                                                                        <Avatar
                                                                                            src={pet.avatar}
                                                                                            sx={{
                                                                                                width: 64,
                                                                                                height: 64,
                                                                                                borderRadius: 2,
                                                                                                boxShadow: "var(--customShadows-z8)",
                                                                                                bgcolor: 'var(--palette-background-neutral)'
                                                                                            }}
                                                                                        />
                                                                                        <Box flexGrow={1}>
                                                                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>{pet.name}</Typography>
                                                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                                                                <Typography variant="caption" sx={{ fontWeight: 600, color: "var(--palette-text-secondary)", bgcolor: "var(--palette-background-neutral)", px: 1, py: 0.25, borderRadius: 0.5 }}>
                                                                                                    {pet.type === 'dog' ? 'Chó' : 'Mèo'} • {pet.weight}kg
                                                                                                </Typography>
                                                                                            </Stack>

                                                                                            <Stack spacing={1.5}>
                                                                                                <Box>
                                                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                                                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--palette-warning-dark)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                                            <Icon icon="fluent:food-24-filled" width={14} /> Lịch ăn
                                                                                                        </Typography>
                                                                                                        <Typography variant="caption" sx={{ fontWeight: 800 }}>{fDone}/{fTotal}</Typography>
                                                                                                    </Stack>
                                                                                                    <LinearProgress variant="determinate" value={fTotal > 0 ? (fDone / fTotal) * 100 : 0} color="warning" sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--palette-warning-lighter)' }} />
                                                                                                </Box>
                                                                                                <Box>
                                                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                                                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--palette-success-dark)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                                            <Icon icon="solar:run-bold" width={14} /> Vận động
                                                                                                        </Typography>
                                                                                                        <Typography variant="caption" sx={{ fontWeight: 800 }}>{eDone}/{eTotal}</Typography>
                                                                                                    </Stack>
                                                                                                    <LinearProgress variant="determinate" value={eTotal > 0 ? (eDone / eTotal) * 100 : 0} color="success" sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--palette-success-lighter)' }} />
                                                                                                </Box>
                                                                                            </Stack>

                                                                                            <Button
                                                                                                fullWidth
                                                                                                variant="contained"
                                                                                                size="small"
                                                                                                onClick={() => moDialog(r, pet._id)}
                                                                                                startIcon={<Icon icon={isLocked ? "solar:eye-bold" : "solar:clipboard-check-bold"} />}
                                                                                                sx={{
                                                                                                    mt: 2.5,
                                                                                                    fontWeight: 800,
                                                                                                    borderRadius: 1.5,
                                                                                                    textTransform: 'none',
                                                                                                    bgcolor: 'var(--palette-text-primary)',
                                                                                                    '&:hover': { bgcolor: 'var(--palette-grey-800)' }
                                                                                                }}
                                                                                            >
                                                                                                {isExpired ? "Xem chi tiết" : (!isStatusAllowed ? "Chờ xác nhận" : `Chăm sóc ${pet.name}`)}
                                                                                            </Button>
                                                                                        </Box>
                                                                                    </Stack>
                                                                                </Paper>
                                                                            </Grid>
                                                                        );
                                                                    })}
                                                                </Grid>
                                                                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed var(--palette-divider)" }}>
                                                                    <Typography variant="caption" sx={{ color: "var(--palette-text-secondary)", fontStyle: 'italic' }}>
                                                                        Đơn hàng hiện đang ở trạng thái {r.boardingStatus}. Khách hàng đã thanh toán đầy đủ.
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            </Fragment>
                                        );
                                    })
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
                                    onChange={e => !isReadOnly && setCareDate(e.target.value)}
                                    disabled={isReadOnly}
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
                                {!isReadOnly && (
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
                                )}
                                {isReadOnly && (
                                    <Box sx={{ px: 2, py: 0.5, bgcolor: "var(--palette-info-lighter)", color: "var(--palette-info-dark)", borderRadius: 1, fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Icon icon="solar:lock-bold" width={14} /> Chế độ chỉ xem
                                    </Box>
                                )}
                            </Stack>

                            <Tabs value={careTab} onChange={(_, v) => setCareTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                                <Tab label={`Lịch ăn (${feedingCount})`} sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' }} />
                                <Tab label={`Vận động (${exerciseCount})`} sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' }} />
                                <Tab label="Nhật ký hàng ngày" sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' }} />
                            </Tabs>

                            {careTab === 0 && (
                                <Box>
                                    <Stack direction="row" spacing={1.5} sx={{ mb: 3, overflowX: "auto", pb: 1 }}>
                                        {(editingBooking?.petIds || []).map((pet: any) => (
                                            <Button
                                                key={pet._id}
                                                variant={String(selectedPetId) === String(pet._id) ? "contained" : "outlined"}
                                                onClick={() => setSelectedPetId(String(pet._id))}
                                                sx={{
                                                    borderRadius: '20px',
                                                    minWidth: 'max-content',
                                                    px: 2,
                                                    py: 1,
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    bgcolor: String(selectedPetId) === String(pet._id) ? 'var(--palette-text-primary)' : 'transparent',
                                                    color: String(selectedPetId) === String(pet._id) ? '#fff' : 'text.secondary',
                                                    '&:hover': {
                                                        bgcolor: String(selectedPetId) === String(pet._id) ? '#000' : 'var(--palette-action-hover)'
                                                    }
                                                }}
                                                startIcon={<Avatar src={pet.avatar} sx={{ width: 28, height: 28 }} />}
                                            >
                                                {pet.name}
                                            </Button>
                                        ))}
                                    </Stack>

                                    {!isReadOnly && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={() => {
                                                const type = (selectedPetObj?.type || selectedPetObj?.petType || "all").toLowerCase() as any;
                                                setFeedingDraft(p => [...p, taoDongLichAn(type, selectedPetId, selectedPetObj?.name)]);
                                            }}
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
                                            Thêm bữa ăn cho {selectedPetObj?.name || "thú cưng"}
                                        </Button>
                                    )}
                                    <Stack spacing={2}>
                                        {feedingDraft
                                            .map((item, originalIdx) => ({ item, originalIdx }))
                                            .filter(({ item }) => !item.petId || String(item.petId) === String(selectedPetId))
                                            .map(({ item, originalIdx }) => (
                                                <FeedingRow
                                                    key={originalIdx}
                                                    item={item}
                                                    idx={originalIdx}
                                                    foodOptions={foodOptions}
                                                    staffOptions={hotelStaffOptions}
                                                    statusOptions={trangThaiChamSocOptions}
                                                    onUpdate={(data) => capNhatDongLichAn(originalIdx, data)}
                                                    onDelete={() => setFeedingDraft(p => p.filter((_, x) => x !== originalIdx))}
                                                    onAddMedia={(files) => handleUploadMedia("f", originalIdx, files)}
                                                    onRemoveMedia={(mIdx) => handleRemoveMedia("f", originalIdx, mIdx)}
                                                    onViewMedia={(mIdx) => handleViewMedia("f", originalIdx, mIdx)}
                                                    isReadOnly={isReadOnly}
                                                />
                                            ))}
                                    </Stack>
                                </Box>
                            )}

                            {careTab === 1 && (
                                <Box>
                                    <Stack direction="row" spacing={1.5} sx={{ mb: 3, overflowX: "auto", pb: 1 }}>
                                        {(editingBooking?.petIds || []).map((pet: any) => (
                                            <Button
                                                key={pet._id}
                                                variant={String(selectedPetId) === String(pet._id) ? "contained" : "outlined"}
                                                onClick={() => setSelectedPetId(String(pet._id))}
                                                sx={{
                                                    borderRadius: '20px',
                                                    minWidth: 'max-content',
                                                    px: 2,
                                                    py: 1,
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    bgcolor: String(selectedPetId) === String(pet._id) ? 'var(--palette-text-primary)' : 'transparent',
                                                    color: String(selectedPetId) === String(pet._id) ? '#fff' : 'text.secondary',
                                                    '&:hover': {
                                                        bgcolor: String(selectedPetId) === String(pet._id) ? '#000' : 'var(--palette-action-hover)'
                                                    }
                                                }}
                                                startIcon={<Avatar src={pet.avatar} sx={{ width: 28, height: 28 }} />}
                                            >
                                                {pet.name}
                                            </Button>
                                        ))}
                                    </Stack>

                                    {!isReadOnly && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={() => {
                                                const type = (selectedPetObj?.type || selectedPetObj?.petType || "all").toLowerCase() as any;
                                                setExerciseDraft(p => [...p, taoDongVanDong(type, selectedPetId, selectedPetObj?.name)]);
                                            }}
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
                                            Thêm hoạt động cho {selectedPetObj?.name || "thú cưng"}
                                        </Button>
                                    )}
                                    <Stack spacing={2}>
                                        {exerciseDraft
                                            .map((item, originalIdx) => ({ item, originalIdx }))
                                            .filter(({ item }) => !item.petId || String(item.petId) === String(selectedPetId))
                                            .map(({ item, originalIdx }) => (
                                                <ExerciseRow
                                                    key={originalIdx}
                                                    item={item}
                                                    idx={originalIdx}
                                                    exerciseOptions={exerciseOptions}
                                                    staffOptions={hotelStaffOptions}
                                                    statusOptions={trangThaiChamSocOptions}
                                                    onUpdate={(data) => capNhatDongVanDong(originalIdx, data)}
                                                    onDelete={() => setExerciseDraft(p => p.filter((_, x) => x !== originalIdx))}
                                                    onAddMedia={(files) => handleUploadMedia("e", originalIdx, files)}
                                                    onRemoveMedia={(mIdx) => handleRemoveMedia("e", originalIdx, mIdx)}
                                                    onViewMedia={(mIdx) => handleViewMedia("e", originalIdx, mIdx)}
                                                    isReadOnly={isReadOnly}
                                                />
                                            ))}
                                    </Stack>
                                </Box>
                            )}
                            {careTab === 2 && <BoardingPetDiaryManager bookingId={editingBooking?._id} pets={editingBooking?.petIds || []} date={careDate} isReadOnly={isReadOnly} />}
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
                    {!isReadOnly && (
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
                    )}
                </DialogActions>
            </Dialog>

            <Dialog open={proofViewer.open} onClose={() => setProofViewer(p => ({ ...p, open: false }))} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "var(--shape-borderRadius-lg)" } }}>
                <DialogContent sx={{ p: 0, bgcolor: "#000", textAlign: "center", position: 'relative' }}>
                    <IconButton onClick={() => setProofViewer(p => ({ ...p, open: false }))} sx={{ position: 'absolute', top: 10, right: 10, color: '#fff', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}><Icon icon="eva:close-fill" /></IconButton>
                    {proofViewer.items[proofViewer.index]?.kind === "video" ? <video src={proofViewer.items[proofViewer.index]?.url} controls style={{ maxWidth: "100%", maxHeight: "85vh" }} /> : <img src={proofViewer.items[proofViewer.index]?.url} style={{ maxWidth: "100%", maxHeight: "85vh" }} alt="Viewer" />}
                </DialogContent>
            </Dialog>
        </Box>
    );
};
