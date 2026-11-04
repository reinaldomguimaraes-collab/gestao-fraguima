"use client";

import { useFormStatus } from "react-dom";

/**
 * Botão de formulário que mostra feedback visual (texto + desabilitado)
 * enquanto a Server Action está processando. Sem isso, o botão parece
 * "não fazer nada" por 1-2 segundos (tempo de validar a senha e redirecionar),
 * e a pessoa acaba clicando várias vezes achando que não funcionou.
 */
export function SubmitButton({
  children,
  pendingText,
  className
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}