package com.github.andrepenteado.mymoney.resources;

import com.github.andrepenteado.mymoney.services.*;
import java.util.LinkedHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiExceptionHandler {
  private static final Logger LOG = LoggerFactory.getLogger(ApiExceptionHandler.class);

  @ExceptionHandler(NaoEncontradoException.class)
  ProblemDetail naoEncontrado(NaoEncontradoException e) {
    return problema(404, e.getMessage());
  }

  @ExceptionHandler(RegraNegocioException.class)
  ProblemDetail regra(RegraNegocioException e) {
    return problema(422, e.getMessage());
  }

  @ExceptionHandler(BindException.class)
  ProblemDetail validacao(BindException e) {
    var erros = new LinkedHashMap<String, String>();
    e.getBindingResult()
        .getFieldErrors()
        .forEach(erro ->
            erros.put(
                erro.getField(),
                erro.isBindingFailure() ? "Valor ou formato inválido." : erro.getDefaultMessage()));
    var p = problema(400, "Confira os campos informados.");
    p.setProperty("erros", erros);
    return p;
  }

  @ExceptionHandler({
    HttpMessageNotReadableException.class,
    MethodArgumentTypeMismatchException.class
  })
  ProblemDetail formato(Exception e) {
    return problema(
        400,
        "Confira as datas (yyyy-MM-dd), os valores, a recorrência inteira e as opções de tipo e"
            + " forma de pagamento.");
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ProblemDetail conflito(DataIntegrityViolationException e) {
    return problema(409, "Não foi possível gravar os dados devido a um conflito de integridade.");
  }

  @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
  ProblemDetail metodo(Exception e) {
    return problema(405, "Esta operação não está disponível para o recurso.");
  }

  @ExceptionHandler(Exception.class)
  ProblemDetail inesperado(Exception e) {
    LOG.error("Falha ao processar operação financeira", e);
    return problema(500, "Não foi possível concluir a operação. Tente novamente.");
  }

  private ProblemDetail problema(int status, String mensagem) {
    var p = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(status), mensagem);
    p.setTitle("Falha na operação");
    return p;
  }
}
