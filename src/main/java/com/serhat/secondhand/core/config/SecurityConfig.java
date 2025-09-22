package com.serhat.secondhand.core.config;

import com.serhat.secondhand.core.jwt.AuthenticationFilter;
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
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import java.util.Arrays;

@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
@Configuration
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final AuthenticationFilter authenticationFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

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
                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/oauth2/google",
                                "/api/auth/oauth2/complete",
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/api/auth/password/forgot",
                                "/api/auth/password/reset",
                                "/swagger-ui/**",
                                "/api/v1/enums/genders",
                                "/api-docs/**",
                                "/api/v1/listings/status/{status}",
                                "/api/v1/listings/{id}",
                                "/api/v1/listings/allListings",
                                "/api/agreements/**",
                                "/swagger-ui.html",
                                "/api/v1/payments/listing-fee-config",
                                "/v3/api-docs/**",
                                "/ws/**"
                        ).permitAll()

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
                response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept");

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
                "X-File-Name"
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
                "Retry-After"
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