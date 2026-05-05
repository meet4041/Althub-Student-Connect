const isProduction = () => process.env.NODE_ENV === "production";

export const authCookieNames = {
  main: "althub_main_token",
  mainRefresh: "althub_main_refresh_token",
  admin: "althub_admin_token",
  superAdmin: "althub_super_admin_token",
};

export const legacyAuthCookieNames = [
  "jwt_token",
  "admin_token",
  "institute_token",
];

export const getAuthCookieOptions = ({ maxAge } = {}) => {
  const options = {
    httpOnly: true,
    secure: isProduction(),
    sameSite: isProduction() ? "None" : "Lax",
    path: "/",
  };

  if (maxAge) options.maxAge = maxAge;
  return options;
};

export const getReadableCsrfCookieOptions = ({ maxAge } = {}) => {
  const options = {
    httpOnly: false,
    secure: isProduction(),
    sameSite: isProduction() ? "None" : "Lax",
    path: "/",
  };

  if (maxAge) options.maxAge = maxAge;
  return options;
};

export const clearCookieNames = (res, names, options = getAuthCookieOptions()) => {
  names.forEach((name) => res.clearCookie(name, options));
};
