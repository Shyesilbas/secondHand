package com.serhat.secondhand.checkout.application;

import org.springframework.web.util.HtmlUtils;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.config.AppConfigProperties;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.ListingCommandService;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.pricing.application.IPricingService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.showcase.application.ShowcasePricingCalculator;
import com.serhat.secondhand.showcase.validator.ShowcaseValidator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentVerificationMessageBuilder {

    private final ListingQueryService listingService;
    private final ListingCommandService listingCommandService;
    private final ShowcasePricingCalculator showcasePricingCalculator;
    private final ShowcaseValidator showcaseValidator;
    private final AppConfigProperties appConfigProperties;
    private final IPricingService pricingService;
    private final CheckoutPricingContextFactory checkoutPricingContextFactory;
    private final CartRepository cartRepository;

    public String buildPaymentDetails(User user, PaymentTransactionType type, InitiateVerificationRequest req) {
        StringBuilder details = new StringBuilder();
        details.append("<table role=\"presentation\" class=\"details\">");
        appendRow(details, "İşlem", getTransactionTypeLabel(type));

        switch (type) {
            case ITEM_PURCHASE -> appendCartDetails(details, user, req);
            case LISTING_CREATION -> appendListingDetails(details, req, listingCommandService.calculateTotalListingFee());
            case SHOWCASE_PAYMENT -> {
                int days = requireValidShowcaseDays(req);
                appendListingDetails(details, req, showcasePricingCalculator.totalCost(days));
                appendRow(details, "Süre", days + " Gün");
            }
            case MEMBERSHIP_PAYMENT -> appendAmountRow(details, appConfigProperties.getMembership().getPremiumPrice());
            default -> {
                // Other transaction types do not start an OTP from the client; no amount is shown.
            }
        }

        appendRow(details, "Tarih", java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")));
        details.append("</table>");
        return details.toString();
    }

    private void appendCartDetails(StringBuilder details, User user, InitiateVerificationRequest req) {
        String couponCode = req != null ? req.getCouponCode() : null;

        PricingResultDto pricing;
        if (req != null && req.getOfferId() != null) {
            com.serhat.secondhand.order.dto.CheckoutRequest syntheticRequest = com.serhat.secondhand.order.dto.CheckoutRequest
                    .builder()
                    .offerId(req.getOfferId())
                    .couponCode(couponCode)
                    .build();

            Result<CheckoutPricingContextFactory.CheckoutPricingContext> contextResult = checkoutPricingContextFactory
                    .build(user.getId(), syntheticRequest);

            if (contextResult.isError()) {
                throw new BusinessException(contextResult.getMessage(),
                        org.springframework.http.HttpStatus.BAD_REQUEST, contextResult.getErrorCode());
            }

            pricing = contextResult.getData().pricing();
        } else {
            List<Cart> cartItems = cartRepository.findByUserIdWithListing(user.getId());
            List<Cart> effectiveCartItems = checkoutPricingContextFactory.buildEffectiveCartItems(cartItems, null,
                    user);
            Result<PricingResultDto> pricingResult = pricingService.priceCartForCheckout(
                    user, effectiveCartItems, couponCode, null, null, null);
            if (pricingResult.isError()) {
                throw new BusinessException(pricingResult.getMessage(),
                        org.springframework.http.HttpStatus.BAD_REQUEST, pricingResult.getErrorCode());
            }
            pricing = pricingResult.getData();
        }

        appendPricingSummary(details, pricing);
    }

    private void appendPricingSummary(StringBuilder details, PricingResultDto pricing) {
        if (pricing == null) return;

        if (pricing.getItems() != null && !pricing.getItems().isEmpty()) {
            for (var item : pricing.getItems()) {
                String itemTitle = "Ürün";
                if (item.getListingId() != null) {
                    var listingOpt = listingService.findById(item.getListingId());
                    if (listingOpt.isPresent() && listingOpt.get().getTitle() != null) {
                        itemTitle = listingOpt.get().getTitle();
                    }
                }

                appendRow(details, item.getQuantity() > 1 ? itemTitle + " x" + item.getQuantity() : itemTitle,
                        formatMoney(item.getNetLineTotal() != null ? item.getNetLineTotal() : item.getCampaignUnitPrice()));
            }
        }

        if (pricing.getCouponDiscount() != null && pricing.getCouponDiscount().compareTo(BigDecimal.ZERO) > 0) {
            appendRow(details, "Kupon İndirimi" + (pricing.getCouponCode() != null ? " (" + pricing.getCouponCode() + ")" : ""),
                    "-" + formatMoney(pricing.getCouponDiscount()));
        }

        if (pricing.getCampaignDiscount() != null && pricing.getCampaignDiscount().compareTo(BigDecimal.ZERO) > 0) {
            appendRow(details, "Kampanya İndirimi", "-" + formatMoney(pricing.getCampaignDiscount()));
        }

        BigDecimal total = pricing.getTotal() != null ? pricing.getTotal() : BigDecimal.ZERO;
        details.append("<tr class=\"total\"><td class=\"label\">Ödenecek Toplam</td><td class=\"value\">")
                .append(formatMoney(total)).append("</td></tr>");
    }

    private void appendListingDetails(StringBuilder details, InitiateVerificationRequest req, BigDecimal amount) {
        if (req != null) {
            String title = null;
            if (req.getListingId() != null) {
                var listingOpt = listingService.findById(req.getListingId());
                if (listingOpt.isPresent()) {
                    title = listingOpt.get().getTitle();
                }
            }

            if (title != null) {
                appendRow(details, "İlan", title);
            }
        }

        if (amount != null) {
            appendRow(details, "Ödenecek Tutar", formatMoney(amount));
        }
    }

    private String getTransactionTypeLabel(PaymentTransactionType type) {
        if (type == null) return "Ödeme İşlemi";
        return switch (type) {
            case ITEM_PURCHASE -> "Ürün Satın Alma";
            case ITEM_SALE -> "Ürün Satışı";
            case LISTING_CREATION -> "Yeni İlan Yayınlama";
            case SHOWCASE_PAYMENT -> "Vitrin & Öne Çıkarma";
            case REFUND -> "İade İşlemi";
            case EWALLET_DEPOSIT -> "Cüzdana Bakiye Yükleme";
            case EWALLET_WITHDRAWAL -> "Cüzdandan Para Çekme";
            case EWALLET_PAYMENT_RECEIVED -> "Cüzdan Ödeme Tahsilatı";
            case MEMBERSHIP_PAYMENT -> "Premium Üyelik Ödemesi";
        };
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "0,00 TRY";
        return String.format(java.util.Locale.forLanguageTag("tr-TR"), "%,.2f TRY", amount);
    }

    private int requireValidShowcaseDays(InitiateVerificationRequest req) {
        Integer days = req != null ? req.getDays() : null;
        if (days == null || showcaseValidator.validateDaysCount(days).isError()) {
            throw new BusinessException(com.serhat.secondhand.showcase.ShowcaseErrorCodes.INVALID_DAYS_COUNT);
        }
        return days;
    }

    private void appendAmountRow(StringBuilder details, BigDecimal amount) {
        appendRow(details, "Tutar", formatMoney(amount));
    }

    /** Values reach the email through th:utext, so user-entered text (listing titles, coupon codes) is escaped here. */
    private void appendRow(StringBuilder details, String label, String value) {
        details.append("<tr><td class=\"label\">").append(HtmlUtils.htmlEscape(label, "UTF-8"))
                .append("</td><td class=\"value\">").append(HtmlUtils.htmlEscape(value == null ? "" : value, "UTF-8"))
                .append("</td></tr>");
    }

}
