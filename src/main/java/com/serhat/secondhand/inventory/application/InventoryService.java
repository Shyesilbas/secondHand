package com.serhat.secondhand.inventory.application;

import com.serhat.secondhand.inventory.domain.entity.Inventory;
import com.serhat.secondhand.inventory.domain.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final com.serhat.secondhand.listing.domain.repository.listing.ListingRepository listingRepository;

    @Transactional
    public void createInventory(UUID listingId, Integer initialQuantity) {
        if (inventoryRepository.findByListingId(listingId).isPresent()) {
            return; // Already exists
        }
        
        Inventory inventory = Inventory.builder()
                .listingId(listingId)
                .availableQuantity(initialQuantity != null ? initialQuantity : 0)
                .build();
                
        inventoryRepository.save(inventory);
        log.info("Created inventory for listing {} with quantity {}", listingId, initialQuantity);
    }

    @Transactional(readOnly = true)
    public Integer getAvailableQuantity(UUID listingId) {
        if (listingId == null) return 0;
        return inventoryRepository.findByListingId(listingId)
                .map(Inventory::getAvailableQuantity)
                .orElseGet(() -> {
                    // If no inventory record exists, check if listing exists and is ACTIVE
                    return listingRepository.findById(listingId)
                            .filter(l -> l.getStatus() == com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus.ACTIVE)
                            .map(l -> 1)
                            .orElse(0); // If not ACTIVE (SOLD/INACTIVE) or not found, stock is strictly 0!
                });
    }

    @Transactional
    public void reserveQuantity(UUID listingId, int quantity) {
        Inventory inventory = getOrCreateInventory(listingId, 1);
        inventory.reserveQuantity(quantity);
        inventoryRepository.save(inventory);
        log.info("Reserved {} items for listing {}. Remaining: {}", quantity, listingId, inventory.getAvailableQuantity());
    }

    @Transactional
    public void restoreQuantity(UUID listingId, int quantity) {
        Inventory inventory = getOrCreateInventory(listingId, 1);
        inventory.restoreQuantity(quantity);
        inventoryRepository.save(inventory);
        log.info("Restored {} items for listing {}. New total: {}", quantity, listingId, inventory.getAvailableQuantity());
    }

    @Transactional
    public void incrementQuantity(UUID listingId, int delta) {
        Inventory inventory = getOrCreateInventory(listingId, 1);
        inventory.incrementQuantity(delta);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void updateQuantity(UUID listingId, Integer newQuantity) {
        Inventory inventory = getOrCreateInventory(listingId, newQuantity != null ? newQuantity : 1);
        inventory.updateQuantity(newQuantity);
        inventoryRepository.save(inventory);
    }

    private Inventory getOrCreateInventory(UUID listingId, Integer defaultQuantity) {
        return inventoryRepository.findByListingId(listingId)
                .orElseGet(() -> {
                    Inventory newInv = Inventory.builder()
                            .listingId(listingId)
                            .availableQuantity(defaultQuantity != null ? defaultQuantity : 1)
                            .build();
                    log.info("Auto-created missing inventory record for listing {} with default quantity {}", listingId, newInv.getAvailableQuantity());
                    return inventoryRepository.save(newInv);
                });
    }
}
