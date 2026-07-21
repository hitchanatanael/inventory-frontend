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
import { BarangKeluarDeleteModal, BarangKeluarFormModal } from "./BarangKeluarModals";

const members = [
  { id: 1, nomor_anggota: "17039.100.0000.498", nama_anggota: "Budi Santoso" },
  { id: 2, nomor_anggota: "17039.100.0001.042", nama_anggota: "Siti Aminah" },
  { id: 3, nomor_anggota: "17039.100.0001.045", nama_anggota: "Joko Prasetyo" },
  { id: 4, nomor_anggota: "17039.100.0001.209", nama_anggota: "Maria Lestari" },
  { id: 5, nomor_anggota: "17039.100.0001.210", nama_anggota: "Ahmad Fauzi" },
  { id: 6, nomor_anggota: "17039.100.0001.380", nama_anggota: "Rina Marlina" },
];

const items = [
  {
    id: 1,
    kode_barang: "GRN26-50P-1",
    nama_barang: "NPK Granular 13-8.27 @50kg",
    satuan: "zak",
    harga_modal: 410000,
    harga_jual: 439500,
  },
  {
    id: 2,
    kode_barang: "DLM26-50P-1",
    nama_barang: "Dolomite Gallata M-100 @50kg",
    satuan: "zak",
    harga_modal: 45500,
    harga_jual: 49500,
  },
  {
    id: 3,
    kode_barang: "KCL26-50P-1",
    nama_barang: "Kcl Mahkota Ex Canada @50kg",
    satuan: "zak",
    harga_modal: 350000,
    harga_jual: 377000,
  },
  {
    id: 4,
    kode_barang: "SSM26-50P-1",
    nama_barang: "SS Meroke Ammophos @50kg",
    satuan: "zak",
    harga_modal: 580000,
    harga_jual: 607000,
  },
  {
    id: 5,
    kode_barang: "UREA26-50P-1",
    nama_barang: "Pupuk Urea @50kg",
    satuan: "zak",
    harga_modal: 250000,
    harga_jual: 265000,
  },
];

const locations = [
  { id: 1, nama_lokasi: "Pusat" },
  { id: 2, nama_lokasi: "Suban" },
];

