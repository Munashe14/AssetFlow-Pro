import api from "./axios";
import { expectArrayResponse } from "./response";


export const getAssets = () =>
    api.get("/assets/").then(response => expectArrayResponse(response, "Assets"));

export const getAsset = (id) =>
    api.get(`/assets/${id}`);

export const getAssetDepreciation = (id) =>
    api.get(`/assets/${id}/depreciation`);

export const getAssetMaintanence = (id) =>
    api.get(`/maintenance/?asset_id=${id}`);

export const getAssetRepairs = (id) =>
    api.get(`/repairs/?asset_id=${id}`);

export const createAsset = (asset) =>
    api.post("/assets/", asset);

export const updateAsset = (id, data) =>
    api.put(`/assets/${id}`, data);

export const deleteAsset = (id) =>
    api.delete(`/assets/${id}`);

export const getAssetByTag = (tag) =>
    api.get(`/assets/?tag=${tag}`);
