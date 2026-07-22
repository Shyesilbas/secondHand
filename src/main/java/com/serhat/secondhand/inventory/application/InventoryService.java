package com.serhat.secondhand.inventory.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.inventory.domain.entity.Inventory;
import com.serhat.secondhand.inventory.domain.repository.InventoryRepository;
import com.serhat.secondhand.inventory.util.InventoryErrorCodes;
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

    @Transactional
    public void createInventory(UUID listingId, Integer initialQuantity) {
        if (inventoryRepository.findByListingId(listingId).isPresent()) {
            return; // Already exists
        }
        
        Inventory inventory = Inventory.builder()
                .listingId(listingId)
                .availableQuantity(initialQuantity)
                .build();
                
        inventoryRepository.save(inventory);
        log.info("Created inventory for listing {} with quantity {}", listingId, initialQuantity);
    }

    @Transactional(readOnly = true)
    public Integer getAvailableQuantity(UUID listingId) {
        return inventoryRepository.findByListingId(listingId)
                .map(Inventory::getAvailableQuantity)
                .orElse(null); // or throw exception depending on requirements, returning null to match old Listing.getQuantity() behavior for missing quantites
    }

    @Transactional
    public void reserveQuantity(UUID listingId, int quantity) {
        Inventory inventory = getInventoryOrThrow(listingId);
        inventory.reserveQuantity(quantity);
        inventoryRepository.save(inventory);
        log.info("Reserved {} items for listing {}. Remaining: {}", quantity, listingId, inventory.getAvailableQuantity());
    }

    @Transactional
    public void restoreQuantity(UUID listingId, int quantity) {
        Inventory inventory = getInventoryOrThrow(listingId);
        inventory.restoreQuantity(quantity);
        inventoryRepository.save(inventory);
        log.info("Restored {} items for listing {}. New total: {}", quantity, listingId, inventory.getAvailableQuantity());
    }

    @Transactional
    public void incrementQuantity(UUID listingId, int delta) {
        Inventory inventory = getInventoryOrThrow(listingId);
        inventory.incrementQuantity(delta);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void updateQuantity(UUID listingId, Integer newQuantity) {
        Inventory inventory = getInventoryOrThrow(listingId);
        inventory.updateQuantity(newQuantity);
        inventoryRepository.save(inventory);
    }

    private Inventory getInventoryOrThrow(UUID listingId) {
        return inventoryRepository.findByListingId(listingId)
                .orElseThrow(() -> new BusinessException(InventoryErrorCodes.INVENTORY_NOT_FOUND));
    }
}
