/**
 * Utility for client-side image compression and Cloudinary URL optimization.
 */

import logger from './logger.js';

/**
 * Compresses an image file client-side using HTML5 Canvas.
 * 
 * @param {File} file The original image file
 * @param {Object} options Compression options
 * @param {number} options.maxWidth Maximum width of the output image (default: 1200)
 * @param {number} options.maxHeight Maximum height of the output image (default: 1200)
 * @param {number} options.quality JPEG quality from 0.0 to 1.0 (default: 0.8)
 * @returns {Promise<File>} A Promise that resolves to the compressed File object
 */
export const compressImage = (file, options = {}) => {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options;

  return new Promise((resolve) => {
    // If the file is not an image, return it as-is
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // Do not compress GIFs as canvas drawing will lose animation
    if (file.type === 'image/gif') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          logger.error('Failed to get canvas 2D context');
          resolve(file); // Fallback to original file
          return;
        }

        // Draw image on canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              logger.error('Canvas to Blob conversion failed');
              resolve(file); // Fallback to original file
              return;
            }

            // Create a new File from the blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            logger.info(
              `Compressed image: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
            );

            // Return compressed file only if it is actually smaller than original
            if (compressedFile.size < file.size) {
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => {
        logger.error('Image load error during compression:', err);
        resolve(file); // Fallback to original file
      };
    };
    reader.onerror = (err) => {
      logger.error('FileReader error during compression:', err);
      resolve(file); // Fallback to original file
    };
  });
};

/**
 * Optimizes a Cloudinary image URL by adding dynamic transformation parameters.
 * 
 * @param {string} url The original image URL
 * @param {Object} options Optimization options
 * @param {number} [options.width] Target width of the image
 * @param {number} [options.height] Target height of the image
 * @param {string} [options.crop='fill'] Cloudinary crop mode (e.g. 'fill', 'limit', 'thumb', 'scale')
 * @returns {string} The optimized image URL
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url;

  // Check if it is a Cloudinary URL
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  const { width, height, crop = 'fill' } = options;

  // Build the transformation string
  // q_auto: automatic quality compression
  // f_auto: automatic format selection (WebP, AVIF)
  let transformations = 'f_auto,q_auto';

  if (width || height) {
    transformations += `,c_${crop}`;
    if (width) transformations += `,w_${width}`;
    if (height) transformations += `,h_${height}`;
  }

  // Find the "/upload/" part and insert the transformations right after it
  // Cloudinary URL pattern: .../image/upload/v12345/folder/image.jpg
  // We insert to get: .../image/upload/f_auto,q_auto,.../v12345/folder/image.jpg
  const uploadPart = '/upload/';
  const index = url.indexOf(uploadPart);
  
  if (index !== -1) {
    const insertPosition = index + uploadPart.length;
    return url.slice(0, insertPosition) + transformations + '/' + url.slice(insertPosition);
  }

  return url;
};
