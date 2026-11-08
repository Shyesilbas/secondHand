package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One official color of an electronic model, e.g. "Çöl Titanyum" shown as {@link Color#BEIGE} in filters. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ElectronicModelColor {
    private String name;
    private Color color;
}
