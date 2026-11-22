package com.serhat.secondhand.core.audit.service;

import com.serhat.secondhand.core.audit.dto.AuditLogDto;
import com.serhat.secondhand.core.audit.entity.AuditLog;
import com.serhat.secondhand.core.audit.mapper.AuditLogMapper;
import com.serhat.secondhand.core.audit.repository.AuditLogRepository;
import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.impl.SystemAuditEmailEvent;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
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
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import com.serhat.secondhand.core.security.ClientIpResolver;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private static final DateTimeFormatter TURKISH_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm", Locale.forLanguageTag("tr"));

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;
    private final UserRepository userRepository;
    private final EmailEventPublisher emailEventPublisher;
    private final ClientIpResolver clientIpResolver;

    private void sendAuditEmail(String userEmail, String subject, String content, EmailType emailType) {
        if (userEmail == null || userEmail.isBlank()) return;
        userRepository.findByEmail(userEmail).ifPresent(user -> {
            try {
                var data = GenericEmailData.builder()
                        .userName(user.getName())
                        .headerTitle(subject)
                        .message(content)
                        .build();
                emailEventPublisher.publish(new SystemAuditEmailEvent(user, subject, data));
                log.info("Security audit email event published successfully to {} for subject: {}", userEmail, subject);
            } catch (Exception e) {
                log.error("Failed to publish security audit email to {}: {}", userEmail, e.getMessage());
            }
        });
    }

    private void appendDetailRow(StringBuilder sb, String label, String value) {
        sb.append("<tr><td class='label'>").append(label).append("</td><td class='value'>")
                .append(org.springframework.web.util.HtmlUtils.htmlEscape(value == null ? "" : value, "UTF-8"))
                .append("</td></tr>");
    }

    private String formatIpAddress(String ip) {
        if (ip == null || ip.isBlank()) return "Bilinmiyor";
        if ("0:0:0:0:0:0:0:1".equals(ip) || "127.0.0.1".equals(ip)) {
            return "127.0.0.1 (Yerel Sunucu)";
        }
        return ip;
    }

    private String formatTimestamp(LocalDateTime dateTime) {
        if (dateTime == null) dateTime = LocalDateTime.now();
        return dateTime.format(TURKISH_DATE_FORMATTER);
    }

    private String simplifyUserAgent(String userAgent) {
        if (userAgent == null || userAgent.isBlank() || "Unknown".equalsIgnoreCase(userAgent)) {
            return "Bilinmeyen Cihaz / Tarayıcı";
        }
        String os = "Bilinmeyen İşletim Sistemi";
        if (userAgent.contains("Macintosh") || userAgent.contains("Mac OS X")) os = "macOS";
        else if (userAgent.contains("Windows")) os = "Windows";
        else if (userAgent.contains("iPhone") || userAgent.contains("iPad")) os = "iOS";
        else if (userAgent.contains("Android")) os = "Android";
        else if (userAgent.contains("Linux")) os = "Linux";

        String browser = "Tarayıcı";
        if (userAgent.contains("Chrome") && !userAgent.contains("Edg") && !userAgent.contains("OPR")) browser = "Google Chrome";
        else if (userAgent.contains("Safari") && !userAgent.contains("Chrome")) browser = "Safari";
        else if (userAgent.contains("Firefox")) browser = "Firefox";
        else if (userAgent.contains("Edg")) browser = "Microsoft Edge";
        else if (userAgent.contains("OPR") || userAgent.contains("Opera")) browser = "Opera";

        return browser + " (" + os + ")";
    }

    private String buildAuditEmailHtml(String description, String eventTypeTitle, String ipAddress, String userAgent, LocalDateTime timestamp, String warningMessage, boolean isWarning) {
        String formattedIp = formatIpAddress(ipAddress);
        String formattedTime = formatTimestamp(timestamp);
        String formattedAgent = simplifyUserAgent(userAgent);

        StringBuilder sb = new StringBuilder();
        sb.append("<p>").append(description).append("</p>");
        sb.append("<table class='details' role='presentation'>");
        appendDetailRow(sb, "İşlem", eventTypeTitle);
        appendDetailRow(sb, "IP Adresi", formattedIp);
        appendDetailRow(sb, "Cihaz / Tarayıcı", formattedAgent);
        appendDetailRow(sb, "Tarih ve Saat", formattedTime);
        sb.append("</table>");

        if (warningMessage != null && !warningMessage.isBlank()) {
            sb.append("<div class='note").append(isWarning ? " note-warning" : "").append("'>")
                    .append("<div class='note-title'>Güvenlik Notu</div>")
                    .append(warningMessage)
                    .append("</div>");
        }

        return sb.toString();
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

            // Successful logins are visible on the security page only; a failed attempt still alerts the owner.
            if (!success) {
                String content = buildAuditEmailHtml(
                        "Hesabınıza yönelik başarısız bir giriş denemesi tespit edildi.",
                        "Başarısız Giriş Denemesi",
                        ipAddress,
                        userAgent,
                        LocalDateTime.now(),
                        "Eğer bu denemeyi siz yapmadıysanız hesabınız güvendedir, ancak şüpheli durumlara karşı şifrenizi güncelleyebilirsiniz.",
                        true
                );
                sendAuditEmail(userEmail, "Güvenlik Uyarısı: Başarısız Giriş Denemesi", content, EmailType.SYSTEM);
            }
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
            String description = success 
                    ? "Hesabınızın şifresi başarıyla değiştirildi."
                    : "Hesabınızın şifresini değiştirmek için başarısız bir deneme yapıldı.";
            String warningMsg = success 
                    ? "Eğer bu şifre değişikliğini siz yapmadıysanız lütfen hemen şifrenizi sıfırlayın veya destek ekibimizle iletişime geçin."
                    : null;

            String content = buildAuditEmailHtml(
                    description, 
                    success ? "Şifre Değişikliği" : "Başarısız Şifre Değiştirme", 
                    ipAddress, 
                    userAgent, 
                    LocalDateTime.now(), 
                    warningMsg, 
                    !success
            );
            sendAuditEmail(userEmail, subject, content, EmailType.PASSWORD_RESET);
        } catch (Exception e) {
            log.error("Failed to save audit log for password change: {}", e.getMessage());
        }
    }

    public String getClientIpAddress(HttpServletRequest request) {
        return clientIpResolver.resolve(request);
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
