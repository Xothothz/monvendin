"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { permissionOptions, type UserPermissions, type UserRole } from "@/lib/permissions";

type UserItem = {
  id: string | number;
  name?: string | null;
  email?: string | null;
  role?: UserRole | "editor";
  permissions?: UserPermissions | null;
};

type FormState = {
  role: UserRole;
  permissions: UserPermissions;
};

type CreateFormState = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: UserPermissions;
};

const buildPermissions = (value?: UserPermissions | null): UserPermissions =>
  permissionOptions.reduce<UserPermissions>((acc, permission) => {
    acc[permission.key] = Boolean(value?.[permission.key]);
    return acc;
  }, {});

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

const parseApiError = async (response: Response, fallback: string) => {
  const data = await response.json().catch(() => ({}));
  return data?.errors?.[0]?.message || data?.message || fallback;
};

export const ParametresUsersPanel = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);
  const [formState, setFormState] = useState<FormState>({
    role: "user",
    permissions: buildPermissions()
  });
  const [createState, setCreateState] = useState<CreateFormState>({
    name: "",
    email: "",
    password: "",
    role: "user",
    permissions: buildPermissions()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

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
    const nextRole = selectedUser.role === "admin" ? "admin" : "user";
    setFormState({
      role: nextRole,
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

  const handleCreateUser = async () => {
    const name = createState.name.trim();
    const email = createState.email.trim();
    const password = createState.password.trim();

    if (!name || !email || !password) {
      setCreateMessage("Nom, email et mot de passe sont requis.");
      return;
    }

    setIsCreating(true);
    setCreateMessage(null);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          role: createState.role,
          permissions: createState.permissions
        })
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Creation impossible."));
      }
      const data = await response.json();
      const created = (data?.doc ?? data) as UserItem;
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      setSelectedUserId(created.id);
      setCreateState({
        name: "",
        email: "",
        password: "",
        role: "user",
        permissions: buildPermissions()
      });
      setCreateMessage("Utilisateur cree.");
    } catch (error) {
      setCreateMessage(error instanceof Error ? error.message : "Creation impossible.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Suppression impossible.");
      }
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      setSelectedUserId(updatedUsers[0]?.id ?? null);
      setMessage("Utilisateur supprime.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Suppression impossible.");
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
                      {user.role === "admin" ? "Admin" : "Utilisateur"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <div className="space-y-6">
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
                        role: event.target.value as UserRole
                      }))
                    }
                    className="mt-2 w-full glass-input"
                  >
                    <option value="admin">Administrateur</option>
                    <option value="user">Utilisateur</option>
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
                        className="flex items-center justify-between glass-panel px-4 py-3 text-sm text-ink"
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
                          disabled={formState.role === "admin"}
                          className="h-4 w-4 rounded border-ink/20 disabled:opacity-50"
                        />
                      </label>
                    ))}
                  </div>
                  {formState.role === "admin" ? (
                    <p className="text-xs text-slate">
                      Les administrateurs ont tous les droits par defaut.
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full rounded-full bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    disabled={isSaving}
                    className="w-full rounded-full border border-rose-200 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Supprimer
                  </button>
                </div>
                {message ? <p className="text-xs text-slate">{message}</p> : null}
              </div>
            ) : (
              <p className="text-sm text-slate">Selectionnez un utilisateur.</p>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-display text-ink">Nouvel utilisateur</h2>
              <p className="text-sm text-slate">
                Creez un compte pour attribuer une page pro.
              </p>
            </div>
            <div className="space-y-3 text-sm">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                  Nom
                </span>
                <input
                  value={createState.name}
                  onChange={(event) =>
                    setCreateState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full glass-input"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                  Email
                </span>
                <input
                  type="email"
                  value={createState.email}
                  onChange={(event) =>
                    setCreateState((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full glass-input"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                  Mot de passe
                </span>
                <input
                  type="password"
                  value={createState.password}
                  onChange={(event) =>
                    setCreateState((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full glass-input"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                  Role
                </span>
                <select
                  value={createState.role}
                  onChange={(event) =>
                    setCreateState((prev) => ({
                      ...prev,
                      role: event.target.value as UserRole
                    }))
                  }
                  className="w-full glass-input"
                >
                  <option value="admin">Administrateur</option>
                  <option value="user">Utilisateur</option>
                </select>
              </label>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                Permissions
              </p>
              <div className="grid gap-2">
                {permissionOptions.map((permission) => (
                  <label
                    key={permission.key}
                    className="flex items-center justify-between glass-panel px-4 py-3 text-sm text-ink"
                  >
                    <span>{permission.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(createState.permissions[permission.key])}
                      onChange={(event) =>
                        setCreateState((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            [permission.key]: event.target.checked
                          }
                        }))
                      }
                      disabled={createState.role === "admin"}
                      className="h-4 w-4 rounded border-ink/20 disabled:opacity-50"
                    />
                  </label>
                ))}
              </div>
              {createState.role === "admin" ? (
                <p className="text-xs text-slate">
                  Les administrateurs ont tous les droits par defaut.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleCreateUser}
              disabled={isCreating}
              className="w-full rounded-full bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "Creation..." : "Creer le compte"}
            </button>
            {createMessage ? <p className="text-xs text-slate">{createMessage}</p> : null}
          </Card>
        </div>
      </div>
    </div>
  );
};
