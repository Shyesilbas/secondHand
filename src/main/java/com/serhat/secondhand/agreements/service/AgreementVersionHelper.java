package com.serhat.secondhand.agreements.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AgreementVersionHelper {
    public String incrementVersion(String currentVersion) {
        if (currentVersion == null || currentVersion.trim().isEmpty()) {
            return "1.0.0";
        }
        try {
            String[] parts = currentVersion.split("\\.");
            if (parts.length != 3) {
                log.warn("Invalid version format: {}, using default", currentVersion);
                return "1.0.0";
            }
            int major = Integer.parseInt(parts[0]);
            int minor = Integer.parseInt(parts[1]);
            int patch = Integer.parseInt(parts[2]);
            patch++;
            return major + "." + minor + "." + patch;
        } catch (NumberFormatException e) {
            log.warn("Invalid version format: {}, using default", currentVersion);
            return "1.0.0";
        }
    }

    public boolean isValidVersion(String version) {
        if (version == null || version.trim().isEmpty()) {
            return false;
        }
        String[] parts = version.split("\\.");
        if (parts.length != 3) {
            return false;
        }
        try {
            Integer.parseInt(parts[0]);
            Integer.parseInt(parts[1]);
            Integer.parseInt(parts[2]);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public String handleContentChange(String oldContent, String newContent, String currentVersion) {
        if (!oldContent.equals(newContent)) {
            return incrementVersion(currentVersion);
        }
        return currentVersion;
    }
}
