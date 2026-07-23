import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, PackagePlus } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import {
    createBarangMasuk,
    getBarangMasukById,
    updateBarangMasuk,
} from "../../services/barangMasukService";
import { getAllMasterBarang } from "../../services/masterBarangService";
import { getAllLokasi } from "../../services/lokasiService";
import { showErrorAlert, showSuccessAlert } from "../../utils/sweetAlert";

const emptyForm = {
    tanggal: "",
    id_master_barang: "",
    id_lokasi: "",
    jumlah: "",
    harga_satuan: "",
    jumlah_bayar: "",
    status: "LUNAS",
};

const STATUS_OPTIONS = ["LUNAS", "PIUTANG", "LOAN"];

const getResponseData = (response) => (Array.isArray(response?.data) ? response.data : []);

const formatRupiah = (value) => {
    const numericValue = Number(value);

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number.isFinite(numericValue) ? numericValue : 0);
};

const formatRupiahInput = (value) => {
    if (value === "" || value === null || value === undefined) return "";

    const numberValue = Number(String(value).replace(/\D/g, ""));
    if (!Number.isFinite(numberValue)) return "";

    return `Rp ${new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
    }).format(numberValue)}`;
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

const getStatusColor = (status) => {
    if (status === "LUNAS") return "success";
    if (status === "PIUTANG") return "error";
    if (status === "LOAN") return "warning";
    return "info";
};

const getLocationColor = (locationName) =>
    String(locationName ?? "").toLowerCase() === "suban" ? "slate" : "primary";

const getItemOptionLabel = (item) =>
    [
        String(item.kode_barang ?? ""),
        String(item.nama_barang ?? ""),
        String(item.nama_lokasi ?? ""),
    ]
        .filter(Boolean)
        .join(" - ");

const buildItemSearchText = (item) =>
    [
        item.kode_barang,
        item.nama_barang,
        item.nama_lokasi,
        item.satuan,
        item.harga_satuan,
    ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

function BarangMasukForm({ mode }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = mode === "edit";
    const [formData, setFormData] = useState({
        ...emptyForm,
        tanggal: new Date().toISOString().slice(0, 10),
    });
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);
    const [errors, setErrors] = useState({});
    const [loadError, setLoadError] = useState("");
    const [itemError, setItemError] = useState("");
    const [locationError, setLocationError] = useState("");
    const [requestError, setRequestError] = useState("");
    const [isLoading, setIsLoading] = useState(isEdit);
    const [isLoadingItems, setIsLoadingItems] = useState(true);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState("");
    const itemDropdownRef = useRef(null);

    const selectedItem = useMemo(
        () => items.find((item) => Number(item.id) === Number(formData.id_master_barang)),
        [formData.id_master_barang, items]
    );

    const filteredItems = useMemo(() => {
        const keyword = itemSearchTerm.trim().toLowerCase();
        if (!keyword) return items;

        return items.filter((item) => buildItemSearchText(item).includes(keyword));
    }, [itemSearchTerm, items]);

    const calculation = useMemo(() => {
        const jumlah = Number(formData.jumlah) || 0;
        const hargaSatuan = Number(formData.harga_satuan) || 0;
        const jumlahBayar = Number(formData.jumlah_bayar) || 0;
        const totalHarga = jumlah * hargaSatuan;

        return {
            total_harga: totalHarga,
            sisa_bayar: jumlahBayar - totalHarga,
            status: formData.status || "LUNAS",
        };
    }, [formData]);

    const loadItems = useCallback(async () => {
        setIsLoadingItems(true);
        setItemError("");

        try {
            const response = await getAllMasterBarang();
            setItems(getResponseData(response));
        } catch (error) {
            setItemError(error.message || "Gagal memuat pilihan barang.");
        } finally {
            setIsLoadingItems(false);
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

    const loadTransaction = useCallback(async () => {
        if (!isEdit) return;

        setIsLoading(true);
        setLoadError("");

        try {
            const response = await getBarangMasukById(id);
            const transaction = response.data || {};
            setFormData({
                tanggal: normalizeDateInput(transaction.tanggal),
                id_master_barang: transaction.id_master_barang ? String(transaction.id_master_barang) : "",
                id_lokasi: transaction.id_lokasi ? String(transaction.id_lokasi) : "",
                jumlah: String(transaction.jumlah ?? ""),
                harga_satuan: String(transaction.harga_satuan ?? ""),
                jumlah_bayar: String(transaction.jumlah_bayar ?? ""),
                status: STATUS_OPTIONS.includes(transaction.status) ? transaction.status : "LUNAS",
            });
        } catch (error) {
            setLoadError(error.message || "Gagal memuat transaksi barang masuk.");
        } finally {
            setIsLoading(false);
        }
    }, [id, isEdit]);

    useEffect(() => {
        loadItems();
        loadLocations();
        loadTransaction();
    }, [loadItems, loadLocations, loadTransaction]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                itemDropdownRef.current &&
                !itemDropdownRef.current.contains(event.target)
            ) {
                setIsItemDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const openDatePicker = (event) => {
        try {
            event.currentTarget.showPicker?.();
        } catch {
            // Some browsers only allow showPicker during direct pointer activation.
        }
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        if (name === "id_master_barang") {
            const nextItem = items.find((item) => Number(item.id) === Number(value));
            setFormData((current) => ({
                ...current,
                id_master_barang: value,
                harga_satuan: nextItem ? String(nextItem.harga_satuan ?? "") : "",
            }));
            setErrors((current) => ({
                ...current,
                id_master_barang: "",
                harga_satuan: "",
            }));
            setRequestError("");
            return;
        }

        if (["jumlah", "harga_satuan", "jumlah_bayar"].includes(name)) {
            setFormData((current) => ({ ...current, [name]: value.replace(/\D/g, "") }));
            setErrors((current) => ({ ...current, [name]: "" }));
            setRequestError("");
            return;
        }

        setFormData((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: "" }));
        setRequestError("");
    };

    const handleItemSelect = (item) => {
        handleFormChange({
            target: {
                name: "id_master_barang",
                value: String(item.id),
            },
        });
        setItemSearchTerm("");
        setIsItemDropdownOpen(false);
    };

    const validateForm = () => {
        const nextErrors = {};
        const itemId = Number(formData.id_master_barang);
        const locationId = Number(formData.id_lokasi);
        const jumlah = Number(formData.jumlah);
        const hargaSatuan = Number(formData.harga_satuan);
        const jumlahBayar = Number(formData.jumlah_bayar);
        const validItemIds = new Set(items.map((item) => Number(item.id)));
        const validLocationIds = new Set(locations.map((location) => Number(location.id)));

        if (!formData.tanggal || Number.isNaN(new Date(formData.tanggal).getTime())) {
            nextErrors.tanggal = "Tanggal wajib diisi.";
        }

        if (!formData.id_master_barang) {
            nextErrors.id_master_barang = "Barang wajib dipilih.";
        } else if (!Number.isInteger(itemId) || itemId <= 0 || !validItemIds.has(itemId)) {
            nextErrors.id_master_barang = "Barang tidak valid.";
        }

        if (!formData.id_lokasi) {
            nextErrors.id_lokasi = "Lokasi wajib dipilih.";
        } else if (!Number.isInteger(locationId) || locationId <= 0 || !validLocationIds.has(locationId)) {
            nextErrors.id_lokasi = "Lokasi tidak valid.";
        }

        if (!formData.jumlah) {
            nextErrors.jumlah = "Jumlah wajib diisi.";
        } else if (!Number.isFinite(jumlah) || jumlah <= 0) {
            nextErrors.jumlah = "Jumlah harus lebih dari 0.";
        }

        if (formData.harga_satuan === "") {
            nextErrors.harga_satuan = "Harga satuan wajib diisi.";
        } else if (!Number.isFinite(hargaSatuan) || hargaSatuan <= 0) {
            nextErrors.harga_satuan = "Harga satuan harus lebih dari 0.";
        }

        if (formData.jumlah_bayar === "") {
            nextErrors.jumlah_bayar = "Jumlah bayar wajib diisi.";
        } else if (!Number.isFinite(jumlahBayar) || jumlahBayar < 0) {
            nextErrors.jumlah_bayar = "Jumlah bayar tidak boleh negatif.";
        }

        if (!formData.status) {
            nextErrors.status = "Status wajib dipilih.";
        } else if (!STATUS_OPTIONS.includes(formData.status)) {
            nextErrors.status = "Status tidak valid.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const buildPayload = () => ({
        tanggal: formData.tanggal,
        id_master_barang: Number(formData.id_master_barang),
        id_lokasi: Number(formData.id_lokasi),
        jumlah: Number(formData.jumlah),
        harga_satuan: Number(formData.harga_satuan),
        jumlah_bayar: Number(formData.jumlah_bayar),
        status: formData.status,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting || !validateForm()) return;

        setIsSubmitting(true);
        setRequestError("");

        try {
            const response = isEdit
                ? await updateBarangMasuk(id, buildPayload())
                : await createBarangMasuk(buildPayload());

            await showSuccessAlert(
                "Berhasil",
                response.message || "Transaksi barang masuk berhasil disimpan."
            );
            navigate("/barang-masuk");
        } catch (error) {
            const message = error.message || "Gagal menyimpan transaksi barang masuk.";
            setRequestError(message);
            await showErrorAlert("Gagal", message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <PageMeta
                title={`${isEdit ? "Edit" : "Tambah"} Barang Masuk | Mandiri Tani Sejahtera`}
                description="Form transaksi barang masuk inventory pupuk."
            />
            <PageBreadcrumb pageTitle={isEdit ? "Edit Barang Masuk" : "Tambah Barang Masuk"} />

            <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                                <PackagePlus className="size-6" />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                {isEdit ? "Edit Barang Masuk" : "Tambah Barang Masuk"}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Isi data transaksi dan total pembayaran akan dihitung otomatis.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/barang-masuk")}
                            disabled={isSubmitting}
                            className="w-full lg:w-auto"
                        >
                            Kembali
                        </Button>
                    </div>

                    {loadError && (
                        <div className="mt-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-500">
                            {loadError}
                        </div>
                    )}

                    {requestError && (
                        <div className="mt-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-500">
                            {requestError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label htmlFor="tanggal">Tanggal</Label>
                                <Input
                                    id="tanggal"
                                    name="tanggal"
                                    type="date"
                                    value={formData.tanggal}
                                    onChange={handleFormChange}
                                    onClick={openDatePicker}
                                    onFocus={openDatePicker}
                                    disabled={isSubmitting || isLoading}
                                    error={Boolean(errors.tanggal)}
                                    hint={errors.tanggal}
                                />
                            </div>

                            <div>
                                <Label htmlFor="id_lokasi">Lokasi</Label>
                                <select
                                    id="id_lokasi"
                                    name="id_lokasi"
                                    value={formData.id_lokasi}
                                    onChange={handleFormChange}
                                    disabled={isSubmitting || isLoading || isLoadingLocations}
                                    className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:text-white/90 ${errors.id_lokasi
                                        ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                                        : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                                        }`}
                                >
                                    <option value="">{isLoadingLocations ? "Memuat lokasi..." : "Pilih lokasi"}</option>
                                    {locations.map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {location.nama_lokasi}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_lokasi && <p className="mt-1.5 text-xs text-error-500">{errors.id_lokasi}</p>}
                                {locationError && <p className="mt-1.5 text-xs text-error-500">{locationError}</p>}
                            </div>

                            <div>
                                <Label htmlFor="id_master_barang">Barang</Label>
                                <div ref={itemDropdownRef} className="relative">
                                    <button
                                        id="id_master_barang"
                                        type="button"
                                        onClick={() => {
                                            if (!isSubmitting && !isLoading && !isLoadingItems) {
                                                setIsItemDropdownOpen((current) => !current);
                                            }
                                        }}
                                        disabled={isSubmitting || isLoading || isLoadingItems}
                                        className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-transparent px-4 py-2.5 text-left text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:text-white/90 ${errors.id_master_barang
                                            ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                                            : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                                            }`}
                                    >
                                        <span className={`min-w-0 truncate ${selectedItem ? "text-gray-800 dark:text-white/90" : "text-gray-400"}`}>
                                            {isLoadingItems
                                                ? "Memuat barang..."
                                                : selectedItem
                                                    ? getItemOptionLabel(selectedItem)
                                                    : "Pilih barang"}
                                        </span>
                                        <ChevronDown className="size-4 shrink-0 text-gray-400" />
                                    </button>

                                    {isItemDropdownOpen && (
                                        <div className="absolute z-999 mt-2 max-h-80 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-700 dark:bg-gray-900">
                                            <div className="border-b border-gray-100 p-3 dark:border-gray-800">
                                                <input
                                                    type="search"
                                                    value={itemSearchTerm}
                                                    onChange={(event) => setItemSearchTerm(event.target.value)}
                                                    placeholder="Cari nama, kode, lokasi..."
                                                    className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                                                    autoFocus
                                                />
                                            </div>

                                            <div className="max-h-60 overflow-y-auto p-2">
                                                {filteredItems.length > 0 ? (
                                                    filteredItems.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => handleItemSelect(item)}
                                                            className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left transition hover:bg-gray-50 dark:hover:bg-white/[0.04] ${Number(item.id) === Number(formData.id_master_barang) ? "bg-brand-50 dark:bg-brand-500/15" : ""}`}
                                                        >
                                                            <span className="min-w-0">
                                                                <span className="block truncate text-sm font-medium text-gray-800 dark:text-white/90">
                                                                    {String(item.nama_barang ?? "-")}
                                                                </span>
                                                                <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                                                                    {String(item.kode_barang ?? "-")}
                                                                </span>
                                                                <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                                                                    {String(item.satuan ?? "-")}
                                                                </span>
                                                            </span>
                                                            <span className="shrink-0 text-right">
                                                                <span className="flex justify-end">
                                                                    <Badge size="sm" color={getLocationColor(item.nama_lokasi)}>
                                                                        {String(item.nama_lokasi ?? "-")}
                                                                    </Badge>
                                                                </span>
                                                                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                                                                    {formatRupiah(item.harga_satuan)}
                                                                </span>
                                                            </span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                                        Barang tidak ditemukan.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {errors.id_master_barang && <p className="mt-1.5 text-xs text-error-500">{errors.id_master_barang}</p>}
                                {itemError && <p className="mt-1.5 text-xs text-error-500">{itemError}</p>}
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleFormChange}
                                    disabled={isSubmitting || isLoading}
                                    className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:text-white/90 ${errors.status
                                        ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                                        : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                                        }`}
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                {errors.status && <p className="mt-1.5 text-xs text-error-500">{errors.status}</p>}
                            </div>

                            <div>
                                <Label htmlFor="jumlah">Jumlah</Label>
                                <Input
                                    id="jumlah"
                                    name="jumlah"
                                    type="number"
                                    min="1"
                                    value={formData.jumlah}
                                    onChange={handleFormChange}
                                    disabled={isSubmitting || isLoading}
                                    placeholder="Masukkan jumlah"
                                    error={Boolean(errors.jumlah)}
                                    hint={errors.jumlah}
                                />
                            </div>

                            <div>
                                <Label htmlFor="harga_satuan">Harga Satuan</Label>
                                <Input
                                    id="harga_satuan"
                                    name="harga_satuan"
                                    inputMode="numeric"
                                    value={formatRupiahInput(formData.harga_satuan)}
                                    onChange={handleFormChange}
                                    disabled={isSubmitting || isLoading}
                                    placeholder="Pilih barang atau isi harga"
                                    error={Boolean(errors.harga_satuan)}
                                    hint={errors.harga_satuan}
                                />
                            </div>

                            <div>
                                <Label htmlFor="jumlah_bayar">Jumlah Bayar</Label>
                                <Input
                                    id="jumlah_bayar"
                                    name="jumlah_bayar"
                                    inputMode="numeric"
                                    value={formatRupiahInput(formData.jumlah_bayar)}
                                    onChange={handleFormChange}
                                    disabled={isSubmitting || isLoading}
                                    placeholder="Masukkan jumlah bayar"
                                    error={Boolean(errors.jumlah_bayar)}
                                    hint={errors.jumlah_bayar}
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:grid-cols-3">
                            <div>
                                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Total</p>
                                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                                    {formatRupiah(calculation.total_harga)}
                                </p>
                            </div>
                            <div>
                                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Sisa Bayar</p>
                                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                                    {formatRupiah(calculation.sisa_bayar)}
                                </p>
                            </div>
                            <div>
                                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Status</p>
                                <div className="mt-1">
                                    <Badge size="sm" color={getStatusColor(calculation.status)}>
                                        {calculation.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/barang-masuk")}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting || isLoading}>
                                {isSubmitting
                                    ? "Menyimpan..."
                                    : isEdit
                                        ? "Simpan Perubahan"
                                        : "Simpan Transaksi"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default BarangMasukForm;
