import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import {
    deleteBarangMasuk,
    getAllBarangMasuk,
} from "../../services/barangMasukService";
import { getAllLokasi } from "../../services/lokasiService";
import {
    showDeleteConfirmation,
    showErrorAlert,
    showSuccessAlert,
} from "../../utils/sweetAlert";

const ENTRIES_PER_PAGE = 20;
const EMPTY_FILTERS = {
    id_lokasi: "",
};

const formatRupiah = (value) => {
    const numericValue = Number(value);

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number.isFinite(numericValue) ? numericValue : 0);
};

const normalizeDateInput = (value) => {
    if (!value) return "";

    const stringValue = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
        return stringValue.slice(0, 10);
    }

    const date = new Date(stringValue);
    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
};

const formatDate = (value) => {
    const normalizedDate = normalizeDateInput(value);
    if (!normalizedDate) return "-";

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(`${normalizedDate}T00:00:00`));
};

const getStatusColor = (status) => {
    if (status === "LUNAS") return "success";
    if (status === "PIUTANG") return "error";
    if (status === "LOAN") return "warning";
    return "info";
};

const getLocationColor = (locationName) =>
    String(locationName ?? "").toLowerCase() === "suban" ? "slate" : "primary";

const getResponseData = (response) => (Array.isArray(response?.data) ? response.data : []);

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

