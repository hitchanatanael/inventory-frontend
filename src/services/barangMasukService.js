import { apiRequest } from "./api";

const validateId = (id) => {
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new Error("ID barang masuk tidak valid.");
    }

    return encodeURIComponent(String(numericId));
};

export const getAllBarangMasuk = (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.id_lokasi) {
        params.set("id_lokasi", filters.id_lokasi);
    }

    const query = params.toString();
    const endpoint = query ? `/barang-masuk?${query}` : "/barang-masuk";

    return apiRequest(endpoint);
};

export const getBarangMasukById = (id) =>
    apiRequest(`/barang-masuk/${validateId(id)}`);

export const createBarangMasuk = (payload) =>
    apiRequest("/barang-masuk", {
        method: "POST",
        body: payload,
    });

export const updateBarangMasuk = (id, payload) =>
    apiRequest(`/barang-masuk/${validateId(id)}`, {
        method: "PUT",
        body: payload,
    });

export const deleteBarangMasuk = (id) =>
    apiRequest(`/barang-masuk/${validateId(id)}`, {
        method: "DELETE",
    });
