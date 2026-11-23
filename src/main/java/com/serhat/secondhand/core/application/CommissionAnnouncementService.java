package com.serhat.secondhand.core.application;

import com.serhat.secondhand.core.config.PlatformFeeConfig;
import com.serhat.secondhand.email.application.EmailLinks;
import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.impl.PlatformAnnouncementEmailEvent;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import com.serhat.secondhand.user.application.SystemAccountService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

/**
 * One-time announcement of the commission and fee rules to every active user. Re-running it is safe:
 * a user who already has the announcement mail (same type and subject) is skipped.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommissionAnnouncementService {

    private static final int BATCH_SIZE = 150;

    private final EmailEventPublisher emailEventPublisher;
    private final EmailConfig emailConfig;
    private final EmailRepository emailRepository;
    private final UserRepository userRepository;
    private final SystemAccountService systemAccountService;
    private final PlatformFeeConfig platformFeeConfig;
    private final FeeScheduleService feeScheduleService;

    /** Returns how many mails were queued. */
    public int announceToAllUsers() {
        String subject = emailConfig.getSubject("email.subject.commission-announcement");
        String message = buildMessage();
        int queued = 0;
        Pageable pageable = PageRequest.of(0, BATCH_SIZE);
        Page<User> batch;
        do {
            batch = userRepository.findAll(pageable);
            List<Long> userIds = batch.getContent().stream().map(User::getId).toList();
            Set<Long> alreadySent = userIds.isEmpty() ? Set.of()
                    : emailRepository.findUserIdsBySubjectAndEmailType(userIds, EmailType.PLATFORM_ANNOUNCEMENT, subject);
            for (User user : batch.getContent()) {
                if (user.getAccountStatus() != AccountStatus.ACTIVE
                        || systemAccountService.isSystemAccount(user)
                        || alreadySent.contains(user.getId())) {
                    continue;
                }
                var data = GenericEmailData.builder()
                        .userName(user.getName())
                        .headerTitle("Komisyon ve Ücret Düzenlemesi")
                        .message(message)
                        .actionText("Komisyon ve Ücretler")
                        .actionUrl(EmailLinks.FEES)
                        .build();
                emailEventPublisher.publish(new PlatformAnnouncementEmailEvent(user, subject, data));
                queued++;
            }
            pageable = batch.nextPageable();
        } while (batch.hasNext());
        log.info("Commission announcement queued for {} users", queued);
        return queued;
    }

    private String buildMessage() {
        var schedule = feeScheduleService.getFeeSchedule();
        String date = platformFeeConfig.getCommission().getEffectiveFrom()
                .format(DateTimeFormatter.ofPattern("dd.MM.yyyy"));
        StringBuilder bands = new StringBuilder();
        for (var band : schedule.commission().bands()) {
            String range = band.maxAmount() == null
                    ? money(band.minAmount()) + " TL ve üzeri"
                    : money(band.minAmount()) + " - " + money(band.maxAmount().subtract(new BigDecimal("0.01"))) + " TL";
            bands.append("<li>").append(range).append(": %").append(band.ratePercent().stripTrailingZeros().toPlainString())
                    .append("</li>");
        }
        return "<p>%s tarihinden itibaren satışlarda yeni bir ücret modeli uygulanacak.</p>".formatted(date)
                + "<p><strong>Satış komisyonu</strong> (araç ve emlak dışındaki ilanlar, satıştan tahsil edilir; "
                + "ilan oluşturma ücreti alınmaz):</p><ul>" + bands + "</ul>"
                + "<p><strong>Araç ve emlak ilanları</strong> için ilan oluşturma ücreti aynen devam eder "
                + "(" + money(schedule.listingFee().totalFee()) + " TL, vergi dahil); bu ilanlardan satış komisyonu alınmaz.</p>"
                + "<p><strong>Kargo ücreti:</strong> kargo ile teslim edilen siparişlerde alıcıdan sipariş başına "
                + money(schedule.shippingFee()) + " TL sabit kargo ücreti alınır; elden teslimde alınmaz."
                + freeShippingNote(schedule) + "</p>"
                + "<p>Vitrin fiyatları değişmedi. Ayrıntılar için aşağıdaki sayfaya bakabilirsiniz.</p>";
    }

    /** Free shipping above the threshold: the buyer pays nothing and the seller carries the fee. */
    private String freeShippingNote(com.serhat.secondhand.core.dto.FeeScheduleDto schedule) {
        if (schedule.freeShippingThreshold() == null) {
            return "";
        }
        return " Bir satıcıdan yapılan alışverişin ürün tutarı (kupon sonrası) " + money(schedule.freeShippingThreshold())
                + " TL ve üzerindeyse kargo alıcı için ücretsizdir; bu durumda kargo ücreti satıcının payından düşülür.";
    }

    private static String money(BigDecimal value) {
        return value.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString().replace('.', ',');
    }
}
