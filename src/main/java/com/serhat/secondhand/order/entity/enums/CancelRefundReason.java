package com.serhat.secondhand.order.entity.enums;

import lombok.Getter;

@Getter
public enum CancelRefundReason {
    DEFECTIVE_PRODUCT("Defective Product"),
    WRONG_ITEM("Wrong Item"),
    NOT_AS_DESCRIBED("Not as Described"),
    CHANGED_MIND("Changed Mind"),
    DELAYED_DELIVERY("Delayed Delivery"),
    OTHER("Other");

    private final String label;

    CancelRefundReason(String label) {
        this.label = label;
    }
}



