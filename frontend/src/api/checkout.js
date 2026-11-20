import api from "./axios";
import { expectArrayResponse } from "./response";

export const checkoutAsset = (assetId, data) => 
    api.post(`/checkouts/checkout/${assetId}`, data);

export const returnAsset = (transactionId, data) =>
    api.post(`/checkouts/return/${transactionId}`, data);

export const returnAssetByAssetId = (assetId, data) =>
    api.post(`/checkouts/return/asset/${assetId}`, data);

export const getCheckouts = () =>
    api.get("/checkouts").then(response => expectArrayResponse(response, "Checkouts"));