# Serviços e regras de negócio

Use serviços Spring para implementar operações com regras verificáveis e limites de transação claros. Os métodos necessários vêm do modelo e dos fluxos do README; não de uma lista obrigatória de operações para todas as entidades.

## Operações e estado persistido

| Operação | Responsabilidade |
| --- | --- |
| Listar/pesquisar | Executar critérios tipados e devolver o resultado ou projeção contratados |
| Buscar por ID | Carregar o registro ou informar ausência de forma explícita |
| Incluir | Validar entrada, atribuir valores gerados, preparar dependentes e persistir a operação completa |
| Alterar | Carregar o registro existente, aplicar os campos da operação e preservar dados que o fluxo não substitui |
| Excluir | Conferir existência e executar a regra de remoção, preservação ou bloqueio dos dependentes |
| Ação de negócio | Validar pré-condições e realizar uma transição ou comando específico |

Na inclusão com ID gerado, rejeite um ID fornecido quando o contrato não o aceitar. Na alteração, use a chave da rota; se o payload também trouxer ID, valide a correspondência. Não deixe `save()` de um objeto arbitrário transformar uma alteração de registro inexistente em inclusão.

Carregue a entidade gerenciada e aplique os valores permitidos pela operação. Campos gerados, vínculos definidos pelo sistema e dados históricos seguem as regras de negócio, independentemente de estarem visíveis no formulário. Não use cópia indiscriminada de propriedades para sobrescrever esses valores.

Na exclusão, não pressuponha que `deleteById()` lança erro para toda chave inexistente: o comportamento depende do Spring Data. Verifique/carregue o registro antes quando o contrato exigir 404 e teste a operação. Integridade referencial e restrições do banco podem falhar no flush; trate-as na fronteira adequada, sem supor um handler de biblioteca externa.

## Regras e transações

Transforme cada regra do README em pré-condições, efeitos e tratamento de falha. Cálculos, geração de dependentes, preservação de históricos e validação de estado ficam no serviço; o recurso REST apenas delega.

Documente operações não óbvias com as pré-condições, efeitos e regras de referência. Use Javadoc quando necessário para explicar o contrato de uma operação pública e vincule a descrição ao trecho ou critério correspondente do README; comentários de getters ou cópias integrais do texto da especificação não substituem essa explicação.

Use `@Transactional` nas operações de escrita que devem ser atômicas. Se incluir o pai e gerar filhos fizer parte da mesma operação, falha em qualquer etapa desfaz a gravação inteira. Não capture uma exceção para devolver sucesso nem continue uma operação parcialmente gravada. As exceções escolhidas e a configuração transacional precisam produzir o rollback esperado.

Valide entradas antes de modificar o estado quando possível. Quando a validação depender de valores calculados ou preservados, prepare o estado final e valide esse resultado dentro da transação antes de persistir. Dê mensagens claras para violações; não dependa de erro genérico no banco para explicar uma regra de negócio.

Regras monetárias usam `BigDecimal`, escala e arredondamento explícitos conforme o domínio. Não escolha um arredondamento universal para todo CRUD. Quando houver distribuição de valores, ajustes, totais ou limites, aplique os exemplos do README; resíduos de arredondamento precisam de destino definido, sem diferença entre soma dos itens e valor total.

Regras de data usam os tipos de calendário, referências temporais e formatos do domínio. Regras dependentes da data atual devem ser testáveis com referência temporal controlada. Recorrências, agendamentos e confirmações só são implementados quando documentados no projeto, com os efeitos e limites que ele definir.

Leituras podem usar transação `readOnly` conforme a persistência e preparação do resultado. Isso não substitui a definição explícita da consulta, do carregamento necessário ou da fronteira de serialização.

## Coleções e registros gerados

Na coleção agregada, religue cada filho ao pai antes de gravar. Ao atualizar, trabalhe sobre a coleção gerenciada e reconcilie itens por ID quando forem persistidos. Valide que cada ID pertence ao agregado; inclua novos itens e remova os ausentes conforme o contrato de substituição da coleção. Não substitua a referência da lista com remoção de órfãos nem apague/recrie indiscriminadamente itens com identidade ou histórico relevante.

O filho agregado normalmente não precisa de serviço próprio: a transação é do pai. Uma coleção obrigatória é validada no estado que será gravado, incluindo os subcampos pertinentes.

Na modalidade independente, o serviço do filho confere a existência do pai, persiste a operação imediatamente e fornece as consultas necessárias. Gravar o pai não recebe nem substitui automaticamente essa coleção. A exclusão do pai continua sujeita à regra de seus dependentes, implementada de forma coerente com o esquema.

Registros derivados pelo negócio não são necessariamente uma coleção manual de inclusão do formulário. A existência de repositório ou endpoint de consulta do filho não autoriza um endpoint para adicionar registros arbitrários.

## Ações e consultas específicas

Crie um método de ação somente quando houver operação de negócio documentada. Confirme o estado anterior e recuse a ação inválida. Se a ação também receber dados editados, reaproveite a preparação da alteração e execute gravação/transição em uma única transação, sem duplicar as regras nem exigir uma chamada de gravação anterior.

Consultas por período, situação, projeções e totais usam os critérios próprios do README. Diferencie conceitos de domínio pela origem e pelos critérios corretos. Não calcule um total geral apenas da página retornada nem apresente um valor derivado como campo editável/persistido sem requisito.

## Critérios de aceite

- Operações válidas produzem o estado esperado; violações não deixam gravação parcial.
- Atualização preserva dados que o fluxo não altera, relacionamentos e históricos conforme o README.
- Exclusão de chave inexistente e restrição de dependentes têm comportamento explícito e testado.
- Geração e renovação de dependentes não duplicam registros nos fluxos em que o negócio exige unicidade de ocorrência.
- Cálculos, datas e validações condicionais são conferidos pelos exemplos e casos de erro relevantes do projeto.
