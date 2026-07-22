package com.serhat.secondhand.inventory.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum InventoryErrorCodes implements ErrorCode {

    INSUFFICIENT_STOCK("INVENTORY_INSUFFICIENT_STOCK", "Insufficient stock for this listing", HttpStatus.CONFLICT),
    INVALID_QUANTITY("INVENTORY_INVALID_QUANTITY", "Quantity must be greater than zero", HttpStatus.BAD_REQUEST),
    INVENTORY_NOT_FOUND("INVENTORY_NOT_FOUND", "Inventory record not found for the given listing", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
