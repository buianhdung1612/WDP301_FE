// SweetAlert2 utility for confirmations
import Swal from 'sweetalert2';

export const confirmDelete = (text: string, onConfirm: () => void) => {
    Swal.fire({
        title: 'Xác nhận xóa?',
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6366f1', // Primary color for cancel button
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            onConfirm();
        }
    });
};

export const confirmAction = (title: string, text: string, onConfirm: () => void, icon: 'info' | 'warning' | 'success' = 'info') => {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: '#10b981', // Success color
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            onConfirm();
        }
    });
};

export const confirmSuccess = (title: string, text: string) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Đóng'
    });
};
