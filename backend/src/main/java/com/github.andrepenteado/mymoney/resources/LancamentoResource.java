package com.github.andrepenteado.mymoney.resources;

import com.github.andrepenteado.mymoney.domain.filters.LancamentoFilter;
import com.github.andrepenteado.mymoney.resources.dto.*;
import com.github.andrepenteado.mymoney.services.LancamentoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lancamentos")
public class LancamentoResource {
  private final LancamentoService service;

  public LancamentoResource(LancamentoService service) {
    this.service = service;
  }

  @GetMapping({"", "/pesquisar"})
  public List<LancamentoDados> pesquisar(@ModelAttribute LancamentoFilter filtro) {
    return service.pesquisar(filtro);
  }

  @GetMapping("/{id}")
  public LancamentoDados buscar(@PathVariable Long id) {
    return service.buscar(id);
  }

  @PostMapping
  public ResponseEntity<LancamentoDados> incluir(@Valid @RequestBody LancamentoDados dados) {
    var salvo = service.incluir(dados);
    return ResponseEntity.created(URI.create("/lancamentos/" + salvo.id())).body(salvo);
  }

  @PutMapping("/{id}")
  public LancamentoDados alterar(@PathVariable Long id, @Valid @RequestBody LancamentoDados dados) {
    return service.alterar(id, dados);
  }

  @PostMapping("/{id}/renovar")
  public LancamentoDados renovar(@PathVariable Long id, @Valid @RequestBody RenovacaoDados dados) {
    return service.renovar(id, dados);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    service.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
