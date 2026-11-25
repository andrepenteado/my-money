---
name: modelo-crud
description: Definir ou interpretar contratos de campos de CRUDs em tabelas Markdown no README, incluindo tipos, validação, integridade, filtros e metadados de apresentação para cadastro e grid. Use ao enriquecer o modelo de dados ou transformar sua especificação em implementação.
---

# Contrato de campos no README

Mantenha a especificação de cada modelo no README do projeto e interprete seus metadados de forma consistente entre frontend e backend. Esta skill adapta as propriedades de um contrato declarativo para tabelas Markdown.

Identidade, pacote-base, raízes dos módulos, versões da stack, idioma, locale, moeda e escala monetária vêm da configuração técnica do README do projeto consumidor. Esta skill define a semântica dos metadados sem fixar esses valores para todos os projetos.

## Representação e responsabilidade

- O README contém modelos, campos, valores de propriedades, domínios de enum, regras de negócio e critérios de aceite. A skill contém a semântica dessas propriedades, sem duplicar os valores particulares de um projeto.
- Identifique cada modelo pelo nome, rótulo singular e plural. Na tabela de dados, `Campo` equivale a `nome`; use o mesmo identificador nas tabelas complementares. Preserve a ordem de declaração dos campos.
- Separe dados/validação, integridade/pesquisa e apresentação quando uma única tabela ficar larga. Resolva as propriedades por modelo e nome do campo, sem confundir campos homônimos de modelos diferentes.
- Propriedades adicionais de um campo podem ser declaradas explicitamente na sua descrição, como `pk: true`, `fk` com o nome do modelo relacionado ou `enum` com o nome do domínio de valores. Defina enums em uma tabela de constantes/rótulos e referencie o nome no campo.
- `—`, célula vazia ou coluna ausente significa propriedade não declarada; aplique o padrão abaixo. `false` e `0` são valores explícitos, não ausência. Quando a ausência for ambígua, esclareça o contrato em vez de inferir uma restrição.
- Uma propriedade declarada em mais de uma tabela precisa ter o mesmo valor. Corrija divergências antes de implementar a parte afetada. Campos inexistentes ou repetidos na mesma tabela também são inconsistências.
- Metadados não são atributos enviados na entidade JSON. Eles orientam tipos, validações, consultas e componentes; os valores de negócio continuam no payload contratado.

O contrato documenta requisitos. Alterá-lo não cria automaticamente telas, constraints, índices ou endpoints. Na tarefa de documentação, descreva a implementação esperada; na implementação, valide o comportamento e mantenha frontend/backend coerentes. Não acrescente login, perfis ou infraestrutura a partir do contrato de origem.

## Propriedades principais

| Propriedade | Padrão | Interpretação |
| --- | --- | --- |
| `tipo` | Obrigatório | Tipo conceitual do valor e comportamento do controle. Não é o nome de uma classe CSS nem o rótulo do campo. |
| `label` | Nome do campo convertido em texto legível | Rótulo consistente em formulário, filtro, coluna e mensagens. |
| `obrigatorio` | `false` | Exige valor nas operações em que o campo é informado; orienta validação e nulabilidade da persistência. Regras condicionais são descritas separadamente. |
| `unique` | `false` | Exige unicidade na persistência. Não se limita à lista que a tela carregou. |
| `indice` | `false` | Solicita índice de consulta na implementação da persistência; não muda validação nem aparência. |
| `pesquisavel` | `false` | `false` omite o filtro de campo; `exato` compara por igualdade; `contem` procura trecho sem diferenciar maiúsculas/minúsculas em texto. |
| `exibe-titulo` | `false` | Repete `label: valor` no resumo abaixo do título do cadastro, sem retirar o campo do formulário. |
| `colunas-layout` | Largura adequada ao conteúdo | Inteiro de `1` a `12` indica largura na grade Bootstrap; sufixo `*` encerra a linha depois do campo. |
| `exibe-formulario` | `true` | Decide se o controle aparece no cadastro; não remove o valor do modelo nem do contrato. |
| `exibe-grid` | `false` | Inclui o campo como coluna da pesquisa; não define se o campo pode ser filtrado ou editado. |

Use booleanos explícitos em `obrigatorio`, `unique`, `indice`, `exibe-titulo`, `exibe-formulario` e `exibe-grid`.

## Dados e tipos

Tipos suportados: `texto`, `textoN` (N linhas de textarea), `email`, `link`, `editor`, `inteiro`, `longo`, `booleano`, `data`, `data-hora`, `decimal`, `moeda`, `foto`, `arquivo` e `lista`, quando o modelo exigir. Não crie anexos, coleções ou dependências apenas porque um tipo está disponível.

`moeda` usa a moeda, escala e formatação definidas no README; não aceita `pesquisavel: contem`. Aritmética financeira e persistência precisam respeitar essa escala, usando representação decimal adequada no backend; o frontend segue o contrato numérico e separa formatação de valor. `data` representa um dia sem horário; `data-hora` segue o contrato de timestamp.

Enum é `tipo: texto` com propriedade `enum` apontando para um domínio não vazio de constantes `UPPER_SNAKE_CASE` e rótulos. Reutilize o domínio compartilhado; não serialize a posição ordinal nem substitua a constante pelo rótulo. Enum aceita pesquisa `exato`, não `contem`.

Propriedades opcionais, quando necessárias:

