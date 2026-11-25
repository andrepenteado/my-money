# Tela de pesquisa

Leia [Campos](campos.md) ao escolher filtros e formatar células; leia [Integração](integracao.md) ao criar serviços ou registrar navegação.

## Composição

1. Breadcrumb fora do container principal.
2. Cabeçalho com contexto de consulta, título no plural, subtítulo e botão `Novo` com ícone de adição, quando disponível.
3. Até três cards de resumo, somente se trouxerem informações úteis e disponíveis. Oculte-os abaixo de `md` se forem complementares; informações essenciais também precisam estar disponíveis no conteúdo principal.
4. Um card de consulta, cujo cabeçalho contém `Filtrar pesquisa` à esquerda.
5. Filtros inicialmente recolhidos e tabela de resultados em `div.table-responsive`.

Informe o alcance dos resumos: resultado filtrado, período selecionado ou total geral. Não apresente soma da página visível como total da consulta. Totais requeridos pelo negócio continuam acessíveis no celular.

O botão dos filtros alterna a área `collapse`, com ID exclusivo, `aria-controls` e `aria-expanded`. Ao aplicar a pesquisa, preserve os filtros e mantenha o botão disponível para revisar os critérios.

## Filtros

- Use os campos pesquisáveis definidos na especificação. Se ela trouxer `pesquisavel: false`, omita esse filtro; não gere filtros para subcampos de coleções sem contrato correspondente na API.
- Cada filtro tem controle próprio e nome acessível. Placeholders e primeira opção do select identificam o campo visualmente; não use um único seletor genérico de campo/valor.
- Organize campos e botões em `row g-3 align-items-center`. Mantenha as ações junto aos filtros em `md`/`lg` quando couberem; distribua filtros numerosos por linhas sem comprimir os controles. Empilhe no celular.
- `Pesquisar` e `Limpar filtros` usam botões compactos apenas com ícone, acompanhados de `title` e `aria-label`. Pesquisar pode ser o submit do formulário para aceitar Enter; limpar é `type="button"`.
- Texto, e-mail e URL usam input de texto, sem exigir e-mail/URL completo. A comparação segue `pesquisavel: exato` ou `contem`, conforme o contrato; texto rico também é filtro textual. A semântica da busca pertence ao endpoint.
- Enum usa select com rótulos centralizados e opção vazia. Booleano distingue `Todos`, `Sim` e `Não`. Relacionamento usa select ou componente com busca, conforme o número de opções; não replica necessariamente o controle usado no cadastro.
- Datas e dinheiro seguem a mesma digitação do cadastro. Períodos validam início e fim antes de chamar o serviço.

## Consulta e contexto

Mantenha um filtro tipado. Sem filtros, use a listagem quando a tela permitir carga inicial; com filtros, use a pesquisa no backend. `0` e `false` são valores preenchidos, enquanto `null`, `undefined` e texto vazio não são.

O filtro de negócio é processado pela API. A busca rápida do DataTables apenas refina o conjunto retornado para leitura. Não substitua o endpoint por filtragem do array em memória.

O padrão é receber o conjunto retornado e fazer paginação, ordenação e busca rápida no DataTables no cliente. Para telas que exigem um critério mínimo, mostre inicialmente `Informe ao menos um filtro para pesquisar` e não liste tudo. Paginação no servidor depende de contrato próprio; não ative `serverSide` sem esse contrato.

Na abertura, desenhe a estrutura inicial e exiba ngx-spinner durante a carga dos dados e preparação do grid. Em `Pesquisar` ou `Limpar filtros`, ative-o antes de consultar e mantenha-o até as novas linhas estarem renderizadas e o DataTables inicializado. Resultado vazio também conclui a carga. Se a tela não consultar por falta de critério mínimo, encerre o estado de carregamento ao apresentar a orientação.

Em erro, cancelamento ou saída da tela, encerre o spinner. A consulta mais recente controla o indicador; uma resposta antiga não pode ocultá-lo nem redesenhar o grid da consulta atual.

Limpar filtros restaura os valores iniciais e o resultado correspondente, respeitando a regra de critério mínimo. Não deixe o grid antigo parecer uma consulta sem filtros. Ao pesquisar ou limpar, volte à primeira página. Após excluir, preserve filtros e ordenação e mantenha a página quando ainda existir.

## Grid

