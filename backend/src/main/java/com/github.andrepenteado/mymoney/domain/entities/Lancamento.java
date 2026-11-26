package com.github.andrepenteado.mymoney.domain.entities;

import com.github.andrepenteado.mymoney.domain.enums.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "lancamento")
public class Lancamento {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false, columnDefinition = "text")
  private String descricao;

  @NotBlank
  @Column(nullable = false, columnDefinition = "text")
  private String pessoa;

  @NotNull
  @DecimalMin("0.01")
  @Digits(integer = 17, fraction = 2)
  @Column(nullable = false, precision = 19, scale = 2)
  private BigDecimal valor;

  @NotNull
  @Column(nullable = false)
  private LocalDate data;

  @NotNull
  @Min(0)
  @Column(nullable = false)
  private Integer recorrencia;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TipoLancamento tipo;

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

  public FormaPagamento getFormaPagamento() {
    return formaPagamento;
  }

  public void setFormaPagamento(FormaPagamento formaPagamento) {
    this.formaPagamento = formaPagamento;
  }
}
