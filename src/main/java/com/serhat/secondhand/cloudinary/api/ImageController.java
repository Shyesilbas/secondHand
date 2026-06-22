package com.serhat.secondhand.cloudinary.api;

import com.serhat.secondhand.cloudinary.application.CloudinaryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
@Tag(name = "Image", description = "Image operations")
public class ImageController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("image") MultipartFile file) {
        String imageUrl = cloudinaryService.uploadImage(file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteImage(@RequestParam("imageUrl") String imageUrl) {
        cloudinaryService.deleteImage(imageUrl);
        return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
    }
}
