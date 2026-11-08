package com.serhat.secondhand.listing.domain.entity.attribute;

/**
 * Value shape of a listing attribute.
 * <ul>
 *   <li>{@code ENUM}: one option value; {@code MULTI_ENUM}: list of option values.</li>
 *   <li>{@code ENUM_MAP}: object whose keys are {@code KEY} options and values are {@code VALUE} options
 *       (e.g. damage map: part -> ORIGINAL/PAINTED/CHANGED).</li>
 *   <li>{@code STRING}: {@code maxValue} is the maximum length; {@code DATE}: ISO {@code yyyy-MM-dd}.</li>
 * </ul>
 */
public enum AttributeDataType {
    STRING,
    INTEGER,
    DECIMAL,
    BOOLEAN,
    DATE,
    ENUM,
    MULTI_ENUM,
    ENUM_MAP
}
