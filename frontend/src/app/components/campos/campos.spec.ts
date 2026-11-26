import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { provideNgxMask } from "ngx-mask";
import { Moeda } from "./moeda";
import { Data } from "./data";
import { dataValida, efetivacao, periodo } from "./validadores";

@Component({
  imports: [ReactiveFormsModule, Moeda, Data],
  template: `<app-moeda [id]="'valor'" [formControl]="valor" /><app-data
      [id]="'data'"
      [formControl]="data"
    />`,
})
class CamposTeste {
  valor = new FormControl<number | null>(null);
  data = new FormControl<string | null>(null, dataValida);
}
describe("Campos monetários e datas", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [CamposTeste],
      providers: [provideNgxMask()],
    }),
  );
  it("preserva o número recebido da API, formata pt-BR e mantém vazio como null", async () => {
    const fixture = TestBed.createComponent(CamposTeste);
    fixture.componentInstance.valor.setValue(1234.5);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input#valor");
    expect(input.value).toBe("1.234,50");
    expect(fixture.componentInstance.valor.value).toBe(1234.5);
    input.value = "";
    input.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "deleteContentBackward",
      }),
    );
    await fixture.whenStable();
    expect(fixture.componentInstance.valor.value).toBeNull();
  });
  it("digita centavos pela direita e ignora separadores que não mudam as casas", async () => {
    const fixture = TestBed.createComponent(CamposTeste);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input#valor");
    input.focus();
    for (const digito of "15050") {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: digito, bubbles: true }),
      );
      input.value += digito;
      input.setSelectionRange(input.value.length, input.value.length);
      input.dispatchEvent(
        new InputEvent("input", {
          data: digito,
          inputType: "insertText",
          bubbles: true,
        }),
      );
      await fixture.whenStable();
    }
    expect(input.value).toBe("150,50");
    expect(fixture.componentInstance.valor.value).toBe(150.5);
    input.value += ",";
    input.setSelectionRange(input.value.length, input.value.length);
    input.dispatchEvent(
      new InputEvent("input", {
        data: ",",
        inputType: "insertText",
        bubbles: true,
      }),
    );
    await fixture.whenStable();
    expect(fixture.componentInstance.valor.value).toBe(150.5);
  });
  it("cola valor localizado e devolve número", async () => {
    const fixture = TestBed.createComponent(CamposTeste);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input#valor");
    input.value = "1.234,50";
    input.setSelectionRange(input.value.length, input.value.length);
    input.dispatchEvent(
      new InputEvent("input", {
        data: "1.234,50",
        inputType: "insertFromPaste",
        bubbles: true,
      }),
    );
    await fixture.whenStable();
    expect(fixture.componentInstance.valor.value).toBe(1234.5);
    expect(input.value).toBe("1.234,50");
  });
  it("cola dígitos como centavos e continua digitando pela direita", async () => {
    const fixture = TestBed.createComponent(CamposTeste);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input#valor");
    const evento = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(evento, "clipboardData", {
      value: { getData: () => "15050" },
    });
    input.dispatchEvent(evento);
    await fixture.whenStable();
    expect(input.value).toBe("150,50");
    expect(fixture.componentInstance.valor.value).toBe(150.5);
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "1", bubbles: true }),
    );
    input.value += "1";
    input.setSelectionRange(input.value.length, input.value.length);
    input.dispatchEvent(
      new InputEvent("input", {
        data: "1",
        inputType: "insertText",
        bubbles: true,
      }),
    );
    await fixture.whenStable();
    expect(input.value).toBe("1.505,01");
    expect(fixture.componentInstance.valor.value).toBe(1505.01);
  });
  it("mantém o dia ISO e rejeita datas impossíveis e incompletas", async () => {
    const fixture = TestBed.createComponent(CamposTeste);
    fixture.componentInstance.data.setValue("2026-01-31");
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector("input#data");
    expect(input.value).toBe("31/01/2026");
    input.value = "30/02/2026";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.data.invalid).toBe(true);
    fixture.componentInstance.data.setValue("2028-02-29");
    expect(fixture.componentInstance.data.valid).toBe(true);
    fixture.componentInstance.data.setValue("2026-02-29");
    expect(fixture.componentInstance.data.invalid).toBe(true);
    fixture.componentInstance.data.setValue("2026-02");
    expect(fixture.componentInstance.data.invalid).toBe(true);
  });
  it("valida consolidação em conjunto e período ordenado", () => {
    const form = new FormGroup(
      {
        data_efetiva: new FormControl<string | null>(null),
        valor_efetivo: new FormControl<number | null>(null),
      },
      { validators: efetivacao },
    );
    expect(form.valid).toBe(true);
    form.controls.valor_efetivo.setValue(90);
    expect(form.hasError("efetivacao")).toBe(true);
    form.controls.data_efetiva.setValue("2026-01-31");
    expect(form.valid).toBe(true);
    const filtro = new FormGroup(
      {
        inicio: new FormControl("2026-02-01"),
        fim: new FormControl("2026-01-31"),
      },
      { validators: periodo },
    );
    expect(filtro.hasError("periodo")).toBe(true);
  });
});
