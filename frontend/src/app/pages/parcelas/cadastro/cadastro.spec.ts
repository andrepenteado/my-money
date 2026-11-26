import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from "@angular/router";
import { provideNgxMask } from "ngx-mask";
import { NgxSpinnerService } from "ngx-spinner";
import { BehaviorSubject } from "rxjs";
import { CadastroParcela } from "./cadastro";
import { Parcela } from "../../../domain/entities/parcela";
import { FormaPagamento } from "../../../domain/enums/forma-pagamento";
import { TipoLancamento } from "../../../domain/enums/tipo-lancamento";
describe("Cadastro de parcela", () => {
  let parametros: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  const parcela = (id: number): Parcela => ({
    id,
    fk_lancamento: id,
    descricao: `Origem ${id}`,
    pessoa: "André",
    tipo: TipoLancamento.DESPESA,
    situacao: "PENDENTE",
    data_vencimento: "2026-02-15",
    valor_vencimento: 100,
    data_efetiva: null,
    valor_efetivo: null,
    forma_pagamento: FormaPagamento.PIX,
  });
  beforeEach(() => {
    parametros = new BehaviorSubject(convertToParamMap({ id: "1" }));
    TestBed.configureTestingModule({
      imports: [CadastroParcela],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNgxMask(),
        { provide: ActivatedRoute, useValue: { paramMap: parametros } },
        {
          provide: NgxSpinnerService,
          useValue: {
            show: () => Promise.resolve(),
            hide: () => Promise.resolve(),
          },
        },
      ],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it("mostra dados assíncronos e carrega outro ID sem interação adicional", async () => {
    const fixture = TestBed.createComponent(CadastroParcela);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne("/backend/parcelas/1").flush(parcela(1));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("#origem-parcela").value).toBe(
      "Origem 1",
    );
    parametros.next(convertToParamMap({ id: "2" }));
    http.expectOne("/backend/parcelas/2").flush(parcela(2));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("#origem-parcela").value).toBe(
      "Origem 2",
    );
    expect(
      fixture.nativeElement.querySelector("#f-valor_vencimento").value,
    ).toBe("100,00");
  });
  it("mantém erro de carga visível e permite tentar novamente sem virar inclusão", async () => {
    const fixture = TestBed.createComponent(CadastroParcela);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne("/backend/parcelas/1")
      .flush(
        { detail: "Falha ao carregar." },
        { status: 500, statusText: "Falha" },
      );
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[role="alert"]').textContent,
    ).toContain("Falha ao carregar.");
    expect(fixture.nativeElement.querySelector("#form-parcela")).toBeNull();
    fixture.componentInstance.tentarNovamente();
    http.expectOne("/backend/parcelas/1").flush(parcela(1));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("#origem-parcela").value).toBe(
      "Origem 1",
    );
  });
});
