# Tela de cadastro

Leia [Campos](campos.md) para controles e validação e [Integração](integracao.md) para payloads, relacionamentos e serviços.

## Composição

1. Breadcrumb com `Início`, link para a pesquisa da entidade e `Cadastro`.
2. Cabeçalho em `row g-3 align-items-start mb-4`, com contexto curto, título `Novo [entidade]`, `Editar [entidade]` ou `Visualizar [entidade]` e subtítulo.
3. Resumo opcional dos campos identificadores abaixo do subtítulo, em uma linha que possa quebrar naturalmente.
4. Um card principal com abas e seções internas do formulário.
5. Barra de ações fora do card: orientação sobre obrigatórios à esquerda; `Voltar` secundário e `Gravar` primário à direita. No celular, empilhe mantendo os botões acessíveis.

O resumo usa os valores atuais dos controles, no formato `Rótulo: valor`, com somente o rótulo em negrito. Separe os itens por ponto médio; omita valores ausentes e seus separadores, preservando `0` e `false`. Não substitua o subtítulo nem retire o campo do formulário apenas porque aparece no resumo.

Se a API já fornecer metadados de criação/alteração e a tela precisar mostrá-los, use um card compacto à direita do cabeçalho, somente em edição e a partir de `md`. Sem título redundante, com ícone e fonte reduzida; criação e alteração lado a lado quando presentes. Esses dados são somente leitura. Não crie campos de auditoria ou serviços para sustentar esse elemento visual.

## Abas e seções

- Abas dentro do mesmo card, antes do conteúdo, com `nav nav-pills`, `nav-link rounded-pill px-3` e ícones quando disponíveis. Preserve essa navegação mesmo com uma única aba, para manter o padrão entre cadastros.
- `Dados cadastrais` recebe campos sem agrupamento explícito; demais abas seguem a ordem definida na especificação, seguidas das abas de coleções.
- Crie uma aba por coleção. Não crie card ou formulário principal independente para cada aba.
- Use IDs exclusivos derivados de nomes sem acentos, com associação entre tab e painel. Se existirem títulos repetidos, acrescente um identificador do campo.
- Primeira aba visível ativa; botão e painel usam a mesma condição de visibilidade. Abas vazias não aparecem. Se a aba ativa deixar de existir, ative a primeira disponível.
- Dentro da aba, use seções com ícone, título, subtítulo útil e separador quando houver grupos distintos. Não acrescente grupos artificiais a um formulário curto.
- Implemente foco e navegação por teclado das abas; use a integração disponível ou estado Angular coerente, sem dois controladores disputando a aba ativa.

## Formulário e gravação

Use formulário reativo com a tipagem suportada pela versão Angular. Organize os campos na grade Bootstrap, usando classes disponíveis na versão adotada, como `row g-3` e labels `fw-semibold` quando compatíveis. Se a especificação definir largura ou quebra de linha, traduza isso para as colunas Bootstrap; ausente essa definição, dê largura confortável e `col-12` a textos longos. Oculte um campo pela apresentação sem apagar seu valor de domínio.

Resolva `label`, `obrigatorio`, `exibe-formulario`, `exibe-titulo`, `aba` e `colunas-layout` pelas tabelas do contrato. Regras de negócio podem limitar operações além dos metadados: uma entidade gerada não ganha inclusão manual apenas porque existe uma tela de cadastro. Dados opcionais em conjunto exigem validador de grupo; não torne ambos obrigatórios permanentemente.

O botão `Gravar`, embora fora do card, deve enviar o formulário: use `type="submit" form="[id-do-formulario]"`. `Voltar` e ações auxiliares não submetem o formulário. A validação e o envio passam por um único método, para clique e Enter terem o mesmo comportamento.

Na inclusão, inicialize apenas os valores definidos no negócio. Na edição, busque o registro pelo parâmetro de rota e preencha o formulário; carregue listas auxiliares antes de resolver controles que dependem delas. Refazer o preenchimento deve substituir coleções, sem acumular itens. Se o ID da rota mudar enquanto o componente existir, carregue o registro correspondente.

Na abertura, exiba ngx-spinner durante a inicialização e a carga do registro e das listas auxiliares. Oculte-o somente quando os controles e suas opções estiverem preenchidos e renderizados. Em inclusão sem consultas, conclua a inicialização do formulário antes de encerrar o spinner. Libere-o também em erro, cancelamento ou saída da tela.

Ao gravar:

- Se inválido, marque os controles pertinentes, mostre mensagens por campo e abra a primeira aba com erro. Uma notificação breve pode resumir a necessidade de correção.
- Se válido, monte o payload tipado e despache inclusão ou alteração conforme o modo atual. Bloqueie submissões repetidas enquanto salvar.
- No sucesso, preencha a tela com a entidade retornada e redefina o estado de alterações pendentes. Permaneça no cadastro em modo de edição do registro salvo; atualize a rota para o ID recebido sem perder o contexto e notifique com ngx-sonner.
- No erro, mantenha os dados digitados, mostre mensagem compreensível e libere nova tentativa. Falha ao buscar o registro não deve transformar a tela silenciosamente em inclusão.

