package com.github.andrepenteado.mymoney.resources.dto;

import com.github.andrepenteado.mymoney.domain.entities.Parcela;
import com.github.andrepenteado.mymoney.domain.enums.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ParcelaConsulta(
    Long id,
    Long fk_lancamento,
    String descricao,
    String pessoa,
    TipoLancamento tipo,
    String situacao,
    LocalDate data_vencimento,
    BigDecimal valor_vencimento,
    LocalDate data_efetiva,
    BigDecimal valor_efetivo,
    FormaPagamento forma_pagamento) {
  public static ParcelaConsulta de(Parcela p) {
    var l = p.getLancamento();
    return new ParcelaConsulta(
        p.getId(),
        l.getId(),
        l.getDescricao(),
        l.getPessoa(),
        l.getTipo(),
        p.getDataEfetiva() == null ? "PENDENTE" : "CONSOLIDADA",
        p.getDataVencimento(),
        p.getValorVencimento(),
        p.getDataEfetiva(),
        p.getValorEfetivo(),
        p.getFormaPagamento());
  }
}
