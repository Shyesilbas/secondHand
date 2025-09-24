package com.serhat.secondhand.cart.repository;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

        List<Cart> findByUserOrderByCreatedAtDesc(User user);

        @Query("SELECT c FROM Cart c JOIN FETCH c.listing l WHERE c.user = :user ORDER BY c.createdAt DESC")
    List<Cart> findByUserWithListing(@Param("user") User user);

        Optional<Cart> findByUserAndListing(User user, Listing listing);

        boolean existsByUserAndListing(User user, Listing listing);

        long countByUser(User user);

        @Modifying
    @Query("DELETE FROM Cart c WHERE c.user = :user")
    void deleteByUser(@Param("user") User user);

        @Modifying
    @Query("DELETE FROM Cart c WHERE c.user = :user AND c.listing = :listing")
    void deleteByUserAndListing(@Param("user") User user, @Param("listing") Listing listing);

        @Modifying
    @Query("UPDATE Cart c SET c.quantity = :quantity WHERE c.user = :user AND c.listing = :listing")
    void updateQuantityByUserAndListing(@Param("user") User user, @Param("listing") Listing listing, @Param("quantity") Integer quantity);
}
