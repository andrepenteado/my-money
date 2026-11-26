import { FORMAS } from "../domain/enums/forma-pagamento";
import { TIPOS } from "../domain/enums/tipo-lancamento";
export const OPCOES_FORMAS = Object.entries(FORMAS).map(([valor, label]) => ({
  valor,
  label,
}));
export const OPCOES_TIPOS = Object.entries(TIPOS).map(([valor, label]) => ({
  valor,
  label,
}));
