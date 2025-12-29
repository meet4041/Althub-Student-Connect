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
      try {
        setLoading(true);
        // Ensure strictly one slash between base and path
        const cleanPath = imgSrc.startsWith("/") ? imgSrc : `/${imgSrc}`;
        const fullUrl = `${WEB_URL}${cleanPath}`; // <--- This fails if WEB_URL is empty!

        // RETRIEVE TOKEN FROM STORAGE 
        // CHECK: Is this key "Althub_Token" or just "token" in your Login.jsx?
        const token = localStorage.getItem("Althub_Token"); 

        const response = await axios.get(fullUrl, {
          responseType: "blob", 
          withCredentials: false, // Set false to satisfy Chrome CORS
          headers: {
             // Sends Header (Primary Auth)
             "Authorization": token ? `Bearer ${token}` : "" 
          }
        });

        // Convert the raw data (blob) into a viewable URL
        const objectUrl = URL.createObjectURL(response.data);
        setCurrentSrc(objectUrl);
      } catch (error) {
        console.error("Image Load Failed:", error);
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