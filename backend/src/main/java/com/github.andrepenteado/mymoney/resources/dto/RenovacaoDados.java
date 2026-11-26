package com.github.andrepenteado.mymoney.resources.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record RenovacaoDados(
    @NotNull(message = "Informe o ano da renovação.") Integer ano,
    @NotNull(message = "Informe o valor mensal.")
        @DecimalMin(value = "0.01", message = "O valor mensal deve ser maior que zero.")
        @Digits(
            integer = 17,
            fraction = 2,
            message = "O valor mensal deve ter até 17 dígitos inteiros e 2 casas decimais.")
        BigDecimal valor,
    @NotNull(message = "Informe o dia do vencimento.")
        @Min(value = 1, message = "O dia deve estar entre 1 e 31.")
        @Max(value = 31, message = "O dia deve estar entre 1 e 31.")
        Integer dia_vencimento) {}
