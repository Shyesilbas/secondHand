package com.serhat.secondhand.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateOrderNameRequest {
    @NotBlank
    private String name;
}
