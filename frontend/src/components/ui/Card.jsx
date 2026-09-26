import React from "react";

export function Card({
  children,
  variant = "default", // default, glass, outlined, elevated, flat
  hoverable = false,
  padding = "md", // none, sm, md, lg
  className = "",
  onClick,
  ...props
}) {
  const classes = [
    "tracto-card",
    `tracto-card-${variant}`,
    `tracto-card-p-${padding}`,
    hoverable ? "tracto-card-hoverable" : "",
    onClick ? "tracto-card-interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", action, ...props }) {
  return (
    <div className={`tracto-card-header ${className}`.trim()} {...props}>
      <div className="tracto-card-header-content">{children}</div>
      {action && <div className="tracto-card-header-action">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = "", ...props }) {
  return (
    <div className={`tracto-card-body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={`tracto-card-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
