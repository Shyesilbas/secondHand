package com.serhat.secondhand.checkout.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.pricing.application.IPricingService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentVerificationMessageBuilder {

    private final ListingConfig listingConfig;
    private final ListingQueryService listingService;
    private final IPricingService pricingService;
    private final CheckoutPricingContextFactory checkoutPricingContextFactory;
    private final CartRepository cartRepository;

    public String buildPaymentDetails(User user, PaymentTransactionType type, InitiateVerificationRequest req) {
        StringBuilder details = new StringBuilder();
        details.append("<table role=\"presentation\" style=\"width: 100%; border-collapse: collapse; margin-top: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;\">");
        details.append("  <tr>");
        details.append("    <td style=\"padding: 20px 24px;\">");
        details.append("      <div style=\"margin-bottom: 14px; font-size: 13px; color: #0f172a; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;\">📦 Sipariş & Ödeme Özeti</div>");
        details.append("      <table role=\"presentation\" style=\"width: 100%; border-collapse: collapse;\">");

        // Service Row
        details.append("        <tr>");
        details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;\">İşlem Türü</td>");
        details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;\">")
                .append(getTransactionTypeLabel(type)).append("</td>");
        details.append("        </tr>");

        switch (type) {
            case ITEM_PURCHASE -> appendCartDetails(details, user, req);
            case LISTING_CREATION -> appendListingDetails(details, req, calculateTotalListingFee());
            case SHOWCASE_PAYMENT -> {
                appendListingDetails(details, req, req != null ? req.getAmount() : null);
                if (req != null && req.getDays() != null) {
                    details.append("        <tr>");
                    details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;\">Süre</td>");
                    details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;\">")
                            .append(req.getDays()).append(" Gün</td>");
                    details.append("        </tr>");
                }
            }
            default -> {
                if (req != null && req.getAmount() != null) {
                    details.append("        <tr>");
                    details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;\">Tutar</td>");
                    details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;\">")
                            .append(formatMoney(req.getAmount())).append("</td>");
                    details.append("        </tr>");
                }
            }
        }

        // Date Row
        details.append("        <tr>");
        details.append("          <td style=\"padding: 10px 0 0 0; color: #94a3b8; font-size: 12px;\">İşlem Tarihi</td>");
        details.append("          <td style=\"padding: 10px 0 0 0; color: #64748b; font-size: 12px; font-weight: 600; text-align: right;\">")
                .append(java.time.LocalDateTime.now()
                        .format(java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")))
                .append("</td>");
        details.append("        </tr>");

        details.append("      </table>");
        details.append("    </td>");
        details.append("  </tr>");
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
            pricing = pricingService.priceCart(user, effectiveCartItems, couponCode);
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

                details.append("        <tr>");
                details.append("          <td style=\"padding: 8px 0; border-bottom: 1px dashed #e2e8f0; color: #334155; font-size: 13px; font-weight: 500;\">")
                        .append(itemTitle)
                        .append(" <span style=\"background-color: #e2e8f0; color: #475569; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 4px;\">x")
                        .append(item.getQuantity()).append("</span></td>");
                details.append("          <td style=\"padding: 8px 0; border-bottom: 1px dashed #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
                        .append(formatMoney(item.getNetLineTotal() != null ? item.getNetLineTotal() : item.getCampaignUnitPrice()))
                        .append("</td>");
                details.append("        </tr>");
            }
        }

        if (pricing.getCouponDiscount() != null && pricing.getCouponDiscount().compareTo(BigDecimal.ZERO) > 0) {
            details.append("        <tr>");
            details.append("          <td style=\"padding: 6px 0; color: #059669; font-size: 12px; font-weight: 600;\">🏷️ Kupon İndirimi")
                    .append(pricing.getCouponCode() != null ? " (" + pricing.getCouponCode() + ")" : "")
                    .append("</td>");
            details.append("          <td style=\"padding: 6px 0; color: #059669; font-size: 12px; font-weight: 700; text-align: right;\">-")
                    .append(formatMoney(pricing.getCouponDiscount())).append("</td>");
            details.append("        </tr>");
        }

        if (pricing.getCampaignDiscount() != null && pricing.getCampaignDiscount().compareTo(BigDecimal.ZERO) > 0) {
            details.append("        <tr>");
            details.append("          <td style=\"padding: 6px 0; color: #059669; font-size: 12px; font-weight: 600;\">✨ Kampanya İndirimi</td>");
            details.append("          <td style=\"padding: 6px 0; color: #059669; font-size: 12px; font-weight: 700; text-align: right;\">-")
                    .append(formatMoney(pricing.getCampaignDiscount())).append("</td>");
            details.append("        </tr>");
        }

        BigDecimal total = pricing.getTotal() != null ? pricing.getTotal() : BigDecimal.ZERO;
        details.append("        <tr>");
        details.append("          <td style=\"padding: 12px 0 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 800;\">Ödenecek Toplam Tutar</td>");
        details.append("          <td style=\"padding: 12px 0 8px 0; border-bottom: 1px solid #e2e8f0; color: #4338ca; font-size: 16px; font-weight: 800; text-align: right;\">")
                .append(formatMoney(total)).append("</td>");
        details.append("        </tr>");
    }

    private void appendListingDetails(StringBuilder details, InitiateVerificationRequest req, BigDecimal amount) {
        if (req != null) {
            String title = null;
            if (req.getCustomTitle() != null && !req.getCustomTitle().isBlank()) {
                title = req.getCustomTitle();
            } else if (req.isBulk()) {
                title = "Toplu Vitrin Öne Çıkarma";
            } else if (req.getListingId() != null) {
                var listingOpt = listingService.findById(req.getListingId());
                if (listingOpt.isPresent()) {
                    title = listingOpt.get().getTitle();
                }
            }

            if (title != null) {
                details.append("        <tr>");
                details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;\">İlan</td>");
                details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;\">")
                        .append(title).append("</td>");
                details.append("        </tr>");
            }
        }

        if (amount != null) {
            details.append("        <tr>");
            details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;\">Ödenecek Tutar</td>");
            details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #4338ca; font-size: 15px; font-weight: 800; text-align: right;\">")
                    .append(formatMoney(amount)).append("</td>");
            details.append("        </tr>");
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
        if (amount == null) return "0.00 TL";
        return String.format(java.util.Locale.forLanguageTag("tr-TR"), "%,.2f TL", amount);
    }

    private BigDecimal calculateTotalListingFee() {
        BigDecimal fee = listingConfig.getCreation().getFee();
        BigDecimal tax = listingConfig.getFee().getTax();
        BigDecimal taxAmount = fee.multiply(tax).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        return fee.add(taxAmount);
    }
}
