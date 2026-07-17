import { useState, useEffect} from "react";
import { login as apiLogin } from "../api/auth";


export function useAuth() {
    const [token, setToken] = useState(() => localStorage.getItem("access_token"));
    const [role, setRole] = useState(() =>localStorage.getItem("user_role"));

    // Decode JWT payload to get role (no library needed - it's base64
    function decodeRole(jwt) {
        try{
            const payload = JSON.parse(atob(jwt.split(".")[1]));
            return payload.role || "storekeeper";
        }catch{ return "storekeeper"}
    }

        async function login(email, password){
        const data = await apiLogin(email, password);
        localStorage.setItem("access_token", data.access_token);
        const r = decodeRole(data.access_token);
        localStorage.setItem("user_role", r);
        setToken(data.access_token);
        setRole(r);
        return r;
    }

    function logout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        setToken(null);
        setRole(null);
    }

return { token, role, login, logout, isAdmin: role === "admin"};
}

