package com.serhat.secondhand.offer.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.offer.dto.CounterOfferRequest;
import com.serhat.secondhand.offer.dto.CreateOfferRequest;
import com.serhat.secondhand.offer.dto.OfferDto;
import com.serhat.secondhand.offer.entity.Offer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IOfferService {
    
    Result<OfferDto> create(Long buyerId, CreateOfferRequest request);
    
    Page<OfferDto> listMade(Long buyerId, Pageable pageable);
    
    Page<OfferDto> listReceived(Long sellerId, Pageable pageable);
    
    Result<OfferDto> getByIdForUser(Long userId, UUID offerId);
    
    Result<OfferDto> accept(Long sellerId, UUID offerId);
    
    Result<OfferDto> reject(Long userId, UUID offerId);
    
    Result<OfferDto> counter(Long userId, UUID offerId, CounterOfferRequest request);
    
    Result<Offer> getAcceptedOfferForCheckout(Long buyerId, UUID offerId);
    
    void markCompleted(Offer offer);
}
