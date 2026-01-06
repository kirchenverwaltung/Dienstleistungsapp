import React from "react";

export function SidebarProvider({ children }) {
  return <div data-sidebar-provider>{children}</div>;
}

export function Sidebar({ children, className = "" }) {
  return <aside className={className} data-sidebar>{children}</aside>;
}

export function SidebarContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SidebarGroup({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SidebarMenu({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SidebarMenuItem({ children }) {
  return <div>{children}</div>;
}

export function SidebarMenuButton({ children, className = "", asChild, ...props }) {
  const Component = asChild ? React.Fragment : "button";
  return asChild ? (
    React.cloneElement(children, { className })
  ) : (
    <Component className={className} {...props}>{children}</Component>
  );
}

export function SidebarHeader({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SidebarTrigger({ children }) {
  return <>{children}</>;
}
