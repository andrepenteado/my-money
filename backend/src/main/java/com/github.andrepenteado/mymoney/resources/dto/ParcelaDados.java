package com.github.andrepenteado.mymoney.resources.dto;

import com.github.andrepenteado.mymoney.domain.enums.FormaPagamento;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ParcelaDados(
    Long id,
    @NotNull(message = "Informe o lançamento de origem.") Long fk_lancamento,
    @NotNull(message = "Informe o vencimento previsto.") LocalDate data_vencimento,
    @NotNull(message = "Informe o valor previsto.")
        @DecimalMin(value = "0.01", message = "O valor previsto deve ser maior que zero.")
        @Digits(
            integer = 17,
            fraction = 2,
            message = "O valor previsto deve ter até 17 dígitos inteiros e 2 casas decimais.")
        BigDecimal valor_vencimento,
    LocalDate data_efetiva,
    @DecimalMin(value = "0.01", message = "O valor efetivo deve ser maior que zero.")
        @Digits(
            integer = 17,
            fraction = 2,
            message = "O valor efetivo deve ter até 17 dígitos inteiros e 2 casas decimais.")
        BigDecimal valor_efetivo,
    @NotNull(message = "Informe a forma de pagamento.") FormaPagamento forma_pagamento) {}
