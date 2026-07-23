import { apiRequest } from "./api";

const validateId = (id) => {
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new Error("ID barang tidak valid.");
    }

    return encodeURIComponent(String(numericId));
};

export const getAllMasterBarang = () => apiRequest("/master-barang");

export const getMasterBarangById = (id) =>
    apiRequest(`/master-barang/${validateId(id)}`);

export const createMasterBarang = (payload) =>
    apiRequest("/master-barang", {
        method: "POST",
        body: payload,
    });

export const updateMasterBarang = (id, payload) =>
    apiRequest(`/master-barang/${validateId(id)}`, {
        method: "PUT",
        body: payload,
    });

export const deleteMasterBarang = (id) =>
    apiRequest(`/master-barang/${validateId(id)}`, {
        method: "DELETE",
    });
