package com.serhat.secondhand.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        log.info("Starting image upload, file size: {} bytes", file.getSize());
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            if (!isValidImageFile(file)) {
                throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, GIF and WebP are allowed");
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                throw new IllegalArgumentException("File size must be less than 10MB");
            }

            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", "secondhand-listings",
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto",
                    "width", 800,
                    "height", 600,
                    "crop", "limit"
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String imageUrl = (String) uploadResult.get("secure_url");
            
            log.info("Image uploaded successfully to Cloudinary: {}", imageUrl);
            return imageUrl;

        } catch (IOException e) {
            log.error("IO error uploading image to Cloudinary: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload image. Please check your file and try again.", e);
        } catch (Exception e) {
            log.error("Unexpected error during image upload to Cloudinary: {}", e.getMessage(), e);
            throw new RuntimeException("An unexpected error occurred while uploading the image. Please try again later.", e);
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            String publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Image deleted successfully from Cloudinary: {}", publicId);
            }
        } catch (IOException e) {
            log.error("IO error deleting image from Cloudinary for URL {}: {}", imageUrl, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error deleting image from Cloudinary for URL {}: {}", imageUrl, e.getMessage(), e);
        }
    }

    private boolean isValidImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (
                contentType.equals("image/jpeg") ||
                contentType.equals("image/jpg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/gif") ||
                contentType.equals("image/webp")
        );
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            String[] parts = imageUrl.split("/");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("secondhand-listings") && i + 1 < parts.length) {
                    String fileName = parts[i + 1];
                    int dotIndex = fileName.lastIndexOf('.');
                    return "secondhand-listings/" + (dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName);
                }
            }
        } catch (Exception e) {
            log.error("Error extracting public ID from URL: {}", imageUrl, e);
        }
        
        return null;
    }
}
