import React from "react";

export function Badge({
  children,
  variant = "neutral", // primary, success, warning, danger, info, neutral, accent, pending, approved, paid, completed, cancelled, rejected
  size = "md", // sm, md
  dot = false,
  className = "",
  ...props
}) {
  // Normalize alias variants
  let normalizedVariant = variant;
  if (variant === "pending") normalizedVariant = "warning";
  else if (variant === "approved") normalizedVariant = "info";
  else if (variant === "paid" || variant === "completed" || variant === "active") normalizedVariant = "success";
  else if (variant === "rejected" || variant === "cancelled") normalizedVariant = "danger";

  return (
    <span
      className={`tracto-badge tracto-badge-${normalizedVariant} tracto-badge-${size} ${className}`.trim()}
      {...props}
    >
      {dot && <span className="tracto-badge-dot" />}
      {children}
    </span>
  );
}

export default Badge;
