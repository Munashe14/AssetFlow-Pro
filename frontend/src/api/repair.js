import api from "./axios";

export const getRepairs   = ()     => api.get("/repairs/");
export const createRepair = (data) => api.post("/repairs/", data);