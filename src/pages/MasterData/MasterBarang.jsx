import { useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { BarangDeleteModal, BarangFormModal } from "./MasterBarangModals";

const initialItems = [
  {
    id: 1,
    kode_barang: "UREA-001",
    nama_barang: "Pupuk Urea",
    satuan: "Zak",
    harga_satuan: 265000,
  },
  {
    id: 2,
    kode_barang: "NPK-001",
    nama_barang: "NPK Phonska",
    satuan: "Zak",
    harga_satuan: 295000,
  },
  {
    id: 3,
    kode_barang: "ZA-001",
    nama_barang: "Pupuk ZA",
    satuan: "Zak",
    harga_satuan: 210000,
  },
  {
    id: 4,
    kode_barang: "SP36-001",
    nama_barang: "Pupuk SP-36",
    satuan: "Zak",
    harga_satuan: 240000,
  },
  {
    id: 5,
    kode_barang: "HERB-001",
    nama_barang: "Herbisida",
    satuan: "Liter",
    harga_satuan: 85000,
  },
];

const emptyForm = {
  kode_barang: "",
  nama_barang: "",
  satuan: "",
  harga_satuan: "",
};

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function MasterBarang() {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedItem, setSelectedItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) =>
      [
        item.kode_barang,
        item.nama_barang,
        item.satuan,
        formatRupiah(item.harga_satuan),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [items, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * entriesPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + entriesPerPage);
  const showingFrom = filteredItems.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + entriesPerPage, filteredItems.length);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2500);
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData(emptyForm);
    setSelectedItem(null);
    setErrors({});
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      satuan: item.satuan,
      harga_satuan: String(item.harga_satuan),
    });
    setErrors({});
  };

  const openDeleteModal = (item) => {
    setModalMode("delete");
    setSelectedItem(item);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedItem(null);
    setErrors({});
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleEntriesChange = (event) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    if (name === "harga_satuan") {
      setFormData((current) => ({ ...current, [name]: value.replace(/\D/g, "") }));
      setErrors((current) => ({ ...current, [name]: "" }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const kodeBarang = formData.kode_barang.trim();
    const namaBarang = formData.nama_barang.trim();
    const satuan = formData.satuan.trim();
    const hargaSatuan = Number(formData.harga_satuan);

    if (!kodeBarang) {
      nextErrors.kode_barang = "Kode barang wajib diisi.";
    }

    if (!namaBarang) {
      nextErrors.nama_barang = "Nama barang wajib diisi.";
    }

    if (!satuan) {
      nextErrors.satuan = "Satuan wajib diisi.";
    }

    if (!formData.harga_satuan) {
      nextErrors.harga_satuan = "Harga satuan wajib diisi.";
    } else if (!Number.isFinite(hargaSatuan) || hargaSatuan <= 0) {
      nextErrors.harga_satuan = "Harga satuan harus lebih dari 0.";
    }

    const duplicate = items.some(
      (item) =>
        item.kode_barang.toLowerCase() === kodeBarang.toLowerCase() &&
        item.id !== selectedItem?.id
    );

    if (duplicate) {
      nextErrors.kode_barang = "Kode barang sudah digunakan.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      kode_barang: formData.kode_barang.trim(),
      nama_barang: formData.nama_barang.trim(),
      satuan: formData.satuan.trim(),
      harga_satuan: Number(formData.harga_satuan),
    };

    if (modalMode === "add") {
      setItems((current) => [{ id: Date.now(), ...payload }, ...current]);
      setCurrentPage(1);
      showToast("Barang berhasil ditambahkan.");
    }

    if (modalMode === "edit") {
      setItems((current) =>
        current.map((item) =>
          item.id === selectedItem.id ? { ...item, ...payload } : item
        )
      );
      showToast("Data barang berhasil diperbarui.");
    }

    closeModal();
  };

  const handleDelete = () => {
    setItems((current) => current.filter((item) => item.id !== selectedItem.id));
    showToast("Data barang berhasil dihapus.", "error");
    closeModal();
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta
        title="Master Barang | Mandiri Tani Sejahtera"
        description="Kelola data barang yang digunakan pada transaksi inventory."
      />
      <PageBreadcrumb pageTitle="Master Barang" />

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
              Master Barang
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola data barang yang digunakan pada transaksi inventory.
            </p>
          </div>
          <Button
            onClick={openAddModal}
            startIcon={<Plus className="size-5" />}
            className="w-full lg:w-auto"
          >
            Tambah Barang
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              Show
              <select
                value={entriesPerPage}
                onChange={handleEntriesChange}
                className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              entries
            </label>

            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Cari barang..."
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
                    Kode Barang
                  </th>
                  <th className="px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Nama Barang
                  </th>
                  <th className="px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Satuan
                  </th>
                  <th className="px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Harga Satuan
                  </th>
                  <th className="px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-5 py-4 text-sm text-center font-medium text-gray-800 dark:text-white/90">
                        {item.kode_barang}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {item.nama_barang}
                      </td>
                      <td className="px-5 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                        {item.satuan}
                      </td>
                      <td className="px-5 py-4 text-sm text-center font-medium text-gray-800 dark:text-white/90">
                        {formatRupiah(item.harga_satuan)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-white"
                            aria-label={`Edit ${item.nama_barang}`}
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-error-50 hover:text-error-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-500"
                            aria-label={`Hapus ${item.nama_barang}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data barang yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {showingFrom} to {showingTo} of {filteredItems.length} entries
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

      <BarangFormModal
        isOpen={modalMode === "add" || modalMode === "edit"}
        modalMode={modalMode}
        formData={formData}
        errors={errors}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />

      <BarangDeleteModal
        isOpen={modalMode === "delete"}
        selectedItem={selectedItem}
        onClose={closeModal}
        onDelete={handleDelete}
      />
    </>
  );
}

export default MasterBarang;
