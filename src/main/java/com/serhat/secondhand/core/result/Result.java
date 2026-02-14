package com.serhat.secondhand.core.result;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;

import java.util.function.Function;

@Getter
public class Result<T> {
    private final boolean success;
    private final String message;
    private final T data;
    private final String errorCode;

    private Result(boolean success, String message, T data, String errorCode) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errorCode = errorCode;
    }


    public static <T> Result<T> success() {
        return new Result<>(true, null, null, null);
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(true, null, data, null);
    }

    public static <T> Result<T> success(T data, String message) {
        return new Result<>(true, message, data, null);
    }

    public static <T> Result<T> error(String message) {
        return new Result<>(false, message, null, null);
    }

    public static <T> Result<T> error(String message, String errorCode) {
        return new Result<>(false, message, null, errorCode);
    }

    public static <T> Result<T> error(ErrorCode errorCode) {
        return new Result<>(false, errorCode.getMessage(), null, errorCode.getCode());
    }


    public boolean isError() {
        return !success;
    }


    public <R> Result<R> map(Function<? super T, ? extends R> mapper) {
        if (isError()) {
            return Result.error(this.message, this.errorCode);
        }
        return Result.success(mapper.apply(this.data));
    }

    public <R> Result<R> flatMap(Function<? super T, Result<R>> mapper) {
        if (isError()) {
            return Result.error(this.message, this.errorCode);
        }
        return mapper.apply(this.data);
    }

}