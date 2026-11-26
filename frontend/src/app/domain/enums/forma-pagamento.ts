export enum FormaPagamento {
  PIX = "PIX",
  TRANSFERENCIA_BANCARIA = "TRANSFERENCIA_BANCARIA",
  CARTAO_CREDITO = "CARTAO_CREDITO",
  CARTAO_DEBITO = "CARTAO_DEBITO",
}
export const FORMAS: Record<FormaPagamento, string> = {
  PIX: "Pix",
  TRANSFERENCIA_BANCARIA: "Transferência Bancária",
  CARTAO_CREDITO: "Cartão de Crédito",
  CARTAO_DEBITO: "Cartão de Débito",
};
