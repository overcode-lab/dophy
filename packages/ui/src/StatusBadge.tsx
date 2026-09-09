import React from "react";

export type StatusType =
  | "pending"
  | "processing"
  | "completed"
  | "rejected"
  | "active"
  | "inactive"
  | "calculated"
  | "withdrawn";

export interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const statusStyles: Record<string, { bg: string; border: string; defaultLabel: string }> = {
    pending: {
      bg: "bg-amber-50 text-amber-700",
      border: "border-amber-200/80",
      defaultLabel: "Diajukan ⏳",
    },
    processing: {
      bg: "bg-sky-50 text-sky-700",
      border: "border-sky-200/80",
      defaultLabel: "Diproses 🔄",
    },
    completed: {
      bg: "bg-emerald-50 text-emerald-700",
      border: "border-emerald-200/80",
      defaultLabel: "Selesai ✅",
    },
    rejected: {
      bg: "bg-rose-50 text-rose-700",
      border: "border-rose-200/80",
      defaultLabel: "Ditolak ❌",
    },
    active: {
      bg: "bg-emerald-50 text-emerald-700",
      border: "border-emerald-200/80",
      defaultLabel: "Aktif",
    },
    inactive: {
      bg: "bg-rose-50 text-rose-700",
      border: "border-rose-200/90",
      defaultLabel: "Nonaktif",
    },
    suspend: {
      bg: "bg-rose-50 text-rose-700",
      border: "border-rose-200/90",
      defaultLabel: "Suspend",
    },
    suspended: {
      bg: "bg-rose-50 text-rose-700",
      border: "border-rose-200/90",
      defaultLabel: "Suspend",
    },
    nonaktif: {
      bg: "bg-rose-50 text-rose-700",
      border: "border-rose-200/90",
      defaultLabel: "Nonaktif",
    },
    calculated: {
      bg: "bg-teal-50 text-teal-700",
      border: "border-teal-200",
      defaultLabel: "Terhitung",
    },
    withdrawn: {
      bg: "bg-purple-50 text-purple-700",
      border: "border-purple-200",
      defaultLabel: "Dicairkan",
    },
  };

  const style = statusStyles[normalizedStatus] || {
    bg: "bg-slate-100 text-slate-700",
    border: "border-slate-200",
    defaultLabel: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-extrabold tracking-wide uppercase shadow-2xs whitespace-nowrap shrink-0 ${style.bg} ${style.border} ${className}`}
    >
      {label || style.defaultLabel}
    </span>
  );
}