| Propriedade | Padrão | Interpretação |
| --- | --- | --- |
| `pk` | `false` | Chave primária do registro. |
| `autoincremento` | `false` | Identificador atribuído na persistência, compatível com a chave e tecnologia adotadas. |
| `fk` | Ausente | Modelo referenciado; preserve a representação de ID/objeto contratada pela API. |
| `fk-display` | Campo descritivo existente | Valor do relacionado exibido ao usuário; declare explicitamente quando houver ambiguidade. |
| `fk-tipo` | `combo` | Controle de relacionamento no cadastro: `combo` ou `radio` para seleção única de poucas opções. |
| `aba` | `Dados cadastrais` | Agrupa campos no cadastro, sem efeito no modelo persistido. |
| `mask` | Ausente | Máscara de entrada do ngx-mask, compatível com o tipo. |

`enum` só se aplica a `texto`; `fk-tipo` exige `fk`. Não sobreponha `mask` a e-mail, URL, moeda ou enum, cujo comportamento já é definido pelo tipo. Editor não recebe unicidade, índice simples, máscara, enum ou resumo de título; fotos e arquivos não recebem pesquisa textual ou resumo de título. Não deduza um cadastro de relacionamento de um campo de texto como nome de pessoa.

## Validação e integridade

`obrigatorio` não substitui regras de positividade, limites, formato ou consistência entre campos. Em dados opcionais que precisam ser informados juntos, mantenha a opcionalidade individual e descreva a validação conjunta. Zero preenchido satisfaz presença; sua validade depende do domínio. Booleano `false` também é valor informado.

Um valor gerado pode ser obrigatório no registro persistido e ausente antes da inclusão. Declare o momento de geração; não faça a tela exigir que o usuário preencha um campo somente leitura, nem invente um valor inicial. A chave gerada não precisa de `obrigatorio: true` no formulário de inclusão para ser uma PK válida.

`unique` só é marcado quando existir requisito real de exclusividade. Nomes e descrições repetíveis não ganham unicidade por aparecerem num exemplo. PK já garante unicidade; não crie constraint ou índice adicional redundante. `indice: false` significa ausência de solicitação de índice adicional, não proibição de índices implícitos em PK/unique.

`pesquisavel` e `indice` são independentes: um campo pesquisável não recebe automaticamente índice, e um índice não cria filtro. Se a tarefa incluir persistência, implemente a integridade no backend/banco; a interface apenas valida o que puder e apresenta o erro retornado.

## Pesquisa e grid

- `exato` usa igualdade, inclusive em enum, relacionamento, número e data. `contem` é aceito apenas para texto sem enum: `texto`, `textoN`, `editor`, `email` e `link`. A semântica é da API; não substitua por uma comparação diferente no navegador.
- Cada campo pesquisável gera seu controle no formulário recolhível de filtros. Pesquisabilidade não depende de `exibe-grid` ou `exibe-formulario`.
- Critérios adicionais, como intervalo de datas, pertencem à especificação da consulta. Não interprete `pesquisavel: exato` como intervalo nem acrescente parâmetros sem contrato.
- Ao menos um campo de dados diferente da PK deve ter `exibe-grid: true`. O primeiro marcado é a identificação principal; demais marcados seguem a ordem de declaração, sem repetir a identificação em outra coluna.
- `Ações` e `ID` são colunas fixas, independentes de `exibe-grid`. Campos com `exibe-grid: false` não geram colunas opcionais, mas continuam no modelo e podem ser filtros.
- Em uma visão de consulta, documente colunas projetadas/derivadas com origem, tipo, rótulo, exibição e ordem. Elas pertencem ao resultado de leitura, não viram campos persistidos ou editáveis por serem exibidas no grid. Relacionamento pode usar `fk-display` para identificação sem duplicar a descrição.

## Cadastro e layout

Agrupe campos por `aba`; a padrão vem primeiro, seguida dos grupos pela primeira ocorrência na tabela de dados. Preserve a ordem dos campos dentro do grupo. Visibilidade, edição, resumo e coluna de pesquisa são decisões independentes.

Traduza `colunas-layout: N` para `col-12 col-md-N` como padrão responsivo, adaptando breakpoints à tela. `N*` encerra explicitamente a `row`, mesmo se a soma for menor que 12. Não aplique o asterisco como classe CSS. Confira a soma das larguras por linha e não reordene campos para caber; textos longos precisam de largura compatível. Campo oculto não exige um espaço vazio no layout.

`exibe-titulo: true` usa o valor atual do formulário, rótulo e formatação próprios do tipo. Vazio/nulo desaparece junto do separador; `0` e `false` aparecem formatados. Com `exibe-formulario: false`, o campo pode aparecer só no resumo. Nunca promova automaticamente todos os campos visíveis ao resumo.

Coleções, quando declaradas, exigem tabela própria de subcampos e modalidade de persistência/entrada explícita quando o padrão não atender. `exibe-grid` dos subcampos se refere à tabela da coleção; coleção e subcampos não viram colunas ou filtros do grid do pai. Obrigatoriedade da coleção segue seu ciclo de persistência. Não transforme uma entidade gerada pelo negócio em subformulário de inclusão manual apenas por ela ser filha de outra.

## Verificação do contrato

- Ao evoluir um modelo existente, compare o contrato com nomes, constantes de enum, filtros e respostas já consumidos pela aplicação. Diferencie mudança de rótulo de mudança de identificador/valor serializado; esta última pode exigir evolução dos dados e dos consumidores.
- Verifique nomes, tipos, valores de propriedades, enum/FK e correspondência dos campos entre as tabelas.
- Confirme que filtros, identificação principal, colunas, resumo, controles e quebras de linha podem ser derivados sem contradições.
- Diferencie regras individuais, validações condicionais, campos gerados e projeções de leitura; preserve exemplos e critérios de aceite existentes.
- Ao alterar somente documentação, revise consistência e links. Ao implementar, use a [skill frontend-angular](../frontend-angular/SKILL.md) para telas e componentes e a [skill backend-spring-boot](../backend-spring-boot/SKILL.md) para domínio, persistência, serviços e API. Execute os checks pertinentes à parte modificada.
