package com.github.andrepenteado.mymoney.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.context.annotation.*;

@Configuration
public class TempoConfig {
  @Bean
  public Clock clock() {
    return Clock.system(ZoneId.of("America/Sao_Paulo"));
  }
}
