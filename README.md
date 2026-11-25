# my-money

## Desenvolvimento

O backend e o frontend são aplicações separadas. Instale Java, Gradle e Node nas versões de [mise.toml](mise.toml) (por exemplo, com `mise install`) e execute `make install-frontend` na raiz para instalar as dependências do frontend.

Os comandos de build, execução e testes estão no [Makefile](Makefile); consulte-os com `make help`. Para desenvolver, execute `make run-backend` e `make run-frontend` em terminais separados. O frontend fica disponível em `http://localhost:4200/`.

## Configuração técnica e particularidades do my-money

O [AGENTS.md](AGENTS.md) e as skills contêm padrões reutilizáveis para projetos Spring Boot e Angular. Esta seção concentra as escolhas específicas do my-money. Ao reutilizar as orientações, cada projeto define seus próprios valores no README e os mantém coerentes com os arquivos de build e configuração.

### Identidade e organização

| Configuração | Valor neste projeto |
| --- | --- |
| Nome | `my-money` |
| Pacote-base Java | `com.github.andrepenteado.mymoney` |
| Raiz do backend | `backend/` |
| Raiz do frontend | `frontend/` |
| Gerenciamento de ferramentas | `mise.toml` |
| Comandos de desenvolvimento | Makefile na raiz; instalação, build, execução e testes conforme `make help` |
| Aplicações | Backend e frontend separados, executados em terminais próprios |

Sob o pacote-base, use os subpacotes `domain.entities`, `domain.enums`, `domain.repositories`, `domain.filters`, `services` e `resources`, conforme os padrões do AGENTS. No frontend, mantenha `src/app/domain`, `src/app/services`, `src/app/components` e `src/app/pages/<crud>/pesquisar` ou `cadastro` relativos à sua raiz.

### Versões declaradas da stack

As versões de ferramentas são definidas no mise; as de frameworks e bibliotecas, no build e nos manifests. Intervalos npm abaixo são declarações de `package.json`; o lockfile registra as versões resolvidas.

| Tecnologia | Versão declarada | Fonte |
| --- | --- | --- |
| Java | 25; ferramenta `corretto-25.0.1.8.1` | `mise.toml` e `backend/build.gradle` |
| Spring Boot | `4.2.0` | `backend/build.gradle` |
| Gradle | `9.9.2` | `mise.toml` |
| Node.js | `24.18.0` | `mise.toml` |
| Angular | `^22.0.0` | `frontend/package.json` |
| Bootstrap | `^6.0.0-alpha.2` | `frontend/package.json` |
| QueryDSL JPA/APT | `5.1.0`, variante `jakarta` | `backend/build.gradle` |

O backend usa Gradle, Spring Data JPA e Bean Validation com APIs Jakarta. O frontend usa npm e os recursos Angular compatíveis com a versão declarada. Estes valores não são requisitos fixos do AGENTS ou das skills: outro projeto pode usar outras versões compatíveis, sem receber uma atualização automática de stack.

### Bibliotecas visuais

| Finalidade | Biblioteca | Versão declarada |
| --- | --- | --- |
| Grid de pesquisa | `datatables.net` | `^3.1.6` |
| Notificações breves | `ngx-sonner` | `^3.1.0` |
| Perguntas e confirmações | `sweetalert2` | `^11.26.26` |
| Máscaras de entrada | `ngx-mask` | `^22.3.2` |
| Carregamento de telas e pesquisas | `ngx-spinner` | `^22.0.1` |

Extensões do DataTables e demais dependências estão em `frontend/package.json`. A declaração de dependência não comprova configuração dos providers, estilos ou uso nas telas. Nas aberturas de pesquisa/cadastro e ao aplicar ou limpar filtros, o spinner permanece até os dados estarem renderizados e o grid utilizável, incluindo a inicialização do DataTables.

### Localização e valores

| Configuração | Valor neste projeto |
| --- | --- |
| Idioma da interface, mensagens e validações | Português do Brasil |
| Locale | `pt-BR` |
| Moeda | Real brasileiro: `BRL`, símbolo `R$` |
| Escala monetária | 2 casas decimais |
| Entrada monetária | Dígitos pela direita em centavos; `15050` exibe `150,50`; separadores digitados não deslocam as casas |
| Formatação monetária | `R$ 1.234,50`, alinhada à direita; API recebe valor numérico e vazio é `null` |
| Datas na interface | `dd/MM/yyyy`, com digitação direta, máscara e teclado numérico |
| Datas na API | ISO `yyyy-MM-dd`, sem conversão de dia para um instante com fuso |

