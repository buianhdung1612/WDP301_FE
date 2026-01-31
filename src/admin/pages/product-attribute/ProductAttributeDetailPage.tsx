
import {
    Box,
    Button,
    Container,
    IconButton,
    Tooltip,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Divider,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    alpha,
} from "@mui/material";
import { prefixAdmin } from "../../constants/routes";
import { ArrowIcon, EditIcon, EyeIcon, PrintIcon, ShareIcon } from "../../assets/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProductAttributeDetail } from "./hooks/useProductAttribute";
import dayjs from "dayjs";
import 'dayjs/locale/vi';
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import TuneIcon from '@mui/icons-material/Tune';
import { ATTRIBUTE_TYPES } from "./configs/constants";

export const ProductAttributeDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: detailRes, isLoading } = useProductAttributeDetail(id);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    const attribute = detailRes?.data || detailRes; // Handle if response wrapped in data or direct

    if (!attribute) return <Box sx={{ textAlign: 'center', py: 5 }}>Không tìm thấy thuộc tính</Box>;

    const displayTypeLabel = ATTRIBUTE_TYPES.find(t => t.value === attribute.type)?.label || attribute.type;
    const isColorType = attribute.type === 'color';

    return (
        <Container disableGutters maxWidth={false} sx={{ px: "40px", pb: 5 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Button
                    component={Link}
                    to={`/${prefixAdmin}/product/attribute/list`}
                    color="inherit"
                    startIcon={<ArrowIcon sx={{ rotate: "90deg", width: 16, height: 16 }} />}
                    disableElevation
                    sx={{
                        fontWeight: 700,
                        textTransform: "none",
                        fontSize: "1.8rem",
                        borderRadius: "8px",
                        p: 0,
                        mb: 1,
                        "&:hover": { backgroundColor: "transparent" }
                    }}
                >
                    {attribute.name}
                </Button>
                <Breadcrumb
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: "Thuộc tính sản phẩm", to: `/${prefixAdmin}/product/attribute/list` },
                        { label: attribute.name }
                    ]}
                />
            </Box>

            {/* Toolbar */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Chỉnh sửa">
                        <IconButton onClick={() => navigate(`/${prefixAdmin}/product/attribute/edit/${attribute._id || id}`)}>
                            <EditIcon sx={{ color: "#637381" }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xem trước">
                        <IconButton>
                            <EyeIcon sx={{ color: "#637381" }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="In">
                        <IconButton>
                            <PrintIcon sx={{ color: "#637381" }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chia sẻ">
                        <IconButton>
                            <ShareIcon sx={{ color: "#637381" }} />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Display Type Badge */}
                <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '1.2rem', color: '#919EAB', mb: 0.5 }}>Kiểu hiển thị</Typography>
                    <Chip
                        label={displayTypeLabel}
                        sx={{
                            backgroundColor: alpha('#4facfe', 0.1),
                            color: '#4facfe',
                            fontWeight: 600,
                            fontSize: '1.3rem',
                        }}
                    />
                </Box>
            </Box>

            {/* Main Card */}
            <Card sx={{
                borderRadius: '16px',
                boxShadow: '0 0 2px 0 rgba(145 158 171 / 20%), 0 12px 24px -4px rgba(145 158 171 / 12%)',
            }}>
                <CardContent sx={{ p: 5 }}>
                    {/* Header inside card */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5 }}>
                        {/* Icon */}
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '12px',
                                backgroundColor: '#f4f6f8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <TuneIcon sx={{ fontSize: '3rem', color: '#4facfe' }} />
                        </Box>

                        {/* Name & Count */}
                        <Box sx={{ textAlign: 'right' }}>
                            <Chip
                                label={`${attribute.options?.length || 0} lựa chọn`}
                                size="small"
                                sx={{
                                    backgroundColor: '#22c55e',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '1.2rem',
                                    mb: 1
                                }}
                            />
                            <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#1C252E' }}>
                                {attribute.name}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Info Grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 4 }}>
                        <Box>
                            <Typography sx={{ fontSize: '1.2rem', color: '#919EAB', fontWeight: 600, mb: 1 }}>
                                Ngày tạo
                            </Typography>
                            <Typography sx={{ fontSize: '1.4rem', color: '#1C252E' }}>
                                {attribute.createdAt ? dayjs(attribute.createdAt).locale('vi').format('DD MMM YYYY') : '--'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '1.2rem', color: '#919EAB', fontWeight: 600, mb: 1 }}>
                                Cập nhật lần cuối
                            </Typography>
                            <Typography sx={{ fontSize: '1.4rem', color: '#1C252E' }}>
                                {attribute.updatedAt ? dayjs(attribute.updatedAt).locale('vi').format('DD MMM YYYY') : '--'}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Values Table */}
                    <Typography sx={{ fontSize: '1.4rem', color: '#919EAB', fontWeight: 600, mb: 2 }}>
                        Danh sách lựa chọn (Options)
                    </Typography>

                    {attribute.options?.length > 0 ? (
                        <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f4f6f8' }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '1.3rem', width: 60 }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '1.3rem' }}>Nhãn (Label)</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '1.3rem', textAlign: isColorType ? 'left' : 'right' }}>
                                            {isColorType ? 'Mã màu' : 'Giá trị (Value)'}
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attribute.options.map((val: any, index: number) => {
                                        return (
                                            <TableRow key={val._id || index} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                                                <TableCell sx={{ fontSize: '1.4rem', color: '#637381' }}>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, color: '#1C252E' }}>
                                                        {val.label}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: isColorType ? 'left' : 'right' }}>
                                                    {isColorType ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Box
                                                                sx={{
                                                                    width: 28,
                                                                    height: 28,
                                                                    borderRadius: '6px',
                                                                    backgroundColor: val.value || '#ccc',
                                                                    border: '2px solid #e0e0e0',
                                                                }}
                                                            />
                                                            <Typography sx={{ fontSize: '1.3rem', fontFamily: 'monospace', color: '#637381' }}>
                                                                {val.value || '--'}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography sx={{ fontSize: '1.4rem', color: '#1C252E' }}>
                                                            {val.value || '--'}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography sx={{ fontSize: '1.4rem', color: '#919EAB', fontStyle: 'italic' }}>
                            Chưa có lựa chọn nào
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};
