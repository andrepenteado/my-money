package com.github.andrepenteado.mymoney.domain.filters;

import com.github.andrepenteado.mymoney.domain.entities.QLancamento;
import com.github.andrepenteado.mymoney.domain.enums.*;
import com.querydsl.core.BooleanBuilder;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

public class LancamentoFilter {
  private Long id;
  private String descricao;
  private String pessoa;
  private BigDecimal valor;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate data;

  private Integer recorrencia;
  private TipoLancamento tipo;
  private FormaPagamento forma_pagamento;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getDescricao() {
    return descricao;
  }

  public void setDescricao(String descricao) {
    this.descricao = descricao;
  }

  public String getPessoa() {
    return pessoa;
  }

  public void setPessoa(String pessoa) {
    this.pessoa = pessoa;
  }

  public BigDecimal getValor() {
    return valor;
  }

  public void setValor(BigDecimal valor) {
    this.valor = valor;
  }

  public LocalDate getData() {
    return data;
  }

  public void setData(LocalDate data) {
    this.data = data;
  }

  public Integer getRecorrencia() {
    return recorrencia;
  }

  public void setRecorrencia(Integer recorrencia) {
    this.recorrencia = recorrencia;
  }

  public TipoLancamento getTipo() {
    return tipo;
  }

  public void setTipo(TipoLancamento tipo) {
    this.tipo = tipo;
  }

  public FormaPagamento getForma_pagamento() {
    return forma_pagamento;
  }

  public void setForma_pagamento(FormaPagamento forma_pagamento) {
    this.forma_pagamento = forma_pagamento;
  }

  public BooleanBuilder predicate() {
    var q = QLancamento.lancamento;
    var p = new BooleanBuilder(q.id.isNotNull());
    if (id != null) p.and(q.id.eq(id));
    if (descricao != null && !descricao.isBlank())
      p.and(q.descricao.containsIgnoreCase(descricao.trim()));
    if (pessoa != null && !pessoa.isBlank()) p.and(q.pessoa.containsIgnoreCase(pessoa.trim()));
    if (valor != null) p.and(q.valor.eq(valor));
    if (data != null) p.and(q.data.eq(data));
    if (recorrencia != null) p.and(q.recorrencia.eq(recorrencia));
    if (tipo != null) p.and(q.tipo.eq(tipo));
    if (forma_pagamento != null) p.and(q.formaPagamento.eq(forma_pagamento));
    return p;
  }
}
