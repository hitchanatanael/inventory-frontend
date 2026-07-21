import { useMemo, useState } from "react";
import { Boxes, Package, Search, Warehouse } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";

const initialStocks = [
  {
    id: 1,
    id_master_barang: 1,
    kode_barang: "GRN26-50P-1",
    nama_barang: "NPK Granular 13-8.27 @50kg",
    satuan: "zak",
    id_lokasi: 1,
    nama_lokasi: "Pusat",
    stok: 320,
    harga_satuan: 410000,
  },
  {
    id: 2,
    id_master_barang: 2,
    kode_barang: "DLM26-50P-1",
    nama_barang: "Dolomite Gallata M-100 @50kg",
    satuan: "zak",
    id_lokasi: 1,
    nama_lokasi: "Pusat",
    stok: 85,
    harga_satuan: 45500,
  },
  {
    id: 3,
    id_master_barang: 3,
    kode_barang: "KCL26-50P-1",
    nama_barang: "Kcl Mahkota Ex Canada @50kg",
    satuan: "zak",
    id_lokasi: 2,
    nama_lokasi: "Suban",
    stok: 14,
    harga_satuan: 350000,
  },
  {
    id: 4,
    id_master_barang: 4,
    kode_barang: "SSM26-50P-1",
    nama_barang: "SS Meroke Ammophos @50kg",
    satuan: "zak",
    id_lokasi: 2,
    nama_lokasi: "Suban",
    stok: 0,
    harga_satuan: 580000,
  },
  {
    id: 5,
    id_master_barang: 5,
    kode_barang: "UREA26-50P-1",
    nama_barang: "Pupuk Urea @50kg",
    satuan: "zak",
    id_lokasi: 1,
    nama_lokasi: "Pusat",
    stok: 145,
    harga_satuan: 250000,
  },
  {
    id: 6,
    id_master_barang: 1,
    kode_barang: "GRN26-50P-1",
    nama_barang: "NPK Granular 13-8.27 @50kg",
    satuan: "zak",
    id_lokasi: 2,
    nama_lokasi: "Suban",
    stok: 42,
    harga_satuan: 410000,
  },
];

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getStockStatus = (stock) => {
  if (stock <= 0) return "HABIS";
  if (stock <= 20) return "MENIPIS";
  return "AMAN";
};

const getStockStatusColor = (status) => {
  if (status === "AMAN") return "success";
  if (status === "MENIPIS") return "warning";
  return "error";
};

const getLocationColor = (locationName) =>
  locationName === "Pusat" ? "primary" : "light";

const enrichStock = (stock) => ({
  ...stock,
  nilai_aset: stock.stok * stock.harga_satuan,
  status_stok: getStockStatus(stock.stok),
});

function StokBarang() {
  const stocks = useMemo(() => initialStocks.map(enrichStock), []);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLocation, setActiveLocation] = useState("Pusat");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const locationStocks = useMemo(
    () => stocks.filter((stock) => stock.nama_lokasi === activeLocation),
    [activeLocation, stocks]
  );

  const filteredStocks = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return locationStocks.filter((stock) => {
      const matchesKeyword =
        !keyword ||
        [
          stock.kode_barang,
          stock.nama_barang,
          stock.satuan,
          stock.nama_lokasi,
          stock.status_stok,
          formatRupiah(stock.harga_satuan),
          formatRupiah(stock.nilai_aset),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesKeyword;
    });
  }, [locationStocks, searchTerm]);

  const summary = useMemo(
    () => ({
      totalItems: locationStocks.length,
      totalStock: locationStocks.reduce((sum, stock) => sum + stock.stok, 0),
      totalAsset: locationStocks.reduce((sum, stock) => sum + stock.nilai_aset, 0),
      lowStock: locationStocks.filter((stock) => stock.status_stok !== "AMAN").length,
    }),
    [locationStocks]
  );

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * entriesPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, startIndex + entriesPerPage);
  const showingFrom = filteredStocks.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + entriesPerPage, filteredStocks.length);

  const resetFiltersPage = () => {
    setCurrentPage(1);
  };

  const handleLocationChange = (locationName) => {
    setActiveLocation(locationName);
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta
        title="Stok Barang | Mandiri Tani Sejahtera"
        description="Pantau stok dan nilai aset barang inventory pupuk."
      />
      <PageBreadcrumb pageTitle="Stok" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Stok Barang
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Pantau stok barang per lokasi dan nilai aset inventory pupuk.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
              <Boxes className="size-5" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Jenis Stok</p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
              {summary.totalItems}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
              <Package className="size-5" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Stok</p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
              {summary.totalStock} zak
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500">
              <Warehouse className="size-5" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nilai Aset</p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
              {formatRupiah(summary.totalAsset)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500">
              <Package className="size-5" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Perlu Perhatian</p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
              {summary.lowStock}
            </p>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-4 border-b border-gray-100 p-5 dark:border-gray-800 lg:grid-cols-[auto_auto_minmax(240px,320px)] lg:items-center lg:justify-between">
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

            <div className="inline-flex w-fit rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              {["Pusat", "Suban"].map((locationName) => {
                const isActive = activeLocation === locationName;

                return (
                  <button
                    key={locationName}
                    type="button"
                    onClick={() => handleLocationChange(locationName)}
                    className={`rounded-md px-4 py-2 text-sm transition ${isActive
                      ? "bg-white font-medium text-brand-500 shadow-theme-xs dark:bg-gray-900 dark:text-brand-400"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                      }`}
                  >
                    {locationName}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  resetFiltersPage();
                }}
                placeholder="Cari stok..."
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[920px] table-fixed">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[24%]" />
                <col className="w-[10%]" />
                <col className="w-[9%]" />
                <col className="w-[9%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="border-y border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-white/[0.02]">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Kode Barang
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Nama Barang
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Lokasi
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Stok
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Satuan
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Harga Satuan
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Nilai Aset
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedStocks.length > 0 ? (
                  paginatedStocks.map((stock) => (
                    <tr
                      key={stock.id}
                      className="transition hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {stock.kode_barang}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        <span className="block truncate" title={stock.nama_barang}>
                          {stock.nama_barang}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <Badge size="sm" color={getLocationColor(stock.nama_lokasi)}>
                          {stock.nama_lokasi}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-gray-800 dark:text-white/90">
                        {stock.stok}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {stock.satuan}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatRupiah(stock.harga_satuan)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatRupiah(stock.nilai_aset)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <Badge size="sm" color={getStockStatusColor(stock.status_stok)}>
                          {stock.status_stok}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      {locationStocks.length === 0
                        ? `Belum ada data stok di ${activeLocation}`
                        : "Data stok tidak ditemukan"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {showingFrom} to {showingTo} of {filteredStocks.length} entries
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
    </>
  );
}

export default StokBarang;