function BarangMasuk() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [locationError, setLocationError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [currentPage, setCurrentPage] = useState(1);

    const loadBarangMasuk = useCallback(async (nextFilters = EMPTY_FILTERS) => {
        setIsLoading(true);
        setLoadError("");

        try {
            const response = await getAllBarangMasuk(nextFilters);
            setTransactions(getResponseData(response));
        } catch (error) {
            setLoadError(error.message || "Gagal memuat data barang masuk.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadLocations = useCallback(async () => {
        setIsLoadingLocations(true);
        setLocationError("");

        try {
            const response = await getAllLokasi();
            setLocations(getResponseData(response));
        } catch (error) {
            setLocationError(error.message || "Gagal memuat pilihan lokasi.");
        } finally {
            setIsLoadingLocations(false);
        }
    }, []);

    useEffect(() => {
        loadBarangMasuk(EMPTY_FILTERS);
        loadLocations();
    }, [loadBarangMasuk, loadLocations]);

    const filteredTransactions = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        const selectedLocationId = String(filters.id_lokasi ?? "");
        const selectedLocation = locations.find(
            (location) => String(location.id) === selectedLocationId
        );
        const selectedLocationName = normalizeText(selectedLocation?.nama_lokasi);

        return transactions.filter((transaction) => {
            const transactionLocationId = String(transaction.id_lokasi ?? "");
            const transactionLocationName = normalizeText(transaction.nama_lokasi);
            const matchesLocation =
                !selectedLocationId ||
                transactionLocationId === selectedLocationId ||
                (selectedLocationName && transactionLocationName === selectedLocationName);

            const searchableText = [
                transaction.tanggal,
                transaction.kode_barang,
                transaction.nama_barang,
                transaction.nama_lokasi,
                transaction.satuan,
                transaction.jumlah,
                transaction.harga_satuan,
                transaction.total_harga,
                transaction.jumlah_bayar,
                transaction.sisa_bayar,
                transaction.status,
            ]
                .map((value) => String(value ?? "").toLowerCase())
                .join(" ");

            return matchesLocation && (!keyword || searchableText.includes(keyword));
        });
    }, [filters.id_lokasi, locations, searchTerm, transactions]);

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ENTRIES_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ENTRIES_PER_PAGE;
    const paginatedTransactions = filteredTransactions.slice(
        startIndex,
        startIndex + ENTRIES_PER_PAGE
    );
    const showingFrom = filteredTransactions.length === 0 ? 0 : startIndex + 1;
    const showingTo = Math.min(startIndex + ENTRIES_PER_PAGE, filteredTransactions.length);

    useEffect(() => {
        setCurrentPage((page) => Math.min(Math.max(1, page), totalPages));
    }, [totalPages]);

    const handleFilterChange = async (event) => {
        const { name, value } = event.target;
        if (isLoading) return;

        const nextFilters = { ...filters, [name]: value };
        setFilters(nextFilters);
        setAppliedFilters(nextFilters);
        setCurrentPage(1);
        await loadBarangMasuk(nextFilters);
    };

    const handleDelete = async (transaction) => {
        if (isDeleting || !transaction) return;

        const identity = [
            transaction.kode_barang,
            transaction.nama_barang,
            transaction.tanggal ? formatDate(transaction.tanggal) : null,
        ]
            .filter(Boolean)
            .join(" - ");

        const confirmation = await showDeleteConfirmation({
            title: "Hapus Transaksi?",
            text: `Transaksi ${identity || "barang masuk ini"} akan dihapus dari database.`,
        });

        if (!confirmation.isConfirmed) return;

        setIsDeleting(true);

        try {
            const response = await deleteBarangMasuk(transaction.id);
            await loadBarangMasuk(appliedFilters);
            await showSuccessAlert(
                "Berhasil",
                response.message || "Transaksi barang masuk berhasil dihapus."
            );
        } catch (error) {
            const message = error.message || "Gagal menghapus transaksi barang masuk.";
            await showErrorAlert("Gagal", message);
        } finally {
            setIsDeleting(false);
        }
    };

    const renderTableBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan="12" className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Memuat data barang masuk...
                    </td>
                </tr>
            );
        }

        if (loadError) {
            return (
                <tr>
                    <td colSpan="12" className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-error-600 dark:text-error-500">{loadError}</p>
                            <Button size="sm" variant="outline" onClick={() => loadBarangMasuk(appliedFilters)}>
                                Coba Lagi
                            </Button>
                        </div>
                    </td>
                </tr>
            );
        }

        if (transactions.length === 0) {
            return (
                <tr>
                    <td colSpan="12" className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada transaksi barang masuk.
                    </td>
                </tr>
            );
        }

        if (paginatedTransactions.length === 0) {
            return (
                <tr>
                    <td colSpan="12" className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Tidak ada transaksi barang masuk yang cocok.
                    </td>
                </tr>
            );
        }

        return paginatedTransactions.map((transaction) => (
            <tr key={transaction.id}>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-center text-gray-700 dark:text-gray-300">
                    {formatDate(transaction.tanggal)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-center font-medium text-gray-800 dark:text-white/90">
                    {String(transaction.kode_barang ?? "-")}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {String(transaction.nama_barang ?? "-")}
                    </p>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                    <Badge size="sm" color={getLocationColor(transaction.nama_lokasi)}>
                        {String(transaction.nama_lokasi ?? "-")}
                    </Badge>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-center text-gray-700 dark:text-gray-300">
                    {String(transaction.satuan ?? "-")}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-center text-gray-700 dark:text-gray-300">
                    {String(transaction.jumlah ?? "-")}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-center font-medium text-gray-800 dark:text-white/90">
                    {formatRupiah(transaction.harga_satuan)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-center font-medium text-gray-800 dark:text-white/90">
                    {formatRupiah(transaction.total_harga)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-center text-gray-700 dark:text-gray-300">
                    {formatRupiah(transaction.jumlah_bayar)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-center text-gray-700 dark:text-gray-300">
                    {formatRupiah(transaction.sisa_bayar)}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex justify-center">
                        <Badge size="sm" color={getStatusColor(transaction.status)}>
                            {String(transaction.status ?? "-")}
                        </Badge>
                    </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => navigate(`/barang-masuk/${transaction.id}/edit`)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-white"
                            aria-label={`Edit ${String(transaction.nama_barang ?? "transaksi barang masuk")}`}
                        >
                            <Edit className="size-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(transaction)}
                            disabled={isDeleting}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-error-50 hover:text-error-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-500"
                            aria-label={`Hapus ${String(transaction.nama_barang ?? "transaksi barang masuk")}`}
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <>
            <PageMeta
                title="Barang Masuk | Mandiri Tani Sejahtera"
                description="Kelola transaksi barang masuk inventory pupuk."
            />
            <PageBreadcrumb pageTitle="Barang Masuk" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:flex-row lg:items-center lg:justify-between lg:p-6">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Barang Masuk
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Kelola transaksi barang masuk untuk inventory pupuk.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate("/barang-masuk/tambah")}
                        startIcon={<Plus className="size-5" />}
                        className="w-full lg:w-auto"
                    >
                        Tambah Transaksi
                    </Button>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="grid grid-cols-1 gap-4 border-b border-gray-100 p-4 dark:border-gray-800 sm:grid-cols-[220px_minmax(240px,1fr)] sm:items-end">
                        <label className="block text-sm text-gray-500 dark:text-gray-400">
                            <select
                                name="id_lokasi"
                                value={filters.id_lokasi}
                                onChange={handleFilterChange}
                                disabled={isLoading || isLoadingLocations}
                                className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                                <option value="">{isLoadingLocations ? "Memuat TP..." : "Semua TP"}</option>
                                {locations.map((location) => (
                                    <option key={location.id} value={location.id}>
                                        {location.nama_lokasi}
                                    </option>
                                ))}
                            </select>
                            {locationError && <p className="mt-1.5 text-xs text-error-500">{locationError}</p>}
                        </label>

                        <div className="relative w-full self-end">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => {
                                    setSearchTerm(event.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Cari transaksi..."
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                            />
                        </div>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                        <table className="min-w-[1320px]">
                            <thead className="border-y border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Tanggal</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Kode Barang</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Nama Barang</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">TP</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Satuan</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Jumlah Masuk</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Harga Satuan</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Total Harga</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Jumlah Bayar</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Sisa Bayar</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {renderTableBody()}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {showingFrom} to {showingTo} of {filteredTransactions.length} entries
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                disabled={safePage === 1}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                            >
                                Previous
                            </button>
                            <span className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                                {safePage}
                            </span>
                            <button
                                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                disabled={safePage === totalPages}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BarangMasuk;
