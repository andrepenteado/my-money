import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { forkJoin, Subscription } from "rxjs";
import {
  Parcela,
  ParcelaFiltro,
  ResumoPeriodo,
  PlanejamentoMes,
} from "../../../domain/entities/parcela";
import { FormaPagamento } from "../../../domain/enums/forma-pagamento";
import { Campo } from "../../../components/campos/campo";
import {
  dataValida,
  inteiro,
  periodo,
} from "../../../components/campos/validadores";
import { Grid } from "../../../components/grid/grid";
import { OPCOES_FORMAS } from "../../../components/opcoes";
import { ParcelaService } from "../../../services/parcela.service";
import { LancamentoService } from "../../../services/lancamento.service";
import { CarregamentoService } from "../../../services/carregamento.service";
import { mensagemErro } from "../../../services/api";
@Component({
  selector: "app-pesquisar-parcelas",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    Campo,
    Grid,
  ],
  templateUrl: "./pesquisar.html",
})
export class PesquisarParcelas implements OnInit {
  private readonly service = inject(ParcelaService);
  private readonly lancamentos = inject(LancamentoService);
  private readonly carregamento = inject(CarregamentoService);
  readonly formas = OPCOES_FORMAS;
  readonly opcoesLancamentos = signal<{ valor: number; label: string }[]>([]);
  readonly linhas = signal<Parcela[] | null>(null);
  readonly resumo = signal<ResumoPeriodo | null>(null);
  readonly planejamento = signal<PlanejamentoMes[]>([]);
  readonly erro = signal("");
  readonly carregando = signal(false);
  readonly filtrosAbertos = signal(false);
  readonly revisao = signal(0);
  readonly f = new FormGroup(
    {
      id: new FormControl<number | null>(null, [inteiro, Validators.min(1)]),
      fk_lancamento: new FormControl<number | null>(null),
      data_vencimento: new FormControl<string | null>(null, dataValida),
      valor_vencimento: new FormControl<number | null>(null),
      data_efetiva: new FormControl<string | null>(null, dataValida),
      valor_efetivo: new FormControl<number | null>(null),
      forma_pagamento: new FormControl<FormaPagamento | null>(null),
      inicio: new FormControl<string | null>(null, dataValida),
      fim: new FormControl<string | null>(null, dataValida),
      visao: new FormControl<"PREVISTA" | "CONSOLIDADA">("PREVISTA", {
        nonNullable: true,
      }),
    },
    { validators: periodo },
  );
  private revisaoEsperada: number | null = null;
  private consulta?: Subscription;
  private terminar: () => void = () => {};
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.consulta?.unsubscribe();
      this.terminar();
    });
  }
  ngOnInit() {
    this.pesquisar();
  }
  pesquisar() {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      this.filtrosAbertos.set(true);
      return;
    }
    this.consulta?.unsubscribe();
    this.revisaoEsperada = null;
    this.terminar();
    this.terminar = this.carregamento.iniciar();
    this.carregando.set(true);
    this.erro.set("");
    const v = this.f.getRawValue();
    const filtro: ParcelaFiltro = {
      id: v.id ?? undefined,
      fk_lancamento: v.fk_lancamento ?? undefined,
      data_vencimento: v.data_vencimento ?? undefined,
      valor_vencimento: v.valor_vencimento ?? undefined,
      data_efetiva: v.data_efetiva ?? undefined,
      valor_efetivo: v.valor_efetivo ?? undefined,
      forma_pagamento: v.forma_pagamento ?? undefined,
      inicio: v.inicio ?? undefined,
      fim: v.fim ?? undefined,
      visao: v.visao,
    };
    this.consulta = forkJoin({
      linhas: this.service.pesquisar(filtro),
      resumo: this.service.resumo(filtro),
      planejamento: this.service.planejamento(),
      lancamentos: this.lancamentos.pesquisar(),
    }).subscribe({
      next: (r) => {
        this.opcoesLancamentos.set(
          r.lancamentos.map((l) => ({
            valor: l.id!,
            label: `${l.descricao} — ${l.pessoa} (ID ${l.id})`,
          })),
        );
        this.resumo.set(r.resumo);
        this.planejamento.set(r.planejamento);
        this.revisaoEsperada = this.revisao() + 1;
        this.linhas.set(r.linhas);
        this.revisao.set(this.revisaoEsperada);
      },
      error: (e) => {
        this.erro.set(mensagemErro(e));
        this.concluirCarga();
      },
    });
  }
  gridPronto(revisao: number) {
    if (revisao === this.revisaoEsperada) this.concluirCarga();
  }
  private concluirCarga() {
    this.carregando.set(false);
    this.terminar();
  }
  limpar() {
    this.f.reset();
    this.pesquisar();
  }
}
