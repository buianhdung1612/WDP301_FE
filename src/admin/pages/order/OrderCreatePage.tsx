import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Stack,
    TextField,
    Typography,
    Divider,
    alpha,
    Avatar,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Autocomplete,
    CircularProgress,
    Grid,
    Box
} from "@mui/material";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { useProducts } from "../product/hooks/useProducts";
import { useUsers } from "../account-user/hooks/useAccountUser";
import { useCreateOrder } from "./hooks/useOrderManagement";
import { LoadingButton } from "../../components/ui/LoadingButton";

export const OrderCreatePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { products, isLoading: isLoadingProducts } = useProducts();
    const { data: usersRes, isLoading: isLoadingUsers } = useUsers({ limit: 1000 });
    const users = (usersRes as any)?.recordList || [];

    const { mutate: createOrder, isPending } = useCreateOrder();

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [shippingFee, setShippingFee] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("money");
    const [notes, setNotes] = useState("");

    const subTotal = useMemo(() => {
        return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [items]);

    const total = useMemo(() => {
        return subTotal + shippingFee - discount;
    }, [subTotal, shippingFee, discount]);

    const handleAddItem = (product: any) => {
        if (!product) return;
        const existingItem = items.find(item => item.productId === product.id);
        if (existingItem) {
            setItems(items.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setItems([...items, {
                productId: product.id,
                name: product.product,
                image: product.image,
                price: product.price,
                quantity: 1,
                variant: [] // Can be extended to support variants
            }]);
        }
    };

    const handleRemoveItem = (productId: string) => {
        setItems(items.filter(item => item.productId !== productId));
    };

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setItems(items.map(item =>
            item.productId === productId ? { ...item, quantity } : item
        ));
    };

    const handleSubmit = () => {
        if (!selectedUser) {
            toast.error("Vui lòng chọn khách hàng");
            return;
        }
        if (items.length === 0) {
            toast.error("Vui lòng thêm sản phẩm vào đơn hàng");
            return;
        }

        const data = {
            userId: selectedUser._id,
            fullName: selectedUser.fullName,
            phone: selectedUser.phone,
            address: selectedUser.address || "N/A",
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                image: item.image,
                variant: item.variant
            })),
            subTotal,
            shippingFee,
            discount,
            total,
            paymentMethod,
            note: notes,
            orderStatus: "pending"
        };

        createOrder(data, {
            onSuccess: (res) => {
                if (res.code === 200) {
                    toast.success("Tạo đơn hàng thành công");
                    navigate(`/${prefixAdmin}/order/list`);
                } else {
                    toast.error(res.message || "Có lỗi xảy ra");
                }
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Không thể tạo đơn hàng");
            }
        });
    };

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 'calc(3 * var(--spacing))' }}>
            <Box sx={{ mb: 4 }}>
                <Title title="Tạo đơn hàng mới" />
                <Breadcrumb
                    items={[
                        { label: t("admin.dashboard"), to: `/${prefixAdmin}` },
                        { label: "Đơn hàng", to: `/${prefixAdmin}/order/list` },
                        { label: "Tạo mới" }
                    ]}
                />
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        {/* Customer Section */}
                        <Card sx={{ p: 3, borderRadius: 'var(--shape-borderRadius-lg)', boxShadow: 'var(--customShadows-card)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Khách hàng</Typography>
                            <Autocomplete
                                options={users}
                                getOptionLabel={(option) => `${option.fullName} - ${option.phone}`}
                                loading={isLoadingUsers}
                                value={selectedUser}
                                onChange={(_e, val) => setSelectedUser(val)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Chọn khách hàng"
                                        placeholder="Tìm theo tên hoặc số điện thoại..."
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {isLoadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                            {selectedUser && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'var(--palette-background-neutral)', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{selectedUser.fullName}</Typography>
                                    <Typography variant="body2" color="text.secondary">{selectedUser.phone}</Typography>
                                    <Typography variant="body2" color="text.secondary">{selectedUser.address || "Chưa có địa chỉ"}</Typography>
                                </Box>
                            )}
                        </Card>

                        {/* Product Section */}
                        <Card sx={{ p: 3, borderRadius: 'var(--shape-borderRadius-lg)', boxShadow: 'var(--customShadows-card)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Sản phẩm</Typography>
                            <Autocomplete
                                options={products as any[]}
                                getOptionLabel={(option) => option?.product || ""}
                                loading={isLoadingProducts}
                                onChange={(_e, val) => handleAddItem(val)}
                                value={null}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Thêm sản phẩm"
                                        placeholder="Tìm sản phẩm..."
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {isLoadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => {
                                    if (!option) return null;
                                    return (
                                        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={option.image} variant="rounded" sx={{ width: 40, height: 40 }} />
                                            <Box>
                                                <Typography variant="subtitle2">{option.product}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.price)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                }}
                            />

                            <TableContainer sx={{ mt: 3 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Sản phẩm</TableCell>
                                            <TableCell align="right">Giá</TableCell>
                                            <TableCell align="center">Số lượng</TableCell>
                                            <TableCell align="right">Thành tiền</TableCell>
                                            <TableCell align="right"></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                    Chưa có sản phẩm nào được chọn
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            items.map((item) => (
                                                <TableRow key={item.productId} sx={{ '&:last-child td': { border: 0 } }}>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar src={item.image} variant="rounded" sx={{ width: 48, height: 48 }} />
                                                            <Typography variant="subtitle2">{item.name}</Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Icon icon="eva:minus-fill" />
                                                            </IconButton>
                                                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                                                                {item.quantity}
                                                            </Typography>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                            >
                                                                <Icon icon="eva:plus-fill" />
                                                            </IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton color="error" size="small" onClick={() => handleRemoveItem(item.productId)}>
                                                            <Icon icon="eva:trash-2-outline" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>

                        <Card sx={{ p: 3, borderRadius: 'var(--shape-borderRadius-lg)', boxShadow: 'var(--customShadows-card)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Ghi chú</Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Nhập ghi chú đơn hàng..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </Card>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        <Card sx={{ p: 3, borderRadius: 'var(--shape-borderRadius-lg)', boxShadow: 'var(--customShadows-card)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Tổng kết đơn hàng</Typography>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Tạm tính</Typography>
                                    <Typography variant="subtitle2">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subTotal)}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">Phí vận chuyển</Typography>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={shippingFee}
                                        onChange={(e) => setShippingFee(Number(e.target.value))}
                                        fullWidth
                                    />
                                </Stack>
                                <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">Giảm giá</Typography>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                        fullWidth
                                    />
                                </Stack>
                                <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tổng tiền</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Card>

                        <Card sx={{ p: 3, borderRadius: 'var(--shape-borderRadius-lg)', boxShadow: 'var(--customShadows-card)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Thanh toán</Typography>
                            <Stack spacing={2}>
                                {[
                                    { value: 'money', label: 'Tiền mặt', icon: 'solar:hand-money-bold' },
                                    { value: 'vnpay', label: 'VNPay', icon: 'logos:vnpay' },
                                    { value: 'zalopay', label: 'ZaloPay', icon: 'logos:zalopay' }
                                ].map((method) => (
                                    <Box
                                        key={method.value}
                                        onClick={() => setPaymentMethod(method.value)}
                                        sx={{
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: paymentMethod === method.value ? 'primary.main' : 'var(--palette-background-neutral)',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            bgcolor: paymentMethod === method.value ? alpha('#00A76F', 0.08) : 'transparent',
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: alpha('#00A76F', 0.04) }
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Icon
                                                icon={method.icon}
                                                width={method.value === 'money' ? 24 : 32}
                                                style={{ filter: method.value === 'money' ? 'none' : 'none' }}
                                            />
                                            <Typography variant="subtitle2">{method.label}</Typography>
                                        </Stack>
                                        {paymentMethod === method.value && <Icon icon="eva:checkmark-circle-2-fill" color="#00A76F" width={20} />}
                                    </Box>
                                ))}
                            </Stack>
                        </Card>

                        <LoadingButton
                            fullWidth
                            size="large"
                            variant="contained"
                            loading={isPending}
                            label="Tạo đơn hàng"
                            onClick={handleSubmit}
                            sx={{
                                py: 1.5,
                                fontWeight: 700,
                                fontSize: '1rem',
                            }}
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};
