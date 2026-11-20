import api from "./axios";
import { expectArrayResponse } from "./response";

export const getRepairs   = ()     => api.get("/repairs/").then(response => expectArrayResponse(response, "Repairs"));
export const createRepair = (data) => api.post("/repairs/", data);