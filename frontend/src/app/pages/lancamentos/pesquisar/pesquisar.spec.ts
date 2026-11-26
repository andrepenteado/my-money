import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNgxMask } from "ngx-mask";
import { NgxSpinnerService } from "ngx-spinner";
import { PesquisarLancamentos } from "./pesquisar";
import { FormaPagamento } from "../../../domain/enums/forma-pagamento";
import { TipoLancamento } from "../../../domain/enums/tipo-lancamento";
import { Lancamento } from "../../../domain/entities/lancamento";

@Component({
  imports: [PesquisarLancamentos],
  template: `<app-pesquisar-lancamentos />`,
})
class PesquisaTeste {}
describe("Pesquisa e DataTables", () => {
  const spinner = {
    show: vi.fn(() => Promise.resolve()),
    hide: vi.fn(() => Promise.resolve()),
  };
  const lancamento = (id: number, descricao: string): Lancamento => ({
    id,
    descricao,
    pessoa: "André",
    valor: 100,
    data: "2026-01-31",
    recorrencia: 1,
    tipo: TipoLancamento.DESPESA,
    forma_pagamento: FormaPagamento.PIX,
  });
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [PesquisaTeste],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNgxMask(),
        { provide: NgxSpinnerService, useValue: spinner },
      ],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it("exibe resposta assíncrona, segunda pesquisa, vazio e novos registros sem outro clique", async () => {
    const fixture = TestBed.createComponent(PesquisaTeste);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const page = fixture.debugElement.children[0]
      .componentInstance as PesquisarLancamentos;
    expect(spinner.show).toHaveBeenCalled();
    expect(spinner.hide).not.toHaveBeenCalled();
    http
      .expectOne("/backend/lancamentos/pesquisar")
      .flush([lancamento(1, "Primeiro")]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Primeiro");
    expect(spinner.hide).toHaveBeenCalled();
    page.f.controls.descricao.setValue("Segundo");
    page.pesquisar();
    http
      .expectOne("/backend/lancamentos/pesquisar?descricao=Segundo")
      .flush([lancamento(2, "Segundo")]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Segundo");
    expect(
      fixture.nativeElement.querySelector("tbody").textContent,
    ).not.toContain("Primeiro");
    expect(fixture.nativeElement.querySelectorAll(".dt-container").length).toBe(
      1,
    );
    page.f.controls.descricao.setValue("Vazio");
    page.pesquisar();
    http.expectOne("/backend/lancamentos/pesquisar?descricao=Vazio").flush([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(
      "Nenhum registro encontrado",
    );
    page.limpar();
    http
      .expectOne("/backend/lancamentos/pesquisar")
      .flush([lancamento(3, "Terceiro")]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Terceiro");
    expect(fixture.nativeElement.querySelectorAll(".dt-container").length).toBe(
      1,
    );
  });
  it("preserva filtros em erro e libera o carregamento para tentar novamente", async () => {
    const fixture = TestBed.createComponent(PesquisaTeste);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const page = fixture.debugElement.children[0]
      .componentInstance as PesquisarLancamentos;
    http
      .expectOne("/backend/lancamentos/pesquisar")
      .flush([], { status: 500, statusText: "Falha" });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(page.carregando()).toBe(false);
    page.f.controls.descricao.setValue("Preservada");
    page.pesquisar();
    http
      .expectOne("/backend/lancamentos/pesquisar?descricao=Preservada")
      .flush(
        { detail: "Tente novamente." },
        { status: 500, statusText: "Falha" },
      );
    await fixture.whenStable();
    expect(page.f.controls.descricao.value).toBe("Preservada");
    expect(spinner.hide).toHaveBeenCalled();
  });
});
