import React, { useEffect, useState } from "react";
import axios from "axios";

// CONFIGURATION: Adjust this to your actual server URL if not globally set
// If you import WEB_URL from a config file, use that instead.
const API_BASE_URL = "http://localhost:5000"; 

const ProtectedImage = ({ imgSrc, alt, className, defaultImage = "/images/profile1.png" }) => {
  const [currentSrc, setCurrentSrc] = useState(defaultImage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Validation: If no source, show default immediately
    if (!imgSrc) {
      setCurrentSrc(defaultImage);
      setLoading(false);
      return;
    }

    // 2. Optimization: If the image is already a public URL (like "images/logo.png" or "https://google.com...")
    // We don't need Axios. Just render it.
    if (!imgSrc.startsWith("http") && !imgSrc.startsWith("/uploads") && !imgSrc.includes("api/")) {
        // Assuming static assets don't need auth
        setCurrentSrc(imgSrc); 
        setLoading(false);
        return;
    }

    // 3. The Secure Fetch
    const fetchSecureImage = async () => {
      try {
        setLoading(true);
        
        // Construct full URL if it's a relative path from your DB
        const fullUrl = imgSrc.startsWith("http") ? imgSrc : `${API_BASE_URL}${imgSrc}`;

        const response = await axios.get(fullUrl, {
          responseType: "blob", // CRITICAL: This is what allows us to bypass the 401 error
        });

        const objectUrl = URL.createObjectURL(response.data);
        setCurrentSrc(objectUrl);
      } catch (error) {
        console.error("Error loading protected image:", error);
        setCurrentSrc(defaultImage); // Fallback to default on 401/404
      } finally {
        setLoading(false);
      }
    };

    fetchSecureImage();
  }, [imgSrc, defaultImage]);

  if (loading) {
      // Optional: Render a small skeleton or spinner here if you want
      return <div className={`skeleton-loader ${className}`} style={{ backgroundColor: '#ccc', minHeight: '50px' }}></div>;
  }

  return <img src={currentSrc} alt={alt} className={className} />;
};

export default ProtectedImage;