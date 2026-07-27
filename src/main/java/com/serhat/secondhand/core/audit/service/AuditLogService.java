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

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private static final DateTimeFormatter TURKISH_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm", Locale.forLanguageTag("tr"));

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;
    private final UserRepository userRepository;
    private final EmailEventPublisher emailEventPublisher;

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

        String statusBadgeColor = isWarning ? "#dc2626" : "#16a34a";
        String statusBgColor = isWarning ? "#fef2f2" : "#f0fdf4";
        String warningBoxBg = isWarning ? "#fffbe6" : "#f0fdf4";
        String warningBoxBorder = isWarning ? "#ffe58f" : "#bbf7d0";
        String warningBoxTextColor = isWarning ? "#8c6b00" : "#166534";

        StringBuilder sb = new StringBuilder();
        sb.append("<p style='font-size: 15px; color: #334155; margin-bottom: 20px; line-height: 1.6;'>").append(description).append("</p>");

        // Detail Box Card
        sb.append("<div style='background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;'>");
        sb.append("<h3 style='margin: 0 0 16px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b;'>Erişim Detayları</h3>");

        sb.append("<table style='width: 100%; border-collapse: collapse; font-size: 14px;'>");

        // Event Type row
        sb.append("<tr>");
        sb.append("<td style='padding: 8px 0; color: #64748b; font-weight: 500; width: 130px;'>İşlem Türü:</td>");
        sb.append("<td style='padding: 8px 0; font-weight: 600; color: #0f172a;'><span style='display: inline-block; padding: 3px 10px; background-color: ").append(statusBgColor).append("; color: ").append(statusBadgeColor).append("; border-radius: 6px; font-size: 12px; font-weight: 700;'>").append(eventTypeTitle).append("</span></td>");
        sb.append("</tr>");

        // IP Row
        sb.append("<tr>");
        sb.append("<td style='padding: 8px 0; color: #64748b; font-weight: 500;'>IP Adresi:</td>");
        sb.append("<td style='padding: 8px 0; font-weight: 600; color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;'>").append(formattedIp).append("</td>");
        sb.append("</tr>");

        // Device Row
        sb.append("<tr>");
        sb.append("<td style='padding: 8px 0; color: #64748b; font-weight: 500;'>Cihaz / Tarayıcı:</td>");
        sb.append("<td style='padding: 8px 0; font-weight: 600; color: #0f172a;'>").append(formattedAgent).append("</td>");
        sb.append("</tr>");

        // Time Row
        sb.append("<tr>");
        sb.append("<td style='padding: 8px 0; color: #64748b; font-weight: 500;'>Tarih ve Saat:</td>");
        sb.append("<td style='padding: 8px 0; font-weight: 600; color: #0f172a;'>").append(formattedTime).append("</td>");
        sb.append("</tr>");

        sb.append("</table>");
        sb.append("</div>");

        // Warning callout box if present
        if (warningMessage != null && !warningMessage.isBlank()) {
            sb.append("<div style='background-color: ").append(warningBoxBg).append("; border: 1px solid ").append(warningBoxBorder).append("; border-radius: 10px; padding: 16px; margin-bottom: 20px; color: ").append(warningBoxTextColor).append("; font-size: 14px; line-height: 1.5;'>");
            sb.append("<strong>🛡️ Güvenlik Tavsiyesi:</strong> ").append(warningMessage);
            sb.append("</div>");
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

            // Send Security Audit Email
            String subject = success ? "Güvenlik Uyarısı: Başarılı Giriş Yapıldı" : "Güvenlik Uyarısı: Başarısız Giriş Denemesi";
            String description = success 
                    ? "Hesabınıza yeni bir başarılı oturum açma işlemi gerçekleştirildi."
                    : "Hesabınıza yönelik başarısız bir giriş denemesi tespit edildi.";
            String warningMsg = success
                    ? "Eğer bu giriş işlemini siz yapmadıysanız, lütfen hesabınızı korumak için hemen şifrenizi sıfırlayın."
                    : "Eğer bu denemeyi siz yapmadıysanız hesabınız güvendedir, ancak şüpheli durumlara karşı şifrenizi güncelleyebilirsiniz.";

            String content = buildAuditEmailHtml(
                    description, 
                    success ? "Başarılı Giriş" : "Başarısız Giriş Denemesi", 
                    ipAddress, 
                    userAgent, 
                    LocalDateTime.now(), 
                    warningMsg, 
                    !success
            );
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
            String description = "Hesabınıza Google hesabınız kullanılarak başarılı bir giriş yapıldı.";
            String warningMsg = "Eğer bu işlemi siz gerçekleştirmediyseniz lütfen Google yetkilendirmelerinizi ve hesap güvenlik ayarlarınızı kontrol edin.";

            String content = buildAuditEmailHtml(
                    description, 
                    "Google OAuth Girişi", 
                    ipAddress, 
                    userAgent, 
                    LocalDateTime.now(), 
                    warningMsg, 
                    false
            );
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
            String description = "Hesabınızdan güvenli bir şekilde çıkış yapıldı.";

            String content = buildAuditEmailHtml(
                    description, 
                    "Güvenli Çıkış", 
                    ipAddress, 
                    userAgent, 
                    LocalDateTime.now(), 
                    null, 
                    false
            );
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
