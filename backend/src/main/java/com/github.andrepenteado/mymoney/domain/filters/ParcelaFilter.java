package com.github.andrepenteado.mymoney.domain.filters;

import com.github.andrepenteado.mymoney.domain.entities.QParcela;
import com.github.andrepenteado.mymoney.domain.enums.*;
import com.querydsl.core.BooleanBuilder;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

public class ParcelaFilter {
  private Long id;
  private Long fk_lancamento;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate data_vencimento;

  private BigDecimal valor_vencimento;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate data_efetiva;

  private BigDecimal valor_efetivo;
  private FormaPagamento forma_pagamento;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate inicio;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate fim;

  private VisaoParcela visao = VisaoParcela.PREVISTA;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getFk_lancamento() {
    return fk_lancamento;
  }

  public void setFk_lancamento(Long fk_lancamento) {
    this.fk_lancamento = fk_lancamento;
  }

  public LocalDate getData_vencimento() {
    return data_vencimento;
  }

  public void setData_vencimento(LocalDate data_vencimento) {
    this.data_vencimento = data_vencimento;
  }

  public BigDecimal getValor_vencimento() {
    return valor_vencimento;
  }

  public void setValor_vencimento(BigDecimal valor_vencimento) {
    this.valor_vencimento = valor_vencimento;
  }

  public LocalDate getData_efetiva() {
    return data_efetiva;
  }

  public void setData_efetiva(LocalDate data_efetiva) {
    this.data_efetiva = data_efetiva;
  }

  public BigDecimal getValor_efetivo() {
    return valor_efetivo;
  }

  public void setValor_efetivo(BigDecimal valor_efetivo) {
    this.valor_efetivo = valor_efetivo;
  }

  public FormaPagamento getForma_pagamento() {
    return forma_pagamento;
  }

  public void setForma_pagamento(FormaPagamento forma_pagamento) {
    this.forma_pagamento = forma_pagamento;
  }

  public LocalDate getInicio() {
    return inicio;
  }

  public void setInicio(LocalDate inicio) {
    this.inicio = inicio;
  }

  public LocalDate getFim() {
    return fim;
  }

  public void setFim(LocalDate fim) {
    this.fim = fim;
  }

  public VisaoParcela getVisao() {
    return visao;
  }

  public void setVisao(VisaoParcela visao) {
    this.visao = visao;
  }

  public BooleanBuilder predicate() {
    var q = QParcela.parcela;
    var p = new BooleanBuilder(q.id.isNotNull());
    if (id != null) p.and(q.id.eq(id));
    if (fk_lancamento != null) p.and(q.lancamento.id.eq(fk_lancamento));
    if (data_vencimento != null) p.and(q.dataVencimento.eq(data_vencimento));
    if (valor_vencimento != null) p.and(q.valorVencimento.eq(valor_vencimento));
    if (data_efetiva != null) p.and(q.dataEfetiva.eq(data_efetiva));
    if (valor_efetivo != null) p.and(q.valorEfetivo.eq(valor_efetivo));
    if (forma_pagamento != null) p.and(q.formaPagamento.eq(forma_pagamento));
    var date = visao == VisaoParcela.CONSOLIDADA ? q.dataEfetiva : q.dataVencimento;
    if (visao == VisaoParcela.CONSOLIDADA)
      p.and(q.dataEfetiva.isNotNull()).and(q.valorEfetivo.isNotNull());
    if (inicio != null) p.and(date.goe(inicio));
    if (fim != null) p.and(date.loe(fim));
    return p;
  }
}
