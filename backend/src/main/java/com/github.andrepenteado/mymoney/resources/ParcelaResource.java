package com.github.andrepenteado.mymoney.resources;

import com.github.andrepenteado.mymoney.domain.filters.ParcelaFilter;
import com.github.andrepenteado.mymoney.resources.dto.*;
import com.github.andrepenteado.mymoney.services.ParcelaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/parcelas")
public class ParcelaResource {
  private final ParcelaService service;

  public ParcelaResource(ParcelaService service) {
    this.service = service;
  }

  @GetMapping({"", "/pesquisar"})
  public List<ParcelaConsulta> pesquisar(@ModelAttribute ParcelaFilter filtro) {
    return service.pesquisar(filtro);
  }

  @GetMapping("/{id}")
  public ParcelaConsulta buscar(@PathVariable Long id) {
    return service.buscar(id);
  }

  @PutMapping("/{id}")
  public ParcelaConsulta alterar(@PathVariable Long id, @Valid @RequestBody ParcelaDados dados) {
    return service.alterar(id, dados);
  }

  @GetMapping("/resumo")
  public ResumoPeriodo resumo(@ModelAttribute ParcelaFilter filtro) {
    return service.resumo(filtro);
  }

  @GetMapping("/planejamento")
  public List<PlanejamentoMes> planejamento() {
    return service.planejamento();
  }
}