const emptyForm = {
  tanggal: "",
  id_master_anggota: "",
  id_master_barang: "",
  id_lokasi: "",
  jumlah: "",
  harga_jual: "",
  jumlah_bayar: "",
  harga_modal: "",
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

const getStatus = (total, paid) => {
  if (paid >= total) return "LUNAS";
  if (paid > 0) return "BELUM LUNAS";
  return "BELUM BAYAR";
};

const getStatusColor = (status) => {
  if (status === "LUNAS") return "success";
  if (status === "BELUM LUNAS") return "warning";
  return "error";
};

const buildTransaction = (payload, id = Date.now()) => {
  const member = members.find((memberItem) => memberItem.id === Number(payload.id_master_anggota));
  const item = items.find((product) => product.id === Number(payload.id_master_barang));
  const location = locations.find((locationItem) => locationItem.id === Number(payload.id_lokasi));
  const jumlah = Number(payload.jumlah) || 0;
  const hargaJual = Number(payload.harga_jual) || 0;
  const jumlahBayar = Number(payload.jumlah_bayar) || 0;
  const hargaModal = Number(payload.harga_modal) || 0;
  const totalHargaJual = jumlah * hargaJual;
  const sisaBayar = Math.max(totalHargaJual - jumlahBayar, 0);

  return {
    id,
    tanggal: payload.tanggal,
    id_master_anggota: member?.id || "",
    nomor_anggota: member?.nomor_anggota || "",
    nama_anggota: member?.nama_anggota || "",
    id_master_barang: item?.id || "",
    kode_barang: item?.kode_barang || "",
    nama_barang: item?.nama_barang || "",
    satuan: item?.satuan || "",
    id_lokasi: location?.id || "",
    nama_lokasi: location?.nama_lokasi || "",
    jumlah,
    harga_jual: hargaJual,
    total_harga_jual: totalHargaJual,
    jumlah_bayar: jumlahBayar,
    sisa_bayar: sisaBayar,
    harga_modal: hargaModal,
    margin: (hargaJual - hargaModal) * jumlah,
    status: getStatus(totalHargaJual, jumlahBayar),
  };
};

const initialTransactions = [
  buildTransaction(
    {
      tanggal: "2026-05-03",
      id_master_anggota: 1,
      id_master_barang: 1,
      id_lokasi: 1,
      jumlah: 8,
      harga_jual: 439500,
      jumlah_bayar: 3516000,
      harga_modal: 410000,
    },
    1
  ),
  buildTransaction(
    {
      tanggal: "2026-05-04",
      id_master_anggota: 2,
      id_master_barang: 2,
      id_lokasi: 1,
      jumlah: 25,
      harga_jual: 49500,
      jumlah_bayar: 750000,
      harga_modal: 45500,
    },
    2
  ),
  buildTransaction(
    {
      tanggal: "2026-05-05",
      id_master_anggota: 3,
      id_master_barang: 3,
      id_lokasi: 2,
      jumlah: 12,
      harga_jual: 377000,
      jumlah_bayar: 0,
      harga_modal: 350000,
    },
    3
  ),
  buildTransaction(
    {
      tanggal: "2026-05-06",
      id_master_anggota: 4,
      id_master_barang: 4,
      id_lokasi: 2,
      jumlah: 6,
      harga_jual: 607000,
      jumlah_bayar: 3642000,
      harga_modal: 580000,
    },
    4
  ),
];

function BarangKeluar() {
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
    const hargaJual = Number(formData.harga_jual) || 0;
    const jumlahBayar = Number(formData.jumlah_bayar) || 0;
    const hargaModal = Number(formData.harga_modal) || 0;
    const total = jumlah * hargaJual;
    const sisa = Math.max(total - jumlahBayar, 0);

    return {
      total_harga_jual: total,
      sisa_bayar: sisa,
      margin: (hargaJual - hargaModal) * jumlah,
      status: getStatus(total, jumlahBayar),
    };
  }, [formData]);

  const filteredTransactions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesKeyword =
        !keyword ||
        [
          transaction.tanggal,
          transaction.nomor_anggota,
          transaction.nama_anggota,
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
      id_master_anggota: String(transaction.id_master_anggota),
      id_master_barang: String(transaction.id_master_barang),
      id_lokasi: String(transaction.id_lokasi),
      jumlah: String(transaction.jumlah),
      harga_jual: String(transaction.harga_jual),
      jumlah_bayar: String(transaction.jumlah_bayar),
      harga_modal: String(transaction.harga_modal),
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
        harga_jual: selectedItem ? String(selectedItem.harga_jual) : "",
        harga_modal: selectedItem ? String(selectedItem.harga_modal) : "",
      }));
      setErrors((current) => ({
        ...current,
        id_master_barang: "",
        harga_jual: "",
        harga_modal: "",
      }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const jumlah = Number(formData.jumlah);
    const hargaJual = Number(formData.harga_jual);
    const hargaModal = Number(formData.harga_modal);
    const jumlahBayar = Number(formData.jumlah_bayar);
    const total = jumlah * hargaJual;

    if (!formData.tanggal) nextErrors.tanggal = "Tanggal wajib diisi.";
    if (!formData.id_master_anggota) nextErrors.id_master_anggota = "Anggota wajib dipilih.";
    if (!formData.id_master_barang) nextErrors.id_master_barang = "Barang wajib dipilih.";
    if (!formData.id_lokasi) nextErrors.id_lokasi = "Lokasi wajib dipilih.";

    if (!formData.jumlah) {
      nextErrors.jumlah = "Jumlah wajib diisi.";
    } else if (!Number.isFinite(jumlah) || jumlah <= 0) {
      nextErrors.jumlah = "Jumlah harus lebih dari 0.";
    }

    if (!formData.harga_jual) {
      nextErrors.harga_jual = "Harga jual wajib diisi.";
    } else if (!Number.isFinite(hargaJual) || hargaJual <= 0) {
      nextErrors.harga_jual = "Harga jual harus lebih dari 0.";
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
      showToast("Transaksi barang keluar berhasil ditambahkan.");
    }

    if (modalMode === "edit") {
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === selectedTransaction.id
            ? buildTransaction(formData, selectedTransaction.id)
            : transaction
        )
      );
      showToast("Transaksi barang keluar berhasil diperbarui.");
    }

    closeModal();
  };

  const handleDelete = () => {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== selectedTransaction.id)
    );
    showToast("Transaksi barang keluar berhasil dihapus.", "error");
    closeModal();
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta
        title="Barang Keluar | Mandiri Tani Sejahtera"
        description="Kelola transaksi barang keluar inventory pupuk."
      />
      <PageBreadcrumb pageTitle="Barang Keluar" />

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
              Barang Keluar
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola transaksi barang keluar untuk inventory pupuk.
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
              <option value="BELUM LUNAS">BELUM LUNAS</option>
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
            <table className="min-w-[1620px]">
              <thead className="border-y border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Tanggal
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    No. Anggota
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Nama Anggota
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
                    Jumlah Keluar
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Harga Satuan
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
                        {transaction.nomor_anggota}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {transaction.nama_anggota}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-center font-medium text-gray-800 dark:text-white/90">
                        {transaction.kode_barang}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {transaction.nama_barang}
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
                        {formatRupiah(transaction.harga_jual)}
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
                        <div className="flex justify-end">
                          <Badge size="sm" color={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex justify-end gap-2">
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
                      colSpan="14"
                      className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada transaksi barang keluar yang cocok.
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

      <BarangKeluarFormModal
        isOpen={modalMode === "add" || modalMode === "edit"}
        modalMode={modalMode}
        formData={formData}
        errors={errors}
        calculation={calculation}
        members={members}
        items={items}
        locations={locations}
        formatRupiah={formatRupiah}
        getStatusColor={getStatusColor}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />

      <BarangKeluarDeleteModal
        isOpen={modalMode === "delete"}
        selectedTransaction={selectedTransaction}
        onClose={closeModal}
        onDelete={handleDelete}
      />
    </>
  );
}

export default BarangKeluar;
