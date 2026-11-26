package com.github.andrepenteado.mymoney;

import static org.assertj.core.api.Assertions.*;

import com.github.andrepenteado.mymoney.domain.entities.*;
import com.github.andrepenteado.mymoney.domain.enums.*;
import com.github.andrepenteado.mymoney.domain.filters.*;
import com.github.andrepenteado.mymoney.domain.repositories.*;
import com.github.andrepenteado.mymoney.resources.dto.*;
import com.github.andrepenteado.mymoney.services.*;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.*;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(FinanceiroIntegrationTest.TempoTeste.class)
class FinanceiroIntegrationTest {
  @Autowired LancamentoService lancamentos;
  @Autowired ParcelaService parcelas;
  @Autowired LancamentoRepository lancamentoRepository;
  @Autowired ParcelaRepository parcelaRepository;
  @Autowired JdbcTemplate jdbc;
  @Autowired ObjectMapper mapper;
  @Autowired RelogioTeste clock;

  @Value("${local.server.port}")
  int port;

  final HttpClient http = HttpClient.newHttpClient();

  @TestConfiguration
  static class TempoTeste {
    @Bean
    @Primary
    RelogioTeste relogioTeste() {
      return new RelogioTeste();
    }
  }

  static class RelogioTeste extends Clock {
    private Instant instante = Instant.parse("2026-11-25T15:00:00Z");

    void ano(int ano) {
      instante = LocalDate.of(ano, 1, 10).atStartOfDay(getZone()).toInstant();
    }

    @Override
    public ZoneId getZone() {
      return ZoneId.of("America/Sao_Paulo");
    }

    @Override
    public Clock withZone(ZoneId zone) {
      return Clock.fixed(instante, zone);
    }

    @Override
    public Instant instant() {
      return instante;
    }
  }

  @BeforeEach
  void limpar() {
    jdbc.execute("TRUNCATE parcela, lancamento RESTART IDENTITY CASCADE");
    clock.ano(2026);
  }

  LancamentoDados dados(String valor, String data, int recorrencia) {
    return new LancamentoDados(
        null,
        "Compra da família",
        "André",
        new BigDecimal(valor),
        LocalDate.parse(data),
        recorrencia,
        TipoLancamento.DESPESA,
        FormaPagamento.PIX);
  }

  List<ParcelaConsulta> doLancamento(Long id) {
    var filtro = new ParcelaFilter();
    filtro.setFk_lancamento(id);
    return parcelas.pesquisar(filtro);
  }

  ParcelaDados editar(
      ParcelaConsulta p,
      LocalDate prevista,
      BigDecimal valorPrevisto,
      LocalDate efetiva,
      BigDecimal valorEfetivo) {
    return new ParcelaDados(
        p.id(),
        p.fk_lancamento(),
        prevista,
        valorPrevisto,
        efetiva,
        valorEfetivo,
        p.forma_pagamento());
  }

  @Test
  void umaParcelaPendenteMantemContrato() {
    var l = lancamentos.incluir(dados("150.50", "2026-01-15", 1));
    var ps = doLancamento(l.id());
    assertThat(ps).hasSize(1);
    assertThat(ps.getFirst().valor_vencimento()).isEqualByComparingTo("150.50");
    assertThat(ps.getFirst().data_vencimento()).isEqualTo(l.data());
    assertThat(ps.getFirst().data_efetiva()).isNull();
    assertThat(ps.getFirst().valor_efetivo()).isNull();
    assertThat(ps.getFirst().forma_pagamento()).isEqualTo(FormaPagamento.PIX);
    assertThat(ps.getFirst().situacao()).isEqualTo("PENDENTE");
  }

  @Test
  void divideSeisParcelasESomaExata() {
    var ps = doLancamento(lancamentos.incluir(dados("600", "2026-01-15", 6)).id());
    assertThat(ps).hasSize(6);
    assertThat(ps).allSatisfy(p -> assertThat(p.valor_vencimento()).isEqualByComparingTo("100"));
    assertThat(ps.getLast().data_vencimento()).isEqualTo(LocalDate.of(2026, 6, 15));
    assertThat(
            ps.stream()
                .map(ParcelaConsulta::valor_vencimento)
                .reduce(BigDecimal.ZERO, BigDecimal::add))
        .isEqualByComparingTo("600");
  }

