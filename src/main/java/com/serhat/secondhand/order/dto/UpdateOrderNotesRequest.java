package com.serhat.secondhand.order.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateOrderNotesRequest {

    @Size(max = 1000, message = "Notes must be 1000 characters or less")
    private String notes;
}

