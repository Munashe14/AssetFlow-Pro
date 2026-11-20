import api from "./axios";
import { expectArrayResponse } from "./response";

export const getDisposals   = ()              => api.get("/disposal/").then(response => expectArrayResponse(response, "Disposals"));
export const disposeAsset   = (assetId, data) => api.post(`/disposal/${assetId}`, data);