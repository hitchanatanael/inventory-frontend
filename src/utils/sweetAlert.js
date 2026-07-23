import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const baseOptions = {
    confirmButtonColor: "#465fff",
    cancelButtonColor: "#d92d20",
};

export const showSuccessAlert = (title, text) =>
    Swal.fire({
        ...baseOptions,
        icon: "success",
        title,
        text,
    });

export const showErrorAlert = (title, text) =>
    Swal.fire({
        ...baseOptions,
        icon: "error",
        title,
        text,
    });

export const showDeleteConfirmation = ({ title, text }) =>
    Swal.fire({
        ...baseOptions,
        icon: "warning",
        title,
        text,
        showCancelButton: true,
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        reverseButtons: true,
    });
