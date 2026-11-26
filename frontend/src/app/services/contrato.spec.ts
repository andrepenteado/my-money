import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { LancamentoService } from "./lancamento.service";
import { ParcelaService } from "./parcela.service";
import { FormaPagamento } from "../domain/enums/forma-pagamento";
import { TipoLancamento } from "../domain/enums/tipo-lancamento";
describe("Contrato HTTP", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it("envia zero e filtros tipados para o backend", () => {
    TestBed.inject(LancamentoService)
      .pesquisar({
        recorrencia: 0,
        valor: 1234.5,
        data: "2026-01-31",
        descricao: "Família",
      })
      .subscribe();
    const r = TestBed.inject(HttpTestingController).expectOne(
      (req) => req.url === "/backend/lancamentos/pesquisar",
    );
    expect(r.request.params.get("recorrencia")).toBe("0");
    expect(r.request.params.get("valor")).toBe("1234.5");
    expect(r.request.params.get("data")).toBe("2026-01-31");
    r.flush([]);
  });
  it("grava moeda numérica, dia ISO e constantes dos enums", () => {
    TestBed.inject(LancamentoService)
      .gravar({
        descricao: "Compra",
        pessoa: "André",
        valor: 150.5,
        data: "2026-01-31",
        recorrencia: 1,
        tipo: TipoLancamento.DESPESA,
        forma_pagamento: FormaPagamento.PIX,
      })
      .subscribe();
    const r = TestBed.inject(HttpTestingController).expectOne(
      "/backend/lancamentos",
    );
    expect(r.request.method).toBe("POST");
    expect(r.request.body.valor).toBe(150.5);
    expect(r.request.body.forma_pagamento).toBe("PIX");
    r.flush({ id: 1, ...r.request.body });
  });
  it("envia uma edição de parcela com FK por identificador e efetivação opcional", () => {
    TestBed.inject(ParcelaService)
      .gravar({
        id: 2,
        fk_lancamento: 1,
        data_vencimento: "2026-02-15",
        valor_vencimento: 100,
        data_efetiva: null,
        valor_efetivo: null,
        forma_pagamento: FormaPagamento.PIX,
      })
      .subscribe();
    const r = TestBed.inject(HttpTestingController).expectOne(
      "/backend/parcelas/2",
    );
    expect(r.request.method).toBe("PUT");
    expect(r.request.body.fk_lancamento).toBe(1);
    expect(r.request.body.valor_efetivo).toBeNull();
    r.flush(r.request.body);
  });
});
