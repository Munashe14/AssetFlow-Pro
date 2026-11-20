import api from "./axios";

export const login = async (email, password) => {
  // Must send as application/x-www-form-urlencoded
  const params = new URLSearchParams();
  params.append("username", email);   // OAuth2 field is "username"
  params.append("password", password);

  const res = await api.post("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data; // { access_token, token_type }
};