package com.serhat.secondhand.core.security;

import com.serhat.secondhand.core.config.RateLimitConfig;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Client IP for rate limiting, login throttling and audit logs.
 * <p>
 * Proxy headers are read only when {@code trust-forwarded-headers} is on <b>and</b> the direct peer is one
 * of {@code trusted-proxies}. X-Forwarded-For is then read right to left and the first address that is not
 * a trusted proxy is the client: entries left of it were written by the client and can be anything.
 */
@Component
@RequiredArgsConstructor
public class ClientIpResolver {

    // IP literals only, so address parsing never triggers a DNS lookup for a header value.
    private static final Pattern IPV4 = Pattern.compile("^\\d{1,3}(\\.\\d{1,3}){3}$");
    private static final Pattern IPV6 = Pattern.compile("^[0-9a-fA-F:.]+$");

    private final RateLimitConfig rateLimitConfig;
    private List<IpAddressMatcher> trustedProxies = List.of();

    @PostConstruct
    void init() {
        trustedProxies = rateLimitConfig.getTrustedProxies().stream()
                .map(String::trim)
                .filter(cidr -> !cidr.isEmpty())
                .map(IpAddressMatcher::new)
                .toList();
    }

    public String resolve(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();
        if (!rateLimitConfig.isTrustForwardedHeaders() || !isTrustedProxy(remoteAddr)) {
            return remoteAddr;
        }

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            String[] hops = xForwardedFor.split(",");
            for (int i = hops.length - 1; i >= 0; i--) {
                String hop = hops[i].trim();
                if (!isIpLiteral(hop)) {
                    // A malformed hop means the chain cannot be trusted past this point.
                    return remoteAddr;
                }
                if (!isTrustedProxy(hop)) {
                    return hop;
                }
            }
            return remoteAddr;
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && isIpLiteral(xRealIp.trim())) {
            return xRealIp.trim();
        }
        return remoteAddr;
    }

    private boolean isTrustedProxy(String address) {
        if (!isIpLiteral(address)) {
            return false;
        }
        for (IpAddressMatcher matcher : trustedProxies) {
            if (matcher.matches(address)) {
                return true;
            }
        }
        return false;
    }

    private static boolean isIpLiteral(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        if (IPV4.matcher(value).matches()) {
            return true;
        }
        return value.indexOf(':') >= 0 && IPV6.matcher(value).matches();
    }
}
