import React from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}) {
  return (
    <div className={`tracto-empty-state ${className}`.trim()}>
      {icon && <div className="tracto-empty-icon">{icon}</div>}
      {title && <h3 className="tracto-empty-title">{title}</h3>}
      {description && <p className="tracto-empty-description">{description}</p>}
      {(action || secondaryAction) && (
        <div className="tracto-empty-actions">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
