import api from "./axios";

export const checkoutAsset = (assetId, data) => 
    api.post(`/assets/${assetId}/checkout`, data);

export const returnAsset = (assetId, data) =>
    api.post(`/assets/${assetId}/return`, data);

export const getCheckouts = () =>
    api.get("/checkouts");