import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  size = "md", // sm, md, lg, xl
  className = "",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="tracto-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`tracto-modal tracto-modal-${size} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tracto-modal-header">
          <div className="tracto-modal-title-wrapper">
            {icon && <span className="tracto-modal-icon">{icon}</span>}
            {title && <h3 className="tracto-modal-title">{title}</h3>}
          </div>
          <button
            type="button"
            className="tracto-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className="tracto-modal-body">{children}</div>

        {footer && <div className="tracto-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
