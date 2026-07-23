import { BrowserRouter as Router, Routes, Route } from "react-router";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import InventoryPlaceholder from "./pages/Inventory/InventoryPlaceholder";
import MasterAnggota from "./pages/MasterData/MasterAnggota";
import MasterBarang from "./pages/MasterData/MasterBarang";
import BarangMasuk from "./pages/Transactions/BarangMasuk";
import BarangMasukForm from "./pages/Transactions/BarangMasukForm";
import BarangKeluar from "./pages/Transactions/BarangKeluar";
import StokBarang from "./pages/Inventory/StokBarang";

function App() {
    return <>
        <Router>
            <ScrollToTop />
            <Routes>
                {
                    /* Dashboard Layout */
                }
                <Route element={<AppLayout />}>
                    <Route index path="/" element={<Home />} />

                    <Route
                        path="/master-anggota"
                        element={<MasterAnggota />}
                    />
                    <Route
                        path="/master-barang"
                        element={<MasterBarang />}
                    />
                    <Route
                        path="/barang-masuk"
                        element={<BarangMasuk />}
                    />
                    <Route
                        path="/barang-masuk/tambah"
                        element={<BarangMasukForm mode="add" />}
                    />
                    <Route
                        path="/barang-masuk/:id/edit"
                        element={<BarangMasukForm mode="edit" />}
                    />
                    <Route
                        path="/barang-keluar"
                        element={<BarangKeluar />}
                    />
                    <Route
                        path="/stok"
                        element={<StokBarang />}
                    />
                    <Route
                        path="/biaya-keluar"
                        element={<InventoryPlaceholder title="Biaya Keluar" description="Halaman pencatatan biaya keluar." />}
                    />
                    <Route
                        path="/loan-anggota"
                        element={<InventoryPlaceholder title="Loan Anggota" description="Halaman pencatatan loan anggota." />}
                    />
                    <Route
                        path="/laporan-keuangan"
                        element={<InventoryPlaceholder title="Laporan Keuangan" description="Halaman laporan keuangan." />}
                    />

                    <Route path="*" element={<Home />} />
                </Route>
            </Routes>
        </Router>
    </>;
}
export {
    App as default
};
