package com.github.andrepenteado.mymoney.services;

import com.github.andrepenteado.mymoney.domain.entities.Lancamento;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public final class GeracaoParcelas {
  private GeracaoParcelas() {}

  public record Prevista(int numero, LocalDate competencia, LocalDate data, BigDecimal valor) {}

  public static List<Prevista> gerar(Lancamento l, int ultimoAno) {
    boolean continua = l.getRecorrencia() == 0;
    int quantidade =
        continua
            ? Math.toIntExact(
                ChronoUnit.MONTHS.between(YearMonth.from(l.getData()), YearMonth.of(ultimoAno, 12))
                    + 1)
            : l.getRecorrencia();
    if (quantidade <= 0) return List.of();
    BigDecimal valor =
        continua
            ? l.getValor()
            : l.getValor().divide(BigDecimal.valueOf(quantidade), 2, RoundingMode.DOWN);
    if (valor.compareTo(new BigDecimal("0.01")) < 0)
      throw new RegraNegocioException(
          "O valor do lançamento é insuficiente para gerar parcelas de pelo menos R$ 0,01.");
    var diferenca =
        continua
            ? BigDecimal.ZERO
            : l.getValor().subtract(valor.multiply(BigDecimal.valueOf(quantidade)));
    var resultado = new ArrayList<Prevista>();
    for (int i = 0; i < quantidade; i++) {
      // Cada mês parte do vencimento original: 31/jan, 28/fev, 31/mar.
      var data = l.getData().plusMonths(i);
      resultado.add(
          new Prevista(i + 1, data.withDayOfMonth(1), data, i == 0 ? valor.add(diferenca) : valor));
    }
    return resultado;
  }
}
