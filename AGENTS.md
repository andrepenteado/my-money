# Instruções para projetos Spring Boot e Angular

## Contexto e documentação

Consulte o [README.md](README.md) do projeto para identidade, objetivos, configuração técnica, particularidades de domínio, regras, exemplos e critérios de aceite. O README contém as escolhas locais; este arquivo e as skills definem os padrões reutilizáveis. Ao alterar comportamento ou configuração, mantenha a documentação coerente com a mudança.

O contrato de campos e seus metadados é mantido nas tabelas do README, sem YAML paralelo. Para definir ou interpretar propriedades de tipo, validação, pesquisa e apresentação, leia a [skill modelo-crud](skills/modelo-crud/SKILL.md). Os valores específicos de cada campo ficam no README; a skill define sua interpretação. Metadados são requisitos, não evidência de funcionalidades já implementadas.

Documentos externos e templates anexados são referências para a tarefa. Adapte-os ao contrato e às convenções do projeto consumidor; seus caminhos e exemplos não são arquivos ou funcionalidades disponíveis nele. Preserve os arquivos de origem ao implementar no projeto.

Use o idioma, locale, moeda, escala monetária e formatos definidos no README. Prefira os nomes concretos da entidade e dos campos a mensagens genéricas, com concordância adequada ao contexto.

## Práticas de engenharia de software

Aplique práticas consolidadas com proporcionalidade à complexidade do problema e às necessidades do projeto:

- **SOLID:** mantenha responsabilidades coesas e bem delimitadas (SRP); permita extensão onde houver variações reais de comportamento (OCP); preserve os contratos ao substituir implementações (LSP); use interfaces específicas às necessidades dos consumidores (ISP); e desacople regras de negócio de detalhes externos por dependências explícitas e injeção de dependências (DIP).
- **Clean Code:** use nomes que expressem o negócio, funções focadas, fluxo de controle legível e tratamento explícito de erros. Dê nomes a constantes de domínio relevantes e escreva comentários para explicar decisões e restrições que o código sozinho não esclareça.
- **KISS:** escolha a solução mais simples que cumpra os requisitos e facilite manutenção e testes. Justifique abstrações, camadas adicionais e padrões de projeto pelo problema concreto que resolvem.
- **DRY:** centralize conhecimento e regras compartilhados, mantendo uma fonte de verdade. Extraia código comum quando houver reutilização real; semelhança de trechos com responsabilidades diferentes não exige uma abstração conjunta.
- **YAGNI:** implemente o necessário para os requisitos atuais. Acrescente funcionalidades, dependências e mecanismos de extensão quando houver uma necessidade definida, evitando antecipar cenários hipotéticos.
- **Composição, coesão e baixo acoplamento:** prefira composição à herança quando ela representar melhor as responsabilidades. Mantenha interfaces pequenas e dependências entre módulos explícitas, respeitando as camadas já definidas no projeto.
- **Testabilidade:** separe cálculos e decisões de negócio de efeitos externos quando isso facilitar sua verificação. Teste comportamentos observáveis, invariantes e casos de erro relevantes, em vez de detalhes internos da implementação.
- **Refatoração incremental:** melhore o desenho em passos pequenos e verificáveis, preservando o comportamento contratado. Restrinja a refatoração à mudança solicitada e evite reescritas amplas apenas para aplicar um princípio ou padrão.

## Tecnologias e organização

- Backend em Java e Spring Boot; frontend em Angular, com Bootstrap para os padrões visuais definidos nas skills.
- Versões, ferramentas de build, pacote-base, raízes dos módulos e particularidades são definidos no README do projeto consumidor. Confirme-os nos manifests, lockfiles e configurações existentes antes de implementar.
- Use recursos e bibliotecas compatíveis com essas versões. Adapte sintaxe, imports e configuração sem atualizar a stack apenas para aplicar as orientações.

### Backend

Use os seguintes subpacotes sob o pacote-base declarado no README e coerente com o código existente. Os caminhos de código são relativos à raiz do módulo backend, que deve ser informada no README; na ausência de outra convenção, use `backend/`:

- `domain.entities`: entidades JPA.
- `domain.enums`: listas de valores fixos do domínio.
- `domain.repositories`: repositórios Spring Data.
- `domain.filters`: filtros QueryDSL.
- `services`: serviços Spring com regras de negócio.
- `resources`: recursos da API REST.

#### Convenções de implementação e skill

- Use Spring Data JPA, Bean Validation e QueryDSL diretamente, com dependências e processadores de anotações compatíveis com o Java, Spring Boot e build do projeto. O namespace de persistência/validação (`jakarta` ou `javax`) segue a stack efetivamente adotada.
- Entidades e repositórios cuidam da persistência; filtros traduzem critérios de pesquisa; serviços validam regras de negócio e delimitam transações; recursos REST fazem binding e delegam aos serviços.
- Use `BigDecimal` para valores monetários e `LocalDate` para datas sem horário, respeitando precisão, escala e contratos do domínio. Preserve as constantes de enums e os nomes do JSON definidos no README.
- Use Liquibase para migrações do esquema, respeitando o changelog mestre e a organização declarada no README ou existente no projeto. Quando houver agrupamento por versão, obtenha-a do build adotado. Verifique dependências e configuração antes de usá-las; a orientação não comprova integração pronta.
- Use os metadados do README para tipos, validações, relacionamentos e consultas. Propriedades visuais não modificam a persistência nem substituem regras de negócio. Não acrescente auditoria, perfis ou funcionalidades de infraestrutura apenas por existirem nos documentos de referência.
- Para criar ou alterar CRUDs e operações de negócio do backend, leia e aplique a [skill backend-spring-boot](skills/backend-spring-boot/SKILL.md), versionada neste projeto. Leia apenas as referências pertinentes à tarefa.

