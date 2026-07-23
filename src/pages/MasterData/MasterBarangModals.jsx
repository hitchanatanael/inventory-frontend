import { Boxes, Trash2 } from "lucide-react";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";

const formatRupiahInput = (value) => {
    const numberValue = Number(String(value).replace(/\D/g, ""));
    if (!numberValue) return "";

    return `Rp ${new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
    }).format(numberValue)}`;
};

function BarangFormModal({
    isOpen,
    modalMode,
    formData,
    errors,
    requestError = "",
    locations = [],
    isLoadingLocations = false,
    locationError = "",
    isSubmitting = false,
    onClose,
    onSubmit,
    onFormChange,
    onRetryLocations,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[640px] p-5 lg:p-8"
        >
            <form onSubmit={onSubmit}>
                <div className="pr-12">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                        <Boxes className="size-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                        {modalMode === "add" ? "Tambah Barang" : "Edit Barang"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Isi data barang untuk kebutuhan transaksi inventory.
                    </p>
                </div>

                {requestError && (
                    <div className="mt-6 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                        {requestError}
                    </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-5">
                    <div>
                        <Label htmlFor="kode_barang">Kode Barang</Label>
                        <Input
                            id="kode_barang"
                            name="kode_barang"
                            value={formData.kode_barang}
                            onChange={onFormChange}
                            placeholder="Masukkan kode barang"
                            disabled={isSubmitting}
                            error={Boolean(errors.kode_barang)}
                            hint={errors.kode_barang}
                        />
                    </div>
                    <div>
                        <Label htmlFor="nama_barang">Nama Barang</Label>
                        <Input
                            id="nama_barang"
                            name="nama_barang"
                            value={formData.nama_barang}
                            onChange={onFormChange}
                            placeholder="Masukkan nama barang"
                            disabled={isSubmitting}
                            error={Boolean(errors.nama_barang)}
                            hint={errors.nama_barang}
                        />
                    </div>
                    <div>
                        <Label htmlFor="id_lokasi">TP</Label>
                        <select
                            id="id_lokasi"
                            name="id_lokasi"
                            value={formData.id_lokasi}
                            onChange={onFormChange}
                            disabled={isSubmitting || isLoadingLocations}
                            className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${errors.id_lokasi
                                    ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500"
                                    : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                                } ${isSubmitting || isLoadingLocations
                                    ? "cursor-not-allowed bg-gray-100 opacity-40 dark:bg-gray-800"
                                    : ""
                                }`}
                        >
                            <option value="">
                                {isLoadingLocations ? "Memuat lokasi..." : "Pilih TP"}
                            </option>
                            {locations.map((location) => (
                                <option key={location.id} value={String(location.id)}>
                                    {location.nama_lokasi}
                                </option>
                            ))}
                        </select>
                        {errors.id_lokasi && (
                            <p className="mt-1.5 text-xs text-error-500">{errors.id_lokasi}</p>
                        )}
                        {locationError && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-error-500">
                                <span>{locationError}</span>
                                <button
                                    type="button"
                                    onClick={onRetryLocations}
                                    className="font-medium text-brand-500 hover:text-brand-600"
                                    disabled={isLoadingLocations}
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="satuan">Satuan</Label>
                        <Input
                            id="satuan"
                            name="satuan"
                            value={formData.satuan}
                            onChange={onFormChange}
                            placeholder="Contoh: Zak, Liter"
                            disabled={isSubmitting}
                            error={Boolean(errors.satuan)}
                            hint={errors.satuan}
                        />
                    </div>
                    <div>
                        <Label htmlFor="harga_satuan">Harga Satuan</Label>
                        <Input
                            id="harga_satuan"
                            name="harga_satuan"
                            inputMode="numeric"
                            value={formatRupiahInput(formData.harga_satuan)}
                            onChange={onFormChange}
                            placeholder="Rp 0"
                            disabled={isSubmitting}
                            error={Boolean(errors.harga_satuan)}
                            hint={errors.harga_satuan}
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isLoadingLocations}>
                        {isSubmitting ? "Menyimpan..." : modalMode === "add" ? "Simpan Barang" : "Simpan Perubahan"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

function BarangDeleteModal({
    isOpen,
    selectedItem,
    requestError = "",
    isDeleting = false,
    onClose,
    onDelete,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[440px] p-5 lg:p-8"
        >
            <div className="pr-12">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500">
                    <Trash2 className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    Hapus Barang?
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Data <span className="font-medium text-gray-800 dark:text-white/90">{selectedItem?.kode_barang} - {selectedItem?.nama_barang}</span> akan dihapus dari database.
                </p>
            </div>

            {requestError && (
                <div className="mt-6 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                    {requestError}
                </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                    Batal
                </Button>
                <Button
                    onClick={onDelete}
                    className="bg-error-500 hover:bg-error-600 disabled:bg-error-300"
                    disabled={isDeleting}
                >
                    {isDeleting ? "Menghapus..." : "Hapus"}
                </Button>
            </div>
        </Modal>
    );
}

export { BarangDeleteModal, BarangFormModal };
