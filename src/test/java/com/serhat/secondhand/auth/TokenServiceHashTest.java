package com.serhat.secondhand.auth;

import com.serhat.secondhand.auth.application.TokenService;
import com.serhat.secondhand.auth.domain.entity.Token;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.auth.domain.repository.TokenRepository;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class TokenServiceHashTest {

    private final TokenRepository repository = mock(TokenRepository.class);
    private final TokenService service = new TokenService(repository);

    @Test
    void storedValueIsHash_andLookupsHashTheirInput() throws Exception {
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        service.saveToken("refresh-token", TokenType.REFRESH_TOKEN, user(), LocalDateTime.now().plusDays(1), null, false);

        ArgumentCaptor<Token> saved = ArgumentCaptor.forClass(Token.class);
        verify(repository).save(saved.capture());
        String stored = saved.getValue().getToken();
        String expected = java.util.HexFormat.of().formatHex(
                java.security.MessageDigest.getInstance("SHA-256").digest("refresh-token".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        assertThat(stored).isEqualTo(expected).doesNotContain("refresh-token");

        when(repository.findByToken(anyString())).thenReturn(Optional.empty());
        service.findByToken("refresh-token");
        verify(repository).findByToken(expected);
    }

    private static User user() {
        User user = new User();
        user.setEmail("a@b.com");
        return user;
    }
}
