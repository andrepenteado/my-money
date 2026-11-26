import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  Injector,
  signal,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {
  catchError,
  combineLatest,
  of,
  startWith,
  Subject,
  Subscription,
  switchMap,
} from "rxjs";
import { toast } from "ngx-sonner";
import { Parcela, ParcelaDados } from "../../../domain/entities/parcela";
import { FormaPagamento } from "../../../domain/enums/forma-pagamento";
import { Campo } from "../../../components/campos/campo";
import {
  dataValida,
  dataIso,
  efetivacao,
} from "../../../components/campos/validadores";
import { OPCOES_FORMAS } from "../../../components/opcoes";
import { ParcelaService } from "../../../services/parcela.service";
import { CarregamentoService } from "../../../services/carregamento.service";
import { mensagemErro } from "../../../services/api";
@Component({
  selector: "app-cadastro-parcela",
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Campo],
  templateUrl: "./cadastro.html",
})
export class CadastroParcela {
  private readonly service = inject(ParcelaService);
  private readonly carregamento = inject(CarregamentoService);
  private readonly injector = inject(Injector);
  readonly formas = OPCOES_FORMAS;
  readonly parcela = signal<Parcela | null>(null);
  readonly carregando = signal(true);
  readonly gravando = signal(false);
  readonly erroCarga = signal("");
  readonly erroGravacao = signal("");
  readonly f = new FormGroup(
    {
      data_vencimento: new FormControl<string | null>(null, [
        Validators.required,
        dataValida,
      ]),
      valor_vencimento: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(0.01),
      ]),
      data_efetiva: new FormControl<string | null>(null, dataValida),
      valor_efetivo: new FormControl<number | null>(null, Validators.min(0.01)),
      forma_pagamento: new FormControl<FormaPagamento | null>(
        null,
        Validators.required,
      ),
    },
    { validators: efetivacao },
  );
  private readonly recarregar = new Subject<void>();
  private carga?: Subscription;
  private operacao?: Subscription;
  private terminarCarga: () => void = () => {};
  private terminarOperacao: () => void = () => {};
  constructor() {
    inject(DestroyRef).onDestroy(() => {
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
          this.parcela.set(null);
          this.erroGravacao.set("");
          this.operacao?.unsubscribe();
          this.terminarOperacao();
          this.gravando.set(false);
          return this.service.buscar(Number(params.get("id"))).pipe(
            catchError((e) => {
              this.erroCarga.set(mensagemErro(e));
              return of(null);
            }),
          );
        }),
      )
      .subscribe({
        next: (p) => {
          if (p) this.preencher(p);
          this.carregando.set(false);
          afterNextRender(this.terminarCarga, { injector: this.injector });
        },
        error: (e) => {
          this.erroCarga.set(mensagemErro(e));
          this.carregando.set(false);
          this.terminarCarga();
        },
      });
  }
  tentarNovamente() {
    this.recarregar.next();
  }
  private preencher(p: Parcela) {
    this.parcela.set(p);
    this.f.patchValue(p);
    this.f.markAsPristine();
    this.f.markAsUntouched();
  }
  vencimentoResumo() {
    const data = this.f.controls.data_vencimento.value;
    return data && dataIso(data) ? data : null;
  }
  gravar() {
    if (this.gravando() || this.carregando() || !this.parcela()) return;
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      afterNextRender(
        () =>
          document
            .querySelector<HTMLElement>("#form-parcela .is-invalid")
            ?.focus(),
        { injector: this.injector },
      );
      return;
    }
    this.gravando.set(true);
    this.erroGravacao.set("");
    this.terminarOperacao = this.carregamento.iniciar();
    const dados = {
      ...this.f.getRawValue(),
      id: this.parcela()!.id,
      fk_lancamento: this.parcela()!.fk_lancamento,
    } as ParcelaDados;
    this.operacao = this.service.gravar(dados).subscribe({
      next: (p) => {
        this.preencher(p);
        this.gravando.set(false);
        toast.success(
          p.situacao === "CONSOLIDADA"
            ? "Parcela consolidada."
            : "Parcela gravada como pendente.",
        );
        afterNextRender(this.terminarOperacao, { injector: this.injector });
      },
      error: (e) => {
        this.erroGravacao.set(mensagemErro(e));
        toast.error(mensagemErro(e));
        this.gravando.set(false);
        this.terminarOperacao();
      },
    });
  }
}