  @Test
  void residuoVaiParaPrimeiraParcela() {
    var ps = doLancamento(lancamentos.incluir(dados("100", "2026-01-31", 3)).id());
    assertThat(ps.get(0).valor_vencimento()).isEqualByComparingTo("33.34");
    assertThat(ps.get(1).valor_vencimento()).isEqualByComparingTo("33.33");
    assertThat(ps.get(2).valor_vencimento()).isEqualByComparingTo("33.33");
    assertThat(ps)
        .extracting(ParcelaConsulta::data_vencimento)
        .containsExactly(
            LocalDate.of(2026, 1, 31), LocalDate.of(2026, 2, 28), LocalDate.of(2026, 3, 31));
  }

  @Test
  void parcelasAtravessamAnoEConsideramBissexto() {
    var ps = doLancamento(lancamentos.incluir(dados("300", "2026-11-30", 3)).id());
    assertThat(ps.getLast().data_vencimento()).isEqualTo(LocalDate.of(2027, 1, 30));
    ps = doLancamento(lancamentos.incluir(dados("200", "2028-01-31", 2)).id());
    assertThat(ps.getLast().data_vencimento()).isEqualTo(LocalDate.of(2028, 2, 29));
  }

  @Test
  void continuoGeraAteDezembroIncluindoInicioFuturo() {
    assertThat(doLancamento(lancamentos.incluir(dados("100", "2026-10-31", 0)).id()))
        .hasSize(3)
        .allSatisfy(p -> assertThat(p.valor_vencimento()).isEqualByComparingTo("100"));
    assertThat(doLancamento(lancamentos.incluir(dados("100", "2028-10-31", 0)).id())).hasSize(3);
  }

  @Test
  void renovacaoExigeConfirmacaoPreservaHistoricoENaoDuplica() {
    var l = lancamentos.incluir(dados("100", "2026-10-31", 0));
    var anteriores = doLancamento(l.id());
    clock.ano(2027);
    lancamentos.alterar(l.id(), dados("110", "2026-10-31", 0));
    assertThat(doLancamento(l.id())).containsExactlyElementsOf(anteriores);
    lancamentos.renovar(l.id(), new RenovacaoDados(2027, new BigDecimal("120"), 31));
    var ps = doLancamento(l.id());
    assertThat(ps).hasSize(15);
    assertThat(ps.subList(0, 3)).containsExactlyElementsOf(anteriores);
    assertThat(ps.get(4).data_vencimento()).isEqualTo(LocalDate.of(2027, 2, 28));
    assertThat(ps.get(5).data_vencimento()).isEqualTo(LocalDate.of(2027, 3, 31));
    assertThatThrownBy(
            () -> lancamentos.renovar(l.id(), new RenovacaoDados(2027, new BigDecimal("120"), 31)))
        .isInstanceOf(RegraNegocioException.class);
    assertThat(doLancamento(l.id())).hasSize(15);
  }

