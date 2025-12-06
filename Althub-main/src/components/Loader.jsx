import React from "react";

const styles = `
  .global-loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(2px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 15px;
  }

  .global-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(102, 189, 158, 0.2);
    border-radius: 50%;
    border-top-color: #66bd9e;
    animation: spin 1s ease-in-out infinite;
  }

  .loader-text {
    font-family: 'Poppins', sans-serif;
    color: #66bd9e;
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.5px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Loader = () => {
  return (
    <>
      <style>{styles}</style>
      <div className="global-loader-overlay">
        <div className="global-spinner"></div>
        <div className="loader-text">Loading...</div>
      </div>
    </>
  );
};

export default Loader;