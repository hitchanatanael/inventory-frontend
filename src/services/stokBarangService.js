import { apiRequest } from "./api";

export const getAllStokBarang = (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.id_lokasi) {
        params.set("id_lokasi", filters.id_lokasi);
    }

    if (filters.search?.trim()) {
        params.set("search", filters.search.trim());
    }

    if (filters.hanya_tersedia === true) {
        params.set("hanya_tersedia", "true");
    }

    const query = params.toString();
    const endpoint = query ? `/stok-barang?${query}` : "/stok-barang";

    return apiRequest(endpoint);
};

export const getRingkasanStokBarang = () =>
    apiRequest("/stok-barang/ringkasan");
