import React from "react";

export function Badge({ children, className = "", variant = "default", ...props }) {
  const styles = variant === "outline" ? "border border-green-500 text-green-700" : "bg-green-100 text-green-800";
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${styles} ${className}`} {...props}>
      {children}
    </span>
  );
}
