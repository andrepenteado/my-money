import { Component, forwardRef, input } from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { NgxMaskDirective } from "ngx-mask";
@Component({
  selector: "app-data",
  imports: [ReactiveFormsModule, NgxMaskDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Data),
      multi: true,
    },
  ],
  template: `<input
    [id]="id()"
    [formControl]="controle"
    mask="00/00/0000"
    [dropSpecialCharacters]="false"
    [validation]="false"
    type="text"
    inputmode="numeric"
    class="form-control"
    [class.is-invalid]="invalido()"
    [attr.aria-invalid]="invalido()"
    [attr.aria-describedby]="id() + '-erro'"
    placeholder="dd/MM/aaaa"
    (blur)="tocar()"
  />`,
})
export class Data implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly invalido = input(false);
  readonly controle = new FormControl("", { nonNullable: true });
  private alterar: (v: string | null) => void = () => {};
  tocar: () => void = () => {};
  constructor() {
    this.controle.valueChanges.subscribe((v) => {
      const partes = v.split("/");
      this.alterar(
        !v
          ? null
          : partes.length === 3
            ? `${partes[2]}-${partes[1]}-${partes[0]}`
            : v,
      );
    });
  }
  writeValue(v: string | null) {
    this.controle.setValue(v ? v.split("-").reverse().join("/") : "", {
      emitEvent: false,
    });
  }
  registerOnChange(fn: (v: string | null) => void) {
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
