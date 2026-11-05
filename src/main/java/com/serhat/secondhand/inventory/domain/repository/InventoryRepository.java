package com.serhat.secondhand.inventory.domain.repository;

import com.serhat.secondhand.inventory.domain.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    Optional<Inventory> findByListingId(UUID listingId);

    List<Inventory> findByListingIdIn(Collection<UUID> listingIds);

    /**
     * Deducts stock in one statement so concurrent buyers of the same listing do not hit optimistic lock
     * failures; bumps the version so entity-based writers still detect the change. Returns 0 when the
     * row has less than {@code quantity} left.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Inventory i
               SET i.availableQuantity = i.availableQuantity - :quantity,
                   i.version = i.version + 1,
                   i.updatedAt = CURRENT_TIMESTAMP
             WHERE i.listingId = :listingId AND i.availableQuantity >= :quantity
            """)
    int deductIfAvailable(@Param("listingId") UUID listingId, @Param("quantity") int quantity);
}
