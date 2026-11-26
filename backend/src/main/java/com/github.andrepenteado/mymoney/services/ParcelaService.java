package com.github.andrepenteado.mymoney.services;

import com.github.andrepenteado.mymoney.domain.entities.*;
import com.github.andrepenteado.mymoney.domain.enums.*;
import com.github.andrepenteado.mymoney.domain.filters.ParcelaFilter;
import com.github.andrepenteado.mymoney.domain.repositories.*;
import com.github.andrepenteado.mymoney.resources.dto.*;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ParcelaService {
  private final ParcelaRepository parcelas;
  private final LancamentoRepository lancamentos;
  private final JPAQueryFactory query;
  private final Clock clock;

  public ParcelaService(
      ParcelaRepository parcelas, LancamentoRepository lancamentos, EntityManager em, Clock clock) {
    this.parcelas = parcelas;
    this.lancamentos = lancamentos;
    this.query = new JPAQueryFactory(em);
    this.clock = clock;
  }

  public List<ParcelaConsulta> pesquisar(ParcelaFilter filtro) {
    validarPeriodo(filtro);
    return parcelas.findAll(filtro.predicate(), Sort.by("dataVencimento", "id")).stream()
        .map(ParcelaConsulta::de)
        .toList();
  }

  public ParcelaConsulta buscar(Long id) {
    return ParcelaConsulta.de(encontrar(id));
  }

  private Parcela encontrar(Long id) {
    return parcelas
        .findById(id)
        .orElseThrow(() -> new NaoEncontradoException("Parcela não encontrada."));
  }

  @Transactional
  public ParcelaConsulta alterar(Long id, ParcelaDados dados) {
    LancamentoService.validarId(id, dados.id());
    // A mesma trava do lançamento coordena ajustes, geração e exclusão das parcelas.
    var origem =
        parcelas
            .buscarLancamentoId(id)
            .orElseThrow(() -> new NaoEncontradoException("Parcela não encontrada."));
    lancamentos
        .buscarParaAlterar(origem)
        .orElseThrow(() -> new NaoEncontradoException("Lançamento não encontrado."));
    var p = encontrar(id);
    if (!origem.equals(dados.fk_lancamento()))
      throw new RegraNegocioException("O lançamento de origem da parcela não pode ser alterado.");
    if ((dados.data_efetiva() == null) != (dados.valor_efetivo() == null))
      throw new RegraNegocioException(
          "Informe a data efetiva e o valor efetivo juntos para consolidar a parcela.");
    boolean ajustou =
        !p.getDataVencimento().equals(dados.data_vencimento())
            || p.getValorVencimento().compareTo(dados.valor_vencimento()) != 0
            || p.getFormaPagamento() != dados.forma_pagamento();
    p.setAjustada(p.getAjustada() || ajustou);
    p.setDataVencimento(dados.data_vencimento());
    p.setValorVencimento(dados.valor_vencimento().setScale(2));
    p.setDataEfetiva(dados.data_efetiva());
    p.setValorEfetivo(dados.valor_efetivo() == null ? null : dados.valor_efetivo().setScale(2));
    p.setFormaPagamento(dados.forma_pagamento());
    return ParcelaConsulta.de(p);
  }

  public ResumoPeriodo resumo(ParcelaFilter filtro) {
    validarPeriodo(filtro);
    var visao = filtro.getVisao();
    try {
      filtro.setVisao(VisaoParcela.PREVISTA);
      var previsto = totais(filtro);
      filtro.setVisao(VisaoParcela.CONSOLIDADA);
      var consolidado = totais(filtro);
      return new ResumoPeriodo(previsto, consolidado);
    } finally {
      filtro.setVisao(visao);
    }
  }

  private Totais totais(ParcelaFilter filtro) {
    var q = QParcela.parcela;
    var valor = filtro.getVisao() == VisaoParcela.CONSOLIDADA ? q.valorEfetivo : q.valorVencimento;
    BigDecimal receitas = BigDecimal.ZERO, despesas = BigDecimal.ZERO;
    for (var row :
        query
            .select(q.lancamento.tipo, valor.sum())
            .from(q)
            .join(q.lancamento)
            .where(filtro.predicate())
            .groupBy(q.lancamento.tipo)
            .fetch()) {
      if (row.get(q.lancamento.tipo) == TipoLancamento.RECEITA) receitas = row.get(valor.sum());
      else despesas = row.get(valor.sum());
    }
    return new Totais(receitas, despesas, receitas.subtract(despesas));
  }

  public List<PlanejamentoMes> planejamento() {
    var q = QParcela.parcela;
    var ano = q.dataVencimento.year();
    var mes = q.dataVencimento.month();
    var soma = q.valorVencimento.sum();
    var meses = new TreeMap<YearMonth, BigDecimal[]>();
    for (var row :
        query
            .select(ano, mes, q.lancamento.tipo, soma)
            .from(q)
            .join(q.lancamento)
            .where(q.dataVencimento.goe(LocalDate.now(clock)))
            .groupBy(ano, mes, q.lancamento.tipo)
            .fetch()) {
      var valores =
          meses.computeIfAbsent(
              YearMonth.of(row.get(ano), row.get(mes)),
              k -> new BigDecimal[] {BigDecimal.ZERO, BigDecimal.ZERO});
      valores[row.get(q.lancamento.tipo) == TipoLancamento.RECEITA ? 0 : 1] = row.get(soma);
    }
    return meses.entrySet().stream()
        .map(e ->
            new PlanejamentoMes(
                e.getKey().toString(),
                new Totais(
                    e.getValue()[0], e.getValue()[1], e.getValue()[0].subtract(e.getValue()[1]))))
        .toList();
  }

  private void validarPeriodo(ParcelaFilter filtro) {
    if (filtro.getInicio() != null
        && filtro.getFim() != null
        && filtro.getFim().isBefore(filtro.getInicio()))
      throw new RegraNegocioException(
          "A data final do período não pode ser anterior à data inicial.");
  }
}
