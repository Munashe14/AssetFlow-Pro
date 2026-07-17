import { useEffect, useState } from "react";
import { getDepartments, createDepartment, deleteDepartment } from "../api/department";
import { useAuth } from "../hooks/useAuth";
import { Modal, Field, inputClass } from "../components/shared";

export default function DepartmentsPage() {
  const { isAdmin }                     = useAuth();
  const [departments, setDepartments]   = useState([]);
  const [newName,     setNewName]       = useState("");
  const [loading,     setLoading]       = useState(true);
  const [saving,      setSaving]        = useState(false);
  const [error,       setError]         = useState("");

  async function load() {
    setLoading(true);
    const res = await getDepartments();
    setDepartments(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await createDepartment({ name: newName.trim() });
      setNewName("");
      load();
    } catch {
      setError("Failed to create department.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete department "${name}"? This cannot be undone.`)) return;
    try {
      await deleteDepartment(id);
      load();
    } catch {
      setError("Delete failed — department may have linked records.");
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Departments</h1>
        <p className="text-slate-400 text-sm mt-0.5">{departments.length} departments registered</p>
      </div>

      {/* Create form — admin only */}
      {isAdmin && (
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Add Department</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate(e)}
              placeholder="e.g. Finance, ICT, HR…"
              className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 placeholder-slate-600"
            />
            <button
              onClick={handleCreate}
              disabled={saving || !newName.trim()}
              className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? "…" : "Add"}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
      )}

      {/* Department list */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {departments.map(dept => (
            <div
              key={dept.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-700/60 bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🏢</span>
                <div>
                  <p className="text-sm font-medium text-slate-200">{dept.name}</p>
                  <p className="text-xs text-slate-600 font-mono">ID #{dept.id}</p>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(dept.id, dept.name)}
                  className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          {departments.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">No departments yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
