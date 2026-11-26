import { Component, input } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
} from "@angular/forms";
import { Data } from "./data";
import { Moeda } from "./moeda";
@Component({
  selector: "app-campo",
  imports: [ReactiveFormsModule, Data, Moeda],
  templateUrl: "./campo.html",
})
export class Campo {
  readonly controle = input.required<AbstractControl>();
  readonly campoId = input.required<string>();
  readonly label = input.required<string>();
  readonly tipo = input<
    "texto" | "inteiro" | "moeda" | "data" | "select" | "radio"
  >("texto");
  readonly obrigatorio = input(false);
  readonly opcoes = input<readonly { valor: string | number; label: string }[]>(
    [],
  );
  get formControl() {
    return this.controle() as FormControl<string | number | null>;
  }
  get invalido() {
    return this.controle().invalid && this.controle().touched;
  }
  get erro(): string {
    const c = this.controle();
    if (c.hasError("required"))
      return `Informe ${this.label().toLocaleLowerCase("pt-BR")}.`;
    if (c.hasError("data")) return "Informe uma data completa e válida.";
    if (c.hasError("inteiro")) return "Informe um número inteiro.";
    if (c.hasError("min")) return `O valor mínimo é ${c.getError("min").min}.`;
    if (c.hasError("max")) return `O valor máximo é ${c.getError("max").max}.`;
    return "Confira o valor informado.";
  }
}
