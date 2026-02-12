package com.serhat.secondhand.core.audit.aspect;

import com.serhat.secondhand.core.audit.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;


@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogService auditLogService;

    @Around("execution(* com.serhat.secondhand.auth.application.IAuthService.login(..))")
    public Object auditLogin(ProceedingJoinPoint joinPoint) throws Throwable {
        Object[] args = joinPoint.getArgs();
        String userEmail = null;
        String ipAddress = "unknown";
        String userAgent = "unknown";
        boolean success = false;
        String errorMessage = null;

        try {
                        if (args.length > 0 && args[0] != null) {
                Object loginRequest = args[0];
                userEmail = (String) loginRequest.getClass().getMethod("email").invoke(loginRequest);
            }

                        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ipAddress = auditLogService.getClientIpAddress(request);
                userAgent = auditLogService.getClientUserAgent(request);
            }

                        Object result = joinPoint.proceed();
            success = true;
            
            log.info("Login successful for user: {} from IP: {}", userEmail, ipAddress);
            return result;

        } catch (Exception e) {
            success = false;
            errorMessage = e.getMessage();
            log.warn("Login failed for user: {} from IP: {} - Error: {}", userEmail, ipAddress, errorMessage);
            throw e;
        } finally {
                        auditLogService.logLogin(userEmail, ipAddress, userAgent, success, errorMessage);
        }
    }

    @Around("execution(* com.serhat.secondhand.auth.application.IAuthService.logout(..))")
    public Object auditLogout(ProceedingJoinPoint joinPoint) throws Throwable {
        String userEmail = null;
        Long userId = null;
        String ipAddress = "unknown";
        String userAgent = "unknown";

        try {
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                userEmail = authentication.getName();
                                if (authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                                                        }
            }

                        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ipAddress = auditLogService.getClientIpAddress(request);
                userAgent = auditLogService.getClientUserAgent(request);
            }

                        Object result = joinPoint.proceed();
            
            log.info("Logout successful for user: {} from IP: {}", userEmail, ipAddress);
            return result;

        } catch (Exception e) {
            log.error("Logout failed for user: {} from IP: {} - Error: {}", userEmail, ipAddress, e.getMessage());
            throw e;
        } finally {
                        auditLogService.logLogout(userEmail, userId, ipAddress, userAgent);
        }
    }

    @Around("execution(* com.serhat.secondhand.auth.application.PasswordService.changePassword(..))")
    public Object auditPasswordChange(ProceedingJoinPoint joinPoint) throws Throwable {
        String userEmail = null;
        Long userId = null;
        String ipAddress = "unknown";
        String userAgent = "unknown";
        boolean success = false;
        String errorMessage = null;

        try {
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                userEmail = authentication.getName();
                                if (authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                                                        }
            }

                        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ipAddress = auditLogService.getClientIpAddress(request);
                userAgent = auditLogService.getClientUserAgent(request);
            }

                        Object result = joinPoint.proceed();
            success = true;
            
            log.info("Password change successful for user: {} from IP: {}", userEmail, ipAddress);
            return result;

        } catch (Exception e) {
            success = false;
            errorMessage = e.getMessage();
            log.warn("Password change failed for user: {} from IP: {} - Error: {}", userEmail, ipAddress, errorMessage);
            throw e;
        } finally {
                        auditLogService.logPasswordChange(userEmail, userId, ipAddress, userAgent, success, errorMessage);
        }
    }
}
