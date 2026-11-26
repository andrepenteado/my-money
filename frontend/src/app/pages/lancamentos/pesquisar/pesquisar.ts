import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import Swal from "sweetalert2";
import { toast } from "ngx-sonner";
import {
  Lancamento,
  LancamentoFiltro,
} from "../../../domain/entities/lancamento";
import { TipoLancamento } from "../../../domain/enums/tipo-lancamento";
import { FormaPagamento } from "../../../domain/enums/forma-pagamento";
import { Campo } from "../../../components/campos/campo";
import { dataValida, inteiro } from "../../../components/campos/validadores";
import { Grid } from "../../../components/grid/grid";
import { OPCOES_FORMAS, OPCOES_TIPOS } from "../../../components/opcoes";
import { LancamentoService } from "../../../services/lancamento.service";
import { CarregamentoService } from "../../../services/carregamento.service";
import { mensagemErro } from "../../../services/api";
@Component({
  selector: "app-pesquisar-lancamentos",
  imports: [ReactiveFormsModule, RouterLink, Campo, Grid],
  templateUrl: "./pesquisar.html",
})
export class PesquisarLancamentos implements OnInit {
  private readonly service = inject(LancamentoService);
  private readonly carregamento = inject(CarregamentoService);
  readonly tipos = OPCOES_TIPOS;
  readonly formas = OPCOES_FORMAS;
  readonly linhas = signal<Lancamento[] | null>(null);
  readonly erro = signal("");
  readonly carregando = signal(false);
  readonly excluindo = signal(false);
  readonly filtrosAbertos = signal(false);
  readonly revisao = signal(0);
  readonly preservarContexto = signal(false);
  readonly f = new FormGroup({
    id: new FormControl<number | null>(null, [inteiro, Validators.min(1)]),
    descricao: new FormControl("", { nonNullable: true }),
    pessoa: new FormControl("", { nonNullable: true }),
    valor: new FormControl<number | null>(null),
    data: new FormControl<string | null>(null, dataValida),
    recorrencia: new FormControl<number | null>(null, [
      inteiro,
      Validators.min(0),
    ]),
    tipo: new FormControl<TipoLancamento | null>(null),
    forma_pagamento: new FormControl<FormaPagamento | null>(null),
  });
  private revisaoEsperada: number | null = null;
  private consulta?: Subscription;
  private exclusao?: Subscription;
  private terminar: () => void = () => {};
  private encerrado = false;
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.encerrado = true;
      this.consulta?.unsubscribe();
      this.exclusao?.unsubscribe();
      this.terminar();
    });
  }
  ngOnInit() {
    this.pesquisar();
  }
  pesquisar(preservar = false) {
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
    this.preservarContexto.set(preservar);
    const v = this.f.getRawValue();
    const filtro: LancamentoFiltro = {
      id: v.id ?? undefined,
      descricao: v.descricao,
      pessoa: v.pessoa,
      valor: v.valor ?? undefined,
      data: v.data ?? undefined,
      recorrencia: v.recorrencia ?? undefined,
      tipo: v.tipo ?? undefined,
      forma_pagamento: v.forma_pagamento ?? undefined,
    };
    this.consulta = this.service.pesquisar(filtro).subscribe({
      next: (linhas) => {
        this.revisaoEsperada = this.revisao() + 1;
        this.linhas.set(linhas);
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
  async excluir(l: Lancamento) {
    if (this.excluindo() || this.carregando()) return;
    this.excluindo.set(true);
    const resposta = await Swal.fire({
      title: "Excluir lançamento?",
      text: `O lançamento “${l.descricao}” e todas as suas parcelas serão excluídos.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b02a37",
    });
    if (!resposta.isConfirmed || this.encerrado) {
      this.excluindo.set(false);
      return;
    }
    this.exclusao = this.service.excluir(l.id!).subscribe({
      next: () => {
        this.excluindo.set(false);
        toast.success("Lançamento e parcelas excluídos.");
        this.pesquisar(true);
      },
      error: (e) => {
        this.excluindo.set(false);
        toast.error(mensagemErro(e));
      },
    });
  }
}
