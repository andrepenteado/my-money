import { TipoLancamento } from "../enums/tipo-lancamento";
import { FormaPagamento } from "../enums/forma-pagamento";
export interface ParcelaDados {
  id?: number;
  fk_lancamento: number;
  data_vencimento: string;
  valor_vencimento: number;
  data_efetiva: string | null;
  valor_efetivo: number | null;
  forma_pagamento: FormaPagamento;
}
export interface Parcela extends ParcelaDados {
  id: number;
  descricao: string;
  pessoa: string;
  tipo: TipoLancamento;
  situacao: "PENDENTE" | "CONSOLIDADA";
}
export interface ParcelaFiltro {
  id?: number;
  fk_lancamento?: number;
  data_vencimento?: string;
  valor_vencimento?: number;
  data_efetiva?: string;
  valor_efetivo?: number;
  forma_pagamento?: FormaPagamento;
  inicio?: string;
  fim?: string;
  visao?: "PREVISTA" | "CONSOLIDADA";
}
export interface Totais {
  receitas: number;
  despesas: number;
  resultado: number;
}
export interface ResumoPeriodo {
  previsto: Totais;
  consolidado: Totais;
}
export interface PlanejamentoMes {
  mes: string;
  previsto: Totais;
}
