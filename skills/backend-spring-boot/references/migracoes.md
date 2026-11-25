# Migrações do esquema

Use Liquibase para registrar alterações do modelo persistido. Leia o contrato no README e confira o changelog mestre, histórico aplicado, banco e versão da aplicação antes de preparar uma migração.

## Organização e evolução

- Siga os diretórios e formato declarados no README ou existentes no projeto. Quando houver organização por versão, leia a versão da aplicação no build adotado, Gradle ou Maven. Uma versão `major.minor.patch` pode agrupar arquivos por `major.minor`, conforme a convenção local.
- Ligue o arquivo de versão ao changelog mestre, com ordem de execução que respeite suas dependências. Um arquivo criado e não incluído não constitui uma migração utilizável.
- Use identidade de changeSet única e estável, com autor identificado conforme o projeto. Apenas a data não distingue duas mudanças do mesmo dia; inclua modelo/operação ou outro identificador adequado.
- Migrações já aplicadas são histórico: acrescente um novo changeSet ao alterar estrutura, valores de enum ou constraints. Não reescreva o conteúdo antigo nem altere checksums para esconder divergências.
- Migre dados existentes antes de impor uma restrição que eles possam violar. Uma coluna obrigatória nova exige uma estratégia de preenchimento; não atribua um valor fictício sem regra de negócio.

A configuração de Liquibase e o acesso ao banco são dependências da execução, não efeitos de escrever esta referência. Não crie provisionamento, credenciais ou arquivos de implantação para cumprir uma tarefa de contrato.

## Tipos e constraints

| Tipo do contrato | Tipo SQL conceitual |
| --- | --- |
| `texto`, `email`, `link` e enum textual | `VARCHAR`, com tamanho compatível com o domínio |
| `textoN`, `editor` | Texto longo, como `TEXT`, conforme o banco |
| `inteiro` | `INTEGER` |
| `longo` | `BIGINT` |
| `booleano` | `BOOLEAN` |
| `data` | `DATE` |
| `data-hora` | Timestamp compatível com a semântica de horário/fuso contratada |
| `decimal` | `NUMERIC`/`DECIMAL`, com precisão e escala definidas pelo domínio |
| `moeda` | `NUMERIC`/`DECIMAL` com precisão e escala monetária definidas no contrato |
| Relacionamento | Coluna compatível com a PK referenciada |

Valores monetários não usam tipos SQL de ponto flutuante. A precisão escolhida precisa acomodar os valores aceitos pelo serviço; a escala monetária permanece coerente entre banco, Java e API, conforme a moeda e as regras documentadas no README.

`pk` e geração de ID seguem o banco e a estratégia JPA adotados. `obrigatorio` orienta `NOT NULL` nos dados persistidos, respeitando o ciclo de geração. `unique` é constraint de unicidade real; `indice` é uma solicitação independente para consultas. Não crie unicidade em nomes repetíveis nem um índice redundante sobre uma chave já indexada.

Siga os nomes de constraints existentes. Sem convenção, use nomes legíveis com prefixos `pk_`, `uk_`, `idx_` e `fk_`, derivados da tabela e dos campos. Alinhe nomes físicos ao mapeamento JPA; não acrescente um segundo prefixo `fk_` a um campo que já o contenha.

Enums armazenam constantes textuais. Se o esquema usar check constraint para seus valores, mantenha-a coerente com o domínio do README; novos valores exigem alteração em novo changeSet. Validação de formato de e-mail/URL pertence à aplicação, sem inventar checks específicos de banco para reproduzir o formulário.

Não adicione colunas para rótulos, layout, resumo do título, colunas calculadas de consulta ou qualquer outro metadado visual. Anexos, quando exigidos, seguem o modelo efetivamente contratado; não pressuponha uma tabela de upload de biblioteca externa.

## Relacionamentos e coleções

Crie a tabela referenciada antes de declarar a FK. Uma coleção persistida como registros filhos requer a tabela e seus campos, com vínculo e nulabilidade coerentes. Índices do vínculo seguem a especificação ou a necessidade demonstrada das consultas; não crie uma unique composta pai/filho sem requisito de exclusividade.

Defina exclusão dos dependentes conforme a regra do negócio. Escolha entre remoção transacional pela aplicação e cascata no banco de forma coerente com o mapeamento JPA; não use `RESTRICT` quando a regra exige excluir os filhos nem configure cascata quando o negócio exige preservar ou bloquear. A remoção do filho não deve apagar o pai.

A modalidade agregada ou independente da coleção define seu ciclo de gravação e API. Ela não implica automaticamente campos de auditoria ou uma restrição de unicidade adicional.

## Critérios de aceite

- Esquema e entidade têm nomes, tipos, precisão, nulabilidade e relacionamentos compatíveis.
- Migração está incluída no histórico executável e possui identidade sem colisão.
- Instalação em banco vazio e atualização do estado anterior funcionam, quando a tarefa incluir implementação e houver ambiente de validação disponível.
- Constraints exigidas e exclusão de dependentes são verificadas contra a persistência; mudanças históricas não são sobrescritas.
