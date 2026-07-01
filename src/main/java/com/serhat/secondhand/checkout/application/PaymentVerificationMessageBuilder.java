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
        details.append("<table role=\"presentation\" style=\"width: 100%; border-collapse: collapse; margin-top: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;\">");
        details.append("  <tr>");
        details.append("    <td style=\"padding: 18px 20px;\">");
        details.append("      <h3 style=\"margin-top: 0; margin-bottom: 16px; font-size: 14px; color: #0f172a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;\">Ödeme Detayları</h3>");
        
        details.append("      <table role=\"presentation\" style=\"width: 100%; border-collapse: collapse;\">");
        
        // Service Row
        details.append("        <tr>");
        details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;\">Hizmet</td>");
        details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
               .append(type.name().replace("_", " ")).append("</td>");
        details.append("        </tr>");

        switch (type) {
            case ITEM_PURCHASE -> appendCartDetails(details, user, req);
            case LISTING_CREATION -> appendListingDetails(details, req, calculateTotalListingFee());
            case SHOWCASE_PAYMENT -> {
                appendListingDetails(details, req, req != null ? req.getAmount() : null);
                if (req != null && req.getDays() != null) {
                    details.append("        <tr>");
                    details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;\">Süre (Gün)</td>");
                    details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
                           .append(req.getDays()).append(" Gün</td>");
                    details.append("        </tr>");
                }
            }
            default -> {
                if (req != null && req.getAmount() != null) {
                    details.append("        <tr>");
                    details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;\">Tutar</td>");
                    details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
                           .append(req.getAmount()).append(" TRY</td>");
                    details.append("        </tr>");
                }
            }
        }

        // Date Row
        details.append("        <tr>");
        details.append("          <td style=\"padding: 8px 0 0 0; color: #64748b; font-size: 13px;\">Tarih</td>");
        details.append("          <td style=\"padding: 8px 0 0 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
               .append(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))).append("</td>");
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
            com.serhat.secondhand.order.dto.CheckoutRequest syntheticRequest =
                    com.serhat.secondhand.order.dto.CheckoutRequest.builder()
                            .offerId(req.getOfferId())
                            .couponCode(couponCode)
                            .build();

            Result<CheckoutPricingContextFactory.CheckoutPricingContext> contextResult =
                    checkoutPricingContextFactory.build(user.getId(), syntheticRequest);

            if (contextResult.isError()) {
                throw new BusinessException(contextResult.getMessage(),
                        org.springframework.http.HttpStatus.BAD_REQUEST, contextResult.getErrorCode());
            }

            pricing = contextResult.getData().pricing();
        } else {
            List<Cart> cartItems = cartRepository.findByUserIdWithListing(user.getId());
            List<Cart> effectiveCartItems = checkoutPricingContextFactory.buildEffectiveCartItems(cartItems, null, user);
            pricing = pricingService.priceCart(user, effectiveCartItems, couponCode);
        }

        appendPricingSummary(details, pricing);
    }

    private void appendPricingSummary(StringBuilder details, PricingResultDto pricing) {
        details.append("        <tr>");
        details.append("          <td colspan=\"2\" style=\"padding: 12px 0 6px 0; color: #64748b; font-size: 13px; font-weight: 600;\">Sipariş Özeti</td>");
        details.append("        </tr>");
        
        if (pricing.getItems() != null) {
            for (var item : pricing.getItems()) {
                details.append("        <tr>");
                details.append("          <td style=\"padding: 4px 0 4px 10px; color: #475569; font-size: 12px;\">Ürün x").append(item.getQuantity()).append("</td>");
                details.append("          <td style=\"padding: 4px 0 4px 0; color: #475569; font-size: 12px; text-align: right;\">")
                       .append(item.getCampaignUnitPrice()).append(" TRY</td>");
                details.append("        </tr>");
            }
        }
        
        details.append("        <tr>");
        details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 700;\">Toplam</td>");
        details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #4f46e5; font-size: 14px; font-weight: 700; text-align: right;\">")
               .append(pricing.getTotal()).append(" TRY</td>");
        details.append("        </tr>");
    }

    private void appendListingDetails(StringBuilder details, InitiateVerificationRequest req, BigDecimal amount) {
        if (req != null) {
            String title = null;
            if (req.getCustomTitle() != null && !req.getCustomTitle().isBlank()) {
                title = req.getCustomTitle();
            } else if (req.isBulk()) {
                title = "Bulk Showcase Payment (Multiple Listings)";
            } else if (req.getListingId() != null) {
                var listingOpt = listingService.findById(req.getListingId());
                if (listingOpt.isPresent()) {
                    title = listingOpt.get().getTitle();
                }
            }
            
            if (title != null) {
                details.append("        <tr>");
                details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;\">İlan</td>");
                details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
                       .append(title).append("</td>");
                details.append("        </tr>");
            }
        }
        
        if (amount != null) {
            details.append("        <tr>");
            details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;\">Tutar</td>");
            details.append("          <td style=\"padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;\">")
                   .append(amount).append(" TRY</td>");
            details.append("        </tr>");
        }
    }

    private BigDecimal calculateTotalListingFee() {
        BigDecimal fee = listingConfig.getCreation().getFee();
        BigDecimal tax = listingConfig.getFee().getTax();
        BigDecimal taxAmount = fee.multiply(tax).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        return fee.add(taxAmount);
    }
}
