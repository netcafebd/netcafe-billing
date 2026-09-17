import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "brand";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20",
    warning: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20",
    danger: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10",
    info: "bg-sky-50 text-sky-700 border-sky-200 ring-sky-700/10",
    neutral: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10",
    brand: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-700/10",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border ring-1 ring-inset shadow-xs transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PAID":
    case "ACTIVE":
    case "VERIFIED":
      return <Badge variant="success">{status.replace("_", " ")}</Badge>;
    case "PAYMENT_SUBMITTED":
    case "PENDING":
      return <Badge variant="warning">{status === "PAYMENT_SUBMITTED" ? "PAYMENT SUBMITTED" : "PENDING VERIFICATION"}</Badge>;
    case "OVERDUE":
    case "REJECTED":
    case "SUSPENDED":
      return <Badge variant="danger">{status.replace("_", " ")}</Badge>;
    case "UNPAID":
      return <Badge variant="info">UNPAID</Badge>;
    case "INACTIVE":
    case "CANCELLED":
    default:
      return <Badge variant="neutral">{status.replace("_", " ")}</Badge>;
  }
}

