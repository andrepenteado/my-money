# Campos, formatos e validação

Use os mesmos controles e regras de formatação no cadastro, nos filtros e nos subformulários. Obtenha idioma, locale, moeda, escala, modo de entrada monetária e formatos de data do README do projeto. A apresentação localizada não altera os tipos do contrato da API. Adapte as classes Bootstrap e integrações às versões adotadas.

## Escolha de controle

| Informação | Cadastro | Pesquisa e leitura |
| --- | --- | --- |
| Texto curto | Input de texto com largura confortável | Input de busca; célula truncada se necessário |
| Texto longo | Textarea em `col-12`, com altura adequada; `textoN` pode indicar N linhas | Busca textual; resumo legível na célula |
| Enum | Radios para poucas opções; rótulos do mapa centralizado | Select com opção vazia; rótulo no grid |
| Booleano | Checkbox ou switch | Filtro `Todos`/`Sim`/`Não`; texto no grid |
| Relacionamento | Select; componente com busca para listas extensas; radios/switches exclusivos quando especificado | Select com busca se necessário; descrição do registro |
| Inteiro ou decimal | Controle numérico com limites do negócio e teclado apropriado | Filtro tipado; formato do locale na leitura |
| Dinheiro | Input textual com máscara e símbolo da moeda definida no contrato | Mesmo controle no filtro; moeda alinhada à direita no grid |
| Data | Input textual no formato do projeto, máscara e validação de calendário | Mesmo controle no filtro; formato do projeto na leitura |
| E-mail | `type="email"`, validador de formato e ícone quando disponível | Busca por trecho; link `mailto:` |
| URL | `type="url"`, exemplo `https://` e validador de URL absoluta HTTP/HTTPS | Busca por trecho; link externo com `noopener noreferrer` |
| Texto rico | Editor somente quando exigido, em `col-12`, com toolbar enxuta | Resumo sem tags no grid; exibição HTML sanitizada em leitura dedicada |
| Imagem | Miniatura e ação de escolher/trocar arquivo | Miniatura proporcional, com texto alternativo adequado |
| Arquivo | Seletor mostrando o nome, sem miniatura | Nome e download quando existir contrato correspondente |

Use ngx-mask para máscaras, integrado diretamente aos controles e formulários reativos. Confira os imports e providers exigidos pela versão instalada. Controles simples continuam com Angular/HTML; ng-select ou um editor compatível são opções para necessidades específicas, conforme as dependências disponíveis.

## Labels e erros

No cadastro, associe `label` e `id`, use `form-label fw-semibold` e destaque obrigatórios com texto/ícone e cor de erro apropriada. Explique o símbolo de obrigatório junto às ações; não deixe a obrigatoriedade depender apenas do vermelho.

Use validators coerentes com o negócio. Exiba erro após interação ou tentativa de envio, com `is-invalid`, `aria-invalid` e `aria-describedby`. Mensagem de obrigatório e de formato são distintas, por exemplo `Informe o e-mail` e `E-mail inválido`. Uma máscara visual não substitui o validador Angular.

Radios usam `fieldset`/`legend` quando apropriado, IDs individuais e um mesmo grupo. Coloque a mensagem do grupo uma única vez. Em relacionamentos representados como switches exclusivos, use radios com visual de switch, preservando a seleção única e a semântica do grupo.

## Dinheiro

Use `input-group` com `input-group-text` contendo o símbolo da moeda, input `type="text"`, alinhamento à direita e placeholder com zero na escala e no locale do projeto. Escolha `inputmode="numeric"` para entrada apenas por dígitos ou `decimal` para entrada com separador decimal. Não use `type="number"` para a entrada monetária mascarada.

Configure no ngx-mask os separadores, casas decimais e modo de entrada definidos no README. Quando a entrada for por dígitos pela direita, interprete-os na menor unidade da escala monetária e não deixe separadores digitados deslocarem as casas. Quando houver digitação explícita do separador decimal, preserve essa intenção. Uma máscara com casas decimais não garante, sozinha, o comportamento de entrada exigido.

O controle e o JSON entregam número; símbolos e separadores de apresentação ficam fora do payload. Vazio é `null`, não zero. Um valor carregado da API deve ser exibido no formato local e retornar com o mesmo valor numérico, respeitando a escala contratada. Não aplique `Number()` ao texto localizado; a conversão precisa receber o valor normalizado. Regras de valor positivo são validators do caso de uso, não parte universal da máscara.