No modo de visualização, retire `Gravar` e a orientação de obrigatórios, mantendo `Voltar`. Use a mesma tela com os controles em leitura, conforme [Campos](campos.md).

## Coleções e subformulários

Cada coleção tem aba com título, explicação curta, entrada de um novo item e tabela simples em `div.table-responsive`, usando `table table-hover align-middle`. Coleções pequenas do formulário não precisam de DataTables.

O subformulário de entrada usa `FormGroup` separado, com estado próprio de validação, ligado a um `div [formGroup]`. Nunca aninhe elementos `<form>`. Os campos obrigatórios de um subformulário vazio não podem bloquear `Gravar` do pai. Aplique o estado visual de validação ao conteúdo pertinente, sem atingir todas as abas e subformulários por cascata.

A tabela começa com a ação `Excluir`, seguida das colunas escolhidas para o item. Não renderize uma coluna de ações vazia. Use os mesmos formatos do grid de pesquisa. Edição de linha só é acrescentada quando houver requisito; o padrão é remover e adicionar novamente. Coleção vazia mostra `Nenhum registro adicionado em [coleção]`.

### Forma de entrada

| Forma | Organização |
| --- | --- |
| Na própria aba | Seção, subformulário, botão `Adicionar` alinhado à direita e tabela |
| Modal | Seção, botão `Novo`, tabela; modal com subformulário, `Cancelar` e `Adicionar` |

O modal fica ao fim do template, fora do formulário principal e das abas. Use dimensões responsivas, título associado, foco inicial e retorno ao botão que o abriu. Feche após adicionar com sucesso; validação ou erro mantém o modal e os valores. Utilize a API pública da integração disponível, sem depender de clicar programaticamente em um botão oculto.

### Persistência

| Modalidade | Estado e comportamento |
| --- | --- |
| Agregada ao pai | Coleção em `FormArray`; adicionar/remover altera o formulário local; grava junto com o pai |
| Independente | Coleção carregada separadamente; adicionar/remover chama o serviço do filho; requer pai com ID persistido |

Na coleção agregada, não chame o backend nem `Gravar` ao adicionar/remover. Valide e copie o valor do subformulário antes de inserir; depois limpe apenas esse subformulário e sua flag de envio. Se a coleção for obrigatória, valide a presença de itens no `FormArray`. Ao carregar ou salvar, reconstrua o array de forma idempotente. Remoção local não exige diálogo de exclusão persistida; ela só será efetivada na gravação do pai.

Na coleção independente, antes de gravar o pai, sinalize `Grave o cadastro antes de adicionar itens`, bloqueie o botão/aba pertinente e confira o ID também no método que enviaria o item. Após persistir o pai, carregue a coleção e libere a interação. Atualize a lista local somente após o sucesso do serviço; confirme exclusões persistidas com SweetAlert2. A obrigatoriedade de itens não pode impedir a primeira gravação do pai; apresente a orientação compatível com esse fluxo.

## Ações de negócio

Inclua apenas ações especificadas para a entidade. As que atuam em um registro persistido aparecem somente depois de ele ter ID. Posicione uma ação da aba no fim daquela aba; ações gerais vêm antes de `Voltar` e `Gravar`.

Use `type="button"` e serviço próprio da ação. Se ela enviar dados editados, valide o formulário antes da confirmação e envie o payload na própria chamada, sem obrigar uma gravação preliminar. Use SweetAlert2 para confirmar ações destrutivas ou irreversíveis e alterações cuja confirmação seja prevista no fluxo. No sucesso, atualize a entidade exibida e notifique com ngx-sonner sem recarregar a aplicação.

## Critérios de aceite

- Inclusão, edição e visualização têm título, preenchimento e ações coerentes.
- Abas ficam no mesmo card; validação conduz ao campo com erro mesmo em aba oculta.
- Clique em `Gravar` e Enter seguem o mesmo envio; erro preserva dados e sucesso mantém o registro salvo aberto.
- Na abertura, ngx-spinner permanece até formulário e opções estarem utilizáveis e encerra também em erro; confirmações SweetAlert2 respeitam cancelamento e sucesso gera notificação ngx-sonner.
- Valores somente leitura são preservados no payload; relacionamentos estão pré-selecionados na edição.
- Subformulário vazio não invalida o pai; adicionar/remover respeita a modalidade de persistência e não duplica itens ao recarregar.
- Modal fecha somente após sucesso e restaura o foco; botões e layout funcionam em celular e por teclado.
