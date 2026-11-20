import api from "./axios";
import { expectArrayResponse } from "./response";

export const getMaintenance       = ()     => api.get("/maintenance/").then(response => expectArrayResponse(response, "Maintenance"));
export const createMaintenance    = (data) => api.post("/maintenance/", data);