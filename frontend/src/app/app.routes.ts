import { Routes } from "@angular/router";
export const routes: Routes = [
  { path: "", redirectTo: "lancamentos/pesquisar", pathMatch: "full" },
  {
    path: "lancamentos",
    children: [
      { path: "", redirectTo: "pesquisar", pathMatch: "full" },
      {
        path: "pesquisar",
        loadComponent: () =>
          import("./pages/lancamentos/pesquisar/pesquisar").then(
            (m) => m.PesquisarLancamentos,
          ),
      },
      {
        path: "cadastro",
        loadComponent: () =>
          import("./pages/lancamentos/cadastro/cadastro").then(
            (m) => m.CadastroLancamento,
          ),
      },
      {
        path: "cadastro/:id",
        loadComponent: () =>
          import("./pages/lancamentos/cadastro/cadastro").then(
            (m) => m.CadastroLancamento,
          ),
      },
    ],
  },
  {
    path: "parcelas",
    children: [
      { path: "", redirectTo: "pesquisar", pathMatch: "full" },
      {
        path: "pesquisar",
        loadComponent: () =>
          import("./pages/parcelas/pesquisar/pesquisar").then(
            (m) => m.PesquisarParcelas,
          ),
      },
      {
        path: "cadastro/:id",
        loadComponent: () =>
          import("./pages/parcelas/cadastro/cadastro").then(
            (m) => m.CadastroParcela,
          ),
      },
    ],
  },
  { path: "**", redirectTo: "lancamentos/pesquisar" },
];
