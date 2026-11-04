"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText,
  className,
  disabled
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending} aria-busy={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}