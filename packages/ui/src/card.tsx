import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "glass" | "solid" | "bordered";
}

export function Card({ children, className, variant = "glass", ...props }: CardProps) {
  const base = "rounded-2xl p-6 transition-all duration-200";
  const variants = {
    glass: "bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-xl text-slate-100",
    solid: "bg-slate-900 border border-slate-800 text-slate-100 shadow-md",
    bordered: "border border-slate-800 bg-transparent text-slate-100",
  };

  return (
    <div className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {children}
    </div>
  );
}
