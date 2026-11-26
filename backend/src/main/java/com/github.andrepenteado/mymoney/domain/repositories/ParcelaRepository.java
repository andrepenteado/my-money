package com.github.andrepenteado.mymoney.domain.repositories;

import com.github.andrepenteado.mymoney.domain.entities.Parcela;
import com.querydsl.core.types.Predicate;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface ParcelaRepository
    extends JpaRepository<Parcela, Long>, QuerydslPredicateExecutor<Parcela> {
  @Override
  @EntityGraph(attributePaths = "lancamento")
  List<Parcela> findAll(Predicate predicate, Sort sort);

  List<Parcela> findByLancamentoIdOrderByNumeroAsc(Long id);

  @Query("select p.lancamento.id from Parcela p where p.id = :id")
  java.util.Optional<Long> buscarLancamentoId(Long id);
}
