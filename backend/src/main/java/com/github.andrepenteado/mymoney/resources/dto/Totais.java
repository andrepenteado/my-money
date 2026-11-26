package com.github.andrepenteado.mymoney.resources.dto;

import java.math.BigDecimal;

public record Totais(BigDecimal receitas, BigDecimal despesas, BigDecimal resultado) {}
