import { Trash2, UsersRound } from "lucide-react";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";

function AnggotaFormModal({
    isOpen,
    modalMode,
    formData,
    errors,
    requestError,
    isSubmitting = false,
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
                        <UsersRound className="size-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                        {modalMode === "add" ? "Tambah Anggota" : "Edit Anggota"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Isi data anggota untuk kebutuhan transaksi inventory.
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5">
                    <div>
                        <Label htmlFor="nomor_anggota">Nomor Anggota</Label>
                        <Input
                            id="nomor_anggota"
                            name="nomor_anggota"
                            value={formData.nomor_anggota}
                            onChange={onFormChange}
                            placeholder="Masukkan nomor anggota"
                            error={Boolean(errors.nomor_anggota)}
                            hint={errors.nomor_anggota}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <Label htmlFor="nama_anggota">Nama Anggota</Label>
                        <Input
                            id="nama_anggota"
                            name="nama_anggota"
                            value={formData.nama_anggota}
                            onChange={onFormChange}
                            placeholder="Masukkan nama anggota"
                            error={Boolean(errors.nama_anggota)}
                            hint={errors.nama_anggota}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <Label htmlFor="keterangan">Status Anggota</Label>
                        <Input
                            id="keterangan"
                            name="keterangan"
                            value="ANGGOTA"
                            disabled
                        />
                    </div>
                </div>

                {requestError && (
                    <p className="mt-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-500">
                        {requestError}
                    </p>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Menyimpan..." : modalMode === "add" ? "Simpan Anggota" : "Simpan Perubahan"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

function AnggotaDeleteModal({
    isOpen,
    selectedMember,
    requestError,
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
                    Hapus Anggota?
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Data <span className="font-medium text-gray-800 dark:text-white/90">{selectedMember?.nama_anggota}</span> akan dihapus.
                </p>
            </div>

            {requestError && (
                <p className="mt-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-500">
                    {requestError}
                </p>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                    Batal
                </Button>
                <Button
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="bg-error-500 hover:bg-error-600 disabled:bg-error-300"
                >
                    {isDeleting ? "Menghapus..." : "Hapus"}
                </Button>
            </div>
        </Modal>
    );
}

export { AnggotaDeleteModal, AnggotaFormModal };