Um valor monetário recebido como `1234.5` aparece como `1.234,50` e retorna como número `1234.5`. A máscara usa ngx-mask; leitura usa formatação de moeda/locale compatível com Angular. A escala monetária orienta também os tipos `BigDecimal` e a persistência decimal do backend. Regras de positividade, arredondamento, distribuição e efetivação são as descritas na especificação de negócio.

### Persistência e domínio

Liquibase é a escolha para migrações; a organização prevista fica em `backend/src/main/resources/db/changelog/`, com arquivos agrupados em `versions/` pelo `major.minor` da versão da aplicação declarada no Gradle. O starter Liquibase está declarado em `backend/build.gradle`, com versão gerenciada pelo Spring Boot; os changelogs e a configuração de execução ainda não estão presentes no backend. Esta seção define a orientação, sem indicar uma integração pronta.

O domínio financeiro distingue dados previstos de efetivos. Lançamentos geram parcelas, e a inclusão do lançamento e geração de suas parcelas deve ser uma operação atômica. Ajustes, consolidação, renovação anual e preservação de históricos seguem as regras e critérios de aceite abaixo; esses comportamentos não são regras universais para outros CRUDs.

## Especificação de negócio

### Objetivo

O my-money ajuda uma pessoa ou família a reunir receitas e despesas em uma única visão, mesmo quando vêm de diferentes bancos, cartões e membros da família. Com isso, é possível acompanhar os valores mensais e planejar as finanças do ano, inclusive para a compra de um bem.

### Entradas e modelo de dados

O usuário informa um **lançamento** para cada receita ou despesa. A partir dele, o sistema gera suas parcelas mensais.

As tabelas abaixo são o contrato para implementação dos campos e das telas. A definição das propriedades fica na [skill modelo-crud](skills/modelo-crud/SKILL.md); o desenho dos componentes segue a [skill frontend-angular](skills/frontend-angular/SKILL.md), e a implementação do backend segue a [skill backend-spring-boot](skills/backend-spring-boot/SKILL.md). Esses metadados orientam a implementação e não indicam que telas, filtros, índices ou restrições já foram implementados.

Cada linha identifica o mesmo campo nas tabelas de dados, integridade/pesquisa e apresentação. `—` significa propriedade não declarada, usando o padrão definido na skill. `colunas-layout` usa a grade de 12 colunas do Bootstrap: `4` ocupa um terço da linha e `8*` ocupa dois terços e encerra a linha.

`tipo`, `label`, `obrigatorio` e demais propriedades são metadados do campo, separados do valor enviado à API. Por exemplo, o campo chamado `tipo` tem metadado `tipo: texto` e domínio `TipoLancamento`. A ordem dos campos nas tabelas de dados orienta formulário, filtros e grid.

#### Lançamento

Nome do modelo: `lancamento`. Rótulos da tela: **Lançamento** / **Lançamentos**.

**Dados e validação**

| Campo | tipo | label | obrigatorio | Descrição e regras |
| --- | --- | --- | --- | --- |
| `id` | `longo` | Identificador | `false` | Chave primária gerada pelo sistema: `pk: true`, `autoincremento: true`. Não é informada na inclusão. |
| `descricao` | `texto` | Descrição | `true` | Descrição da receita ou despesa. |
| `pessoa` | `texto` | Pessoa | `true` | Nome da pessoa que recebeu a receita ou realizou a despesa; neste modelo é texto, sem cadastro de pessoas separado. |
| `valor` | `moeda` | Valor | `true` | Valor total do lançamento, em reais; para recorrência contínua, valor mensal. Deve ser maior que zero. |
| `data` | `data` | Primeiro vencimento | `true` | Data válida de vencimento da primeira parcela. |
| `recorrencia` | `inteiro` | Recorrência | `true` | Quantidade de parcelas: `1` para uma vez, `2` para duas vezes e assim por diante; `0` para recorrência contínua. Inteiro não negativo. |
| `tipo` | `texto` | Tipo | `true` | `enum: TipoLancamento`, definido em Domínios de valores. |
| `forma_pagamento` | `texto` | Forma de pagamento | `true` | `enum: FormaPagamento`, definido em Domínios de valores. |

