import React from "react";

export function Switch({ checked = false, onCheckedChange }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={e => onCheckedChange?.(e.target.checked)}
      />
      <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${checked ? "bg-green-500" : "bg-gray-300"}`}>
        <span className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${checked ? "translate-x-5" : ""}`}></span>
      </span>
    </label>
  );
}
