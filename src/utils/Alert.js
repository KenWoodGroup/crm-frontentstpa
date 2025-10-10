import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Global z-index tuzatish (modallar ustida chiqishi uchun)
(function addGlobalStyles() {
    if (!document.getElementById("swal-global-styles")) {
        const styleElement = document.createElement("style");
        styleElement.id = "swal-global-styles";
        styleElement.textContent = `
      .swal2-container {
          z-index: 99999 !important;
      }
      .swal2-popup {
          z-index: 99999 !important;
      }
      .swal2-backdrop-show {
          z-index: 99998 !important;
      }
    `
        document.head.appendChild(styleElement);
    }
})();

// Oddiy xabarlar uchun
export const Alert = (message, iconType = "info") => {
    Swal.fire({
        title: message,
        icon: iconType,
        position: "top-end",
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        showConfirmButton: false,
        showCloseButton: true,
    });
};

// Confirm oynasi uchun
export const Confirm = async (message) => {
    const result = await Swal.fire({
        title: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ha",
        cancelButtonText: "Yo‘q",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#d33",
        backdrop: true,
    });
    return result.isConfirmed;
};
