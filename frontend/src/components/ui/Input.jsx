import React, { forwardRef } from "react";

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon,
    rightElement,
    required = false,
    className = "",
    containerClassName = "",
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className={`tracto-form-group ${containerClassName}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="tracto-label">
          {label}
          {required && <span className="tracto-required">*</span>}
        </label>
      )}

      <div
        className={`tracto-input-wrapper ${icon ? "has-icon-left" : ""} ${
          rightElement ? "has-element-right" : ""
        } ${error ? "has-error" : ""} ${disabled ? "is-disabled" : ""}`}
      >
        {icon && <span className="tracto-input-icon left">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`tracto-input ${className}`.trim()}
          {...props}
        />
        {rightElement && <div className="tracto-input-element right">{rightElement}</div>}
      </div>

      {error ? (
        <p className="tracto-form-feedback error">{error}</p>
      ) : helperText ? (
        <p className="tracto-form-feedback helper">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
