import React, { useState, useEffect } from 'react';
import './Toast.css';

function Toast({ message, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${visible ? 'toast-visible' : 'toast-hidden'}`}>
      {message}
    </div>
  );
}

export default Toast;
