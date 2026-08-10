import api from "./axios";

export const getEmployees = () =>
    api.get("/employees/");

export const getCurrentEmployee = () =>
    api.get("/employees/me");

export const createEmployee = (employee) =>
    api.post("/employees/", employee);

