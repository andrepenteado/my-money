import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
  untracked,
} from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import DataTable from "datatables.net-dt";
import { Api } from "datatables.net";
import { Lancamento } from "../../domain/entities/lancamento";
import { Parcela } from "../../domain/entities/parcela";
import { FORMAS } from "../../domain/enums/forma-pagamento";
import { TIPOS } from "../../domain/enums/tipo-lancamento";
@Component({
  selector: "app-grid",
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: "./grid.html",
})
export class Grid {
  readonly lancamentos = input<readonly Lancamento[] | null>(null);
  readonly parcelas = input<readonly Parcela[] | null>(null);
  readonly revisao = input(0);
  readonly ocupado = input(false);
  readonly preservarContexto = input(false);
  readonly pronto = output<number>();
  readonly excluir = output<Lancamento>();
  readonly tabela = viewChild<ElementRef<HTMLTableElement>>("tabela");
  readonly visivel = signal(false);
  readonly linhasLancamento = signal<readonly Lancamento[]>([]);
  readonly linhasParcela = signal<readonly Parcela[]>([]);
  readonly formas = FORMAS;
  readonly tipos = TIPOS;
  private instancia?: Api;
  private readonly injector = inject(Injector);
  private versao = 0;
  private encerrado = false;
  constructor() {
    effect(() => {
      const lancamentos = this.lancamentos(),
        parcelas = this.parcelas();
      const revisao = this.revisao();
      if (lancamentos === null && parcelas === null) return;
      const versao = ++this.versao;
      const contexto =
        untracked(() => this.preservarContexto()) && this.instancia
          ? { ordem: this.instancia.order(), pagina: this.instancia.page() }
          : null;
      this.instancia?.destroy();
      this.instancia = undefined;
      this.visivel.set(false);
      // O Angular remove a tabela antes de criar as novas linhas organizadas pelo plugin.
      afterNextRender(
        () => {
          if (this.encerrado || versao !== this.versao) return;
          this.linhasLancamento.set(lancamentos ?? []);
          this.linhasParcela.set(parcelas ?? []);
          this.visivel.set(true);
          afterNextRender(
            () => {
              if (this.encerrado || versao !== this.versao) return;
              const tabela = this.tabela()?.nativeElement;
              if (!tabela) return;
              this.instancia = new DataTable(tabela, {
                order: [[1, "desc"]],
                columnDefs: [
                  { targets: 0, orderable: false, searchable: false },
                ],
                pageLength: 10,
                language: {
                  search: "Busca rápida:",
                  lengthMenu: "Exibir _MENU_ registros",
                  info: "_START_ a _END_ de _TOTAL_ registros",
                  infoEmpty: "Nenhum registro",
                  infoFiltered: "(de _MAX_ registros)",
                  emptyTable: "Nenhum registro encontrado. Revise os filtros.",
                  zeroRecords: "Nenhum registro corresponde à busca rápida.",
                  paginate: {
                    first: "Primeira",
                    last: "Última",
                    next: "Próxima",
                    previous: "Anterior",
                  },
                },
              });
              if (contexto) {
                this.instancia.order(contexto.ordem);
                this.instancia
                  .page(
                    Math.min(
                      contexto.pagina,
                      Math.max(0, this.instancia.page.info().pages - 1),
                    ),
                  )
                  .draw(false);
              }
              this.pronto.emit(revisao);
            },
            { injector: this.injector },
          );
        },
        { injector: this.injector },
      );
    });
    inject(DestroyRef).onDestroy(() => {
      this.encerrado = true;
      this.versao++;
      this.instancia?.destroy();
    });
  }
}