**Integridade e pesquisa**

| Campo | unique | indice | pesquisavel |
| --- | --- | --- | --- |
| `id` | `false` | `false` | `exato` |
| `descricao` | `false` | `false` | `contem` |
| `pessoa` | `false` | `false` | `contem` |
| `valor` | `false` | `false` | `exato` |
| `data` | `false` | `true` | `exato` |
| `recorrencia` | `false` | `false` | `exato` |
| `tipo` | `false` | `false` | `exato` |
| `forma_pagamento` | `false` | `false` | `exato` |

**Apresentação**

| Campo | exibe-titulo | colunas-layout | exibe-formulario | exibe-grid |
| --- | --- | --- | --- | --- |
| `id` | `false` | — | `false` | `false` |
| `descricao` | `true` | `8` | `true` | `true` |
| `pessoa` | `true` | `4*` | `true` | `true` |
| `valor` | `false` | `4` | `true` | `true` |
| `data` | `false` | `4` | `true` | `true` |
| `recorrencia` | `false` | `4*` | `true` | `false` |
| `tipo` | `false` | `6` | `true` | `true` |
| `forma_pagamento` | `false` | `6*` | `true` | `true` |

A identificação principal do grid é `descricao`. A coluna fixa `ID` permanece visível mesmo com `exibe-grid: false` no campo `id`. Os demais campos visíveis seguem a ordem da tabela de dados.

#### Parcela

Nome do modelo: `parcela`. Rótulos da tela: **Parcela** / **Parcelas**. Parcelas são geradas pelo lançamento; estes metadados não criam uma inclusão manual de parcelas. A edição contempla consolidação e os ajustes individuais previstos nas regras de negócio.

**Dados e validação**

| Campo | tipo | label | obrigatorio | Descrição e regras |
| --- | --- | --- | --- | --- |
| `id` | `longo` | Identificador | `false` | Chave primária gerada pelo sistema: `pk: true`, `autoincremento: true`. |
| `fk_lancamento` | `longo` | Lançamento | `true` | Identificador do lançamento de origem: `fk: lancamento`, `fk-display: descricao`. O vínculo é definido na geração. |
| `data_vencimento` | `data` | Vencimento previsto | `true` | Data prevista para pagamento ou recebimento, gerada a partir da data do lançamento. Deve ser válida; ajustes individuais seguem as regras de negócio. |
| `valor_vencimento` | `moeda` | Valor previsto | `true` | Valor previsto, calculado a partir do lançamento. Deve ser maior que zero; ajustes individuais seguem as regras de negócio. |
| `data_efetiva` | `data` | Data efetiva | `false` | Data efetiva do pagamento ou recebimento, informada na consolidação. Quando preenchida, deve ser válida e exige `valor_efetivo`. |
| `valor_efetivo` | `moeda` | Valor efetivo | `false` | Valor efetivamente pago ou recebido. Quando preenchido, deve ser maior que zero e exige `data_efetiva`. |
| `forma_pagamento` | `texto` | Forma de pagamento | `true` | Forma copiada do lançamento: `enum: FormaPagamento`. |

**Integridade e pesquisa**

| Campo | unique | indice | pesquisavel |
| --- | --- | --- | --- |
| `id` | `false` | `false` | `exato` |
| `fk_lancamento` | `false` | `true` | `exato` |
| `data_vencimento` | `false` | `true` | `exato` |
| `valor_vencimento` | `false` | `false` | `exato` |
| `data_efetiva` | `false` | `true` | `exato` |
| `valor_efetivo` | `false` | `false` | `exato` |
| `forma_pagamento` | `false` | `false` | `exato` |

**Apresentação**

