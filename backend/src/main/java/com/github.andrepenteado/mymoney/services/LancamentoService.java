package com.github.andrepenteado.mymoney.services;

import com.github.andrepenteado.mymoney.domain.entities.*;
import com.github.andrepenteado.mymoney.domain.filters.LancamentoFilter;
import com.github.andrepenteado.mymoney.domain.repositories.*;
import com.github.andrepenteado.mymoney.resources.dto.*;
import java.time.*;
import java.util.*;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class LancamentoService {
  private final LancamentoRepository lancamentos;
  private final ParcelaRepository parcelas;
  private final Clock clock;

  public LancamentoService(
      LancamentoRepository lancamentos, ParcelaRepository parcelas, Clock clock) {
    this.lancamentos = lancamentos;
    this.parcelas = parcelas;
    this.clock = clock;
  }

  public List<LancamentoDados> pesquisar(LancamentoFilter filtro) {
    var result = new ArrayList<LancamentoDados>();
    lancamentos
        .findAll(filtro.predicate(), Sort.by("data", "id"))
        .forEach(l -> result.add(LancamentoDados.de(l)));
    return result;
  }

  public LancamentoDados buscar(Long id) {
    return LancamentoDados.de(encontrar(id));
  }

  private Lancamento encontrar(Long id) {
    return lancamentos
        .findById(id)
        .orElseThrow(() -> new NaoEncontradoException("Lançamento não encontrado."));
  }

  private Lancamento bloquear(Long id) {
    return lancamentos
        .buscarParaAlterar(id)
        .orElseThrow(() -> new NaoEncontradoException("Lançamento não encontrado."));
  }

  @Transactional
  public LancamentoDados incluir(LancamentoDados dados) {
    if (dados.id() != null)
      throw new RegraNegocioException("O identificador do lançamento é gerado pelo sistema.");
    var l = new Lancamento();
    dados.aplicar(l);
    var previstas =
        GeracaoParcelas.gerar(l, Math.max(LocalDate.now(clock).getYear(), l.getData().getYear()));
    lancamentos.save(l);
    previstas.forEach(p -> parcelas.save(nova(l, p)));
    return LancamentoDados.de(l);
  }

  @Transactional
  public LancamentoDados alterar(Long id, LancamentoDados dados) {
    validarId(id, dados.id());
    var l = bloquear(id);
    var existentes = parcelas.findByLancamentoIdOrderByNumeroAsc(id);
    boolean eraContinua = l.getRecorrencia() == 0;
    int anoAtual = LocalDate.now(clock).getYear();
    int ultimoAno =
        existentes.stream()
            .mapToInt(p -> p.getCompetencia().getYear())
            .max()
            .orElse(l.getData().getYear());
    dados.aplicar(l);
    // Alterar um lançamento contínuo não autoriza gerar um ano ainda não confirmado.
    int limite = eraContinua ? ultimoAno : Math.max(anoAtual, l.getData().getYear());
    var previstas = GeracaoParcelas.gerar(l, limite);
    Map<Integer, Parcela> porOcorrencia = new HashMap<>();
    existentes.forEach(p -> porOcorrencia.put(p.getNumero(), p));
    Set<Integer> mantidas = new HashSet<>();
    for (var prevista : previstas) {
      if (eraContinua && prevista.competencia().getYear() < anoAtual) continue;
      int numero = numero(l, prevista);
      var parcela = porOcorrencia.get(numero);
      mantidas.add(numero);
      if (parcela == null) parcelas.save(nova(l, prevista));
      else if (!parcela.preservada()) aplicarPrevista(parcela, l, prevista);
    }
    for (var p : existentes) {
      boolean historica = eraContinua && p.getCompetencia().getYear() < anoAtual;
      if (!mantidas.contains(p.getNumero()) && !p.preservada() && !historica) parcelas.delete(p);
    }
    return LancamentoDados.de(l);
  }

  /** A confirmação autoriza apenas o ano corrente, mantendo as ocorrências dos anos anteriores. */
  @Transactional
  public LancamentoDados renovar(Long id, RenovacaoDados dados) {
    var l = bloquear(id);
    if (l.getRecorrencia() != 0)
      throw new RegraNegocioException(
          "A renovação anual está disponível apenas para lançamentos contínuos.");
    int ano = LocalDate.now(clock).getYear();
    if (dados.ano() != ano)
      throw new RegraNegocioException("Confirme a renovação para o ano corrente (" + ano + ").");
    if (ano <= l.getData().getYear())
      throw new RegraNegocioException(
          "O lançamento já foi gerado no ano inicial; renove a partir do ano seguinte.");
    var existentes = parcelas.findByLancamentoIdOrderByNumeroAsc(id);
    if (existentes.stream().anyMatch(p -> p.getCompetencia().getYear() == ano))
      throw new RegraNegocioException(
          "As parcelas de " + ano + " já foram geradas para este lançamento.");
    l.setValor(dados.valor().setScale(2));
    l.setData(LocalDate.of(ano, 1, dados.dia_vencimento()));
    GeracaoParcelas.gerar(l, ano).forEach(p -> parcelas.save(nova(l, p)));
    return LancamentoDados.de(l);
  }

  @Transactional
  public void excluir(Long id) {
    var l = bloquear(id);
    parcelas.deleteAll(parcelas.findByLancamentoIdOrderByNumeroAsc(id));
    lancamentos.delete(l);
  }

  static void validarId(Long rota, Long corpo) {
    if (corpo != null && !rota.equals(corpo))
      throw new RegraNegocioException(
          "O identificador informado não corresponde ao registro da rota.");
  }

  private int numero(Lancamento l, GeracaoParcelas.Prevista prevista) {
    return l.getRecorrencia() == 0
        ? prevista.competencia().getYear() * 12 + prevista.competencia().getMonthValue()
        : prevista.numero();
  }

  private Parcela nova(Lancamento l, GeracaoParcelas.Prevista prevista) {
    var p = new Parcela();
    p.setLancamento(l);
    p.setNumero(numero(l, prevista));
    aplicarPrevista(p, l, prevista);
    return p;
  }

  private void aplicarPrevista(Parcela p, Lancamento l, GeracaoParcelas.Prevista prevista) {
    p.setCompetencia(prevista.competencia());
    p.setDataVencimento(prevista.data());
    p.setValorVencimento(prevista.valor());
    p.setFormaPagamento(l.getFormaPagamento());
  }
}
