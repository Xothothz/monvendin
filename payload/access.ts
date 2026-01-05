import type { Access, AccessArgs } from "payload";
import type { PermissionKey, UserWithPermissions } from "../lib/permissions";

type UserWithRole = UserWithPermissions & {
  id?: string | number;
};

const hasPermission = (user: UserWithRole | null | undefined, key: PermissionKey) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return Boolean(user.permissions?.[key]);
};

const hasAnyPermission = (
  user: UserWithRole | null | undefined,
  keys: PermissionKey[]
) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return keys.some((key) => Boolean(user.permissions?.[key]));
};

export const isAdmin = ({ req }: AccessArgs<UserWithRole>) => req.user?.role === "admin";

export const isAuthenticated = ({ req }: AccessArgs<UserWithRole>) => Boolean(req.user);

export const hasPermissionAccess =
  (key: PermissionKey): Access =>
  ({ req }) =>
    hasPermission(req.user as UserWithRole, key);

export const hasAnyPermissionAccess =
  (keys: PermissionKey[]): Access =>
  ({ req }) =>
    hasAnyPermission(req.user as UserWithRole, keys);

export const publishedOnly: Access = ({ req }) => {
  if (req.user?.role === "admin") {
    return true;
  }

  return {
    status: {
      equals: "published"
    }
  };
};

export const publishedOrHasPermission =
  (key?: PermissionKey | PermissionKey[]): Access =>
  ({ req }) => {
    if (req.user?.role === "admin") {
      return true;
    }
    if (key) {
      const keys = Array.isArray(key) ? key : [key];
      if (hasAnyPermission(req.user as UserWithRole, keys)) {
        return true;
      }
    }
    return {
      status: {
        equals: "published"
      }
    };
  };

export const isAdminOrOwner: Access = ({ req }) => {
  if (req.user?.role === "admin") {
    return true;
  }
  if (!req.user?.id) {
    return false;
  }
  return {
    owner: {
      equals: req.user.id
    }
  };
};

export const publishedOrOwner: Access = ({ req }) => {
  if (req.user?.role === "admin") {
    return true;
  }
  if (req.user?.id) {
    return {
      or: [
        { status: { equals: "published" } },
        { owner: { equals: req.user.id } }
      ]
    };
  }
  return {
    status: {
      equals: "published"
    }
  };
};
