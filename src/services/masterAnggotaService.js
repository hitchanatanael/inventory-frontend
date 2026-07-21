import { apiRequest } from "./api";

const validateId = (id) => {
    if (id === undefined || id === null || String(id).trim() === "") {
        throw new Error("ID anggota tidak valid.");
    }

    return encodeURIComponent(String(id));
};

export const getAllMasterAnggota = () => apiRequest("/master-anggota");

export const getMasterAnggotaById = (id) =>
    apiRequest(`/master-anggota/${validateId(id)}`);

export const createMasterAnggota = (payload) =>
    apiRequest("/master-anggota", {
        method: "POST",
        body: payload,
    });

export const updateMasterAnggota = (id, payload) =>
    apiRequest(`/master-anggota/${validateId(id)}`, {
        method: "PUT",
        body: payload,
    });

export const deleteMasterAnggota = (id) =>
    apiRequest(`/master-anggota/${validateId(id)}`, {
        method: "DELETE",
    });
