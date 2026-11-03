import { randomBytes } from "crypto";

/** Token de convite / definição de senha — de uso único, com validade de 7 dias. */
export function gerarTokenConvite() {
  return randomBytes(24).toString("hex");
}

export function expiraEm7Dias() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

/** Código curto exibido no Administrativo (ex.: CLI-0001), nunca usado para controle de acesso. */
export function proximoCodigoEmpresa(ultimoNumero: number) {
  const n = ultimoNumero + 1;
  return `CLI-${String(n).padStart(4, "0")}`;
}
