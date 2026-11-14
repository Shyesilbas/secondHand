package com.serhat.secondhand.email;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ModerationEmailTemplatesTest {

    private static final TemplateEngine ENGINE = engine();

    private static TemplateEngine engine() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(resolver);
        return engine;
    }

    private static String render(String template, Map<String, Object> vars) {
        Context context = new Context();
        context.setVariables(vars);
        return ENGINE.process("emails/moderation/" + template, context);
    }

    private static Map<String, Object> fullVariables() {
        Map<String, Object> vars = new HashMap<>();
        vars.put("userName", "Ayse");
        vars.put("complaintId", "c-123");
        vars.put("targetLabel", "Bisiklet");
        vars.put("reason", "SPAM");
        vars.put("eligibleAt", "13.11.2026 16:00");
        vars.put("resolvedAt", "13.11.2026 17:00");
        vars.put("adminNotes", "Aura note");
        vars.put("violationLabel", "Taciz / hakaret");
        vars.put("listingTitle", "Bisiklet");
        vars.put("bannedUntil", "20.11.2026 18:30");
        vars.put("warningCount", 2);
        vars.put("warningThreshold", 3);
        vars.put("appealDeadline", "20.11.2026 18:30");
        vars.put("approved", true);
        vars.put("penaltyReversed", true);
        vars.put("explanation", "Aura appeal note");
        return vars;
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "complaint-submitted.html", "complaint-resolved.html", "complaint-dismissed.html",
            "user-warning.html", "listing-suspended.html", "temp-ban.html", "perm-ban.html", "appeal-outcome.html"
    })
    void everyTemplateRendersWithComplaintId(String template) {
        assertThat(render(template, fullVariables())).contains("c-123");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "complaint-submitted.html", "complaint-resolved.html", "complaint-dismissed.html",
            "user-warning.html", "listing-suspended.html", "temp-ban.html", "perm-ban.html", "appeal-outcome.html"
    })
    void everyTemplateRendersWithOnlyRequiredVariables(String template) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("userName", "Ayse");
        vars.put("complaintId", "c-123");
        vars.put("approved", false);
        vars.put("penaltyReversed", false);
        assertThat(render(template, vars)).contains("c-123").doesNotContain("Aura Güvenlik Raporu");
    }

    @Test
    void auraNotesAreHtmlEscaped() {
        Map<String, Object> vars = fullVariables();
        vars.put("adminNotes", "<script>alert(1)</script>");
        String html = render("complaint-resolved.html", vars);
        assertThat(html).doesNotContain("<script>").contains("&lt;script&gt;");
    }

    @Test
    void tempBanShowsRestrictionEnd() {
        assertThat(render("temp-ban.html", fullVariables())).contains("20.11.2026 18:30");
    }
}
