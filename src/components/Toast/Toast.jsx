import React, { useState, useEffect, useRef } from 'react';
import './Toast.css';

function Toast({ message, onClose }) {
  const [visible, setVisible] = useState(true);
  const innerTimerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      innerTimerRef.current = setTimeout(onClose, 300);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(innerTimerRef.current);
    };
  }, [onClose]);

  return (
    <div className={`toast ${visible ? 'toast-visible' : 'toast-hidden'}`}>
      {message}
    </div>
  );
}

export default Toast;
