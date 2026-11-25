# Domínio, repositórios e filtros

Use o contrato Markdown do README para mapear entidades, enums e critérios de pesquisa. Preserve a organização de pacotes definida no `AGENTS.md`, inclusive o nome de `domain.filters`.

## Tipos e entidades JPA

| Informação | Tipo Java |
| --- | --- |
| Texto, texto longo, e-mail, URL ou conteúdo rico | `String` |
| Inteiro | `Integer` |
| Inteiro longo ou ID numérico longo | `Long` |
| Booleano | `Boolean`, quando ausência for distinta de `false` |
| Data sem horário | `LocalDate` |
| Data e hora | Tipo `java.time` compatível com o contrato, como `LocalDateTime` ou `OffsetDateTime` |
| Decimal e dinheiro | `BigDecimal` |
| Enum | Enum Java correspondente ao domínio textual |
| Relacionamento | Referência JPA ao modelo relacionado, com ID/objeto da API representado conforme o contrato |

Use `@Entity`, PK e estratégia de geração compatíveis com o esquema. Declare `@Table`, `@Column` e `@JoinColumn` quando necessário para manter nomes, nulabilidade ou precisão explícitos. Não dependa de uma estratégia de nomes implícita que gere tabelas/colunas diferentes das migrações.

`moeda` usa `BigDecimal` com precisão e escala monetária definidas no README e coerentes com o banco. Não converta valores financeiros para `double`/`float` durante cálculos. Texto longo e rico usam armazenamento apropriado ao banco; um editor não exige um tipo de entidade ou biblioteca de upload especial. Anotações de persistência e validação usam o namespace suportado pela stack do projeto.

Não exija Lombok, `Serializable`, `toString()` ou uma classe-base se o projeto não precisar deles. Métodos gerados não devem percorrer relacionamentos recursivos. Se houver igualdade por ID, não trate duas entidades novas com ID nulo como iguais e cuide da estabilidade do hash em coleções durante a persistência.

## Validação de valor

- Obrigatório textual usa `@NotBlank`; enum, data, número, booleano e vínculo obrigatório usam `@NotNull`. Uma chave gerada ausente na inclusão não é erro de formulário.
- Mensagens usam os rótulos do contrato. Distinga ausência, formato inválido e regra de negócio.
- `email` usa `@Email`; URL absoluta HTTP/HTTPS usa validador disponível ou validação explícita adequada. Campo opcional vazio não deve ser recusado apenas pelo formato.
- `unique` e nulabilidade persistida ficam coerentes com as migrações. Bean Validation não substitui uma constraint de unicidade no banco.
- Presença não implica positividade: regras para valores maiores que zero, limites e pares de campos dependem do domínio. Use validação de grupo/classe ou serviço para consistência entre campos.

Os limites aplicados ao payload de entrada podem diferir da entidade persistida quando dados obrigatórios são gerados pelo serviço. Valide o resultado preparado antes de persistir; não faça a entrada exigir um campo que só existirá depois da geração.

## Enums e relacionamentos

Crie enums pelas constantes e rótulos definidos no README. Use `@Enumerated(EnumType.STRING)`, preservando as constantes na API e no banco. Rótulos podem ser expostos por descrição/getter conforme o projeto. Enum existente é reaproveitado; divergência do domínio exige revisão explícita do contrato e dos dados existentes.

Mapeie FK com `@ManyToOne`/`@JoinColumn` quando representar vínculo de entidade. A API pode receber somente o ID; resolva a entidade existente no serviço, sem criar um objeto relacionado a partir de qualquer dado enviado pelo cliente.

Coleções com tabela de vínculo e atributos próprios usam entidade intermediária, ligada por `@OneToMany`/`@ManyToOne`, em vez de um `@ManyToMany` que elimine esses dados de negócio.

| Modalidade | Mapeamento e responsabilidade |
| --- | --- |
| Agregada | Pai mantém a coleção; cascata e remoção de órfãos quando o filho só existe dentro do agregado; validação dos itens pelo pai |
| Independente | Filho tem ciclo próprio, vínculo ao pai e repositório quando necessário; pai não precisa expor uma coleção no seu JSON |

Inicialize coleções agregadas e mantenha ambos os lados do vínculo. Evite ciclos pai/filho na serialização, usando DTOs, projeções ou exclusão explícita da referência inversa conforme o contrato. Não dependa de lazy loading fora da transação para completar a resposta.

## Repositórios e QueryDSL

Use `JpaRepository` com tipo da entidade e da chave. Repositório do filho só é criado quando houver consulta/persistência própria; cascata do agregado não exige um por subcampo ou coleção. Prefira métodos derivados e QueryDSL; use `@Query` quando houver necessidade concreta.

Crie filtro apenas quando existirem critérios suportados. Seus atributos refletem os campos pesquisáveis do README, com tipos corretos para enums, datas, números e IDs de relacionamento. Critérios de período ou projeções adicionais precisam de contrato próprio; não derive busca por intervalo de uma propriedade `exato`.

- Combine critérios preenchidos com `AND`, usando o metamodelo `Q...` da entidade e predicados tipados.
- Ignore `null` e texto vazio/em branco; preserve `0` e `false` como valores preenchidos.
- `exato` usa igualdade; `contem` usa comparação parcial sem diferenciar maiúsculas/minúsculas somente nos tipos textuais aceitos pelo contrato, sem enum.
- Relacionamento é filtrado pela chave, sem comparação acidental de objeto/string. Subcampos de coleção não ganham pesquisa genérica sem requisito correspondente.
- Execute o predicado com `QuerydslPredicateExecutor` ou consulta QueryDSL explícita conforme a necessidade. Projeções e totais podem exigir uma consulta própria, evitando uma busca adicional por cada linha.
- Configure o processamento de anotações e a geração de classes `Q` no build adotado quando a tarefa incluir essa integração. Use a variante QueryDSL e as APIs de persistência compatíveis com o namespace `jakarta` ou `javax` da stack; não escreva o metamodelo manualmente nem misture namespaces.

## Critérios de aceite

- Entidades e metamodelo compilam com os tipos e nomes do esquema.
- Enums preservam constantes; relacionamentos e JSON mantêm o formato contratado, sem recursão.
- Pesquisa combina filtros e respeita `0`, `false`, igualdade e busca parcial; consultas de projeção não dependem de carregar toda a tabela em memória.
- Validações individuais, condicionais e da persistência respeitam o ciclo de geração dos campos.
