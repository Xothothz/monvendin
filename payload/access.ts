import type { Access, AccessArgs } from "payload";

type UserWithRole = {
  role?: "admin" | "editor";
};

export const isAdmin = ({ req }: AccessArgs<UserWithRole>) => req.user?.role === "admin";

export const isStaff = ({ req }: AccessArgs<UserWithRole>) =>
  req.user?.role === "admin" || req.user?.role === "editor";

export const isAuthenticated = ({ req }: AccessArgs<UserWithRole>) => Boolean(req.user);

export const publishedOnly: Access = ({ req }) => {
  if (req.user) {
    return true;
  }

  return {
    status: {
      equals: "published"
    }
  };
};
