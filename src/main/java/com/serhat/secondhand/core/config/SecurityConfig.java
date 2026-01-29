package com.serhat.secondhand.core.config;

import com.serhat.secondhand.core.jwt.AuthenticationFilter;
import com.serhat.secondhand.core.security.RateLimitingFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
@Configuration
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final AuthenticationFilter authenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    // Public API endpoint groups
    private static final List<String> AUTH_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/oauth2/google",
            "/api/auth/oauth2/complete",
            "/oauth2/**",
            "/login/oauth2/**",
            "/api/auth/password/forgot",
            "/api/auth/password/reset"
    );

    private static final List<String> LISTING_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/v1/listings/status/{status}",
            "/api/v1/listings/{id}",
            "/api/v1/listings/allListings",
            "/api/v1/listings/filter",
            "/api/v1/listings/search/listing-no/{listingNo}",
            "/api/v1/listings/byUser/{id}",
            "/api/v1/listings/type/{listingType}",
            "/api/v1/listings/type/{listingType}/active",
            "/api/v1/listings/type/{listingType}/ordered",
            "/api/v1/listings/{id}/view"
    );

    private static final List<String> CATEGORY_LISTING_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/v1/books/{id}",
            "/api/v1/books/filter",
            "/api/v1/realEstates/{id}",
            "/api/v1/realEstates/filter",
            "/api/v1/vehicles/{id}",
            "/api/v1/vehicles/filter",
            "/api/v1/clothing/{id}",
            "/api/v1/clothing/filter",
            "/api/v1/electronics/{id}",
            "/api/v1/electronics/filter",
            "/api/v1/sports/{id}",
            "/api/v1/sports/filter"
    );

    private static final List<String> SHOWCASE_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/showcases/active",
            "/api/showcases/pricing-config"
    );

    private static final List<String> AGREEMENT_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/agreements/**"
    );

    private static final List<String> PAYMENT_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/v1/payments/listing-fee-config"
    );

    private static final List<String> AI_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/ai-test/**"
    );

    private static final List<String> ENUM_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/v1/enums/**"
    );

    private static final List<String> DOCUMENTATION_ENDPOINTS = Arrays.asList(
            "/swagger-ui/**",
            "/api-docs/**",
            "/swagger-ui.html",
            "/v3/api-docs/**"
    );

    private static final List<String> IMAGE_ENDPOINTS = Arrays.asList(
            "/api/images/upload"
    );

    private static final List<String> WEBSOCKET_ENDPOINTS = Arrays.asList(
            "/ws/**"
    );

    private static final List<String> FOLLOW_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/follow/stats/*",
            "/api/follow/user/*/followers",
            "/api/follow/user/*/following"
    );

    private static final List<String> RATE_LIMIT_TEST_ENDPOINTS = Arrays.asList(
            "/api/test/rate-limit/**"
    );

    private static final List<String> FAVORITE_LIST_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/favorite-lists/user/*",
            "/api/favorite-lists/popular"
    );

    private static final List<String> FAVORITE_PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/favorites/top",
            "/api/favorites/top-listings"
    );

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/ws/**")
                        .disable()
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // Authentication & Authorization endpoints
                        .requestMatchers(AUTH_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()

                        .requestMatchers(AI_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()

                        .requestMatchers(LISTING_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()
                        
                        // Public category-specific listing endpoints
                        .requestMatchers(CATEGORY_LISTING_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()
                        
                        // Public showcase endpoints
                        .requestMatchers(SHOWCASE_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()
                        
                        // Public agreement endpoints
                        .requestMatchers(AGREEMENT_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()
                        
                        // Public payment configuration endpoints
                        .requestMatchers(PAYMENT_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()
                        
                        // Public enum endpoints
                        .requestMatchers(ENUM_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()
                        
                        // Documentation endpoints
                        .requestMatchers(DOCUMENTATION_ENDPOINTS.toArray(new String[0])).permitAll()
                        
                        // Image endpoints
                        .requestMatchers(IMAGE_ENDPOINTS.toArray(new String[0])).authenticated()
                        
                        // WebSocket endpoints
                        .requestMatchers(WEBSOCKET_ENDPOINTS.toArray(new String[0])).permitAll()
                        .requestMatchers("/api/v1/listings/clothing/generator/**").permitAll()
                        .requestMatchers("/api/v1/listings/electronics/generator/**").permitAll()
                        .requestMatchers("/api/v1/listings/sports/generator/**").permitAll()
                        .requestMatchers("/api/v1/listings/books/generator/**").permitAll()
                        
                        // Follow public endpoints (stats can be viewed by anyone)
                        .requestMatchers(FOLLOW_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()
                        
                        // Rate limit test endpoints (for testing rate limiting)
                        .requestMatchers(RATE_LIMIT_TEST_ENDPOINTS.toArray(new String[0])).permitAll()
                        
                        // Favorite list public endpoints
                        .requestMatchers(FAVORITE_LIST_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()
                        
                        // Favorite public endpoints (top favorites can be viewed by anyone)
                        .requestMatchers(FAVORITE_PUBLIC_ENDPOINTS.toArray(new String[0])).permitAll()

                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/oauth2/authorization/google")
                        .redirectionEndpoint(redirection -> redirection
                                .baseUri("/login/oauth2/code/*")
                        )
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(customAuthenticationEntryPoint())
                        .accessDeniedHandler(customAccessDeniedHandler())
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(rateLimitingFilter, SecurityContextHolderFilter.class)
                .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            String requestURI = request.getRequestURI();
            String acceptHeader = request.getHeader("Accept");
            String userAgent = request.getHeader("User-Agent");

            log.warn("Authentication failed for URI: {}, Accept: {}", requestURI, acceptHeader);

            if (requestURI.startsWith("/api/") ||
                    (acceptHeader != null && acceptHeader.contains("application/json")) ||
                    (userAgent != null && userAgent.toLowerCase().contains("axios"))) {

                response.setContentType("application/json;charset=UTF-8");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

                response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
                response.setHeader("Access-Control-Allow-Credentials", "true");
                response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, Origin, X-Requested-With, Cache-Control, X-File-Name, Idempotency-Key");

                String jsonResponse = String.format(
                        "{\"error\":\"UNAUTHORIZED\",\"message\":\"Token expired or invalid\",\"timestamp\":\"%s\",\"path\":\"%s\"}",
                        Instant.now().toString(),
                        requestURI
                );

                response.getWriter().write(jsonResponse);
                log.info("Sent JSON unauthorized response for API endpoint: {}", requestURI);
                return;
            }

            log.info("Redirecting to OAuth2 for browser request: {}", requestURI);
            response.sendRedirect("/oauth2/authorization/google");
        };
    }

    @Bean
    public AccessDeniedHandler customAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            String requestURI = request.getRequestURI();
            String acceptHeader = request.getHeader("Accept");

            log.warn("Access denied for URI: {}", requestURI);

            if (requestURI.startsWith("/api/") ||
                    (acceptHeader != null && acceptHeader.contains("application/json"))) {

                response.setContentType("application/json;charset=UTF-8");
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);

                // CORS headers
                response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
                response.setHeader("Access-Control-Allow-Credentials", "true");

                String jsonResponse = String.format(
                        "{\"error\":\"FORBIDDEN\",\"message\":\"Access denied\",\"timestamp\":\"%s\",\"path\":\"%s\"}",
                        Instant.now().toString(),
                        requestURI
                );

                response.getWriter().write(jsonResponse);
                return;
            }

            response.sendRedirect("/login");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://localhost:5173",  // Vite default port
                "http://127.0.0.1:5173"
        ));

        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Cache-Control",
                "X-File-Name",
                "Idempotency-Key"
        ));

        // Allow credentials (important for JWT tokens)
        configuration.setAllowCredentials(true);

        // Exposed headers
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "X-Total-Count",
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining", 
                "X-RateLimit-Reset",
                "Retry-After",
                "Idempotency-Key"
        ));

        // Max age for preflight requests
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setPasswordEncoder(passwordEncoder());
        authProvider.setUserDetailsService(userDetailsService);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}