| Campo | exibe-titulo | colunas-layout | exibe-formulario | exibe-grid |
| --- | --- | --- | --- | --- |
| `id` | `false` | — | `false` | `false` |
| `fk_lancamento` | `true` | `12*` | `true` | `true` |
| `data_vencimento` | `true` | `6` | `true` | `true` |
| `valor_vencimento` | `false` | `6*` | `true` | `true` |
| `data_efetiva` | `false` | `6` | `true` | `true` |
| `valor_efetivo` | `false` | `6*` | `true` | `true` |
| `forma_pagamento` | `false` | `12*` | `true` | `true` |

A identificação principal é a descrição do lançamento associado, definida por `fk-display`. O identificador da parcela fica na coluna fixa `ID`. `data_efetiva` e `valor_efetivo` são opcionais para uma parcela pendente e obrigatórios em conjunto para consolidá-la; essa condição exige validação conjunta, além das propriedades individuais.

#### Domínios de valores

Campos com `enum` usam as constantes abaixo no contrato da API e seus rótulos na interface. `FormaPagamento` é compartilhado por lançamento e parcela.

| enum | Constante | label |
| --- | --- | --- |
| `TipoLancamento` | `RECEITA` | Receita |
| `TipoLancamento` | `DESPESA` | Despesa |
| `FormaPagamento` | `PIX` | Pix |
| `FormaPagamento` | `TRANSFERENCIA_BANCARIA` | Transferência Bancária |
| `FormaPagamento` | `CARTAO_CREDITO` | Cartão de Crédito |
| `FormaPagamento` | `CARTAO_DEBITO` | Cartão de Débito |

#### Visão de consulta das parcelas

A consulta por período complementa os campos da parcela com os dados de origem e a situação calculada. As colunas abaixo são valores de leitura, não novos campos persistidos em `Parcela`:

| Coluna | Origem | tipo | label | exibe-grid |
| --- | --- | --- | --- | --- |
| `pessoa` | `lancamento.pessoa` | `texto` | Pessoa | `true` |
| `tipo` | `lancamento.tipo`, enum `TipoLancamento` | `texto` | Tipo | `true` |
| `situacao` | Calculada: Pendente sem efetivação; Consolidada com data e valor efetivos | `texto` | Situação | `true` |

Essas colunas vêm após a identificação do lançamento, seguidas dos campos de datas, valores e forma de pagamento. A descrição já aparece na identificação principal, sem uma segunda coluna repetida.

Filtros de período são critérios da consulta, separados de `pesquisavel: exato` dos campos de data. A visão prevista aplica o período a `data_vencimento`; a consolidada, a `data_efetiva`. Data final anterior à inicial é inválida. Totais e resultado do período são calculados conforme as regras abaixo, sem se tornarem campos editáveis do cadastro.

### Processamento e regras de negócio

1. Ao cadastrar um lançamento com recorrência maior que zero, o sistema gera a quantidade informada de parcelas. Elas são criadas com data e valor de vencimento preenchidos e campos de efetivação vazios.
2. A primeira parcela usa a data do lançamento como data de vencimento. As seguintes vencem a cada mês, sempre calculadas a partir da data original. Quando o mês não tiver o mesmo dia, usa-se seu último dia.
3. Para recorrência maior que zero, o valor de vencimento de cada parcela é o valor do lançamento dividido pela quantidade de parcelas. O resultado é truncado em centavos e a diferença é somada à primeira parcela, para que a soma corresponda ao valor do lançamento.
4. Para recorrência `0`, o valor informado é mensal, pois não há quantidade definida de parcelas para dividi-lo. O sistema gera parcelas mensais até dezembro do ano corrente. No início de cada ano, o usuário confirma ou atualiza o valor e o dia de vencimento antes de gerar as parcelas do novo ano. As parcelas de anos anteriores são preservadas. Um lançamento recorrente com início em ano futuro gera parcelas desde seu início até dezembro desse ano.
5. Uma parcela fica **pendente** enquanto sua data e seu valor de efetivação não forem informados. Ela só é **consolidada** quando o usuário informa ambos.
6. Os dados efetivos podem ser diferentes dos previstos. Por exemplo, uma despesa de R$ 100,00 com desconto pode ser consolidada por R$ 90,00 em uma data antecipada; juros podem resultar em valor maior e data posterior. Isso não altera o vencimento previsto, o lançamento nem as demais parcelas.
7. As consultas mostram separadamente os valores previstos e os consolidados. Os previstos usam a data e o valor de vencimento; os consolidados usam a data e o valor de pagamento. Em cada visão, o sistema soma receitas e despesas e calcula receitas menos despesas.
8. Ao alterar um lançamento, o sistema atualiza suas parcelas pendentes ainda não ajustadas, respeitando a preservação dos anos anteriores na renovação anual de recorrências contínuas. Ao excluir um lançamento, suas parcelas também são excluídas.

