package com.serhat.secondhand.order.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOrderNotesRequest {

    @Size(max = 1000, message = "Notes must be 1000 characters or less")
    private String notes;
}

