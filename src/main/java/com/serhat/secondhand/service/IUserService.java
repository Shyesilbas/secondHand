package com.serhat.secondhand.service;

import com.serhat.secondhand.entity.User;

public interface IUserService {

    boolean existByEmail(String email);
    User findByEmail(String email);
    boolean existByPhone(String phone);
    void save(User user);
    void update(User user);
    void validateUniqueUser(String email, String phoneNumber);

}
