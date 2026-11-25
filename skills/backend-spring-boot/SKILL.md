---
name: backend-spring-boot
description: Criar ou alterar CRUDs e operações de negócio em Java com Spring Boot, incluindo migrações Liquibase, entidades JPA, filtros QueryDSL, serviços transacionais e recursos REST. Use para implementar o backend a partir dos modelos e regras documentados no README.
---

# Backend Spring Boot para CRUDs

Implemente persistência, consultas e operações de negócio usando Spring diretamente. Mantenha o contrato da API consistente com o frontend e as regras descritas no README. Não imponha uma biblioteca agregadora, herança de serviços-base ou geração automática de funcionalidades não solicitadas.

## Contexto e referências

Leia o `AGENTS.md`, o README e o código existente. Consulte a [skill modelo-crud](../modelo-crud/SKILL.md) para interpretar os metadados das tabelas Markdown. Exemplos dos documentos de origem não criam campos, endpoints ou regras para o projeto consumidor.

Leia no README a configuração técnica do projeto consumidor: pacote-base, raiz do backend, versões, ferramenta de build, banco e organização das migrações. Confirme esses valores no build Gradle ou Maven e nos recursos da aplicação antes de escrever imports, migrações ou processadores de anotações. A presença de uma biblioteca nesta skill não comprova sua instalação ou configuração; a elaboração destas orientações não instala dependências.

Respeite o nível de linguagem Java configurado, mesmo quando a máquina tiver um JDK mais recente. Escolha namespaces de persistência/validação e variantes do QueryDSL conforme as dependências efetivas: use `jakarta` em uma stack Jakarta e `javax` em uma stack que ainda o adote, sem misturá-los. APIs Spring, tratamento de erros e configuração do build precisam existir nas versões do projeto; não atualize a stack apenas para aplicar esta skill.

Leia conforme a parte afetada:

| Tarefa | Referência |
| --- | --- |
| Esquema, tipos SQL, constraints e migrações Liquibase | [Migrações](references/migracoes.md) |
| Enums, entidades, relacionamentos, repositórios e pesquisa QueryDSL | [Domínio](references/dominio.md) |
| Validação de negócio, transações, atualização e coleções | [Serviços](references/servicos.md) |
| Endpoints, binding, respostas e erros da API | [Recursos REST](references/recursos.md) |

## Responsabilidade das camadas

- **Domínio e persistência:** tipos, vínculos e constraints coerentes com os dados documentados. Metadados de exibição, layout e máscaras não geram colunas nem limitam a escrita por conta própria.
- **Filtros e repositórios:** consultas tipadas, com a semântica declarada de igualdade, busca parcial e critérios adicionais. Não crie pesquisa genérica por reflexão sobre nomes de campos.
- **Serviços:** operações de negócio, invariantes, atribuição de dados gerados, preservação de dados existentes e limites de transação.
- **Recursos REST:** conversão da requisição para o contrato tipado, validação da entrada e delegação. Mantenha cálculos e decisões de negócio no serviço.

Use DTOs ou projeções quando o JSON precisar diferir do modelo JPA, como ao representar uma FK por ID ou devolver colunas calculadas de consulta. Evite criar estruturas paralelas sem necessidade; preserve o contrato existente e não exponha um grafo de entidades por conveniência de implementação.

## Critérios de implementação e validação

Implemente apenas as operações necessárias ao modelo. Uma entidade gerada pelo negócio não ganha inclusão manual porque os documentos de referência enumeram um CRUD completo. Regras declaradas na especificação devem resultar em condições e efeitos verificáveis, com referências aos trechos do README quando isso ajudar a revisão.

Ao implementar comportamento, use exemplos e critérios de aceite do README como casos de teste. Priorize cálculos monetários, regras condicionais, alteração/exclusão de dependentes, falha transacional, filtros combinados e códigos HTTP. Testes de persistência devem exercitar as consultas e constraints relevantes; mocks sozinhos não comprovam esses comportamentos.

Valide que migrações, entidades, tipos da API e frontend descrevem o mesmo contrato. Na parte alterada, execute os builds e testes pelos comandos documentados no projeto, usando Makefile ou wrappers quando adotados. Se a configuração ainda não permitir uma verificação necessária, informe a limitação concreta sem apresentar a integração como concluída. Para uma tarefa somente de documentação, valide a skill, as referências e a coerência das instruções, sem executar ou instalar o backend por conta disso.
