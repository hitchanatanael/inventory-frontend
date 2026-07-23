import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow
} from "../../components/ui/table";
import { CalendarCheck, PackageMinus, PackagePlus } from "lucide-react";

const summaryCards = [
    {
        label: "Barang Masuk",
        value: "126",
        note: "Transaksi penerimaan",
        icon: <PackagePlus className="size-6 text-success-600 dark:text-success-500" />
    },
    {
        label: "Barang Keluar",
        value: "94",
        note: "Transaksi pengeluaran",
        icon: <PackageMinus className="size-6 text-error-600 dark:text-error-500" />
    },
    {
        label: "Transaksi Bulan Ini",
        value: "220",
        note: "Total barang masuk dan keluar",
        icon: <CalendarCheck className="size-6 text-gray-800 dark:text-white/90" />
    }
];

const stockRows = [
    {
        id: 1,
        name: "Urea",
        category: "Subsidi",
        stock: "320 sak",
        warehouse: "Gudang Utama",
        status: "Aman"
    },
    {
        id: 2,
        name: "NPK Phonska",
        category: "Subsidi",
        stock: "85 sak",
        warehouse: "Gudang Utama",
        status: "Menipis"
    },
    {
        id: 3,
        name: "ZA",
        category: "Non Subsidi",
        stock: "140 sak",
        warehouse: "Gudang Cabang",
        status: "Aman"
    },
    {
        id: 4,
        name: "SP-36",
        category: "Subsidi",
        stock: "12 sak",
        warehouse: "Gudang Cabang",
        status: "Kritis"
    }
];

function Home() {
    return <>
        <PageMeta
            title="Mandiri Tani Sejahtera"
            description="Inventory pupuk KSP CU Mutiara Mandiri"
        />
        <PageBreadcrumb pageTitle="Dashboard" />
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Pantau ringkasan transaksi dan stok inventory pupuk.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                {summaryCards.map((card) => <div
                    key={card.label}
                    className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                        {card.icon}
                    </div>
                    <div className="mt-5">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {card.label}
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {card.value}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {card.note}
                        </p>
                    </div>
                </div>)}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Ringkasan Stok Pupuk
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Data sementara untuk patokan tampilan inventory.
                    </p>
                </div>
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                            <TableRow>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Nama Pupuk
                                </TableCell>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Kategori
                                </TableCell>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Stok
                                </TableCell>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Gudang
                                </TableCell>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {stockRows.map((item) => <TableRow key={item.id}>
                                <TableCell className="py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                    {item.name}
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                    {item.category}
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                    {item.stock}
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                    {item.warehouse}
                                </TableCell>
                                <TableCell className="py-3">
                                    <Badge
                                        size="sm"
                                        color={item.status === "Aman" ? "success" : item.status === "Menipis" ? "warning" : "error"}
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    </>;
}
export {
    Home as default
};
