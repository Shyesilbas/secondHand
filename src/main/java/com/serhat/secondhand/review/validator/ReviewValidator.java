package com.serhat.secondhand.review.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.review.util.ReviewErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReviewValidator {

    public Result<Void> validateForCreate(User reviewer, OrderItem orderItem) {
        Order order = orderItem.getOrder();
        if (!order.getUser().getId().equals(reviewer.getId())) {
            return Result.error(ReviewErrorCodes.ORDER_ITEM_NOT_BELONG_TO_USER);
        }

        if (!order.isFulfilledForReview()) {
            return Result.error(ReviewErrorCodes.ORDER_NOT_DELIVERED);
        }

        return Result.success();
    }
}