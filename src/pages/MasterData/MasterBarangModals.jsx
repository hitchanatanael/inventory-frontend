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
  onClose,
  onSubmit,
  onFormChange,
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

        <div className="mt-6 grid grid-cols-1 gap-5">
          <div>
            <Label htmlFor="kode_barang">Kode Barang</Label>
            <Input
              id="kode_barang"
              name="kode_barang"
              value={formData.kode_barang}
              onChange={onFormChange}
              placeholder="Masukkan kode barang"
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
              error={Boolean(errors.nama_barang)}
              hint={errors.nama_barang}
            />
          </div>
          <div>
            <Label htmlFor="satuan">Satuan</Label>
            <Input
              id="satuan"
              name="satuan"
              value={formData.satuan}
              onChange={onFormChange}
              placeholder="Contoh: Zak, Liter"
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
              error={Boolean(errors.harga_satuan)}
              hint={errors.harga_satuan}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">
            {modalMode === "add" ? "Simpan Barang" : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function BarangDeleteModal({ isOpen, selectedItem, onClose, onDelete }) {
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
          Data <span className="font-medium text-gray-800 dark:text-white/90">{selectedItem?.nama_barang}</span> akan dihapus dari daftar lokal.
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

export { BarangDeleteModal, BarangFormModal };
