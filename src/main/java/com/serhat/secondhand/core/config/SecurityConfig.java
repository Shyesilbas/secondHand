package com.serhat.secondhand.core.config;

import com.serhat.secondhand.core.jwt.AuthenticationFilter;
import com.serhat.secondhand.core.security.CsrfCookieFilter;
import com.serhat.secondhand.core.security.PublicEndpointRegistry;
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
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Instant;
import java.util.Arrays;
import java.util.Set;

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
    private final CorsConfigProperties corsConfigProperties;
    private final PublicEndpointRegistry publicEndpointRegistry;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        Set<String> dynamicPublicEndpoints = publicEndpointRegistry.getPublicEndpoints();
        log.info("Applying security to {} dynamically discovered public endpoints", dynamicPublicEndpoints.size());
        
        // Add additional non-controller public paths (wildcards)
        Set<String> additionalPublicPaths = new java.util.HashSet<>(Arrays.asList(
                "/oauth2/**",
                "/login/oauth2/**",
                "/swagger-ui/**",
                "/api-docs/**",
                "/swagger-ui.html",
                "/v3/api-docs/**",
                "/ws/**",
                "/actuator/health/**",
                "/actuator/info",
                "/actuator/prometheus",
                "/api/agreements/**" // Many agreements are public
        ));
        
        Set<String> allPublicEndpoints = new java.util.HashSet<>(dynamicPublicEndpoints);
        allPublicEndpoints.addAll(additionalPublicPaths);

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(requestHandler)
                        .ignoringRequestMatchers(allPublicEndpoints.toArray(new String[0]))
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(allPublicEndpoints.toArray(new String[0])).permitAll()
                        .requestMatchers("/api/images/upload").authenticated()
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
                .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class);

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

        configuration.setAllowedOrigins(corsConfigProperties.getAllowedOrigins());
        configuration.setAllowedMethods(corsConfigProperties.getAllowedMethods());
        configuration.setAllowedHeaders(corsConfigProperties.getAllowedHeaders());
        configuration.setAllowCredentials(corsConfigProperties.isAllowCredentials());
        configuration.setExposedHeaders(corsConfigProperties.getExposedHeaders());
        configuration.setMaxAge(corsConfigProperties.getMaxAge());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
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

