package com.github.andrepenteado.mymoney.domain.entities;

import com.github.andrepenteado.mymoney.domain.enums.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "parcela")
public class Parcela {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "fk_lancamento", nullable = false)
  private Lancamento lancamento;

  @Column(nullable = false)
  private Integer numero;

  @Column(nullable = false)
  private LocalDate competencia;

  @Column(nullable = false)
  private boolean ajustada;

  @NotNull
  @Column(name = "data_vencimento", nullable = false)
  private LocalDate dataVencimento;

  @NotNull
  @DecimalMin("0.01")
  @Digits(integer = 17, fraction = 2)
  @Column(name = "valor_vencimento", nullable = false, precision = 19, scale = 2)
  private BigDecimal valorVencimento;

  @Column(name = "data_efetiva")
  private LocalDate dataEfetiva;

  @DecimalMin("0.01")
  @Digits(integer = 17, fraction = 2)
  @Column(name = "valor_efetivo", precision = 19, scale = 2)
  private BigDecimal valorEfetivo;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(name = "forma_pagamento", nullable = false)
  private FormaPagamento formaPagamento;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Lancamento getLancamento() {
    return lancamento;
  }

  public void setLancamento(Lancamento lancamento) {
    this.lancamento = lancamento;
  }

  public Integer getNumero() {
    return numero;
  }

  public void setNumero(Integer numero) {
    this.numero = numero;
  }

  public LocalDate getCompetencia() {
    return competencia;
  }

  public void setCompetencia(LocalDate competencia) {
    this.competencia = competencia;
  }

  public boolean getAjustada() {
    return ajustada;
  }

  public void setAjustada(boolean ajustada) {
    this.ajustada = ajustada;
  }

  public LocalDate getDataVencimento() {
    return dataVencimento;
  }

  public void setDataVencimento(LocalDate dataVencimento) {
    this.dataVencimento = dataVencimento;
  }

  public BigDecimal getValorVencimento() {
    return valorVencimento;
  }

  public void setValorVencimento(BigDecimal valorVencimento) {
    this.valorVencimento = valorVencimento;
  }

  public LocalDate getDataEfetiva() {
    return dataEfetiva;
  }

  public void setDataEfetiva(LocalDate dataEfetiva) {
    this.dataEfetiva = dataEfetiva;
  }

  public BigDecimal getValorEfetivo() {
    return valorEfetivo;
  }

  public void setValorEfetivo(BigDecimal valorEfetivo) {
    this.valorEfetivo = valorEfetivo;
  }

  public FormaPagamento getFormaPagamento() {
    return formaPagamento;
  }

  public void setFormaPagamento(FormaPagamento formaPagamento) {
    this.formaPagamento = formaPagamento;
  }

  public boolean preservada() {
    return ajustada || dataEfetiva != null;
  }
}
