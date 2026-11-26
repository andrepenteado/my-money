import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  Lancamento,
  LancamentoFiltro,
  Renovacao,
} from "../domain/entities/lancamento";
import { API_URL, parametros } from "./api";
@Injectable({ providedIn: "root" })
export class LancamentoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/lancamentos`;
  pesquisar(filtro: LancamentoFiltro = {}) {
    return this.http.get<Lancamento[]>(`${this.url}/pesquisar`, {
      params: parametros(filtro),
    });
  }
  buscar(id: number) {
    return this.http.get<Lancamento>(`${this.url}/${id}`);
  }
  gravar(dados: Lancamento) {
    return dados.id
      ? this.http.put<Lancamento>(`${this.url}/${dados.id}`, dados)
      : this.http.post<Lancamento>(this.url, dados);
  }
  excluir(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  renovar(id: number, dados: Renovacao) {
    return this.http.post<Lancamento>(`${this.url}/${id}/renovar`, dados);
  }
}
