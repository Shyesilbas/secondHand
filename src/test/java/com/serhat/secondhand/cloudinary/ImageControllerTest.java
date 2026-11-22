package com.serhat.secondhand.cloudinary;

import com.serhat.secondhand.cloudinary.api.ImageController;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The image API had a delete-by-URL endpoint without any ownership check, so any signed-in user could
 * remove every public listing image. Nothing used it; it stays removed until a delete with ownership exists.
 */
class ImageControllerTest {

    @Test
    void exposesNoDeleteEndpoint() {
        assertThat(Arrays.stream(ImageController.class.getDeclaredMethods())
                .filter(m -> m.isAnnotationPresent(DeleteMapping.class)))
                .isEmpty();
    }
}
