import Swal from 'sweetalert2';

export const confirmDelete = (text: string, onConfirm: () => void) => {
    Swal.fire({
        title: 'Xác nhận xóa?',
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            onConfirm();
        }
    });
};
