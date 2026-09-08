import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  children: React.ReactNode;
}

export function Badge({ variant = "info", className, children, ...props }: BadgeProps) {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide";

  const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    info: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    neutral: "bg-slate-800 text-slate-300 border border-slate-700",
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {children}
    </span>
  );
}
