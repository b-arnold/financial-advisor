"use client";
// A half-width labelled field, used in pairs inside a flex row.
import { ReactNode } from "react";

export function FieldHalf({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-1">{children}</div>;
}
