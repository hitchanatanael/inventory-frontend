import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { AnggotaDeleteModal, AnggotaFormModal } from "./MasterAnggotaModals";
import {
  createMasterAnggota,
  deleteMasterAnggota,
  getAllMasterAnggota,
  updateMasterAnggota,
} from "../../services/masterAnggotaService";

const emptyForm = {
  nomor_anggota: "",
  nama_anggota: "",
  keterangan: "ANGGOTA",
};

const ENTRIES_PER_PAGE = 20;

function MasterAnggota() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedMember, setSelectedMember] = useState(null);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [toast, setToast] = useState(null);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await getAllMasterAnggota();
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setLoadError(error.message || "Gagal memuat data anggota.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const filteredMembers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return members;

    return members.filter((member) =>
      [
        String(member.nomor_anggota ?? ""),
        String(member.nama_anggota ?? ""),
        String(member.keterangan ?? ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [members, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ENTRIES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ENTRIES_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + ENTRIES_PER_PAGE);
  const showingFrom = filteredMembers.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + ENTRIES_PER_PAGE, filteredMembers.length);

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2500);
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData(emptyForm);
    setSelectedMember(null);
    setErrors({});
    setRequestError("");
  };

  const openEditModal = (member) => {
    setModalMode("edit");
    setSelectedMember(member);
    setFormData({
      nomor_anggota: String(member.nomor_anggota ?? ""),
      nama_anggota: String(member.nama_anggota ?? ""),
      keterangan: member.keterangan || "ANGGOTA",
    });
    setErrors({});
    setRequestError("");
  };

  const openDeleteModal = (member) => {
    setModalMode("delete");
    setSelectedMember(member);
    setRequestError("");
  };

  const closeModal = () => {
    if (isSubmitting || isDeleting) return;

    setModalMode(null);
    setSelectedMember(null);
    setErrors({});
    setRequestError("");
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setRequestError("");
  };

  const validateForm = () => {
    const nextErrors = {};
    const nomorAnggota = formData.nomor_anggota.trim();
    const namaAnggota = formData.nama_anggota.trim();

    if (!nomorAnggota) {
      nextErrors.nomor_anggota = "Nomor anggota wajib diisi.";
    }

    if (!namaAnggota) {
      nextErrors.nama_anggota = "Nama anggota wajib diisi.";
    }

    const duplicate = members.some(
      (member) =>
        String(member.nomor_anggota ?? "") === nomorAnggota &&
        member.id !== selectedMember?.id
    );

    if (duplicate) {
      nextErrors.nomor_anggota = "Nomor anggota sudah digunakan.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    const payload = {
      nomor_anggota: formData.nomor_anggota.trim(),
      nama_anggota: formData.nama_anggota.trim(),
      keterangan: modalMode === "edit" ? formData.keterangan || "ANGGOTA" : "ANGGOTA",
    };

    setIsSubmitting(true);
    setRequestError("");

    try {
      const response =
        modalMode === "add"
          ? await createMasterAnggota(payload)
          : await updateMasterAnggota(selectedMember.id, payload);

      await loadMembers();
      setCurrentPage(1);
      showToast(response.message || "Data anggota berhasil disimpan.");
      setFormData(emptyForm);
      setModalMode(null);
      setSelectedMember(null);
      setErrors({});
    } catch (error) {
      setRequestError(error.message || "Gagal menyimpan data anggota.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || !selectedMember) return;

    setIsDeleting(true);
    setRequestError("");

    try {
      const response = await deleteMasterAnggota(selectedMember.id);
      await loadMembers();
      showToast(response.message || "Data anggota berhasil dihapus.", "error");
      setModalMode(null);
      setSelectedMember(null);
      setErrors({});
    } catch (error) {
      setRequestError(error.message || "Gagal menghapus data anggota.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="5" className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Memuat data anggota...
          </td>
        </tr>
      );
    }

    if (loadError) {
      return (
        <tr>
          <td colSpan="5" className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center gap-3">
              <p className="text-error-600 dark:text-error-500">{loadError}</p>
              <Button size="sm" variant="outline" onClick={loadMembers}>
                Coba Lagi
              </Button>
            </div>
          </td>
        </tr>
      );
    }

    if (paginatedMembers.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            {members.length === 0 ? "Belum ada data anggota." : "Tidak ada anggota yang cocok."}
          </td>
        </tr>
      );
    }

    return paginatedMembers.map((member, index) => (
      <tr key={member.id}>
        <td className="px-5 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
          {startIndex + index + 1}
        </td>
        <td className="px-5 py-4 text-sm text-center font-medium text-gray-800 dark:text-white/90">
          {member.nomor_anggota}
        </td>
        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
          {member.nama_anggota}
        </td>
        <td className="px-5 py-4 text-center">
          <Badge
            size="sm"
            color={member.keterangan === "ANGGOTA" ? "success" : "light"}
          >
            {member.keterangan}
          </Badge>
        </td>
        <td className="px-5 py-4 text-center">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => openEditModal(member)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-white"
              aria-label={`Edit ${member.nama_anggota}`}
            >
              <Edit className="size-4" />
            </button>
            <button
              onClick={() => openDeleteModal(member)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-error-50 hover:text-error-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-500"
              aria-label={`Hapus ${member.nama_anggota}`}
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
        title="Master Anggota | Mandiri Tani Sejahtera"
        description="Kelola data anggota yang digunakan pada transaksi inventory."
      />
      <PageBreadcrumb pageTitle="Master Anggota" />

      {toast && (
        <div className="fixed right-5 top-20 z-99999 w-[calc(100%-2.5rem)] max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 sm:right-6">
          <p className={`text-sm font-medium ${toast.type === "error" ? "text-error-600 dark:text-error-500" : "text-success-600 dark:text-success-500"}`}>
            {toast.message}
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:flex-row lg:items-center lg:justify-between lg:p-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Master Anggota
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola data anggota yang digunakan pada transaksi inventory.
            </p>
          </div>
          <Button
            onClick={openAddModal}
            startIcon={<Plus className="size-5" />}
            className="w-full lg:w-auto"
          >
            Tambah Anggota
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Cari anggota..."
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-y border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    No
                  </th>
                  <th className="px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Nomor Anggota
                  </th>
                  <th className="px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Nama Anggota
                  </th>
                  <th className="px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Keterangan
                  </th>
                  <th className="px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {renderTableBody()}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {showingFrom} to {showingTo} of {filteredMembers.length} entries
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

      <AnggotaFormModal
        isOpen={modalMode === "add" || modalMode === "edit"}
        modalMode={modalMode}
        formData={formData}
        errors={errors}
        requestError={requestError}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />

      <AnggotaDeleteModal
        isOpen={modalMode === "delete"}
        selectedMember={selectedMember}
        requestError={requestError}
        isDeleting={isDeleting}
        onClose={closeModal}
        onDelete={handleDelete}
      />
    </>
  );
}

export default MasterAnggota;
