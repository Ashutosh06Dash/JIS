import React from "react";

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  disabled = false,
  required = false,
  error = "",
  ...props
}) => {
  const inputClasses = `
    w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 shadow-sm
    ${error ? "border-red-500" : "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 focus:outline-none"}
    ${disabled ? "bg-gray-100 opacity-70 cursor-not-allowed" : "bg-white"}
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className={`block mb-2 text-sm font-medium 
            ${error ? "text-red-600" : "text-gray-700"}`}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
