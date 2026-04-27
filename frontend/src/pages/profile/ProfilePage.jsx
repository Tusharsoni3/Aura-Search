import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Copy, Edit2, Save, LogOut, X } from "lucide-react";
import toast from "react-hot-toast";

/**
 * ProfilePage
 * - Shows the current authenticated user's profile information.
 * - Allows editing the display name locally (uses AuthContext.updateUser).
 * - Provides quick actions: copy email, logout, back to chat.
 *
 * Note: persisting profile changes to the backend requires an API endpoint.
 * This component updates the auth context so the UI reflects the change.
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  // Local edit state
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setNameInput(user.name);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0C11] flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-[#15161F] rounded-2xl p-8 border border-[#23253A] shadow-2xl text-center">
          <p className="text-slate-400">You are not signed in.</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-xl bg-indigo-500 text-[#0B0C11] font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  const initials = (() => {
    const name = user.name || user.email || "User";
    return name
      .split(/\s+/)
      .map((n) => n[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  })();

  const createdAtText = user?.createdAt
    ? new Date(user.createdAt).toLocaleString()
    : "—";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      toast.success("Email copied to clipboard");
    } catch {
      toast.error("Unable to copy email");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  };

  const handleSaveName = async () => {
    const trimmed = (nameInput || "").trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      // Update context locally. If you add a backend endpoint to persist profile,
      // call it here and await the response before calling updateUser(...) below.
      updateUser({ name: trimmed });
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C11] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/chat")}
              aria-label="Back to chat"
              className="px-3 py-2 rounded-lg bg-[#1A1B27] border border-[#23253A] text-sm text-slate-300 hover:bg-[#1A1C2E]"
            >
              Back
            </button>
            <h1 className="text-2xl font-bold text-[#F0F0FF]">Profile</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-[#15161F] px-4 py-2 rounded-xl border border-[#23253A] text-slate-300 hover:bg-red-600/10 transition"
            >
              <LogOut size={16} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>

        <div className="bg-[#15161F] border border-[#23253A] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar & basic info */}
          <div className="flex flex-col items-center md:items-start md:col-span-1">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-xl font-bold mb-4"
              style={{
                background: "linear-gradient(135deg, #818CF8 0%, #34D399 100%)",
                color: "#0B0C11",
              }}
            >
              {initials}
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-400">Signed in as</p>
              <p className="text-sm font-medium text-[#F0F0FF] truncate">{user.email}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleCopyEmail}
                  className="text-xs px-3 py-1 rounded-md bg-[#1A1B27] border border-[#23253A] text-indigo-300 hover:bg-[#1A1C2E]"
                >
                  <Copy size={12} className="inline-block mr-1" /> Copy Email
                </button>
              </div>
            </div>
          </div>

          {/* Details & editable name */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-400">Display name</p>
                {!editing ? (
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-[#F0F0FF]">{user.name || "—"}</p>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-slate-400 hover:text-indigo-300 p-1 rounded-md"
                      aria-label="Edit name"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="bg-[#1A1B27] border border-[#23253A] text-[#F0F0FF] px-3 py-2 rounded-md outline-none"
                      placeholder="Your name"
                      aria-label="Display name"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      className="px-3 py-2 bg-indigo-500 text-[#0B0C11] rounded-md flex items-center gap-2"
                    >
                      <Save size={14} />
                      <span>{saving ? "Saving..." : "Save"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setNameInput(user.name || "");
                      }}
                      className="px-2 py-2 rounded-md bg-[#1A1B27] border border-[#23253A] text-slate-400"
                      aria-label="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-slate-400">Account created</p>
                <p className="text-sm font-medium text-[#F0F0FF]">{createdAtText}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Provider</p>
                <p className="text-sm font-medium text-[#F0F0FF]">{user.provider || "email"}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-slate-400 mb-2">Security</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-[#F0F0FF] font-medium">Two-factor authentication</p>
                  <p className="text-xs text-slate-500">If enabled, you will receive a login code when signing in.</p>
                </div>
                <div>
                  {/* 2FA toggle could be wired to backend. For now show current status */}
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      user.twoFactorEnabled ? "bg-emerald-600/10 text-emerald-300" : "bg-[#1A1B27] text-slate-400"
                    }`}
                  >
                    {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/chat")}
                className="px-4 py-2 rounded-xl bg-[#1A1B27] border border-[#23253A] text-slate-300 hover:bg-[#1A1C2E]"
              >
                Back to Chat
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-600/10 border border-red-400/10 text-red-400 hover:bg-red-600/5"
              >
                <LogOut size={14} className="inline-block mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* small footer */}
        <div className="mt-4 text-xs text-slate-500 text-center">
          <p>Logged in as <strong className="text-slate-300">{user.email}</strong></p>
        </div>
      </div>
    </div>
  );
}
