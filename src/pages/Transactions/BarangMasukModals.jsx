import { PackagePlus, Trash2 } from "lucide-react";
import Badge from "../../components/ui/badge/Badge";
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

function BarangMasukFormModal({
  isOpen,
  modalMode,
  formData,
  errors,
  calculation,
  items,
  locations,
  formatRupiah,
  getStatusColor,
  onClose,
  onSubmit,
  onFormChange,
}) {
  const renderSelectError = (name) =>
    errors[name] && <p className="mt-1.5 text-xs text-error-500">{errors[name]}</p>;

  const openDatePicker = (event) => {
    try {
      event.currentTarget.showPicker?.();
    } catch {
      // Some browsers only allow showPicker during direct pointer activation.
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[760px] p-5 lg:p-8"
    >
      <form onSubmit={onSubmit}>
        <div className="pr-12">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
            <PackagePlus className="size-6" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {modalMode === "add" ? "Tambah Barang Masuk" : "Edit Barang Masuk"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Isi data transaksi dan total pembayaran akan dihitung otomatis.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              name="tanggal"
              type="date"
              value={formData.tanggal}
              onChange={onFormChange}
              onClick={openDatePicker}
              onFocus={openDatePicker}
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
              onChange={onFormChange}
              className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${errors.id_lokasi
                ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                }`}
            >
              <option value="">Pilih lokasi</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.nama_lokasi}
                </option>
              ))}
            </select>
            {renderSelectError("id_lokasi")}
          </div>
          <div>
            <Label htmlFor="id_master_barang">Barang</Label>
            <select
              id="id_master_barang"
              name="id_master_barang"
              value={formData.id_master_barang}
              onChange={onFormChange}
              className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${errors.id_master_barang
                ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                }`}
            >
              <option value="">Pilih barang</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_barang} - {item.kode_barang}
                </option>
              ))}
            </select>
            {renderSelectError("id_master_barang")}
          </div>
          <div>
            <Label htmlFor="barang_sampai">Kedatangan Barang</Label>
            <select
              id="barang_sampai"
              name="barang_sampai"
              value={formData.barang_sampai}
              onChange={onFormChange}
              className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${errors.barang_sampai
                ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                }`}
            >
              <option value="">Pilih status kedatangan</option>
              <option value="SUDAH">Sudah Sampai</option>
              <option value="BELUM">Belum Sampai</option>
            </select>
            {renderSelectError("barang_sampai")}
          </div>
          <div>
            <Label htmlFor="jumlah">Jumlah</Label>
            <Input
              id="jumlah"
              name="jumlah"
              type="number"
              min="0"
              value={formData.jumlah}
              onChange={onFormChange}
              placeholder="Masukkan jumlah"
              error={Boolean(errors.jumlah)}
              hint={errors.jumlah}
            />
          </div>
          <div>
            <Label htmlFor="harga_modal">Harga Modal</Label>
            <Input
              id="harga_modal"
              name="harga_modal"
              value={formatRupiahInput(formData.harga_modal)}
              readOnly
              placeholder="Pilih barang terlebih dahulu"
              error={Boolean(errors.harga_modal)}
              hint={errors.harga_modal}
            />
          </div>
          <div>
            <Label htmlFor="jumlah_bayar">Jumlah Bayar</Label>
            <Input
              id="jumlah_bayar"
              name="jumlah_bayar"
              inputMode="numeric"
              value={formatRupiahInput(formData.jumlah_bayar)}
              onChange={onFormChange}
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
              {formatRupiah(calculation.total_harga_jual)}
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
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">
            {modalMode === "add" ? "Simpan Transaksi" : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function BarangMasukDeleteModal({ isOpen, selectedTransaction, onClose, onDelete }) {
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
          Hapus Transaksi?
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Transaksi <span className="font-medium text-gray-800 dark:text-white/90">{selectedTransaction?.nama_barang}</span> akan dihapus dari daftar lokal.
        </p>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button
          onClick={onDelete}
          className="bg-error-500 hover:bg-error-600 disabled:bg-error-300"
        >
          Hapus
        </Button>
      </div>
    </Modal>
  );
}

export { BarangMasukDeleteModal, BarangMasukFormModal };
