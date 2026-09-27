package com.healthbuddy.service;

import com.healthbuddy.exception.AppException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class LocalFileSystemStorageService implements FileStorageService {

    private final Path rootLocation;
    private final long maxFileSizeBytes;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("pdf", "png", "jpg", "jpeg");
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg"
    );

    public LocalFileSystemStorageService(
            @Value("${app.storage.local.base-dir:./data/medical-reports}") String baseDir,
            @Value("${app.storage.max-file-size-bytes:20971520}") long maxFileSizeBytes
    ) {
        this.rootLocation = Paths.get(baseDir).toAbsolutePath().normalize();
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            log.info("Medical report file storage initialized at: {}", rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize storage directory: {}", rootLocation, e);
            throw new AppException("Failed to initialize medical file storage directory", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public String store(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new AppException("Cannot upload an empty file", HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new AppException("File size exceeds the maximum allowed limit of " + (maxFileSizeBytes / (1024 * 1024)) + "MB", HttpStatus.BAD_REQUEST);
        }

        String rawFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "report.pdf"));
        if (rawFilename.contains("..")) {
            throw new AppException("Filename contains invalid path sequence: " + rawFilename, HttpStatus.BAD_REQUEST);
        }

        // Validate Extension
        String extension = getFileExtension(rawFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new AppException("Unsupported file extension: ." + extension + ". Allowed formats: PDF, PNG, JPG, JPEG", HttpStatus.BAD_REQUEST);
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException("Unsupported Content-Type: " + contentType + ". Allowed formats: PDF, PNG, JPG, JPEG", HttpStatus.BAD_REQUEST);
        }

        // Validate Magic Bytes (content inspection)
        validateMagicBytes(file, extension);

        // Sanitize filename & create unique storage name
        String sanitizedBase = rawFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueFileName = UUID.randomUUID() + "_" + sanitizedBase;

        String safeSubDir = (subDirectory != null && !subDirectory.isBlank())
                ? subDirectory.replaceAll("[^a-zA-Z0-9_-]", "")
                : "general";

        try {
            Path targetDir = rootLocation.resolve(safeSubDir).normalize();
            if (!targetDir.startsWith(rootLocation)) {
                throw new AppException("Invalid storage directory path", HttpStatus.BAD_REQUEST);
            }
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(uniqueFileName).normalize();
            if (!targetPath.startsWith(rootLocation)) {
                throw new AppException("Cannot store file outside target directory", HttpStatus.BAD_REQUEST);
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String storageKey = safeSubDir + "/" + uniqueFileName;
            log.info("Medical document stored successfully. Storage key: {}, size: {} bytes", storageKey, file.getSize());
            return storageKey;
        } catch (IOException e) {
            log.error("Failed to store file: {}", rawFilename, e);
            throw new AppException("Failed to store medical file securely", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Resource retrieve(String storageKey) {
        if (storageKey == null || storageKey.isBlank() || storageKey.contains("..")) {
            throw new AppException("Invalid storage key", HttpStatus.BAD_REQUEST);
        }

        try {
            Path filePath = rootLocation.resolve(storageKey).normalize();
            if (!filePath.startsWith(rootLocation)) {
                throw new AppException("Invalid path traversal attempt", HttpStatus.BAD_REQUEST);
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new AppException("Medical file not found on storage server", HttpStatus.NOT_FOUND);
            }
        } catch (MalformedURLException e) {
            log.error("Malformed URL for storage key: {}", storageKey, e);
            throw new AppException("Medical file resource path is invalid", HttpStatus.NOT_FOUND);
        }
    }

    @Override
    public void delete(String storageKey) {
        if (storageKey == null || storageKey.isBlank() || storageKey.contains("..")) {
            return;
        }

        try {
            Path filePath = rootLocation.resolve(storageKey).normalize();
            if (filePath.startsWith(rootLocation)) {
                Files.deleteIfExists(filePath);
                log.info("Medical document file deleted: {}", storageKey);
            }
        } catch (IOException e) {
            log.warn("Failed to delete physical file for storage key: {}", storageKey, e);
        }
    }

    @Override
    public boolean exists(String storageKey) {
        if (storageKey == null || storageKey.isBlank() || storageKey.contains("..")) {
            return false;
        }
        Path filePath = rootLocation.resolve(storageKey).normalize();
        return filePath.startsWith(rootLocation) && Files.exists(filePath);
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return "";
    }

    private void validateMagicBytes(MultipartFile file, String extension) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            int bytesRead = is.read(header);
            if (bytesRead < 4) {
                throw new AppException("File is too short to be a valid document", HttpStatus.BAD_REQUEST);
            }

            if ("pdf".equals(extension)) {
                // PDF magic bytes: %PDF (0x25, 0x50, 0x44, 0x46)
                if (header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46) {
                    throw new AppException("File content is not a valid PDF document", HttpStatus.BAD_REQUEST);
                }
            } else if ("png".equals(extension)) {
                // PNG magic bytes: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
                if (header[0] != (byte) 0x89 || header[1] != 0x50 || header[2] != 0x4E || header[3] != 0x47) {
                    throw new AppException("File content is not a valid PNG image", HttpStatus.BAD_REQUEST);
                }
            } else if ("jpg".equals(extension) || "jpeg".equals(extension)) {
                // JPEG magic bytes: 0xFF, 0xD8, 0xFF
                if ((header[0] & 0xFF) != 0xFF || (header[1] & 0xFF) != 0xD8 || (header[2] & 0xFF) != 0xFF) {
                    throw new AppException("File content is not a valid JPEG/JPG image", HttpStatus.BAD_REQUEST);
                }
            }
        } catch (IOException e) {
            log.error("Failed to read magic bytes for uploaded file", e);
            throw new AppException("Could not inspect file contents for security validation", HttpStatus.BAD_REQUEST);
        }
    }
}
