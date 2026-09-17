import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  className?: string;
}

export function Alert({ type = "info", title, message, className }: AlertProps) {
  const styles = {
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-800",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-800",
      icon: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    },
  };

  const current = styles[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-sm shadow-2xs",
        current.bg,
        className
      )}
    >
      {current.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold">{title}</h4>}
        <p className={cn("text-xs sm:text-sm", title && "mt-0.5")}>{message}</p>
      </div>
    </div>
  );
}

