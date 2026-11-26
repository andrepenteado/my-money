package com.github.andrepenteado.mymoney.resources.dto;

import com.github.andrepenteado.mymoney.domain.entities.Lancamento;
import com.github.andrepenteado.mymoney.domain.enums.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LancamentoDados(
    Long id,
    @NotBlank(message = "Informe a descrição do lançamento.") String descricao,
    @NotBlank(message = "Informe a pessoa do lançamento.") String pessoa,
    @NotNull(message = "Informe o valor do lançamento.")
        @DecimalMin(value = "0.01", message = "O valor do lançamento deve ser maior que zero.")
        @Digits(
            integer = 17,
            fraction = 2,
            message = "O valor do lançamento deve ter até 17 dígitos inteiros e 2 casas decimais.")
        BigDecimal valor,
    @NotNull(message = "Informe o primeiro vencimento.") LocalDate data,
    @NotNull(message = "Informe a recorrência.")
        @Min(value = 0, message = "A recorrência deve ser um inteiro não negativo.")
        Integer recorrencia,
    @NotNull(message = "Informe o tipo do lançamento.") TipoLancamento tipo,
    @NotNull(message = "Informe a forma de pagamento.") FormaPagamento forma_pagamento) {
  public static LancamentoDados de(Lancamento l) {
    return new LancamentoDados(
        l.getId(),
        l.getDescricao(),
        l.getPessoa(),
        l.getValor(),
        l.getData(),
        l.getRecorrencia(),
        l.getTipo(),
        l.getFormaPagamento());
  }

  public void aplicar(Lancamento l) {
    l.setDescricao(descricao.trim());
    l.setPessoa(pessoa.trim());
    l.setValor(valor.setScale(2));
    l.setData(data);
    l.setRecorrencia(recorrencia);
    l.setTipo(tipo);
    l.setFormaPagamento(forma_pagamento);
  }
}
