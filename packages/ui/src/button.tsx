import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-dophy-500 hover:bg-dophy-600 text-white shadow-md shadow-dophy-500/20 focus:ring-dophy-500 active:scale-[0.98]",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 focus:ring-slate-700 active:scale-[0.98]",
    outline: "border border-slate-700 hover:bg-slate-800/50 text-slate-200 focus:ring-dophy-500 active:scale-[0.98]",
    ghost: "text-slate-300 hover:bg-slate-800/40 hover:text-white focus:ring-slate-700",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 focus:ring-red-500 active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-semibold",
    md: "px-4 py-2 text-sm font-semibold",
    lg: "px-6 py-3 text-base font-semibold",
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
}
