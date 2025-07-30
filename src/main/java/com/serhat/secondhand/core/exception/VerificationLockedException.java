package com.serhat.secondhand.core.exception;

import org.springframework.http.HttpStatus;

public class VerificationLockedException extends BusinessException {
  public VerificationLockedException(String message) {
    super(message, HttpStatus.BAD_REQUEST, "VERIFICATION_LOCKED");
  }}
