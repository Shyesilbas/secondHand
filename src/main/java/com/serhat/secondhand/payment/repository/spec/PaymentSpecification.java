package com.serhat.secondhand.payment.repository.spec;

import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PaymentSpecification {

    public static Specification<Payment> withFilters(
            Long userId,
            PaymentTransactionType transactionType,
            PaymentType paymentType,
            PaymentDirection paymentDirection,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            BigDecimal amountMin,
            BigDecimal amountMax,
            String searchTerm
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // User filter: (fromUser = userId OR toUser = userId)
            Predicate fromUserPredicate = cb.equal(root.get("fromUser").get("id"), userId);
            Predicate toUserPredicate = cb.equal(root.get("toUser").get("id"), userId);
            predicates.add(cb.or(fromUserPredicate, toUserPredicate));

            if (transactionType != null) {
                if (transactionType == PaymentTransactionType.ITEM_SALE) {
                    Predicate directMatch = cb.equal(root.get("transactionType"), PaymentTransactionType.ITEM_SALE);
                    Predicate purchaseMatch = cb.and(
                        cb.equal(root.get("transactionType"), PaymentTransactionType.ITEM_PURCHASE),
                        cb.equal(root.get("toUser").get("id"), userId)
                    );
                    predicates.add(cb.or(directMatch, purchaseMatch));
                } else if (transactionType == PaymentTransactionType.ITEM_PURCHASE) {
                    Predicate directMatch = cb.equal(root.get("transactionType"), PaymentTransactionType.ITEM_PURCHASE);
                    Predicate saleMatch = cb.and(
                        cb.equal(root.get("transactionType"), PaymentTransactionType.ITEM_SALE),
                        cb.equal(root.get("fromUser").get("id"), userId)
                    );
                    predicates.add(cb.or(directMatch, saleMatch));
                } else {
                    predicates.add(cb.equal(root.get("transactionType"), transactionType));
                }
            }

            if (paymentType != null) {
                predicates.add(cb.equal(root.get("paymentType"), paymentType));
            }

            if (paymentDirection != null) {
                if (paymentDirection == PaymentDirection.INCOMING) {
                    predicates.add(cb.equal(root.get("toUser").get("id"), userId));
                } else if (paymentDirection == PaymentDirection.OUTGOING) {
                    predicates.add(cb.equal(root.get("fromUser").get("id"), userId));
                }
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("processedAt"), dateFrom));
            }

            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("processedAt"), dateTo));
            }

            if (amountMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), amountMin));
            }

            if (amountMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("amount"), amountMax));
            }

            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                String pattern = "%" + searchTerm.trim().toLowerCase() + "%";
                Predicate tuName = cb.like(cb.lower(root.join("toUser", jakarta.persistence.criteria.JoinType.LEFT).get("name")), pattern);
                Predicate tuSurname = cb.like(cb.lower(root.join("toUser", jakarta.persistence.criteria.JoinType.LEFT).get("surname")), pattern);
                Predicate fuName = cb.like(cb.lower(root.join("fromUser", jakarta.persistence.criteria.JoinType.LEFT).get("name")), pattern);
                Predicate fuSurname = cb.like(cb.lower(root.join("fromUser", jakarta.persistence.criteria.JoinType.LEFT).get("surname")), pattern);
                Predicate title = cb.like(cb.lower(root.get("listingTitle")), pattern);
                Predicate listingNo = cb.like(cb.lower(root.get("listingNo")), pattern);
                predicates.add(cb.or(tuName, tuSurname, fuName, fuSurname, title, listingNo));
            }

            // Optimize N+1 issues by adding fetch in count queries avoiding errors
            if (Long.class != query.getResultType()) {
                root.fetch("fromUser", jakarta.persistence.criteria.JoinType.LEFT);
                root.fetch("toUser", jakarta.persistence.criteria.JoinType.LEFT);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
