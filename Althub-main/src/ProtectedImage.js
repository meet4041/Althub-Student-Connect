import React, { useEffect, useState } from "react";
import axios from "axios";

const ProtectedImage = ({ src, alt, className }) => {
  const defaultAvatar = "/images/profile1.png";
  const [imageSrc, setImageSrc] = useState(defaultAvatar);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Use Axios so the Interceptor adds the Token automatically
        const response = await axios.get(src, {
          responseType: "blob", // Important: Tell axios we expect a file, not JSON
        });

        // Create a local URL for the image blob
        const objectUrl = URL.createObjectURL(response.data);
        setImageSrc(objectUrl);
      } catch (error) {
        console.error("Failed to load image:", error);
        setImageSrc(defaultAvatar); // Fallback on error
      }
    };

    if (src) {
      fetchImage();
    }
  }, [src]);

  return <img src={imageSrc} alt={alt} className={className} />;
};

export default ProtectedImage;