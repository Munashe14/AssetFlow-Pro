import api from "./axios";

export const getDisposals   = ()              => api.get("/disposal/");
export const disposeAsset   = (assetId, data) => api.post(`/disposal/${assetId}`, data);