Na leitura, use `CurrencyPipe` com moeda, locale e casas decimais definidos no contrato. Registre o locale uma única vez na aplicação quando necessário, usando a configuração suportada pela versão Angular adotada. Ordenação do grid usa o valor numérico subjacente.

Se houver vários campos monetários, encapsule o comportamento comum em um controle Angular local com `ControlValueAccessor` e validação compatível, apoiado no ngx-mask. Evite máscaras divergentes entre telas.

Ao implementar esse controle, confira digitação caractere a caractere, colagem, apagar, vazio e preenchimento vindo da API, verificando tanto o texto exibido quanto o tipo e valor enviados pelo formulário.

## Datas e teclado

Permita digitação direta no formato de data definido no README, usando `type="text"`, máscara e placeholder correspondentes. Para formatos com entrada apenas por dígitos, use `inputmode="numeric"`. Calendário pode ser uma ajuda adicional; não deve impedir digitar pelo teclado. Use ngx-mask para a máscara e um validador de calendário no Angular, em vez de apenas trocar o tipo do input.

Para uma data sem horário, o valor do controle e da API segue ISO `yyyy-MM-dd`, separado do texto apresentado e sem converter para um instante com fuso. Rejeite datas incompletas ou impossíveis, como 30 de fevereiro, mês fora do intervalo e 29 de fevereiro fora de ano bissexto. Limpar produz `null`; carregamento e digitação devem preservar o mesmo dia. Data e hora seguem o contrato específico da API, sem pressupor o fuso ou reaproveitar cegamente a conversão de data simples.

Todo campo cuja digitação é só de dígitos declara `inputmode="numeric"`: inteiros, datas numéricas, dinheiro por dígitos pela direita e máscaras numéricas. Use `decimal` quando a pessoa precisar digitar um separador decimal. Não troque o tipo semântico para `tel` só para obter teclado numérico.

## Relacionamentos

Exiba o campo descritivo definido para a entidade relacionada. Guarde o objeto ou ID conforme o contrato da API; faça adaptação explícita se o componente visual exigir outra representação.

Na edição, compare por ID ou reconcilie o valor carregado com a instância presente na lista de opções. A seleção não pode depender de duas respostas HTTP devolverem a mesma referência de objeto. Use arrays estáveis para as opções, atualizados após a carga; evite getters que recriem a lista a cada renderização.

## Campos somente leitura

Preserve o valor anterior de campos ocultos ou não editáveis ao montar o payload. Não presuma que `form.value` inclui controles desabilitados; se usar esse estado, monte explicitamente o payload a partir de `getRawValue()` e dos dados preservados.

| Controle | Apresentação somente leitura |
| --- | --- |
| Input/textarea | `readonly` e fundo secundário discreto |
| Select ou componente com busca | Recurso read-only efetivo do componente; alternativamente, valor textual acessível |
| Radio/checkbox/switch | Valor textual ou bloqueio real de mouse e teclado, mantendo o valor do modelo |
| Editor | Modo de leitura da própria integração |
| Imagem/arquivo | Miniatura/nome e download; sem escolher, trocar ou remover |

`pe-none`, `aria-disabled` e remoção do tab não bloqueiam sozinhos todos os meios de alterar um controle. Se o controle não oferecer leitura efetiva, prefira apresentar o valor sem edição em vez de um bloqueio só visual.

## Conteúdo rico e anexos

Editor e anexos são condicionais aos campos solicitados. Não introduza upload, armazenamento ou endpoints por conta de uma convenção visual.

Na exibição rica fora do editor, use a sanitização Angular de `[innerHTML]`, sem `bypassSecurityTrustHtml`. No grid, extraia texto e trunque sem interpretar o HTML.

Miniatura de foto mantém proporção e fica alinhada verticalmente aos outros campos da linha, por exemplo com `align-items-center`; escolher/trocar deve funcionar também por botão acessível, sem depender só de clicar na imagem. Arquivo mostra nome e ações pertinentes. Se houver envio, siga o serviço existente, associe ao registro somente após sucesso e preserve a escolha em caso de erro.
