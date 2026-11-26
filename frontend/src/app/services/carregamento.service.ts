import { inject, Injectable } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
@Injectable({ providedIn: "root" })
export class CarregamentoService {
  private readonly spinner = inject(NgxSpinnerService);
  private readonly tarefas = new Set<symbol>();
  iniciar(): () => void {
    const tarefa = Symbol();
    this.tarefas.add(tarefa);
    void this.spinner.show();
    return () => {
      this.tarefas.delete(tarefa);
      if (!this.tarefas.size) void this.spinner.hide();
    };
  }
}
