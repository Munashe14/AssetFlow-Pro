import { useEffect, useState } from "react";
import { Modal, Field, inputClass } from "../components/shared";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

// API calls — add these to src/api/users.js if you haven't already
const getUsers    = ()          => api.get("/users/");
const createUser  = (data)      => api.post("/users/", data);
const deleteUser  = (id)        => api.delete(`/users/${id}`);

const ROLES = ["admin", "storekeeper"];

const ROLE_CONFIG = {
  admin:       { label: "Admin",       classes: "text-teal-400  bg-teal-500/15  border-teal-500/40"  },
  storekeeper: { label: "Storekeeper", classes: "text-blue-400  bg-blue-500/15  border-blue-500/40"  },
};

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.storekeeper;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

const EMPTY_FORM = {
  username: "",
  email:    "",
  password: "",
  role:     "storekeeper",
};

export default function UsersPage() {
  const { isAdmin, role: currentRole } = useAuth();

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [showPass,   setShowPass]   = useState(false);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function load() {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError("Username, email and password are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createUser(form);
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to create user. Email may already be in use."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, username) {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      load();
    } catch {
      setError("Delete failed.");
    }
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {users.length} user{users.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowForm(true); setError(""); }}
            className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            + Add User
          </button>
        )}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by username, email or role…"
        className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 w-72 focus:outline-none focus:border-teal-500 placeholder-slate-500"
      />

      {error && !showForm && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="rounded-xl border border-slate-700/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/40">
                {["#", "Username", "Email", "Role", isAdmin ? "Actions" : ""].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                    {user.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full bg-teal-600/70 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white uppercase">
                          {user.username.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-slate-200">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
                        className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-2">
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role).length;
          const cfg   = ROLE_CONFIG[role] || ROLE_CONFIG.storekeeper;
          return (
            <div
              key={role}
              className="rounded-xl border border-slate-700/60 bg-slate-800/20 px-4 py-3"
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
                {cfg.label}s
              </p>
              <p className={`text-2xl font-bold ${cfg.classes.split(" ")[0]}`}>
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {showForm && (
        <Modal title="Add New User" onClose={() => { setShowForm(false); setError(""); setForm(EMPTY_FORM); }}>
          <div className="space-y-3">
            <Field label="Username *">
              <input
                value={form.username}
                onChange={e => update("username", e.target.value)}
                placeholder="e.g. tendai.moyo"
                className={inputClass}
              />
            </Field>

            <Field label="Email *">
              <input
                type="email"
                value={form.email}
                onChange={e => update("email", e.target.value)}
                placeholder="e.g. tendai@company.co.zw"
                className={inputClass}
              />
            </Field>

            <Field label="Password *">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  className={`${inputClass} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            <Field label="Role *">
              <select
                value={form.role}
                onChange={e => update("role", e.target.value)}
                className={inputClass}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </Field>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="flex-1 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-900 font-semibold text-sm py-2 rounded-lg transition-colors"
            >
              {submitting ? "Creating…" : "Create User"}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(""); setForm(EMPTY_FORM); }}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm py-2 rounded-lg border border-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-800 rounded-xl" />
      ))}
    </div>
  );
}
