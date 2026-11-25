---
name: frontend-angular
description: Criar ou alterar telas Angular de pesquisa e cadastro de CRUDs, com Bootstrap, filtros, grid DataTables e formulários reativos. Use para definir o desenho visual e o comportamento dos componentes, incluindo a integração mínima com modelos, serviços e navegação.
---

# Frontend Angular para CRUDs

Produza pesquisa e cadastro com a mesma linguagem visual e interações previsíveis. Use Angular e bibliotecas diretamente, sem exigir uma biblioteca agregadora ou componentes-base herdados.

## Contexto e referências

Leia o `AGENTS.md`, a especificação de negócio e as telas existentes do projeto. Identifique campos, rótulos, obrigatoriedade, filtros, colunas, ações, relacionamentos e coleções. Os exemplos de uma especificação servem de referência; não criam campos ou funcionalidades não solicitados.

Confira as versões, dependências e estilos disponíveis antes de escrever imports ou configurações. Use DataTables para grid, ngx-sonner para notificações, SweetAlert2 (`sweetalert2`) para perguntas e confirmações, ngx-mask para máscaras e ngx-spinner para carregamento. A menção nesta skill não comprova que a integração está configurada; verifique o projeto antes de usá-la.

Obtenha do README a raiz do frontend, as versões, o idioma, locale, moeda, escala e formatos. Confirme versões e configuração nos manifests e lockfiles. Escolha versões de bibliotecas compatíveis com o Angular adotado; não atualize o framework apenas para usar uma API desta orientação. Componentes standalone, módulos, formulários tipados, blocos de template e mecanismos reativos devem seguir os recursos disponíveis na versão do projeto.

Os textos e classes das referências são exemplos de apresentação: adapte o idioma, os rótulos e os utilitários à configuração e à versão Bootstrap do projeto, mantendo a hierarquia visual e as interações.

Leia conforme a tarefa:

| Tarefa | Referência |
| --- | --- |
| Interpretar os metadados de campos nas tabelas do README | [Modelo CRUD](../modelo-crud/SKILL.md) |
| Lista, filtros, ações de linha e ciclo do DataTables | [Pesquisa](references/pesquisa.md) |
| Formulário, abas, gravação e coleções | [Cadastro](references/cadastro.md) |
| Controles, formatação, validação e leitura | [Campos](references/campos.md) |
| Modelos, serviços, rotas e menu necessários à tela | [Integração](references/integracao.md) |

Esta skill cobre interface e interação. Autenticação, configuração por perfis, monitoramento, logs remotos e infraestrutura ficam fora de seu escopo.

## Linguagem visual compartilhada

- Breadcrumb acima do conteúdo: `Início`, entidade no plural e, no cadastro, modo da tela. Use links reais das rotas existentes e marque o item atual com `aria-current="page"`.
- Conteúdo em `section.container.py-3`. Cabeçalho com contexto curto, ícone coerente quando disponível, um `h1` em negrito e subtítulo útil. Na pesquisa, a ação `Novo` acompanha o cabeçalho; no cadastro, as ações finais ficam abaixo do card.
- Use a grade Bootstrap com `row g-3` e colunas responsivas. Em telas pequenas, empilhe campos e ações; preserve a ordem de leitura. Evite larguras fixas que causem rolagem horizontal na página.
- Cards agrupam consulta ou formulário. Subdivida o formulário com seções internas, título, ícone e explicação curta, sem um card novo por grupo de campos.
- Ação principal em `btn-primary`; navegação e cancelamento em botão secundário; exclusão em `btn-outline-danger`. Use os mesmos textos para a mesma ação: `Novo`, `Pesquisar`, `Limpar filtros`, `Voltar`, `Gravar`, `Adicionar`, `Excluir`.
- Prefira utilitários Bootstrap. Classes semânticas como `record-cell` ou `filters-collapse` só devem ser usadas com estilos existentes ou definidos na implementação; não pressuponha um tema externo. Reutilize a biblioteca de ícones disponível, sem acrescentar uma apenas para um ícone decorativo.

## Templates e estilos

