import axios from "axios";
import api from "./axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const login = async (email, password) => {
  // Must send as application/x-www-form-urlencoded
  const params = new URLSearchParams();
  params.append("username", email);   // OAuth2 field is "username"
  params.append("password", password);

  const res = await axios.post(`${BASE}/auth/login`, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data; // { access_token, token_type }
};