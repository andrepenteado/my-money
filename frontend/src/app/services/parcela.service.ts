import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  Parcela,
  ParcelaDados,
  ParcelaFiltro,
  ResumoPeriodo,
  PlanejamentoMes,
} from "../domain/entities/parcela";
import { API_URL, parametros } from "./api";
@Injectable({ providedIn: "root" })
export class ParcelaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/parcelas`;
  pesquisar(filtro: ParcelaFiltro = {}) {
    return this.http.get<Parcela[]>(`${this.url}/pesquisar`, {
      params: parametros(filtro),
    });
  }
  buscar(id: number) {
    return this.http.get<Parcela>(`${this.url}/${id}`);
  }
  gravar(dados: ParcelaDados) {
    return this.http.put<Parcela>(`${this.url}/${dados.id}`, dados);
  }
  resumo(filtro: ParcelaFiltro) {
    return this.http.get<ResumoPeriodo>(`${this.url}/resumo`, {
      params: parametros(filtro),
    });
  }
  planejamento() {
    return this.http.get<PlanejamentoMes[]>(`${this.url}/planejamento`);
  }
}
