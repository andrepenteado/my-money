package com.github.andrepenteado.mymoney.services;

public class NaoEncontradoException extends RuntimeException {
  public NaoEncontradoException(String mensagem) {
    super(mensagem);
  }
}
