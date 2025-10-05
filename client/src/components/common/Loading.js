import React from 'react';
import '../../styles/components.css';

const Loading = ({ 
  size = 'medium', 
  text = 'Loading...', 
  inline = false,
  overlay = false 
}) => {
  const sizeClass = `spinner-${size}`;
  const containerClass = inline ? 'loading-inline' : overlay ? 'loading-overlay' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className={`spinner ${sizeClass}`}>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
};

export default Loading;
