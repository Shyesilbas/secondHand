package com.serhat.secondhand.listing.domain.entity.attribute;

/**
 * {@code CATALOG}: fact of the catalog leaf (e.g. trunk volume of a vehicle version), read from the catalog,
 * never sent by a seller. {@code LISTING}: fact of the single item (e.g. owner count), stored in
 * {@code listings.attributes}.
 */
public enum AttributeLevel {
    CATALOG,
    LISTING
}
