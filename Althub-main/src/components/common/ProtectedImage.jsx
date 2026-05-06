import React, { useEffect, useState } from "react";
import { buildImageUrl, getImageOnError } from "@althub/shared/images";
import { WEB_URL } from "../../config/api";

// Thin wrapper around <img> that prepends WEB_URL to backend paths and
// renders the fallback on error. Uses native browser caching (Cache-Control
// + ETag set by Althub-server/routes/imagesRoute.js) — no blob fetch needed.
//
// Same auth model as before: the browser sends the HttpOnly cookies on the
// <img> request thanks to SameSite=None; Secure (in cross-site mode) or
// SameSite=Lax (in same-origin mode).
const ProtectedImage = ({
  imgSrc,
  alt = "",
  className,
  defaultImage = "/images/profile1.png",
  loading = "lazy",
  decoding = "async",
  ...props
}) => {
  const resolved = buildImageUrl(imgSrc, { baseURL: WEB_URL, fallback: defaultImage });
  const [src, setSrc] = useState(resolved);

  useEffect(() => {
    setSrc(buildImageUrl(imgSrc, { baseURL: WEB_URL, fallback: defaultImage }));
  }, [imgSrc, defaultImage]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={getImageOnError(defaultImage)}
      {...props}
    />
  );
};

export default ProtectedImage;
