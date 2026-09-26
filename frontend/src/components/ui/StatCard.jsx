import React from "react";

export function StatCard({
  label,
  value,
  subtext,
  icon,
  trend, // { direction: 'up' | 'down', value: string }
  variant = "default", // default, success, warning, info, accent
  className = "",
  onClick,
}) {
  return (
    <div
      className={`tracto-stat-card tracto-stat-${variant} ${onClick ? "is-clickable" : ""} ${className}`.trim()}
      onClick={onClick}
    >
      <div className="tracto-stat-header">
        <span className="tracto-stat-label">{label}</span>
        {icon && <div className="tracto-stat-icon-wrapper">{icon}</div>}
      </div>
      <div className="tracto-stat-value">{value}</div>
      {(subtext || trend) && (
        <div className="tracto-stat-footer">
          {trend && (
            <span className={`tracto-stat-trend trend-${trend.direction}`}>
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
            </span>
          )}
          {subtext && <span className="tracto-stat-subtext">{subtext}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;
