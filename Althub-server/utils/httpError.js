export const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  error.expose = status < 500;
  return error;
};

export const badRequest = (message) => httpError(400, message);
export const unauthorized = (message) => httpError(401, message);
export const forbidden = (message) => httpError(403, message);
export const notFound = (message) => httpError(404, message);
