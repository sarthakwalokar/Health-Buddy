package com.healthbuddy.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /**
     * Stores an uploaded multipart file securely and returns its unique storage key.
     *
     * @param file the uploaded file
     * @param subDirectory optional sub-directory partition (e.g., patient UUID)
     * @return the unique storage key
     */
    String store(MultipartFile file, String subDirectory);

    /**
     * Retrieves the file resource associated with the given storage key.
     *
     * @param storageKey the storage key
     * @return the file Resource
     */
    Resource retrieve(String storageKey);

    /**
     * Deletes the file associated with the given storage key.
     *
     * @param storageKey the storage key
     */
    void delete(String storageKey);

    /**
     * Checks if a file exists for the given storage key.
     *
     * @param storageKey the storage key
     * @return true if the file exists, false otherwise
     */
    boolean exists(String storageKey);
}
