import { Component, forwardRef, input } from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";
@Component({
  selector: "app-moeda",
  imports: [ReactiveFormsModule, NgxMaskDirective],
  providers: [
    provideNgxMask({
      typeFromDecimals: true,
      decimalMarker: ",",
      thousandSeparator: ".",
      leadZero: true,
    }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Moeda),
      multi: true,
    },
  ],
  template: `<div class="input-group" (paste)="colar($event)">
    <span class="input-group-text">R$</span
    ><input
      [id]="id()"
      [formControl]="controle"
      mask="separator.2"
      [validation]="false"
      [dropSpecialCharacters]="true"
      type="text"
      inputmode="numeric"
      class="form-control text-end"
      [class.is-invalid]="invalido()"
      [attr.aria-invalid]="invalido()"
      [attr.aria-describedby]="id() + '-erro'"
      placeholder="0,00"
      (blur)="tocar()"
    />
  </div>`,
})
export class Moeda implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly invalido = input(false);
  readonly controle = new FormControl<number | string | null>(null);
  private alterar: (v: number | null) => void = () => {};
  tocar: () => void = () => {};
  constructor() {
    this.controle.valueChanges.subscribe((v) =>
      this.alterar(v === null || v === "" ? null : Number(v)),
    );
  }
  colar(evento: ClipboardEvent) {
    const texto = evento.clipboardData?.getData("text").trim() ?? "";
    if (!/^\d+$/.test(texto)) return;
    evento.preventDefault();
    const campo = evento.target as HTMLInputElement;
    const formatado = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(texto) / 100);
    campo.value = formatado;
    campo.setSelectionRange(formatado.length, formatado.length);
    campo.dispatchEvent(
      new InputEvent("input", {
        inputType: "insertFromPaste",
        data: formatado,
        bubbles: true,
      }),
    );
  }
  writeValue(v: number | null) {
    this.controle.setValue(v, { emitEvent: false });
  }
  registerOnChange(fn: (v: number | null) => void) {
    this.alterar = fn;
  }
  registerOnTouched(fn: () => void) {
    this.tocar = fn;
  }
  setDisabledState(disabled: boolean) {
    disabled
      ? this.controle.disable({ emitEvent: false })
      : this.controle.enable({ emitEvent: false });
  }
}
