package com.serhat.secondhand.review.validator;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.review.repository.ReviewRepository;
import com.serhat.secondhand.review.util.ReviewErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReviewValidator {

    private final ReviewRepository reviewRepository;

    public void validateForCreate(User reviewer, OrderItem orderItem) {
        if (!orderItem.getOrder().getUser().getId().equals(reviewer.getId())) {
            throw new BusinessException(ReviewErrorCodes.ORDER_ITEM_NOT_BELONG_TO_USER);
        }

        ShippingStatus currentStatus = orderItem.getOrder().getShipping() != null 
                ? orderItem.getOrder().getShipping().getStatus() 
                : null;
        if (currentStatus == null || currentStatus != ShippingStatus.DELIVERED) {
            throw new BusinessException(ReviewErrorCodes.ORDER_NOT_DELIVERED);
        }

        if (reviewRepository.existsByReviewerAndOrderItem(reviewer, orderItem)) {
            throw new BusinessException(ReviewErrorCodes.REVIEW_ALREADY_EXISTS);
        }
    }
}

