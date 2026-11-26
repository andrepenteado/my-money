package com.github.andrepenteado.mymoney.domain.repositories;

import com.github.andrepenteado.mymoney.domain.entities.Lancamento;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface LancamentoRepository
    extends JpaRepository<Lancamento, Long>, QuerydslPredicateExecutor<Lancamento> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select l from Lancamento l where l.id = :id")
  Optional<Lancamento> buscarParaAlterar(Long id);
}
