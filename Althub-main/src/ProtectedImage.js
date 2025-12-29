import React, { useEffect, useState } from "react";
import axios from "axios";
import { WEB_URL } from "./baseURL"; // Import the shared URL

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
    if (imgSrc.startsWith("http") || !imgSrc.includes("/api/")) { 
       // Checks if it's NOT an API route (assuming API routes have /api/)
       // If your DB saves paths like "/uploads/..." that are static, this condition might need tweaking.
       // But usually GridFS routes look like "/api/image/..."
       if(imgSrc.startsWith("http")) {
         setCurrentSrc(imgSrc);
         setLoading(false);
         return;
       }
    }

    // 3. The Secure Fetch
    const fetchSecureImage = async () => {
      try {
        setLoading(true);
        // Use WEB_URL instead of hardcoded localhost:5000
        const fullUrl = imgSrc.startsWith("http") ? imgSrc : `${WEB_URL}${imgSrc}`;

        const response = await axios.get(fullUrl, {
          responseType: "blob", 
          withCredentials: true // Ensure cookies are sent if needed
        });

        const objectUrl = URL.createObjectURL(response.data);
        setCurrentSrc(objectUrl);
      } catch (error) {
        // console.error("Error loading protected image:", error);
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