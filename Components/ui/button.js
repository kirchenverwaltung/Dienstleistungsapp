import React from "react";

export function Button({ children, className = "", variant = "default", size = "md", ...props }) {
  return (
    <button
      className={`px-3 py-2 rounded-md border border-transparent bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 ${
        variant === "ghost" ? "bg-transparent text-inherit border-none" : ""
      } ${size === "icon" ? "p-2 aspect-square" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
