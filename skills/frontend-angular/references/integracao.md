# Integração mínima para as telas

Use esta referência quando a implementação visual exigir modelos, serviços ou navegação. Siga a organização definida no `AGENTS.md`; não gere configurações adicionais por antecipação.

## Modelos e enums

- Modele entidades, filtros, respostas e payloads com tipos específicos, sem `any`. Preserve nomes, tipos de ID, nulabilidade e estrutura dos relacionamentos conforme o JSON da API.
- Dinheiro trafega como número no contrato numérico, separado da moeda e formatação de apresentação definidas no README. Datas sem horário usam string ISO de data; timestamps seguem o formato contratado.
- Enums serializados como texto mantêm as constantes do backend. Centralize seus rótulos em um `Record<Enum, string>` reaproveitado nos filtros, radios e grid; reutilize enums já existentes.
- O filtro tem propriedades opcionais correspondentes aos critérios suportados pelo backend. Não gere metadados de campos que nenhuma tela consuma.
- Coleção agregada integra o payload do pai e não ganha serviço próprio. Coleção independente tem modelo/serviço correspondente e vínculo ao pai conforme o contrato; não envie esse array na gravação do pai se ele não fizer parte do payload.
- Visibilidade de um campo na tela não remove dados do contrato. Na atualização, preserve os valores necessários que não foram editados, sem enviar campos exclusivos de resposta quando a API os excluir do payload.

## Serviços

Use serviços Angular com `HttpClient`, injeção de dependências e retornos tipados. Concentre neles a construção de URLs e parâmetros. Reutilize a configuração da aplicação; não copie tokens de configuração de outra biblioteca nem espalhe prefixos arbitrários pelos CRUDs.

Ao configurar o cliente HTTP em versões que ofereçam `provideHttpClient()`, mantenha uma única chamada no mesmo escopo de providers e combine nela os recursos e interceptors necessários. Em versões ou projetos que usem módulos, preserve a configuração compatível correspondente. Reaproveite a configuração existente, verificando sua composição antes de acrescentar providers; uma tela nova não precisa de uma segunda configuração do cliente.

Implemente somente os métodos necessários: listar, buscar por ID, pesquisar por filtros, incluir, alterar, excluir e ações de negócio especificadas. Métodos HTTP, endpoints e formatos seguem a API existente; não invente endpoints a partir apenas do nome da tela.

Para pesquisa GET, serialize os critérios com `HttpParams`, respeitando o formato de enums, relacionamentos, números e datas. Preserve `0` e `false`; omita somente valores ausentes ou texto vazio. Não converta um objeto de relacionamento em `[object Object]`.

Se uma API ainda não existir, registre o contrato necessário e mantenha a apresentação demonstrável conforme o escopo autorizado. Não descreva um serviço fictício como integração concluída nem implemente backend ou infraestrutura por iniciativa desta skill.

Componentes organizam estado de carregamento, renderização, navegação e feedback; não implementam novamente regras de negócio do backend. Trate falhas visíveis sem duplicar a mesma mensagem caso já exista um tratamento compartilhado. Não crie interceptadores globais apenas para implementar um CRUD.

## Rotas e menu

Registre rotas diretamente com Angular Router. O padrão de um CRUD é:

| Caminho relativo à entidade | Tela |
| --- | --- |
| `pesquisar` | Pesquisa |
| `cadastro` | Inclusão |
| `cadastro/:id` | Edição ou visualização |
| Caminho vazio | Redirecionamento para `pesquisar`, com `pathMatch: 'full'` |

Preserve a convenção de URLs já adotada, inclusive um nome diferente de parâmetro de ID. Use `loadChildren` para rotas/módulos e `loadComponent` para componentes standalone quando suportado e adequado ao projeto. Evite importação eager e lazy do mesmo componente sem motivo.

Se houver menu, acrescente um item por CRUD, com rótulo no plural, ícone coerente disponível e link para pesquisa. Preserve a estrutura do menu existente; não recrie um sistema de navegação. Coleções editadas dentro do pai não ganham menu ou rotas próprios, mesmo quando têm endpoints separados.

Breadcrumb, `Novo`, `Editar`/`Visualizar` e `Voltar` usam as mesmas rotas. Use `RouterLink`/Router, com carregamento direto da URL de edição funcionando. Uma inclusão bem-sucedida adota o ID devolvido pela API para continuar como edição.

## Verificação

- Confira URL, parâmetros e payload de uma consulta e de uma gravação, incluindo moeda, data e enum.
- Abra a pesquisa pelo menu e o cadastro por URL direta, com e sem ID; confira retorno para pesquisa.
- Verifique que um controle oculto/somente leitura não elimina um valor existente e que IDs de relacionamento continuam coerentes após carregar opções.
- Mudanças de contrato são refletidas nos tipos de frontend e backend; lacunas reais permanecem documentadas como pendentes.
