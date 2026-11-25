# Recursos REST e contrato da API

Implemente recursos com Spring MVC e injeção de dependências direta. Receba entradas tipadas, valide o formato da requisição e delegue as operações ao serviço. Não execute regras de negócio ou consultas de persistência no controlador.

## Endpoints

Preserve o prefixo e os caminhos existentes do projeto. Na ausência de contrato prévio, use nomes de recursos no plural e estes padrões apenas para as operações que o modelo realmente oferecer:

| Método | Caminho relativo ao recurso | Operação |
| --- | --- | --- |
| `GET` | Caminho vazio | Listar |
| `GET` | `/pesquisar` com query params tipados | Pesquisar |
| `GET` | `/{id}` | Buscar |
| `POST` | Caminho vazio | Incluir |
| `PUT` | `/{id}` | Alterar conforme o contrato |
| `DELETE` | `/{id}` | Excluir |
| `POST` | `/{id}/{acao}` | Executar ação de negócio documentada |

Use `@RestController`, mapeamentos HTTP e binding apropriados. Em pesquisa GET, receba os atributos do filtro por query params, por exemplo com `@ModelAttribute`; não use body nem parâmetros genéricos `campo`/`valor`. Datas, enums, números e booleanos usam conversão tipada; uma conversão inválida resulta em erro de entrada, não em um filtro silenciosamente ignorado.

Declare pesquisa somente quando houver critérios suportados. `/pesquisar` e `/{id}` precisam ter mapeamentos inequívocos. Paginação no servidor exige parâmetros e resposta próprios; não introduza isso apenas porque o frontend usa DataTables no cliente.

Ação de negócio usa nome de caminho legível, como kebab-case. Sem dados editados, recebe apenas a chave e pode não ter body. Com dados editados, recebe o payload da operação e delega ao serviço a gravação e transição atômicas. Não imponha o envio de toda a entidade quando o contrato tiver um DTO próprio nem devolva um formato que o frontend não conheça.

## Entrada, saída e status

- Use `@Valid`/validação apropriada na entrada e critérios tipados. Distinga validação do payload das invariantes da entidade final, especialmente quando há dados gerados pelo serviço.
- Na inclusão, o padrão é `201 Created`, com `Location` para o registro salvo e resposta com o ID/estado final necessário ao frontend. Busca, pesquisa e alteração retornam `200 OK`; exclusão sem conteúdo, `204 No Content`. Preserve um contrato já estabelecido quando houver.
- Retorne o estado atualizado nas operações que a tela precisa refletir, usando entidade segura, DTO ou projeção conforme o contrato. Coleções vazias de consulta retornam resultado vazio, não 404.
- Preserve nomes e tipos do JSON, enums como constantes, valores monetários numéricos e datas ISO. Se Java e JSON usarem nomes diferentes, declare o mapeamento; uma FK representada por ID não deve virar silenciosamente um objeto completo na resposta.
- Não serialize grafos recursivos, proxies ou dados fora do contrato. Prepare respostas/projeções com o carregamento necessário, evitando uma consulta adicional por linha e lazy loading após o término da transação.

## Falhas da API

Siga o tratamento compartilhado existente. Quando for necessário implementá-lo, use recursos compatíveis com a versão Spring adotada, como `@RestControllerAdvice` e `ProblemDetail` quando disponível. Em versões sem essa API, use uma resposta de erro tipada compatível com o contrato. Mantenha um formato estável que o frontend consiga apresentar, sem depender de exceções ou handlers de uma biblioteca agregadora.

| Situação | Resposta esperada, salvo contrato existente |
| --- | --- |
| JSON, parâmetro, formato ou campo obrigatório inválido | `400 Bad Request`, com identificação dos erros pertinentes |
| Registro solicitado inexistente | `404 Not Found` |
| Conflito de estado ou unicidade | `409 Conflict` |
| Regra de negócio que impede processar uma entrada válida em formato | `422 Unprocessable Entity`, ou o código de negócio já adotado |
| Falha inesperada | `500 Internal Server Error`, sem detalhes internos na resposta |

Mantenha mensagens de validação e negócio compreensíveis e consistentes com os rótulos do README. Uma constraint violada no flush/commit precisa resultar em falha HTTP coerente; não declare sucesso antes da conclusão da operação transacional.

## Coleções e visões de consulta

Coleção agregada trafega no payload do pai quando esse for o contrato e não ganha endpoints próprios por padrão.

Uma coleção independente pode oferecer listagem por pai, busca e operações próprias conforme o negócio. Diferencie a chave do pai da chave do filho, por exemplo `GET /{filhos}/por-{pai}/{idPai}` para listagem e `GET /{filhos}/{idFilho}` para busca. Esses caminhos são padrões de desenho, não endpoints considerados existentes antes da implementação.

Colunas projetadas ou calculadas, consultas por período e totais podem ter resposta própria. Declare origem, nomes e tipos do resultado conforme o README e alinhe o serviço Angular correspondente. Não acrescente esses valores à entidade persistida apenas para preencher o grid.

## Critérios de aceite

- Endpoints delegam aos serviços corretos e oferecem somente operações documentadas.
- Binding de filtros e payloads mantém tipos, nomes e semântica de pesquisa compatíveis com o frontend.
- Respostas de sucesso e erro possuem status e corpo esperados; inclusão devolve o ID necessário para continuar em edição.
- Testes da API verificam consultas, conversões inválidas, ausência de registro, violações e efeitos da operação, sem apenas conferir a presença de anotações.
