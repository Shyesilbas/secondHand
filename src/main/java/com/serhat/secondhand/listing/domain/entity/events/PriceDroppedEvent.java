package com.serhat.secondhand.listing.domain.entity.events;

import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
public class PriceDroppedEvent extends ApplicationEvent {
    private final UUID listingId;
    private final String listingTitle;
    private final BigDecimal oldPrice;
    private final BigDecimal newPrice;
    private final Currency currency;

    public PriceDroppedEvent(Object source, UUID listingId, String listingTitle, BigDecimal oldPrice, BigDecimal newPrice, Currency currency) {
        super(source);
        this.listingId = listingId;
        this.listingTitle = listingTitle;
        this.oldPrice = oldPrice;
        this.newPrice = newPrice;
        this.currency = currency;
    }
}