- Tabela com ID único e classes como `table table-hover align-middle`. Mantenha cabeçalho e corpo com o mesmo número e ordem de colunas.
- Ordem padrão: `Ações`, `ID`, identificação principal e demais campos escolhidos para o grid. No contrato com `exibe-grid`, a identificação é o primeiro campo marcado diferente da PK; demais colunas opcionais incluem apenas os marcados. Campos `tipo: lista` não viram colunas. Preserve as projeções e a ordem adicional especificadas para visões de consulta.
- Identificação principal com ícone coerente, texto principal e informação secundária útil. O ID permanece na própria coluna. Não repita um campo em várias colunas sem necessidade.
- Primeira coluna com ações agrupadas em `d-flex flex-wrap gap-2`. Use botões redondos, por exemplo `btn btn-outline-primary btn-sm rounded-circle p-2 lh-1`, com ícones de largura uniforme quando a biblioteca oferecer esse recurso.
- Ofereça `Editar` ou `Visualizar`, conforme o modo de interação da tela, e `Excluir` quando a operação existir. Ações de negócio vêm depois dessas e precisam de requisito explícito.
- Não faça a coluna de ações participar da ordenação ou busca textual. Não vincule eventos Angular por strings de HTML produzidas pelo plugin.
- Dinheiro e números alinhados à direita; enum com rótulo, booleano com textos do idioma adotado e relacionamento com descrição. Configure ordenação por valor numérico ou data ISO, para que valores formatados pelo locale não sejam ordenados alfabeticamente.
- E-mail e URL são links. Use `mailto:` para e-mail e `target="_blank" rel="noopener noreferrer"` para URL externa. Interrompa propagação se a linha também navegar.
- Texto rico aparece sem tags HTML; textos longos são truncados sem alargar a tabela, com acesso ao conteúdo completo. Não renderize HTML de editor dentro da célula.

Traduza paginação, busca e mensagens do DataTables para o idioma definido no README. Resultado vazio informa que nenhum registro foi encontrado e sugere revisar os filtros. Erro de consulta permanece distinto de resultado vazio.

## Ciclo do DataTables

Integre a API pública da versão instalada diretamente ou pelo adaptador Angular escolhido no projeto. Mantenha uma única instância por tabela. Não pressuponha métodos de uma biblioteca agregadora.

Escolha um único responsável pelas linhas. No padrão com Angular, use `@for` ou a diretiva de repetição suportada pela versão para renderizar linhas e eventos; o plugin organiza a tabela já renderizada. Não forneça simultaneamente linhas Angular e um segundo conjunto de linhas em `data`/`render` do plugin.

Quando Angular controlar as linhas, a troca de resultados deve seguir esta sequência:

1. Destruir a instância atual sem remover por conta própria o nó que pertence ao Angular.
2. Remover a tabela pelo estado do template, por exemplo `@if (tabelaPronta)` ou diretiva condicional equivalente na versão adotada, e concluir essa renderização antes de recriar o conteúdo.
3. Atribuir a nova lista, recriar a tabela com Angular e aguardar a renderização.
4. Inicializar o DataTables somente depois de as linhas estarem no DOM.

Use os mecanismos de renderização e limpeza compatíveis com a versão Angular. Apenas `destroy()` seguido da troca do array no mesmo ciclo pode deixar linhas controladas pelo plugin e um grid desatualizado. Destrua a instância também ao sair da tela; impeça uma resposta tardia de recriá-la depois da destruição. O ngx-spinner termina quando o resultado estiver utilizável, incluindo a inicialização do grid.

## Exclusão e outras ações

Confirme exclusão com SweetAlert2, identificando o registro e o efeito relevante informado pelo negócio. Cancelar não chama o serviço. Depois de confirmar, bloqueie repetição da operação; no sucesso, notifique com ngx-sonner e atualize a consulta sem `window.location.reload()`. Use ngx-spinner durante a recarga até o grid atualizado estar utilizável.

Ações de negócio destrutivas ou irreversíveis também confirmam com SweetAlert2 antes de enviar. No erro, preserve o resultado e mostre a falha com ngx-sonner; não remova a linha otimisticamente sem uma estratégia explícita de restauração.

## Critérios de aceite

- `Novo` e ações de linha navegam corretamente; excluir respeita confirmação e cancelamento.
- Filtros chegam ao serviço com valores e tipos corretos, inclusive `0` e `false`; limpar restaura a consulta esperada.
- Segunda pesquisa com registros diferentes, resultado vazio e nova pesquisa após vazio atualizam o grid sem duplicar instâncias.
- Na abertura e após filtrar/limpar, ngx-spinner permanece até o grid estar utilizável e encerra em erro ou cancelamento; perguntas usam SweetAlert2 e notificações usam ngx-sonner.
- Exclusão atualiza o resultado mantendo o contexto; falhas preservam os filtros e permitem tentar novamente.
- Botões, filtros e tabela funcionam por teclado e em celular; a rolagem horizontal fica restrita à tabela.
- Cabeçalhos, células, ordenação de moeda/data e rótulos no idioma adotado continuam coerentes após atualizar o resultado.
