package com.serhat.secondhand.cloudinary.application;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.serhat.secondhand.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
            throw new BusinessException("Failed to upload image. Please check your file and try again.", HttpStatus.BAD_REQUEST, "IMAGE_UPLOAD_FAILED");
        } catch (Exception e) {
            log.error("Unexpected error during image upload to Cloudinary: {}", e.getMessage(), e);
            throw new BusinessException("An unexpected error occurred while uploading the image. Please try again later.", HttpStatus.INTERNAL_SERVER_ERROR, "IMAGE_UPLOAD_UNEXPECTED_ERROR");
        }
    }

    private boolean isValidImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        
        if (contentType == null || originalFilename == null) {
            return false;
        }

        boolean validContentType = contentType.equals("image/jpeg") ||
                contentType.equals("image/jpg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/gif") ||
                contentType.equals("image/webp");

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        boolean validExtension = extension.equals("jpg") ||
                extension.equals("jpeg") ||
                extension.equals("png") ||
                extension.equals("gif") ||
                extension.equals("webp");

        return validContentType && validExtension;
    }
}
