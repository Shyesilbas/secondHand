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

    /**
     * Find all cart items for a specific user
     */
    List<Cart> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find all cart items for a specific user with listing details
     */
    @Query("SELECT c FROM Cart c JOIN FETCH c.listing l WHERE c.user = :user ORDER BY c.createdAt DESC")
    List<Cart> findByUserWithListing(@Param("user") User user);

    /**
     * Find a specific cart item by user and listing
     */
    Optional<Cart> findByUserAndListing(User user, Listing listing);

    /**
     * Check if a listing exists in user's cart
     */
    boolean existsByUserAndListing(User user, Listing listing);

    /**
     * Count total items in user's cart
     */
    long countByUser(User user);

    /**
     * Delete all items from user's cart
     */
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.user = :user")
    void deleteByUser(@Param("user") User user);

    /**
     * Delete a specific item from user's cart
     */
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.user = :user AND c.listing = :listing")
    void deleteByUserAndListing(@Param("user") User user, @Param("listing") Listing listing);

    /**
     * Update quantity of a cart item
     */
    @Modifying
    @Query("UPDATE Cart c SET c.quantity = :quantity WHERE c.user = :user AND c.listing = :listing")
    void updateQuantityByUserAndListing(@Param("user") User user, @Param("listing") Listing listing, @Param("quantity") Integer quantity);
}
