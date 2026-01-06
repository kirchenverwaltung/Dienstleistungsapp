import React, { useState } from "react";

export function Tabs({ defaultValue, children, className = "" }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className={className} data-tabs-value={value}>
      {React.Children.map(children, child => React.cloneElement(child, { value, setValue }))}
    </div>
  );
}

export function TabsList({ children }) {
  return <div className="flex gap-2 mb-2">{children}</div>;
}

export function TabsTrigger({ value: tabValue, children, setValue, value }) {
  const active = value === tabValue;
  return (
    <button
      className={`px-3 py-2 rounded-md border ${active ? "bg-green-500 text-white" : "bg-white text-gray-700"}`}
      onClick={() => setValue(tabValue)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value: tabValue, children, value }) {
  return value === tabValue ? <div>{children}</div> : null;
}
