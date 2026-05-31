package com.serhat.secondhand.core.audit.service;

import com.serhat.secondhand.core.audit.dto.AuditLogDto;
import com.serhat.secondhand.core.audit.entity.AuditLog;
import com.serhat.secondhand.core.audit.mapper.AuditLogMapper;
import com.serhat.secondhand.core.audit.repository.AuditLogRepository;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private void sendAuditEmail(String userEmail, String subject, String content, EmailType emailType) {
        if (userEmail == null || userEmail.isBlank()) return;
        userRepository.findByEmail(userEmail).ifPresent(user -> {
            try {
                emailService.sendEmail(user, subject, content, emailType);
                log.info("Security audit email sent successfully to {} for subject: {}", userEmail, subject);
            } catch (Exception e) {
                log.error("Failed to send security audit email to {}: {}", userEmail, e.getMessage());
            }
        });
    }

    @Async("taskExecutor")
    @Transactional
    public void logLogin(String userEmail, String ipAddress, String userAgent, boolean success, String errorMessage) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userEmail(userEmail)
                    .eventType(success ? AuditLog.AuditEventType.LOGIN_SUCCESS : AuditLog.AuditEventType.LOGIN_FAILURE)
                    .eventStatus(success ? AuditLog.AuditEventStatus.SUCCESS : AuditLog.AuditEventStatus.FAILURE)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details(success ? "Login successful" : "Login failed")
                    .errorMessage(errorMessage)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved for login: {} - {}", userEmail, success ? "SUCCESS" : "FAILURE");

            // Send Security Audit Email
            String subject = success ? "Güvenlik Uyarısı: Başarılı Giriş Yapıldı" : "Güvenlik Uyarısı: Başarısız Giriş Denemesi";
            String content = success 
                    ? String.format("Hesabınıza yeni bir başarılı giriş yapıldı.\n\nDetaylar:\nIP Adresi: %s\nTarayıcı (User-Agent): %s\nZaman: %s\n\nEğer bu işlemi siz yapmadıysanız lütfen hemen şifrenizi sıfırlayın.", ipAddress, userAgent, LocalDateTime.now())
                    : String.format("Hesabınıza başarısız bir giriş denemesi yapıldı.\n\nDetaylar:\nIP Adresi: %s\nTarayıcı (User-Agent): %s\nHata: %s\nZaman: %s\n\nEğer bu işlemi siz gerçekleştirmediyseniz hesabınız güvendedir, ancak şüpheli durumlara karşı şifrenizi güncellemeyi düşünebilirsiniz.", ipAddress, userAgent, errorMessage != null ? errorMessage : "Hatalı şifre veya e-posta", LocalDateTime.now());
            sendAuditEmail(userEmail, subject, content, EmailType.SYSTEM);
        } catch (Exception e) {
            log.error("Failed to save audit log for login: {}", e.getMessage());
        }
    }

    @Async("taskExecutor")
    @Transactional
    public void logLoginViaGoogle(String userEmail, Long userId, String ipAddress, String userAgent) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userEmail(userEmail)
                    .userId(userId)
                    .eventType(AuditLog.AuditEventType.LOGIN_SUCCESS)
                    .eventStatus(AuditLog.AuditEventStatus.SUCCESS)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details("Login Via Google")
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved for Google OAuth login: {}", userEmail);

            // Send Security Audit Email
            String subject = "Güvenlik Uyarısı: Google ile Giriş Yapıldı";
            String content = String.format("Hesabınıza Google hesabınız kullanılarak başarılı bir giriş yapıldı.\n\nDetaylar:\nIP Adresi: %s\nTarayıcı (User-Agent): %s\nZaman: %s\n\nEğer bu işlemi siz yapmadıysanız lütfen Google yetkilendirmelerinizi kontrol edin.", ipAddress, userAgent, LocalDateTime.now());
            sendAuditEmail(userEmail, subject, content, EmailType.SYSTEM);
        } catch (Exception e) {
            log.error("Failed to save audit log for Google OAuth login: {}", e.getMessage());
        }
    }

    @Async("taskExecutor")
    @Transactional
    public void logLogout(String userEmail, Long userId, String ipAddress, String userAgent) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userEmail(userEmail)
                    .userId(userId)
                    .eventType(AuditLog.AuditEventType.LOGOUT)
                    .eventStatus(AuditLog.AuditEventStatus.SUCCESS)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details("User logged out successfully")
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved for logout: {}", userEmail);

            // Send Security Audit Email
            String subject = "Güvenlik Bildirimi: Başarılı Çıkış Yapıldı";
            String content = String.format("Hesabınızdan güvenli bir şekilde çıkış yapıldı.\n\nDetaylar:\nIP Adresi: %s\nTarayıcı (User-Agent): %s\nZaman: %s", ipAddress, userAgent, LocalDateTime.now());
            sendAuditEmail(userEmail, subject, content, EmailType.SYSTEM);
        } catch (Exception e) {
            log.error("Failed to save audit log for logout: {}", e.getMessage());
        }
    }

    @Async("taskExecutor")
    @Transactional
    public void logPasswordChange(String userEmail, Long userId, String ipAddress, String userAgent, boolean success, String errorMessage) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userEmail(userEmail)
                    .userId(userId)
                    .eventType(success ? AuditLog.AuditEventType.PASSWORD_CHANGE_SUCCESS : AuditLog.AuditEventType.PASSWORD_CHANGE_FAILURE)
                    .eventStatus(success ? AuditLog.AuditEventStatus.SUCCESS : AuditLog.AuditEventStatus.FAILURE)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details(success ? "Password change successful" : "Password change failed")
                    .errorMessage(errorMessage)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved for password change: {} - {}", userEmail, success ? "SUCCESS" : "FAILURE");

            // Send Security Audit Email
            String subject = success ? "Güvenlik Uyarısı: Şifreniz Değiştirildi" : "Güvenlik Uyarısı: Başarısız Şifre Değiştirme Denemesi";
            String content = success
                    ? String.format("Hesabınızın şifresi başarıyla değiştirildi.\n\nDetaylar:\nIP Adresi: %s\nTarayıcı (User-Agent): %s\nZaman: %s\n\nEğer bu işlemi siz yapmadıysanız lütfen hemen şifrenizi sıfırlayın veya destek ekibimizle iletişime geçin.", ipAddress, userAgent, LocalDateTime.now())
                    : String.format("Hesabınızın şifresini değiştirmek için başarısız bir deneme gerçekleştirildi.\n\nDetaylar:\nIP Adresi: %s\nTarayıcı (User-Agent): %s\nHata: %s\nZaman: %s", ipAddress, userAgent, errorMessage != null ? errorMessage : "Hatalı mevcut şifre", LocalDateTime.now());
            sendAuditEmail(userEmail, subject, content, EmailType.PASSWORD_RESET);
        } catch (Exception e) {
            log.error("Failed to save audit log for password change: {}", e.getMessage());
        }
    }

    public String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    public String getClientUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 1000)) : "Unknown";
    }

        public Long countFailedLoginAttemptsByUser(String userEmail, LocalDateTime since) {
        return auditLogRepository.countFailedAttemptsByUserAndTypeSince(userEmail, AuditLog.AuditEventType.LOGIN_FAILURE, since);
    }

    public Long countFailedLoginAttemptsByIp(String ipAddress, LocalDateTime since) {
        return auditLogRepository.countFailedAttemptsByIpAndTypeSince(ipAddress, AuditLog.AuditEventType.LOGIN_FAILURE, since);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getUserAuditLogs(String userEmail, Pageable pageable) {
        return auditLogRepository.findByUserEmailOrderByCreatedAtDesc(userEmail, pageable)
                .map(auditLogMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getUserAuditLogs(Long userId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(auditLogMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogsByEventType(AuditLog.AuditEventType eventType, Pageable pageable) {
        return auditLogRepository.findByEventTypeOrderByCreatedAtDesc(eventType, pageable)
                .map(auditLogMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findByDateRange(startDate, endDate, pageable)
                .map(auditLogMapper::toDto);
    }
}
