package com.serhat.secondhand.email;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Renders every email template through the shared layout. Guards the two things a template can get
 * wrong on its own: rows that print with nothing in them, and links to pages that do not exist.
 */
class EmailTemplatesRenderTest {

    /** Frontend routes an email may link to (see secondhand-frontend/src/common/constants/routes.js). */
    private static final List<String> KNOWN_ROUTES = List.of(
            "/listings", "/security", "/agreements", "/profile", "/profile/orders", "/profile/i-sold",
            "/offers", "/complaints", "/my-listings", "/my-showcases", "/payments", "/payment-methods");

    private static final Pattern HREF = Pattern.compile("href=\"([^\"]*)\"");
    private static final Pattern EMPTY_VALUE_CELL = Pattern.compile("<td class=\"value\">\\s*</td>");

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

    static Stream<String> templates() throws IOException, URISyntaxException {
        Path root = Path.of(EmailTemplatesRenderTest.class.getResource("/templates/emails").toURI());
        try (Stream<Path> files = Files.walk(root)) {
            return files.filter(p -> p.toString().endsWith(".html"))
                    .filter(p -> !p.getParent().equals(root))
                    .map(p -> root.relativize(p).toString().replace('\\', '/'))
                    .sorted()
                    .toList()
                    .stream();
        }
    }

    private static String render(String template, Map<String, Object> vars) {
        Context context = new Context();
        context.setVariables(vars);
        return ENGINE.process("emails/" + template, context);
    }

    private static Map<String, Object> minimalVariables() {
        Map<String, Object> vars = new HashMap<>();
        vars.put("userName", "Ayse");
        vars.put("complaintId", "c-123");
        vars.put("approved", false);
        vars.put("penaltyReversed", false);
        vars.put("quantity", 1);
        return vars;
    }

    private static Map<String, Object> fullVariables() {
        Map<String, Object> vars = minimalVariables();
        vars.put("headerTitle", "Baslik");
        vars.put("message", "Mesaj metni");
        vars.put("actionUrl", "/listings/42");
        vars.put("actionText", "Git");
        vars.put("listingUrl", "/listings/42");
        vars.put("amount", "1.000,00");
        vars.put("amountLabel", "Yuklenen Tutar");
        vars.put("currency", "TRY");
        vars.put("typeLabel", "Tur");
        vars.put("listingTitle", "Bisiklet");
        vars.put("paymentMethod", "E-Cuzdan");
        vars.put("transactionDate", "15.11.2026 14:22");
        vars.put("transactionNumber", "A1B2C3D4");
        vars.put("verificationCode", "123456");
        vars.put("codeHint", "Kod 15 dakika gecerlidir.");
        vars.put("totalPrice", "900,00 TRY");
        vars.put("unitPrice", "450,00 TRY");
        vars.put("quantity", 2);
        vars.put("expiresAt", "16.11.2026 14:00");
        vars.put("nextStep", "Odemeyi tamamlayin.");
        vars.put("totalAmount", "900,00 TRY");
        vars.put("orderNumber", "#ORD-1");
        vars.put("orderDate", "15.11.2026 14:22");
        vars.put("deliveryMethod", "SAFE_MEETUP");
        vars.put("meetupLocation", "Kadikoy");
        vars.put("meetupVerificationCode", "654321");
        vars.put("notes", "Not");
        vars.put("items", List.of(Map.of(
                "listing", Map.of("title", "Bisiklet"), "quantity", 2, "totalPrice", 900, "currency", "TRY")));
        vars.put("listingPrice", "900,00 TRY");
        vars.put("listingCity", "Istanbul");
        vars.put("date", "15.11.2026 14:22");
        vars.put("expiryDate", "15.12.2026 14:22");
        vars.put("paymentId", "A1B2C3D4");
        vars.put("benefits", List.of("Gunluk 8 Aura AI mesaji"));
        vars.put("adminNotes", "Aura note");
        vars.put("violationLabel", "Taciz");
        vars.put("appealDeadline", "20.11.2026 18:30");
        return vars;
    }

    private static void assertLinksPointToKnownRoutes(String html) {
        Matcher matcher = HREF.matcher(html);
        while (matcher.find()) {
            String href = matcher.group(1);
            assertThat(KNOWN_ROUTES.stream().anyMatch(route -> href.equals(route) || href.startsWith(route + "/")))
                    .as("link target %s", href)
                    .isTrue();
        }
    }

    @ParameterizedTest
    @MethodSource("templates")
    void rendersInsideSharedLayoutWithOnlyRequiredVariables(String template) {
        String html = render(template, minimalVariables());

        assertThat(html).contains("class=\"container\"").contains("class=\"footer\"");
        assertThat(EMPTY_VALUE_CELL.matcher(html).find()).as("empty detail row").isFalse();
        assertThat(html).doesNotContain("href=\"\"");
        assertLinksPointToKnownRoutes(html);
    }

    @ParameterizedTest
    @MethodSource("templates")
    void rendersWithEveryVariableSet(String template) {
        String html = render(template, fullVariables());

        assertThat(html).contains("class=\"container\"");
        assertThat(EMPTY_VALUE_CELL.matcher(html).find()).as("empty detail row").isFalse();
        assertLinksPointToKnownRoutes(html);
    }

    @Test
    void receiptOmitsRowsThatHaveNoValue() {
        Map<String, Object> vars = minimalVariables();
        vars.put("amount", "1.000.000,00");
        vars.put("amountLabel", "Yuklenen Tutar");
        vars.put("typeLabel", "Cuzdana Para Yukleme");
        vars.put("transactionNumber", "");

        String html = render("payments/receipt.html", vars);

        assertThat(html).contains("Yuklenen Tutar").contains("1.000.000,00 TRY");
        assertThat(html).doesNotContain("İlan").doesNotContain("İşlem Referansı").doesNotContain("Ödeme Yöntemi");
    }

    @Test
    void verificationCodeIsRenderedOnce() {
        Map<String, Object> vars = minimalVariables();
        vars.put("verificationCode", "123456");

        String html = render("notifications/verification-code.html", vars);

        assertThat(html.split("123456", -1)).hasSize(2);
    }
}
