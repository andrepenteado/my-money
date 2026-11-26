import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  Injector,
  signal,
} from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  catchError,
  combineLatest,
  forkJoin,
  of,
  startWith,
  Subject,
  Subscription,
  switchMap,
} from "rxjs";
import { toast } from "ngx-sonner";
import Swal from "sweetalert2";
import { Lancamento } from "../../../domain/entities/lancamento";
import { Parcela } from "../../../domain/entities/parcela";
import { TipoLancamento } from "../../../domain/enums/tipo-lancamento";
import { FormaPagamento } from "../../../domain/enums/forma-pagamento";
import { Campo } from "../../../components/campos/campo";
import {
  dataValida,
  inteiro,
  naoBranco,
} from "../../../components/campos/validadores";
import { OPCOES_FORMAS, OPCOES_TIPOS } from "../../../components/opcoes";
import { LancamentoService } from "../../../services/lancamento.service";
import { ParcelaService } from "../../../services/parcela.service";
import { CarregamentoService } from "../../../services/carregamento.service";
import { mensagemErro } from "../../../services/api";
@Component({
  selector: "app-cadastro-lancamento",
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, Campo],
  templateUrl: "./cadastro.html",
})
export class CadastroLancamento {
  private readonly service = inject(LancamentoService);
  private readonly parcelasService = inject(ParcelaService);
  private readonly carregamento = inject(CarregamentoService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  readonly tipos = OPCOES_TIPOS;
  readonly formas = OPCOES_FORMAS;
  readonly id = signal<number | null>(null);
  readonly parcelas = signal<Parcela[]>([]);
  readonly aba = signal<"dados" | "parcelas">("dados");
  readonly carregando = signal(true);
  readonly gravando = signal(false);
  readonly erroCarga = signal("");
  readonly erroGravacao = signal("");
  readonly ano = Number(
    new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    }).format(new Date()),
  );
  readonly f = new FormGroup({
    descricao: new FormControl("", {
      nonNullable: true,
      validators: naoBranco,
    }),
    pessoa: new FormControl("", { nonNullable: true, validators: naoBranco }),
    valor: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
    data: new FormControl<string | null>(null, [
      Validators.required,
      dataValida,
    ]),
    recorrencia: new FormControl<number | null>(null, [
      Validators.required,
      inteiro,
      Validators.min(0),
    ]),
    tipo: new FormControl<TipoLancamento | null>(null, Validators.required),
    forma_pagamento: new FormControl<FormaPagamento | null>(
      null,
      Validators.required,
    ),
  });
  readonly renovacao = new FormGroup({
    valor: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
    dia_vencimento: new FormControl<number | null>(null, [
      Validators.required,
      inteiro,
      Validators.min(1),
      Validators.max(31),
    ]),
  });
  private readonly recarregar = new Subject<void>();
  private carga?: Subscription;
  private operacao?: Subscription;
  private terminarCarga: () => void = () => {};
  private terminarOperacao: () => void = () => {};
  private encerrado = false;
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.encerrado = true;
      this.carga?.unsubscribe();
      this.operacao?.unsubscribe();
      this.terminarCarga();
      this.terminarOperacao();
    });
    this.carga = combineLatest([
      inject(ActivatedRoute).paramMap,
      this.recarregar.pipe(startWith(undefined)),
    ])
      .pipe(
        switchMap(([params]) => {
          this.terminarCarga();
          this.terminarCarga = this.carregamento.iniciar();
          this.carregando.set(true);
          this.erroCarga.set("");
          const parametro = params.get("id");
          const id = parametro ? Number(parametro) : null;
          if (id !== this.id()) {
            this.operacao?.unsubscribe();
            this.terminarOperacao();
            this.gravando.set(false);
          }
          this.id.set(id);
          this.erroGravacao.set("");
          if (id === null) {
            this.f.reset();
            this.parcelas.set([]);
            return of(null);
          }
          return forkJoin({
            lancamento: this.service.buscar(id),
            parcelas: this.parcelasService.pesquisar({ fk_lancamento: id }),
          }).pipe(
            catchError((e) => {
              this.erroCarga.set(mensagemErro(e));
              return of(null);
            }),
          );
        }),
      )
      .subscribe({
        next: (r) => {
          if (r) {
            this.preencher(r.lancamento);
            this.parcelas.set(r.parcelas);
          }
          this.aposCarga();
        },
        error: (e) => {
          this.erroCarga.set(mensagemErro(e));
          this.aposCarga();
        },
      });
  }
  tentarNovamente() {
    this.recarregar.next();
  }
  private preencher(l: Lancamento) {
    this.id.set(l.id!);
    this.f.patchValue(l);
    this.f.markAsPristine();
    this.f.markAsUntouched();
    this.renovacao.setValue({
      valor: l.valor,
      dia_vencimento: Number(l.data.slice(8, 10)),
    });
    this.renovacao.markAsUntouched();
  }
  private aposCarga() {
    this.carregando.set(false);
    afterNextRender(this.terminarCarga, { injector: this.injector });
  }
  private validar() {
    if (this.f.valid) return true;
    this.f.markAllAsTouched();
    this.aba.set("dados");
    afterNextRender(
      () =>
        document
          .querySelector<HTMLElement>("#form-lancamento .is-invalid")
          ?.focus(),
      { injector: this.injector },
    );
    return false;
  }
  gravar() {
    if (
      this.gravando() ||
      this.carregando() ||
      this.erroCarga() ||
      !this.validar()
    )
      return;
    this.gravando.set(true);
    this.erroGravacao.set("");
    this.terminarOperacao = this.carregamento.iniciar();
    const dados = {
      ...this.f.getRawValue(),
      id: this.id() ?? undefined,
    } as Lancamento;
    this.operacao = this.service.gravar(dados).subscribe({
      next: (l) => {
        this.preencher(l);
        toast.success("Lançamento gravado e parcelas atualizadas.");
        void this.router.navigate(["/lancamentos/cadastro", l.id], {
          replaceUrl: true,
        });
        this.atualizarParcelas(l.id!);
      },
      error: (e) => this.falha(e),
    });
  }
  private atualizarParcelas(id: number) {
    this.operacao = this.parcelasService
      .pesquisar({ fk_lancamento: id })
      .subscribe({
        next: (p) => {
          this.parcelas.set(p);
          this.concluir();
        },
        error: (e) => this.falha(e),
      });
  }
  private concluir() {
    this.gravando.set(false);
    afterNextRender(this.terminarOperacao, { injector: this.injector });
  }
  private falha(e: unknown) {
    this.erroGravacao.set(mensagemErro(e));
    toast.error(mensagemErro(e));
    this.gravando.set(false);
    this.terminarOperacao();
  }
  async renovar() {
    if (!this.id() || this.gravando() || this.carregando()) return;
    if (this.renovacao.invalid) {
      this.renovacao.markAllAsTouched();
      return;
    }
    this.gravando.set(true);
    const r = this.renovacao.getRawValue();
    const resposta = await Swal.fire({
      title: `Renovar para ${this.ano}?`,
      text: `Confirme o valor mensal de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(r.valor!)} e o vencimento no dia ${r.dia_vencimento}. As parcelas anteriores serão preservadas.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar renovação",
      cancelButtonText: "Cancelar",
    });
    if (!resposta.isConfirmed || this.encerrado) {
      this.gravando.set(false);
      return;
    }
    this.erroGravacao.set("");
    this.terminarOperacao = this.carregamento.iniciar();
    this.operacao = this.service
      .renovar(this.id()!, {
        ano: this.ano,
        valor: r.valor!,
        dia_vencimento: r.dia_vencimento!,
      })
      .subscribe({
        next: (l) => {
          this.preencher(l);
          toast.success(`Parcelas de ${this.ano} geradas.`);
          this.atualizarParcelas(l.id!);
        },
        error: (e) => this.falha(e),
      });
  }
}
