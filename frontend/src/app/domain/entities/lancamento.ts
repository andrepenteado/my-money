import { TipoLancamento } from "../enums/tipo-lancamento";
import { FormaPagamento } from "../enums/forma-pagamento";
export interface Lancamento {
  id?: number;
  descricao: string;
  pessoa: string;
  valor: number;
  data: string;
  recorrencia: number;
  tipo: TipoLancamento;
  forma_pagamento: FormaPagamento;
}
export interface LancamentoFiltro {
  id?: number;
  descricao?: string;
  pessoa?: string;
  valor?: number;
  data?: string;
  recorrencia?: number;
  tipo?: TipoLancamento;
  forma_pagamento?: FormaPagamento;
}
export interface Renovacao {
  ano: number;
  valor: number;
  dia_vencimento: number;
}
