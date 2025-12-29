import React, { useEffect, useState } from "react";
import axios from "axios";
import { WEB_URL } from "./baseURL"; 

const ProtectedImage = ({ imgSrc, alt, className, defaultImage = "/images/profile1.png" }) => {
  const [currentSrc, setCurrentSrc] = useState(defaultImage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imgSrc || imgSrc === "undefined" || imgSrc === "") {
      setCurrentSrc(defaultImage);
      setLoading(false);
      return;
    }

    if (imgSrc.startsWith("http")) {
       setCurrentSrc(imgSrc);
       setLoading(false);
       return;
    }

    const fetchSecureImage = async () => {
      try {
        setLoading(true);
        // Ensure we don't get double slashes if WEB_URL ends with / and imgSrc starts with /
        const cleanPath = imgSrc.startsWith("/") ? imgSrc : `/${imgSrc}`;
        const fullUrl = `${WEB_URL}${cleanPath}`;

        const token = localStorage.getItem("Althub_Token");

        const response = await axios.get(fullUrl, {
          responseType: "blob", 
          withCredentials: false, // <--- CHANGED: Set to false to fix Chrome CORS
          headers: {
             "Authorization": token ? `Bearer ${token}` : "" 
          }
        });

        const objectUrl = URL.createObjectURL(response.data);
        setCurrentSrc(objectUrl);
      } catch (error) {
        console.error("Image load failed:", error);
        setCurrentSrc(defaultImage); 
      } finally {
        setLoading(false);
      }
    };

    fetchSecureImage();
  }, [imgSrc, defaultImage]);

  if (loading) {
      return <img src={defaultImage} alt={alt} className={className} style={{opacity: 0.5}} />;
  }

  return <img src={currentSrc} alt={alt} className={className} />;
};

export default ProtectedImage;