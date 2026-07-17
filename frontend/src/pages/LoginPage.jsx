import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";


export default function LoginPage() {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try{
            await login(email, password);
            navigate("/dashboard");
        }catch(err) {
            setError("Invalid email or password");
        }finally{
            setLoading(false)
        }
        
    }
   return(
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center">
                    <span className="text-slate-900 font-bold text-lg"></span>
                </div>
                     <span className="text-white font-bold text-xl tracking-tight">FAMS</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">Sign In</h1>
            <p className="text-slate-600 text-sm mb-6">Fixed Asset Mangement System</p>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-slate-500 block mb-1">Email address</label>
                    <input 
                    type="email"
                    value={email}
                    onChange={e=> setEmail(e.target.value)}
                    placeholder="admin@company.co.zw"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500
                    placeholder-slate-600 "
                     />
                </div>
                <div>
                    <label className="text-xs text-slate-500 block mb-1">Password</label>
                    <input 
                    type="password"
                    value={password}
                    onChange={e=> setPassword(e.target.value)}
                    placeholder="**************"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500" />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-900 font-semibold text-sm py-2.5 rounded-lg transition-colors"
                >
                    {loading ? "Signing in...": "Sign in"}
                </button>

                <p className="text-center text-sm text-slate-500">
                    Need an account?{' '}
                    <Link to="/create-account" className="text-teal-400 hover:text-teal-300">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    </div>
   ) 
}