### Frontend

Os caminhos abaixo são relativos à raiz do módulo frontend declarada no README; na ausência de outra convenção, use `frontend/`:

- `src/app/domain/entities`: entidades mapeadas.
- `src/app/domain/enums`: listas de valores fixos.
- `src/app/services`: serviços.
- `src/app/pages`: páginas da aplicação.
- `src/app/pages/<crud>/pesquisar`: tela de pesquisa de um CRUD.
- `src/app/pages/<crud>/cadastro`: formulário de cadastro de um CRUD.
- `src/app/components`: componentes visuais compartilhados, quando houver reutilização real.

Mantenha modelos e contratos da API consistentes entre frontend e backend.

#### Convenções de implementação

- Prefira componentes standalone, formulários reativos tipados e blocos `@if`/`@for`/`@switch` quando suportados pela versão adotada. Preserve a organização com módulos quando necessária e adapte as APIs ao projeto. Mantenha a nomenclatura e identidades estáveis na renderização de listas.
- Mantenha chamadas HTTP nos serviços e tipos de entidades/enums no domínio; componentes cuidam da apresentação e da interação. Não imponha herança de componentes-base aos CRUDs.
- Registre as rotas com Angular Router e carregamento sob demanda. Cada CRUD tem pesquisa, inclusão e edição; coleções internas ao cadastro não geram menu ou rotas próprios sem requisito de negócio.
- Reutilize a configuração existente de URLs da API. Não espalhe endpoints pelos templates ou componentes e não pressuponha um prefixo `/api`.
- Preserve os nomes e tipos do JSON recebido e enviado. Centralize os rótulos de enums para uso no grid, nos filtros e no cadastro.

#### Convenções visuais e skill

- A interface segue o idioma, locale, formatos e moeda definidos no README. Apresente separadamente conceitos de domínio distintos quando o contrato assim exigir.
- Use o Bootstrap na versão do projeto para grid, cards, botões, abas e espaçamento. Mantenha a mesma hierarquia visual entre pesquisa e cadastro e concentre estilos reutilizados na folha global; estilos exclusivos ficam no componente.
- Use DataTables para o grid de pesquisa, ngx-sonner para notificações breves, SweetAlert2 (`sweetalert2`) para perguntas e confirmações, ngx-mask para máscaras e ngx-spinner para carregamento. Integre as bibliotecas diretamente, selecionando versões compatíveis com o Angular e conferindo a configuração do módulo frontend.
- Na abertura das telas de pesquisa e cadastro, use ngx-spinner desde o início da carga até os dados estarem renderizados. Ao aplicar ou limpar filtros, mantenha o spinner até o resultado estar exibido e o DataTables pronto; encerre-o também em erro ou cancelamento.
- Para criar ou alterar telas Angular de pesquisa e cadastro de CRUDs, leia e aplique a [skill frontend-angular](skills/frontend-angular/SKILL.md), versionada neste projeto. Ela contém os procedimentos e critérios de aceite visuais; leia apenas as referências pertinentes à tarefa.

## Fluxo para mudanças de CRUD

- Delimite os modelos e as partes solicitadas. Compare o contrato do README com código, esquema e API existentes para identificar o que precisa ser criado, reutilizado ou alterado; um CRUD existente pode ser evoluído quando isso fizer parte do pedido.
- Preserve alterações do usuário e reaproveite componentes, enums, serviços e configurações compartilhados. Modifique arquivos comuns apenas quando a integração da mudança exigir, sem sobrescrever implementações de outros CRUDs.
- Quando a tarefa incluir backend e frontend, defina primeiro os nomes, tipos, endpoints, filtros e respostas do contrato; implemente a persistência/API e alinhe os serviços e telas que a consomem. Em uma tarefa de uma só camada, mantenha a interface compatível e documente dependências pendentes da outra.
- Resolva divergências pelas regras explícitas do pedido e do README. Se faltar uma decisão de negócio necessária, esclareça a parte afetada e prossiga com o trabalho independente; não substitua silenciosamente um contrato existente por um exemplo do anexo.

## Desenvolvimento e validação

Use os comandos documentados no README e as ferramentas de build e testes do projeto. Quando houver Makefile, consulte `make help` e mantenha sua ajuda coerente com comandos novos ou alterados. Instale ferramentas e dependências pelas versões e lockfiles adotados; configurações como `mise.toml`, wrappers de build e toolchains devem ser respeitadas quando presentes. Execute os servidores dos módulos conforme a organização local.

Valide as alterações com os builds e testes pertinentes à parte modificada. Para regras de negócio, use os exemplos e critérios de aceite do README como referência e inclua testes para os casos relevantes. Não inclua dependências, configurações ou funcionalidades como prontas na documentação antes de implementá-las.

Na entrega de um CRUD, indique os comportamentos e critérios de aceite verificados, os comandos executados e seus resultados, além das lacunas concretas. Uma classe gerada ou um build bem-sucedido não comprova sozinho a implementação de uma regra de negócio.
