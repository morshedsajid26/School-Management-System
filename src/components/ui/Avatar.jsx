"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/formatters";

export default function Avatar({
  src,
  alt = "User Avatar",
  name = "",
  size = "md",
  status, // "online" | "offline" | "busy"
  className = "",
}) {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg font-bold",
  };

  const statusSizes = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
    xl: "h-3.5 w-3.5",
  };

  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-slate-400",
    busy: "bg-amber-500",
  };

  const showImage = src && !hasError;
  const initials = getInitials(name || alt);

  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-medium overflow-hidden border border-slate-200/80 bg-slate-100 text-slate-700 select-none shadow-xs",
          sizes[size] || sizes.md
        )}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
            statusSizes[size] || "h-2 w-2",
            statusColors[status] || "bg-emerald-500"
          )}
        />
      )}
    </div>
  );
}
