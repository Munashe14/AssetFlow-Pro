import api from "./axios";

export const getDashboardData = () => api.get("/reports/dashboard");

// Returns a blob - use responseType blob for file downloads
export const exportAssetsPDF = () =>
    api.get("/reports/export/pdf", {responseType: "blob"});

export const exportAssetsExcel = () =>
    api.get("/reports/export/excel", {responseType: "blob"});

export const getDueReturns = () =>
    api.get("/reports/due-return-reminders/");

export const getWarrantyAlerts = () =>
    api.get("/reports/warranty-expiry-alerts/");

export const getLowInventory = () =>
    api.get("/reports/low-inventory-alerts/");

