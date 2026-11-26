import { InjectionToken } from "@angular/core";
import { HttpErrorResponse, HttpParams } from "@angular/common/http";
export const API_URL = new InjectionToken<string>("API_URL", {
  providedIn: "root",
  factory: () => "/backend",
});
export function parametros(filtro: object): HttpParams {
  let params = new HttpParams();
  for (const [campo, valor] of Object.entries(filtro)) {
    if (valor !== null && valor !== undefined && String(valor).trim() !== "")
      params = params.set(campo, String(valor));
  }
  return params;
}
export function mensagemErro(erro: unknown): string {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0)
      return "Não foi possível acessar o servidor. Verifique a conexão e tente novamente.";
    const dados = erro.error as {
      detail?: string;
      erros?: Record<string, string>;
    } | null;
    if (dados?.erros) return Object.values(dados.erros).join(" ");
    if (dados?.detail) return dados.detail;
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}