  @Test
  void renovacoesSimultaneasGeramUmaVez() throws Exception {
    var l = lancamentos.incluir(dados("100", "2026-10-15", 0));
    clock.ano(2027);
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
      Callable<Boolean> renovar =
          () -> {
            try {
              lancamentos.renovar(l.id(), new RenovacaoDados(2027, new BigDecimal("100"), 15));
              return true;
            } catch (RegraNegocioException e) {
              return false;
            }
          };
      var resultados = executor.invokeAll(List.of(renovar, renovar));
      assertThat(
              resultados.stream()
                  .map(f -> {
                    try {
                      return f.get();
                    } catch (Exception e) {
                      throw new RuntimeException(e);
                    }
                  })
                  .filter(Boolean::booleanValue)
                  .count())
          .isEqualTo(1);
    }
    assertThat(doLancamento(l.id())).hasSize(15);
  }

  @Test
  void descontoEmJaneiroMantemPrevistoEmFevereiro() {
    var l = lancamentos.incluir(dados("200", "2026-02-15", 2));
    var ps = doLancamento(l.id());
    var p = ps.getFirst();
    parcelas.alterar(
        p.id(),
        editar(
            p,
            p.data_vencimento(),
            p.valor_vencimento(),
            LocalDate.of(2026, 1, 31),
            new BigDecimal("90")));
    assertThat(doLancamento(l.id()).getLast()).isEqualTo(ps.getLast());
    var janeiro = new ParcelaFilter();
    janeiro.setInicio(LocalDate.of(2026, 1, 1));
    janeiro.setFim(LocalDate.of(2026, 1, 31));
    var resumo = parcelas.resumo(janeiro);
    assertThat(resumo.previsto().despesas()).isZero();
    assertThat(resumo.consolidado().despesas()).isEqualByComparingTo("90");
    janeiro.setVisao(VisaoParcela.CONSOLIDADA);
    assertThat(parcelas.pesquisar(janeiro)).hasSize(1);
    var fevereiro = new ParcelaFilter();
    fevereiro.setInicio(LocalDate.of(2026, 2, 1));
    fevereiro.setFim(LocalDate.of(2026, 2, 28));
    assertThat(parcelas.resumo(fevereiro).previsto().despesas()).isEqualByComparingTo("100");
    assertThat(parcelas.resumo(fevereiro).consolidado().despesas()).isZero();
  }

  @Test
  void efetivacaoExigeParEPendenteNaoSomaConsolidado() {
    var p = doLancamento(lancamentos.incluir(dados("100", "2026-01-15", 1)).id()).getFirst();
    assertThatThrownBy(() ->
            parcelas.alterar(
                p.id(),
                editar(
                    p, p.data_vencimento(), p.valor_vencimento(), LocalDate.of(2026, 1, 15), null)))
        .isInstanceOf(RegraNegocioException.class);
    assertThatThrownBy(() ->
            parcelas.alterar(
                p.id(),
                editar(p, p.data_vencimento(), p.valor_vencimento(), null, new BigDecimal("100"))))
        .isInstanceOf(RegraNegocioException.class);
    assertThat(parcelas.buscar(p.id())).isEqualTo(p);
    assertThat(parcelas.resumo(new ParcelaFilter()).consolidado().despesas()).isZero();
  }

  @Test
  void totaisSomamReceitasDespesasEResultado() {
    var receita =
        new LancamentoDados(
            null,
            "Salário",
            "André",
            new BigDecimal("3000"),
            LocalDate.of(2026, 1, 15),
            1,
            TipoLancamento.RECEITA,
            FormaPagamento.PIX);
    var p = doLancamento(lancamentos.incluir(receita).id()).getFirst();
    parcelas.alterar(
        p.id(),
        editar(
            p,
            p.data_vencimento(),
            p.valor_vencimento(),
            p.data_vencimento(),
            p.valor_vencimento()));
    p = doLancamento(lancamentos.incluir(dados("1200", "2026-01-15", 1)).id()).getFirst();
    parcelas.alterar(
        p.id(),
        editar(
            p,
            p.data_vencimento(),
            p.valor_vencimento(),
            p.data_vencimento(),
            p.valor_vencimento()));
    var r = parcelas.resumo(new ParcelaFilter());
    assertThat(r.consolidado().receitas()).isEqualByComparingTo("3000");
    assertThat(r.consolidado().despesas()).isEqualByComparingTo("1200");
    assertThat(r.consolidado().resultado()).isEqualByComparingTo("1800");
  }

  @Test
  void atualizaPendentesPreservaAjustadasConsolidadasEIdentidades() {
    var l = lancamentos.incluir(dados("600", "2026-01-15", 6));
    var ps = doLancamento(l.id());
    var consolidada =
        parcelas.alterar(
            ps.get(0).id(),
            editar(
                ps.get(0),
                ps.get(0).data_vencimento(),
                ps.get(0).valor_vencimento(),
                LocalDate.of(2026, 1, 14),
                new BigDecimal("90")));
    var ajustada =
        parcelas.alterar(
            ps.get(1).id(),
            editar(ps.get(1), LocalDate.of(2026, 2, 20), new BigDecimal("105"), null, null));
    lancamentos.alterar(l.id(), dados("900", "2026-01-16", 6));
    assertThat(parcelas.buscar(consolidada.id())).isEqualTo(consolidada);
    assertThat(parcelas.buscar(ajustada.id())).isEqualTo(ajustada);
    assertThat(parcelas.buscar(ps.get(2).id()).valor_vencimento()).isEqualByComparingTo("150");
    assertThat(parcelas.buscar(ps.get(2).id()).data_vencimento())
        .isEqualTo(LocalDate.of(2026, 3, 16));
    lancamentos.alterar(l.id(), dados("200", "2026-01-16", 1));
    assertThat(doLancamento(l.id())).hasSize(2); // As duas preservadas sobrevivem à redução.
    lancamentos.excluir(l.id());
    assertThat(parcelaRepository.count()).isZero();
    assertThat(lancamentoRepository.count()).isZero();
  }

  @Test
  void insuficienciaEFalhaNoFilhoDesfazemLancamentoInteiro() {
    assertThatThrownBy(() -> lancamentos.incluir(dados("0.02", "2026-01-15", 3)))
        .isInstanceOf(RegraNegocioException.class);
    assertThat(lancamentoRepository.count()).isZero();
    jdbc.execute(
        "CREATE FUNCTION falhar_parcela() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE"
            + " EXCEPTION 'falha simulada'; END $$");
    jdbc.execute(
        "CREATE TRIGGER teste_falha BEFORE INSERT ON parcela FOR EACH ROW EXECUTE FUNCTION"
            + " falhar_parcela()");
    try {
      assertThatThrownBy(() -> lancamentos.incluir(dados("100", "2026-01-15", 1)))
          .isInstanceOf(RuntimeException.class);
    } finally {
      jdbc.execute("DROP TRIGGER teste_falha ON parcela");
      jdbc.execute("DROP FUNCTION falhar_parcela()");
    }
    assertThat(lancamentoRepository.count()).isZero();
    assertThat(parcelaRepository.count()).isZero();
  }

  @Test
  void pesquisaCombinaIgualdadeTrechoSemDiferenciarCaixaEZero() {
    lancamentos.incluir(dados("100", "2026-10-15", 0));
    lancamentos.incluir(dados("100", "2026-10-15", 1));
    var filtro = new LancamentoFilter();
    filtro.setDescricao("FAMÍLIA");
    filtro.setPessoa("AND");
    filtro.setRecorrencia(0);
    filtro.setValor(new BigDecimal("100"));
    filtro.setForma_pagamento(FormaPagamento.PIX);
    assertThat(lancamentos.pesquisar(filtro)).hasSize(1);
    filtro.setValor(new BigDecimal("99"));
    assertThat(lancamentos.pesquisar(filtro)).isEmpty();
  }

  @Test
  void bancoRecusaEfetivacaoParcialEOcorrenciasDuplicadas() {
    var p = doLancamento(lancamentos.incluir(dados("100", "2026-01-15", 1)).id()).getFirst();
    assertThatThrownBy(() -> jdbc.update("UPDATE parcela SET valor_efetivo=90 WHERE id=?", p.id()))
        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    assertThatThrownBy(() ->
            jdbc.update(
                "INSERT INTO parcela"
                    + " (fk_lancamento,numero,competencia,ajustada,data_vencimento,valor_vencimento,forma_pagamento)"
                    + " SELECT"
                    + " fk_lancamento,numero,competencia,ajustada,data_vencimento,valor_vencimento,forma_pagamento"
                    + " FROM parcela WHERE id=?",
                p.id()))
        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
  }

  @Test
  void planejamentoAgrupaMesESomaNoBanco() {
    lancamentos.incluir(dados("300", "2026-11-30", 3));
    var resultado = parcelas.planejamento();
    assertThat(resultado)
        .extracting(PlanejamentoMes::mes)
        .containsExactly("2026-11", "2026-12", "2027-01");
    assertThat(resultado)
        .allSatisfy(m -> assertThat(m.previsto().despesas()).isEqualByComparingTo("100"));
  }

  HttpResponse<String> requisicao(String metodo, String path, String body) throws Exception {
    var builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
    if (body != null) builder.header("Content-Type", "application/json");
    return http.send(
        builder
            .method(
                metodo,
                body == null
                    ? HttpRequest.BodyPublishers.noBody()
                    : HttpRequest.BodyPublishers.ofString(body))
            .build(),
        HttpResponse.BodyHandlers.ofString());
  }

  @Test
  void apiRetornaCriadoLocationSnakeCaseNumerosEDataIso() throws Exception {
    var r =
        requisicao(
            "POST", "/lancamentos", mapper.writeValueAsString(dados("150.50", "2026-01-15", 1)));
    assertThat(r.statusCode()).isEqualTo(201);
    assertThat(r.headers().firstValue("Location")).contains("/lancamentos/1");
    var json = mapper.readTree(r.body());
    assertThat(json.get("forma_pagamento").asText()).isEqualTo("PIX");
    assertThat(json.get("valor").isNumber()).isTrue();
    assertThat(json.get("data").asText()).isEqualTo("2026-01-15");
    assertThat(requisicao("GET", "/parcelas/pesquisar?fk_lancamento=1", null).statusCode())
        .isEqualTo(200);
    assertThat(requisicao("DELETE", "/lancamentos/1", null).statusCode()).isEqualTo(204);
    assertThat(requisicao("GET", "/lancamentos/1", null).statusCode()).isEqualTo(404);
    assertThat(requisicao("DELETE", "/lancamentos/1", null).statusCode()).isEqualTo(404);
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "\"recorrencia\":-1",
        "\"recorrencia\":1.5",
        "\"tipo\":\"INVALIDO\"",
        "\"forma_pagamento\":\"DINHEIRO\"",
        "\"data\":\"2026-02-30\"",
        "\"valor\":0",
        "\"descricao\":\" \"",
        "\"valor\":1.234"
      })
  void apiRecusaEntradasInvalidasSemGravar(String alteracao) throws Exception {
    var json = mapper.readTree(mapper.writeValueAsString(dados("100", "2026-01-15", 1)));
    var campo = alteracao.substring(1, alteracao.indexOf('"', 1));
    var atualizado = ((tools.jackson.databind.node.ObjectNode) json);
    atualizado.set(campo, mapper.readTree("{" + alteracao + "}").get(campo));
    var r = requisicao("POST", "/lancamentos", mapper.writeValueAsString(atualizado));
    assertThat(r.statusCode()).as(r.body()).isEqualTo(400);
    assertThat(lancamentoRepository.count()).isZero();
  }

  @Test
  void apiValidaFiltrosPeriodoIdsEVinculoImutavel() throws Exception {
    assertThat(requisicao("GET", "/lancamentos/pesquisar?recorrencia=abc", null).statusCode())
        .isEqualTo(400);
    assertThat(
            requisicao("GET", "/parcelas/pesquisar?inicio=2026-02-02&fim=2026-01-01", null)
                .statusCode())
        .isEqualTo(422);
    var l = lancamentos.incluir(dados("100", "2026-01-15", 1));
    var p = doLancamento(l.id()).getFirst();
    var invalido =
        new ParcelaDados(
            p.id(),
            999L,
            p.data_vencimento(),
            p.valor_vencimento(),
            null,
            null,
            p.forma_pagamento());
    assertThat(
            requisicao("PUT", "/parcelas/" + p.id(), mapper.writeValueAsString(invalido))
                .statusCode())
        .isEqualTo(422);
    assertThat(requisicao("POST", "/parcelas", mapper.writeValueAsString(invalido)).statusCode())
        .isEqualTo(405);
  }
}
