import React, { useEffect, useState } from "react";
import axios from "axios";
import { WEB_URL } from "./baseURL"; 

const ProtectedImage = ({ imgSrc, alt, className, defaultImage = "/images/profile1.png" }) => {
  const [currentSrc, setCurrentSrc] = useState(defaultImage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Validation
    if (!imgSrc || imgSrc === "undefined" || imgSrc === "") {
      setCurrentSrc(defaultImage);
      setLoading(false);
      return;
    }

    // 2. Optimization: Static/External images don't need auth
    if (imgSrc.startsWith("http")) {
       setCurrentSrc(imgSrc);
       setLoading(false);
       return;
    }

    // 3. The Secure Fetch
    const fetchSecureImage = async () => {
      let objectUrl = null;
      try {
        setLoading(true);
        // Ensure strictly one slash between base and path
        const cleanPath = imgSrc.startsWith("/") ? imgSrc : `/${imgSrc}`;
        const fullUrl = `${WEB_URL}${cleanPath}`;

        // Prefer cookie-based auth (HttpOnly jwt_token). Use withCredentials.
        const response = await axios.get(fullUrl, {
          responseType: "blob",
          withCredentials: true
        });

        objectUrl = URL.createObjectURL(response.data);
        setCurrentSrc(objectUrl);
      } catch (error) {
        console.error("Image Load Failed:", error);
        setCurrentSrc(defaultImage);
      } finally {
        setLoading(false);
      }

      // Cleanup: revoke object URL on unmount or when src changes
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    };

    const cleanup = fetchSecureImage();
    return () => { if (cleanup && typeof cleanup === 'function') cleanup(); };
  }, [imgSrc, defaultImage]);

  if (loading) {
      return <img src={defaultImage} alt={alt} className={className} style={{opacity: 0.5}} />;
  }

  return <img src={currentSrc} alt={alt} className={className} />;
};

export default ProtectedImage;