- Templates de componentes são fragmentos Angular. Use blocos `@if`, `@for` e `@switch` quando suportados; em versões anteriores, adapte para as diretivas estruturais disponíveis. A estrutura do documento fica no arquivo de entrada da aplicação; não copie `<html>`, `<head>`, `<body>`, scripts ou CDNs de uma referência visual para o componente.
- Use os estilos e assets presentes no projeto. Caminhos de templates externos não devem aparecer como imports do código gerado; um recurso necessário precisa existir na estrutura e configuração da aplicação.
- Carregue os CSS das bibliotecas antes das regras globais do projeto, pela ordem de `styles` no `angular.json` ou por imports no início da folha global. Ajustes compartilhados ficam na folha global; estilos exclusivos da tela ficam no componente. Preserve uma ordem de carregamento que permita aplicar os ajustes locais às bibliotecas.

## Estados e feedback

Modele carregamento, sucesso, vazio, erro e operação em andamento. Na abertura de pesquisa e cadastro, desenhe a estrutura inicial e use ngx-spinner durante a preparação e carga dos dados. Encerre-o quando grid, resumos, formulário e opções necessários à tela estiverem renderizados e utilizáveis. Na pesquisa, isso inclui a inicialização do DataTables.

Ao aplicar ou limpar filtros, ative ngx-spinner antes da consulta e mantenha-o até exibir o novo resultado no grid. Encerre-o também em erro, cancelamento ou saída da tela. Coordene o spinner com a operação ativa para que uma resposta antiga não o esconda enquanto a consulta atual ainda carrega. Compartilhe a instância quando adequado, sem sobrepor indicadores duplicados para a mesma carga.

Exponha o estado assíncrono com signals quando disponíveis, `async` pipe ou outro mecanismo compatível com a versão e a detecção de mudanças adotadas. O retorno HTTP precisa atualizar grid, resumos, opções e formulário sem depender de um clique adicional.

Em refatorações, preserve a estratégia de detecção de mudanças existente até verificar o comportamento do componente e do contêiner que o hospeda. Uma troca de estratégia precisa manter as atualizações assíncronas no DOM e usar metadados disponíveis na versão Angular adotada. Use `detectChanges()` manual apenas quando houver uma necessidade concreta de renderização, como na coordenação do DOM com DataTables, em vez de espalhá-lo para compensar um estado que não notifica mudanças.

Use ngx-sonner para notificar sucesso de uma operação ou uma falha breve. Validação detalhada permanece perto do campo, e uma falha que impede usar a tela deve oferecer uma mensagem persistente e tentativa novamente.

Use SweetAlert2 para alertas com perguntas, como confirmação de exclusão ou de alteração quando o fluxo a exigir. Identifique o registro e apresente as opções de confirmar e cancelar no idioma definido no README; execute a operação somente após confirmação explícita. Cancelamento mantém os dados e não chama o serviço. Preserve foco e operação por teclado no diálogo.

Desabilite ações repetidas enquanto a respectiva operação estiver em andamento e restabeleça o estado ao terminar, inclusive em erro. Preserve filtros e valores digitados quando uma requisição falhar. Coordene respostas assíncronas para que uma resposta antiga não substitua uma pesquisa ou registro mais recente. Atualize o conteúdo afetado sem recarregar a aplicação inteira.

## Acessibilidade e validação visual

- Botões apenas com ícone precisam de `title` e `aria-label` com ação e contexto; ícones decorativos usam `aria-hidden="true"`. Preserve foco visível e operação por teclado.
- Associe labels e mensagens aos controles. Campos obrigatórios têm rótulo destacado e indicação textual ou símbolo explicado; a cor não é a única indicação.
- Filtros compactos podem ter label visualmente oculto; placeholder sozinho não dá nome acessível ao controle.
- Abas, collapse e modais precisam de estado ARIA coerente com o conteúdo exibido. Não pressuponha que as classes Bootstrap, sozinhas, implementam interações.
- Quando houver validação em uma aba oculta, abra a primeira aba com erro e leve o foco ao controle correspondente.

Ao implementar telas, valide os critérios da referência usada, o comportamento em celular e desktop e os comandos pertinentes do projeto. Testes devem conferir comportamentos, como atualização da segunda pesquisa ou valor monetário enviado, sem apenas comparar nomes de classes. Ao alterar reatividade, confira o DOM após a resposta assíncrona, incluindo a composição com o contêiner da tela quando pertinente, sem depender de uma interação extra do usuário. Informe as limitações efetivamente encontradas na validação.
