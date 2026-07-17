import api from "./axios";

export const registerUser = async ({ username, email, password, role }) => {
  const res = await api.post("/users/register", {
    username,
    email,
    password,
    role,
  });

  return res.data;
};

export const getUsers   = ()     => 
  api.get("/users/");
export const createUser = (data) => 
  api.post("/users/", data);
export const deleteUser = (id)   => 
  api.delete(`/users/${id}`);