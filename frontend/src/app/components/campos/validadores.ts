import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
export function dataIso(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [ano, mes, dia] = texto.split("-").map(Number);
  if (ano < 1 || mes < 1 || mes > 12 || dia < 1) return false;
  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
  return (
    dia <=
    [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mes - 1]
  );
}
export const dataValida: ValidatorFn = (c) =>
  !c.value || dataIso(String(c.value)) ? null : { data: true };
export const inteiro: ValidatorFn = (c) =>
  c.value === null || c.value === "" || Number.isInteger(Number(c.value))
    ? null
    : { inteiro: true };
export const naoBranco: ValidatorFn = (c) =>
  String(c.value ?? "").trim() ? null : { required: true };
export const efetivacao: ValidatorFn = (c) =>
  Boolean(c.get("data_efetiva")?.value) ===
  (c.get("valor_efetivo")?.value !== null)
    ? null
    : { efetivacao: true };
export const periodo: ValidatorFn = (c) => {
  const inicio = c.get("inicio")?.value,
    fim = c.get("fim")?.value;
  return inicio && fim && dataIso(inicio) && dataIso(fim) && fim < inicio
    ? { periodo: true }
    : null;
};
