package com.serhat.secondhand.dashboard.service.port;

import com.serhat.secondhand.user.domain.entity.User;

public interface UserQueryPort {

    User findById(Long id);
}

