"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";

type UserPermissions = {
  manageActualites?: boolean;
  manageAgenda?: boolean;
  manageDocuments?: boolean;
  manageVendinfos?: boolean;
  manageAssociations?: boolean;
  canPublish?: boolean;
};

type UserItem = {
  id: string | number;
  name?: string | null;
  email?: string | null;
  role?: "admin" | "editor";
  permissions?: UserPermissions | null;
};

type FormState = {
  role: "admin" | "editor";
  permissions: UserPermissions;
};

const permissionOptions: Array<{ key: keyof UserPermissions; label: string }> = [
  { key: "manageActualites", label: "Actualites" },
  { key: "manageAgenda", label: "Agenda" },
  { key: "manageDocuments", label: "Documents" },
  { key: "manageVendinfos", label: "Vendinfos" },
  { key: "manageAssociations", label: "Associations" },
  { key: "canPublish", label: "Publication directe" }
];

const buildPermissions = (value?: UserPermissions | null): UserPermissions => ({
  manageActualites: Boolean(value?.manageActualites),
  manageAgenda: Boolean(value?.manageAgenda),
  manageDocuments: Boolean(value?.manageDocuments),
  manageVendinfos: Boolean(value?.manageVendinfos),
  manageAssociations: Boolean(value?.manageAssociations),
  canPublish: Boolean(value?.canPublish)
});

const fetchUsers = async () => {
  const response = await fetch("/api/users?depth=0&limit=200&sort=name", {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = await response.json();
  return (data?.docs ?? []) as UserItem[];
};

export const ParametresUsersPanel = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);
  const [formState, setFormState] = useState<FormState>({
    role: "editor",
    permissions: buildPermissions()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === String(selectedUserId)) ?? null,
    [users, selectedUserId]
  );

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const data = await fetchUsers();
        if (!isActive) return;
        setUsers(data);
        if (!selectedUserId && data.length > 0) {
          setSelectedUserId(data[0].id);
        }
      } catch (error) {
        if (isActive) {
          setMessage(error instanceof Error ? error.message : "Chargement impossible.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUser) return;
    setFormState({
      role: selectedUser.role ?? "editor",
      permissions: buildPermissions(selectedUser.permissions)
    });
  }, [selectedUser]);

  const handleSave = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          role: formState.role,
          permissions: formState.permissions
        })
      });
      if (!response.ok) {
        throw new Error("Enregistrement impossible.");
      }
      const data = await response.json();
      const updated = (data?.doc ?? data) as UserItem;
      setUsers((prev) =>
        prev.map((user) => (String(user.id) === String(updated.id) ? updated : user))
      );
      setMessage("Mise a jour enregistree.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-start">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display text-ink">Utilisateurs</h2>
              <p className="text-sm text-slate">
                Selectionnez un compte pour modifier son role et ses permissions.
              </p>
            </div>
            {isLoading ? <span className="text-xs text-slate">Chargement...</span> : null}
          </div>

          {users.length === 0 ? (
            <p className="text-sm text-slate">Aucun utilisateur disponible.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => {
                const isActive = String(user.id) === String(selectedUserId);
                return (
                  <button
                    key={String(user.id)}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-gold/40 bg-gold/10 text-ink"
                        : "border-ink/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {user.name || user.email || "Utilisateur"}
                      </p>
                      <p className="text-xs text-slate">{user.email}</p>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">
                      {user.role === "admin" ? "Admin" : "Editeur"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-display text-ink">Droits</h2>
            <p className="text-sm text-slate">
              Modifiez le role et les permissions associees.
            </p>
          </div>

          {selectedUser ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                  Role
                </p>
                <select
                  value={formState.role}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      role: event.target.value as "admin" | "editor"
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                >
                  <option value="admin">Administrateur</option>
                  <option value="editor">Editeur</option>
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                  Permissions
                </p>
                <div className="grid gap-2">
                  {permissionOptions.map((permission) => (
                    <label
                      key={permission.key}
                      className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink"
                    >
                      <span>{permission.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(formState.permissions[permission.key])}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              [permission.key]: event.target.checked
                            }
                          }))
                        }
                        className="h-4 w-4 rounded border-ink/20"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full rounded-full bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
              {message ? <p className="text-xs text-slate">{message}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-slate">Selectionnez un utilisateur.</p>
          )}
        </Card>
      </div>
    </div>
  );
};
