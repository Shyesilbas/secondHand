package com.serhat.secondhand.user.domain.dto;

public record BlockStatusDto(boolean blockedByMe, boolean blockedMe, boolean eitherBlocked) {

    public static BlockStatusDto of(boolean blockedByMe, boolean blockedMe) {
        return new BlockStatusDto(blockedByMe, blockedMe, blockedByMe || blockedMe);
    }
}
