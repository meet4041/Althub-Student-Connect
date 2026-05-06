import React, { useEffect, useState } from "react";
import apiClient from "../../api/client";
import { WEB_URL } from "../../config/api";

const ProtectedImage = ({ imgSrc, alt, className, defaultImage = "/images/profile1.png", ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(defaultImage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let objectUrl = null;
    let retryTimer = null;

    const finishWithDefault = () => {
      if (!active) return;
      setCurrentSrc(defaultImage);
      setLoading(false);
    };

    if (!imgSrc || imgSrc === "undefined" || imgSrc === "") {
      finishWithDefault();
      return;
    }

    if (imgSrc.startsWith("http") || imgSrc.startsWith("blob:") || imgSrc.startsWith("data:")) {
      setCurrentSrc(imgSrc);
      setLoading(false);
      return;
    }

    const fetchSecureImage = async (attempt = 0) => {
      try {
        setLoading(true);
        const cleanPath = imgSrc.startsWith("/") ? imgSrc : `/${imgSrc}`;
        const response = await apiClient.get(`${WEB_URL}${cleanPath}`, {
          responseType: "blob",
          withCredentials: true,
        });

        const nextObjectUrl = URL.createObjectURL(response.data);
        if (!active) {
          URL.revokeObjectURL(nextObjectUrl);
          return;
        }

        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = nextObjectUrl;
        setCurrentSrc(nextObjectUrl);
        setLoading(false);
      } catch (error) {
        if (!active) return;
        if (attempt === 0) {
          retryTimer = window.setTimeout(() => fetchSecureImage(1), 500);
          return;
        }
        console.error("Image Load Failed:", error);
        finishWithDefault();
      }
    };

    fetchSecureImage();

    return () => {
      active = false;
      if (retryTimer) window.clearTimeout(retryTimer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imgSrc, defaultImage]);

  if (loading) {
    return <img src={defaultImage} alt={alt} className={className} style={{ opacity: 0.5 }} {...props} />;
  }

  return <img src={currentSrc} alt={alt} className={className} {...props} />;
};

export default ProtectedImage;
