import { useMemo, useState } from "react";
import {
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { BarangMasukDeleteModal, BarangMasukFormModal } from "./BarangMasukModals";

const items = [
  {
    id: 1,
    kode_barang: "GRN26-50P-1",
    nama_barang: "NPK Granular 13-8.27 @50kg",
    satuan: "zak",
    harga_modal: 410000,
  },
  {
    id: 2,
    kode_barang: "DLM26-50P-1",
    nama_barang: "Dolomite Gallata M-100 @50kg",
    satuan: "zak",
    harga_modal: 45500,
  },
  {
    id: 3,
    kode_barang: "KCL26-50P-1",
    nama_barang: "Kcl Mahkota Ex Canada @50kg",
    satuan: "zak",
    harga_modal: 350000,
  },
  {
    id: 4,
    kode_barang: "SSM26-50P-1",
    nama_barang: "SS Meroke Ammophos @50kg",
    satuan: "zak",
    harga_modal: 580000,
  },
  {
    id: 5,
    kode_barang: "UREA26-50P-1",
    nama_barang: "Pupuk Urea @50kg",
    satuan: "zak",
    harga_modal: 250000,
  },
];

const locations = [
  {
    id: 1,
    nama_lokasi: "Pusat",
  },
  {
    id: 2,
    nama_lokasi: "Suban",
  },
];

const emptyForm = {
  tanggal: "",
  id_master_barang: "",
  id_lokasi: "",
  jumlah: "",
  jumlah_bayar: "",
  harga_modal: "",
  barang_sampai: "",
};

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const getStatus = (total, paid, hasArrived) => {
  if (!hasArrived) return "LOAN";
  if (paid >= total) return "LUNAS";
  return "PIUTANG";
};

const getStatusColor = (status) => {
  if (status === "LUNAS") return "success";
  if (status === "PIUTANG") return "warning";
  return "info";
};

const buildTransaction = (payload, id = Date.now()) => {
  const item = items.find((product) => product.id === Number(payload.id_master_barang));
  const location = locations.find((locationItem) => locationItem.id === Number(payload.id_lokasi));
  const jumlah = Number(payload.jumlah) || 0;
  const jumlahBayar = Number(payload.jumlah_bayar) || 0;
  const hargaModal = Number(payload.harga_modal) || 0;
  const barangSampai = payload.barang_sampai === "SUDAH";
  const totalHarga = jumlah * hargaModal;
  const sisaBayar = Math.max(totalHarga - jumlahBayar, 0);

  return {
    id,
    tanggal: payload.tanggal,
    id_master_barang: item?.id || "",
    kode_barang: item?.kode_barang || "",
    nama_barang: item?.nama_barang || "",
    satuan: item?.satuan || "",
    id_lokasi: location?.id || "",
    nama_lokasi: location?.nama_lokasi || "",
    jumlah,
    total_harga_jual: totalHarga,
    jumlah_bayar: jumlahBayar,
    sisa_bayar: sisaBayar,
    harga_modal: hargaModal,
    barang_sampai: payload.barang_sampai,
    status: getStatus(totalHarga, jumlahBayar, barangSampai),
  };
};

const initialTransactions = [
  buildTransaction(
    {
      tanggal: "2026-05-01",
      id_master_barang: 1,
      id_lokasi: 1,
      jumlah: 15,
      jumlah_bayar: 6150000,
      harga_modal: 410000,
      barang_sampai: "SUDAH",
    },
    1
  ),
  buildTransaction(
    {
      tanggal: "2026-05-01",
      id_master_barang: 2,
      id_lokasi: 1,
      jumlah: 1075,
      jumlah_bayar: 48912500,
      harga_modal: 45500,
      barang_sampai: "SUDAH",
    },
    2
  ),
  buildTransaction(
    {
      tanggal: "2026-05-01",
      id_master_barang: 3,
      id_lokasi: 1,
      jumlah: 154,
      jumlah_bayar: 53900000,
      harga_modal: 350000,
      barang_sampai: "SUDAH",
    },
    3
  ),
  buildTransaction(
    {
      tanggal: "2026-05-01",
      id_master_barang: 4,
      id_lokasi: 1,
      jumlah: 105,
      jumlah_bayar: 60900000,
      harga_modal: 580000,
      barang_sampai: "SUDAH",
    },
    4
  ),
];

function BarangMasuk() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const calculation = useMemo(() => {
    const jumlah = Number(formData.jumlah) || 0;
    const jumlahBayar = Number(formData.jumlah_bayar) || 0;
    const hargaModal = Number(formData.harga_modal) || 0;
    const total = jumlah * hargaModal;
    const sisa = Math.max(total - jumlahBayar, 0);
    const barangSampai = formData.barang_sampai === "SUDAH";

    return {
      total_harga_jual: total,
      sisa_bayar: sisa,
      status: getStatus(total, jumlahBayar, barangSampai),
    };
  }, [formData]);

  const filteredTransactions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesKeyword =
        !keyword ||
        [
          transaction.tanggal,
          transaction.kode_barang,
          transaction.nama_barang,
          transaction.satuan,
          transaction.nama_lokasi,
          transaction.status,
          formatRupiah(transaction.total_harga_jual),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const matchesStatus =
        statusFilter === "ALL" || transaction.status === statusFilter;
      const matchesLocation =
        locationFilter === "ALL" ||
        transaction.id_lokasi === Number(locationFilter);

      return matchesKeyword && matchesStatus && matchesLocation;
    });
  }, [locationFilter, searchTerm, statusFilter, transactions]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * entriesPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const showingFrom = filteredTransactions.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + entriesPerPage, filteredTransactions.length);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2500);
  };

  const resetFiltersPage = () => {
    setCurrentPage(1);
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      ...emptyForm,
      tanggal: new Date().toISOString().slice(0, 10),
    });
    setSelectedTransaction(null);
    setErrors({});
  };

  const openEditModal = (transaction) => {
    setModalMode("edit");
    setSelectedTransaction(transaction);
    setFormData({
      tanggal: transaction.tanggal,
      id_master_barang: String(transaction.id_master_barang),
      id_lokasi: String(transaction.id_lokasi),
      jumlah: String(transaction.jumlah),
      jumlah_bayar: String(transaction.jumlah_bayar),
      harga_modal: String(transaction.harga_modal),
      barang_sampai: transaction.barang_sampai || "SUDAH",
    });
    setErrors({});
  };

  const openDeleteModal = (transaction) => {
    setSelectedTransaction(transaction);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedTransaction(null);
    setErrors({});
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    if (name === "id_master_barang") {
      const selectedItem = items.find((item) => item.id === Number(value));
      setFormData((current) => ({
        ...current,
        id_master_barang: value,
        harga_modal: selectedItem ? String(selectedItem.harga_modal) : "",
      }));
      setErrors((current) => ({
        ...current,
        id_master_barang: "",
        harga_modal: "",
      }));
      return;
    }

    if (name === "jumlah_bayar") {
      setFormData((current) => ({ ...current, [name]: value.replace(/\D/g, "") }));
      setErrors((current) => ({ ...current, [name]: "" }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const jumlah = Number(formData.jumlah);
    const hargaModal = Number(formData.harga_modal);
    const jumlahBayar = Number(formData.jumlah_bayar);
    const total = jumlah * hargaModal;

    if (!formData.tanggal) nextErrors.tanggal = "Tanggal wajib diisi.";
    if (!formData.id_master_barang) nextErrors.id_master_barang = "Barang wajib dipilih.";
    if (!formData.id_lokasi) nextErrors.id_lokasi = "Lokasi wajib dipilih.";
    if (!formData.barang_sampai) nextErrors.barang_sampai = "Status kedatangan wajib dipilih.";

    if (!formData.jumlah) {
      nextErrors.jumlah = "Jumlah wajib diisi.";
    } else if (!Number.isFinite(jumlah) || jumlah <= 0) {
      nextErrors.jumlah = "Jumlah harus lebih dari 0.";
    }

    if (formData.harga_modal === "") {
      nextErrors.harga_modal = "Harga modal wajib diisi.";
    } else if (!Number.isFinite(hargaModal) || hargaModal < 0) {
      nextErrors.harga_modal = "Harga modal tidak boleh negatif.";
    }

    if (formData.jumlah_bayar === "") {
      nextErrors.jumlah_bayar = "Jumlah bayar wajib diisi.";
    } else if (!Number.isFinite(jumlahBayar) || jumlahBayar < 0) {
      nextErrors.jumlah_bayar = "Jumlah bayar tidak boleh negatif.";
    } else if (Number.isFinite(total) && jumlahBayar > total) {
      nextErrors.jumlah_bayar = "Jumlah bayar tidak boleh melebihi total.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    if (modalMode === "add") {
      setTransactions((current) => [buildTransaction(formData), ...current]);
      setCurrentPage(1);
      showToast("Transaksi barang masuk berhasil ditambahkan.");
    }

    if (modalMode === "edit") {
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === selectedTransaction.id
            ? buildTransaction(formData, selectedTransaction.id)
            : transaction
        )
      );
      showToast("Transaksi barang masuk berhasil diperbarui.");
    }

    closeModal();
  };

  const handleDelete = () => {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== selectedTransaction.id)
    );
    showToast("Transaksi barang masuk berhasil dihapus.", "error");
    closeModal();
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta
        title="Barang Masuk | Mandiri Tani Sejahtera"
        description="Kelola transaksi barang masuk inventory pupuk."
      />
      <PageBreadcrumb pageTitle="Barang Masuk" />

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
              Barang Masuk
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola transaksi barang masuk untuk inventory pupuk.
            </p>
          </div>
          <Button
            onClick={openAddModal}
            startIcon={<Plus className="size-5" />}
            className="w-full lg:w-auto"
          >
            Tambah Transaksi
          </Button>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-4 border-b border-gray-100 p-5 dark:border-gray-800 lg:grid-cols-[auto_180px_200px_minmax(240px,320px)] lg:items-center lg:justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              Show
              <select
                value={entriesPerPage}
                onChange={(event) => {
                  setEntriesPerPage(Number(event.target.value));
                  resetFiltersPage();
                }}
                className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              entries
            </label>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                resetFiltersPage();
              }}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="ALL">Semua Status</option>
              <option value="LUNAS">LUNAS</option>
              <option value="PIUTANG">PIUTANG</option>
              <option value="LOAN">LOAN</option>
            </select>

            <select
              value={locationFilter}
              onChange={(event) => {
                setLocationFilter(event.target.value);
                resetFiltersPage();
              }}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="ALL">Semua Lokasi</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.nama_lokasi}
                </option>
              ))}
            </select>

            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  resetFiltersPage();
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
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Tanggal
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Kode Barang
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Nama Barang
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    TP
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Satuan
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Jumlah Masuk
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Harga Modal
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Total Harga
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Jumlah Bayar
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Sisa Bayar
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Transaksi
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-center text-gray-700 dark:text-gray-300">
                        {formatDate(transaction.tanggal)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-center font-medium text-gray-800 dark:text-white/90">
                        {transaction.kode_barang}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {transaction.nama_barang}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                        {transaction.nama_lokasi}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-center text-gray-700 dark:text-gray-300">
                        {transaction.satuan}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-center text-gray-700 dark:text-gray-300">
                        {transaction.jumlah}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-center font-medium text-gray-800 dark:text-white/90">
                        {formatRupiah(transaction.harga_modal)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-center font-medium text-gray-800 dark:text-white/90">
                        {formatRupiah(transaction.total_harga_jual)}
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
                            {transaction.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(transaction)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-white"
                            aria-label={`Edit ${transaction.nama_barang}`}
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(transaction)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-error-50 hover:text-error-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-500"
                            aria-label={`Hapus ${transaction.nama_barang}`}
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
                      colSpan="12"
                      className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada transaksi barang masuk yang cocok.
                    </td>
                  </tr>
                )}
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

      <BarangMasukFormModal
        isOpen={modalMode === "add" || modalMode === "edit"}
        modalMode={modalMode}
        formData={formData}
        errors={errors}
        calculation={calculation}
        items={items}
        locations={locations}
        formatRupiah={formatRupiah}
        getStatusColor={getStatusColor}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />

      <BarangMasukDeleteModal
        isOpen={modalMode === "delete"}
        selectedTransaction={selectedTransaction}
        onClose={closeModal}
        onDelete={handleDelete}
      />
    </>
  );
}

export default BarangMasuk;
