import React from "react";

export function Button({
  children,
  variant = "primary", // primary, secondary, outline, ghost, danger, accent, success
  size = "md", // sm, md, lg
  fullWidth = false,
  isLoading = false,
  loadingText,
  icon,
  iconPosition = "left",
  className = "",
  disabled,
  type = "button",
  onClick,
  ...props
}) {
  const baseClasses = "tracto-btn";
  const variantClass = `tracto-btn-${variant}`;
  const sizeClass = `tracto-btn-${size}`;
  const widthClass = fullWidth ? "tracto-btn-block" : "";
  const loadingClass = isLoading ? "tracto-btn-loading" : "";

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className="tracto-btn-spinner-wrapper">
          <span className="tracto-spinner" aria-hidden="true" />
          <span>{loadingText || children}</span>
        </span>
      ) : (
        <span className="tracto-btn-content">
          {icon && iconPosition === "left" && <span className="tracto-btn-icon left">{icon}</span>}
          {children}
          {icon && iconPosition === "right" && <span className="tracto-btn-icon right">{icon}</span>}
        </span>
      )}
    </button>
  );
}

export default Button;
