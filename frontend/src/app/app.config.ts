import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { registerLocaleData } from "@angular/common";
import pt from "@angular/common/locales/pt";
import { provideRouter } from "@angular/router";
import { provideNgxMask } from "ngx-mask";
import { routes } from "./app.routes";
registerLocaleData(pt);
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideNgxMask(),
    { provide: LOCALE_ID, useValue: "pt-BR" },
  ],
};
