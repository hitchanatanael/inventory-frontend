import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Package, Search, Warehouse } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import {
    getAllStokBarang,
    getRingkasanStokBarang,
} from "../../services/stokBarangService";
import { getAllLokasi } from "../../services/lokasiService";

const emptyFilters = {
    id_lokasi: "",
    search: "",
};

const emptySummary = {
    keseluruhan: {
        total_jenis_barang: 0,
        total_stok: 0,
        total_nilai_aset: 0,
    },
    per_lokasi: [],
};

const getResponseData = (response) => (Array.isArray(response?.data) ? response.data : []);

const normalizeSummary = (data) => ({
    keseluruhan: {
        total_jenis_barang: data?.keseluruhan?.total_jenis_barang ?? 0,
        total_stok: data?.keseluruhan?.total_stok ?? 0,
        total_nilai_aset: data?.keseluruhan?.total_nilai_aset ?? 0,
    },
    per_lokasi: Array.isArray(data?.per_lokasi) ? data.per_lokasi : [],
});

const toFiniteNumber = (value) => {
    const numericValue = Number(value ?? 0);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatNumber = (value) =>
    new Intl.NumberFormat("id-ID").format(toFiniteNumber(value));

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(toFiniteNumber(value));

const getStockStatus = (stock) => {
    const numericStock = toFiniteNumber(stock);

    if (numericStock < 0) return "Stok Negatif";
    if (numericStock === 0) return "Habis";
    return "Tersedia";
};

const getStockStatusColor = (status) => {
    if (status === "Tersedia") return "success";
    if (status === "Habis") return "warning";
    return "error";
};

const getLocationColor = (locationName) =>
    String(locationName ?? "").toLowerCase() === "suban" ? "slate" : "primary";

const findLocationSummary = (summaryItems, locationName, locationCode) =>
    summaryItems.find((item) => {
        const itemName = String(item.nama_lokasi ?? "").toLowerCase();
        const itemCode = String(item.kode_lokasi ?? "").toLowerCase();

        return (
            itemName === locationName.toLowerCase() ||
            itemCode === locationCode.toLowerCase()
        );
    });

function StokBarang() {
    const [stockItems, setStockItems] = useState([]);
    const [summary, setSummary] = useState(emptySummary);
    const [locations, setLocations] = useState([]);
    const [filters, setFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [summaryError, setSummaryError] = useState("");
    const [locationError, setLocationError] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);

    const loadStokBarang = useCallback(async (activeFilters = emptyFilters) => {
        setIsLoading(true);
        setLoadError("");

        try {
            const response = await getAllStokBarang(activeFilters);
            setStockItems(getResponseData(response));
        } catch (error) {
            setLoadError(error.message || "Gagal memuat data stok barang.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadRingkasanStok = useCallback(async () => {
        setIsLoadingSummary(true);
        setSummaryError("");

        try {
            const response = await getRingkasanStokBarang();
            setSummary(normalizeSummary(response.data));
        } catch (error) {
            setSummary(emptySummary);
            setSummaryError(error.message || "Gagal memuat ringkasan stok barang.");
        } finally {
            setIsLoadingSummary(false);
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
        loadRingkasanStok();
        loadLocations();
    }, [loadLocations, loadRingkasanStok, loadStokBarang]);

    useEffect(() => {
        const activeFilters = {
            id_lokasi: filters.id_lokasi,
            search: filters.search.trim(),
        };

        setAppliedFilters(activeFilters);
        setCurrentPage(1);

        const timeoutId = window.setTimeout(() => {
            loadStokBarang(activeFilters);
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [filters, loadStokBarang]);

    const pusatSummary = useMemo(
        () => findLocationSummary(summary.per_lokasi, "pusat", "p"),
        [summary.per_lokasi]
    );
    const subanSummary = useMemo(
        () => findLocationSummary(summary.per_lokasi, "suban", "s"),
        [summary.per_lokasi]
    );

    const totalPages = Math.max(1, Math.ceil(stockItems.length / entriesPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * entriesPerPage;
    const paginatedStocks = stockItems.slice(startIndex, startIndex + entriesPerPage);
    const showingFrom = stockItems.length === 0 ? 0 : startIndex + 1;
    const showingTo = Math.min(startIndex + entriesPerPage, stockItems.length);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
        .filter((page) => Math.abs(page - safePage) <= 1 || page === 1 || page === totalPages);

    useEffect(() => {
        setCurrentPage((page) => Math.min(Math.max(1, page), totalPages));
    }, [totalPages]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleRefresh = async () => {
        if (isLoading || isLoadingSummary) return;

        await Promise.all([
            loadStokBarang(appliedFilters),
            loadRingkasanStok(),
        ]);
    };

    const renderSummaryValue = (value, formatter = formatNumber) =>
        isLoadingSummary ? "Memuat..." : formatter(value);

    const renderTableBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan="10" className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Memuat data stok barang...
                    </td>
                </tr>
            );
        }

        if (loadError) {
            return (
                <tr>
                    <td colSpan="10" className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-error-600 dark:text-error-500">{loadError}</p>
                            <Button size="sm" variant="outline" onClick={() => loadStokBarang(appliedFilters)}>
                                Coba Lagi
                            </Button>
                        </div>
                    </td>
                </tr>
            );
        }

        if (paginatedStocks.length === 0) {
            return (
                <tr>
                    <td colSpan="10" className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Tidak ada data stok barang.
                    </td>
                </tr>
            );
        }

        return paginatedStocks.map((stock, index) => {
            const stockStatus = getStockStatus(stock.stok);

            return (
                <tr
                    key={`${stock.id_master_barang}-${stock.id_lokasi}`}
                    className="transition hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                >
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                        {startIndex + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {String(stock.kode_barang ?? "-")}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        <span className="block truncate" title={String(stock.nama_barang ?? "")}>
                            {String(stock.nama_barang ?? "-")}
                        </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                        <Badge size="sm" color={getLocationColor(stock.nama_lokasi)}>
                            {String(stock.nama_lokasi ?? "-")}
                        </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {String(stock.satuan ?? "-")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                        {formatNumber(stock.stok_masuk)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                        {formatNumber(stock.stok_keluar)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                {formatNumber(stock.stok)}
                            </span>
                            <Badge size="sm" color={getStockStatusColor(stockStatus)}>
                                {stockStatus}
                            </Badge>
                        </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatRupiah(stock.harga_satuan)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatRupiah(stock.nilai_aset)}
                    </td>
                </tr>
            );
        });
    };

    return (
        <>
            <PageMeta
                title="Stok Barang | Mandiri Tani Sejahtera"
                description="Pantau stok dan nilai aset barang inventory pupuk."
            />
            <PageBreadcrumb pageTitle="Stok" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:flex-row lg:items-center lg:justify-between lg:p-6">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Stok Barang
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Pantau stok barang per lokasi dan nilai aset inventory pupuk.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isLoading || isLoadingSummary}
                        className="w-full lg:w-auto"
                    >
                        Refresh
                    </Button>
                </div>

                {summaryError && (
                    <div className="rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-500">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <span>{summaryError}</span>
                            <Button size="sm" variant="outline" onClick={loadRingkasanStok}>
                                Coba Lagi
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                            <Boxes className="size-5" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Stok Pusat</p>
                        <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                            {renderSummaryValue(pusatSummary?.total_stok)}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                            <Warehouse className="size-5" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Aset Pusat</p>
                        <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                            {renderSummaryValue(pusatSummary?.total_nilai_aset, formatRupiah)}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500">
                            <Package className="size-5" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Stok Suban</p>
                        <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                            {renderSummaryValue(subanSummary?.total_stok)}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">
                            <Warehouse className="size-5" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Aset Suban</p>
                        <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                            {renderSummaryValue(subanSummary?.total_nilai_aset, formatRupiah)}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500">
                            <Boxes className="size-5" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Aset Keseluruhan</p>
                        <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                            {renderSummaryValue(summary.keseluruhan.total_nilai_aset, formatRupiah)}
                        </p>
                    </div>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 dark:border-gray-800 md:grid-cols-[auto_180px_minmax(260px,1fr)] md:items-center">
                        <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            Show
                            <select
                                value={entriesPerPage}
                                onChange={(event) => {
                                    setEntriesPerPage(Number(event.target.value));
                                    setCurrentPage(1);
                                }}
                                className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            entries
                        </label>

                        <label className="block text-sm text-gray-500 dark:text-gray-400">
                            <span className="sr-only">TP</span>
                            <select
                                name="id_lokasi"
                                value={filters.id_lokasi}
                                onChange={handleFilterChange}
                                disabled={isLoadingLocations}
                                className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
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

                        <div>
                            <label className="sr-only" htmlFor="stok-search">
                                Search
                            </label>
                            <div className="relative w-full">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="stok-search"
                                    type="search"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Cari kode atau nama barang..."
                                    className="h-10 w-full rounded-lg border border-gray-300 bg-transparent py-2 pl-10 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full min-w-[1160px] table-fixed">
                            <colgroup>
                                <col className="w-[6%]" />
                                <col className="w-[13%]" />
                                <col className="w-[22%]" />
                                <col className="w-[9%]" />
                                <col className="w-[8%]" />
                                <col className="w-[10%]" />
                                <col className="w-[10%]" />
                                <col className="w-[10%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                            </colgroup>
                            <thead className="border-y border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-white/[0.02]">
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">No</th>
                                    <th className="whitespace-nowrap px-4 py-3 text-left text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Kode Barang</th>
                                    <th className="whitespace-nowrap px-4 py-3 text-left text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Nama Barang</th>
                                    <th className="whitespace-nowrap px-4 py-3 text-left text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">TP</th>
                                    <th className="whitespace-nowrap px-4 py-3 text-left text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Satuan</th>
                                    <th className="whitespace-nowrap px-4 py-3 text-right text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Stok Masuk</th>
                                    <th className="whitespace-nowrap px-4 py-3 text-right text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Stok Keluar</th>
                                    <th className="whitespace-nowrap px-4 py-3 text-right text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Stok Tersedia</th>
                                    <th className="whitespace-nowrap px-4 py-3 text-right text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Harga Satuan</th>
                                    <th className="whitespace-nowrap px-4 py-3 text-right text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">Nilai Aset</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {renderTableBody()}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {showingFrom} to {showingTo} of {stockItems.length} entries
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                disabled={safePage === 1}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                            >
                                Previous
                            </button>
                            {pageNumbers.map((page, index) => {
                                const previousPage = pageNumbers[index - 1];
                                const showGap = previousPage && page - previousPage > 1;

                                return (
                                    <span key={page} className="flex items-center gap-2">
                                        {showGap && <span className="text-sm text-gray-400">...</span>}
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`rounded-lg px-3 py-2 text-sm font-medium ${safePage === page
                                                ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                                                : "border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    </span>
                                );
                            })}
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

export default StokBarang;