**Exemplo:** um lançamento de despesa de R$ 600,00 em 15/01/2026, com recorrência `6`, gera parcelas com vencimento de R$ 100,00 em 15/01, 15/02, 15/03, 15/04, 15/05 e 15/06/2026. Ao pagar a primeira com desconto em 14/01, o usuário informa essa data e o valor pago de R$ 90,00; o vencimento previsto continua sendo 15/01 e R$ 100,00.

### Saídas

- Lista de lançamentos e de suas parcelas.
- Consulta das parcelas por período, com identificação da pessoa, descrição, tipo, forma de pagamento, dados previstos, dados efetivos e situação pendente ou consolidada.
- Totais de receitas, despesas e resultado do período, separados em previsto e consolidado.
- Visão dos vencimentos futuros por mês para apoiar o planejamento financeiro. Os valores previstos não são garantia de recebimento ou pagamento.

### Casos de erro

- Campos obrigatórios ausentes, data inválida, valor menor ou igual a zero ou recorrência negativa ou não inteira: impedir o cadastro e informar o problema.
- Ao consolidar uma parcela, data de pagamento e valor pago devem ser informados juntos; data inválida ou valor menor ou igual a zero impede a consolidação e gera uma mensagem de erro.
- Valor total insuficiente para gerar parcelas de pelo menos R$ 0,01 cada: impedir o cadastro e informar o problema.
- Tipo ou forma de pagamento diferente das opções permitidas: impedir o cadastro e informar o problema.
- Falha ao salvar o lançamento ou gerar suas parcelas: informar a falha e não deixar um lançamento parcialmente cadastrado.
- Período de consulta inválido, como data final anterior à inicial: informar o problema e solicitar a correção.

### Critérios de aceite

1. Um lançamento com recorrência `1` gera uma parcela pendente com a mesma data e valor de vencimento e a mesma forma de pagamento; data de pagamento e valor pago ficam vazios.
2. Um lançamento de R$ 600,00 em 15/01/2026 com recorrência `6` gera seis parcelas mensais com vencimento de R$ 100,00, de janeiro a junho, totalizando R$ 600,00. Para R$ 100,00 em três parcelas, os valores de vencimento são R$ 33,34, R$ 33,33 e R$ 33,33.
3. Um lançamento em 31/01/2026 gera parcelas em 28/02/2026 e 31/03/2026, quando sua recorrência incluir esses meses. Um lançamento de três parcelas iniciado em novembro também gera as parcelas de dezembro e janeiro do ano seguinte.
4. Um lançamento contínuo de R$ 100,00 por mês iniciado em outubro gera parcelas de outubro a dezembro do ano corrente. No ano seguinte, suas novas parcelas são geradas após confirmação ou atualização do valor e do vencimento, sem duplicar ocorrências e sem alterar as parcelas anteriores.
5. Uma parcela de despesa com vencimento de R$ 100,00 em 15/02, paga por R$ 90,00 em 31/01, continua prevista por R$ 100,00 em fevereiro e aparece consolidada por R$ 90,00 em janeiro. As demais parcelas não são alteradas.
6. Uma parcela de receita com data e valor efetivos informados passa a consolidada; com apenas um dos dois campos, a consolidação é recusada. Parcelas pendentes não entram nos totais consolidados.
7. Ao consultar um mês com receitas consolidadas de R$ 3.000,00 e despesas consolidadas de R$ 1.200,00, o sistema apresenta resultado consolidado de R$ 1.800,00; os totais previstos são apresentados separadamente pelos vencimentos.
8. A alteração de um lançamento é refletida em suas parcelas, respeitando ajustes individuais, parcelas consolidadas e a preservação dos anos anteriores na renovação anual. A exclusão do lançamento remove suas parcelas. Dados inválidos não são gravados e geram uma mensagem compreensível.

