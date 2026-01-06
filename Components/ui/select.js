import React from "react";

export function Select({ value, onValueChange, children }) {
  return <div data-select>{React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}</div>;
}

export function SelectTrigger({ children, className = "", ...props }) {
  return (
    <button className={`border border-gray-300 rounded-md px-3 py-2 w-full text-left ${className}`} {...props}>
      {children}
    </button>
  );
}

export function SelectValue({ placeholder, value }) {
  return <span>{value || placeholder}</span>;
}

export function SelectContent({ children }) {
  return <div className="mt-2 space-y-1">{children}</div>;
}

export function SelectItem({ children, value: optionValue, onValueChange }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="border border-gray-200 rounded-md px-3 py-2 hover:bg-gray-50"
      onClick={() => onValueChange?.(optionValue)}
    >
      {children}
    </div>
  );
}
