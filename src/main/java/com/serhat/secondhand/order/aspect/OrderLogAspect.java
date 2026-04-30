package com.serhat.secondhand.order.aspect;

import com.serhat.secondhand.order.application.OrderLogService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;

import java.lang.reflect.Method;
import java.util.stream.IntStream;

@Aspect
@Component
@RequiredArgsConstructor
public class OrderLogAspect {

    private final OrderLogService orderLog;

    @Pointcut("execution(* com.serhat.secondhand.order.api.OrderController.*(..))")
    public void orderControllerMethods() {}

    @Before("orderControllerMethods()")
    public void logOrderApiCall(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        String userEmail = getCurrentUserEmail();

        // Check if it's a mutation (POST, PUT, DELETE) based on method name or annotations would be better
        // but for now we follow the existing pattern in OrderController
        if (isMutation(methodName)) {
            Long orderId = findOrderIdInArgs(joinPoint);
            orderLog.logApiMutation(methodName, orderId, userEmail);
        } else {
            orderLog.logApiRequest(methodName, userEmail);
        }
    }

    private boolean isMutation(String methodName) {
        return methodName.startsWith("checkout") || 
               methodName.startsWith("cancel") || 
               methodName.startsWith("refund") || 
               methodName.startsWith("complete") || 
               methodName.startsWith("update");
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user.getEmail();
        }
        return "anonymous";
    }

    private Long findOrderIdInArgs(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        // This is a bit simplified, ideally we'd look for @PathVariable "orderId"
        return IntStream.range(0, args.length)
                .filter(i -> args[i] instanceof Long)
                .mapToObj(i -> (Long) args[i])
                .findFirst()
                .orElse(null);
    }
}
