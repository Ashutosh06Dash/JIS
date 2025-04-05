import React from "react";

const Button = ({
  variant = "primary",
  type = "button",
  className = "",
  disabled = false,
  children,
  onClick,
  ...props
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 ease-in-out inline-flex items-center justify-center";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg py-2 px-6",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-[calc(0.5rem-2px)] px-[calc(1.5rem-2px)]",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg py-2 px-6",
    accent: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg py-2 px-6",
    text: "text-indigo-600 hover:bg-indigo-50 py-2 px-4"
  };

  const disabledClasses = "opacity-60 cursor-not-allowed";

  const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${disabled ? disabledClasses : ""}
    ${className}
  `;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
