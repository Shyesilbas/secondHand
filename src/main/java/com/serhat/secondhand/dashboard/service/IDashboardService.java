package com.serhat.secondhand.dashboard.service;

import com.serhat.secondhand.dashboard.dto.BuyerDashboardDto;
import com.serhat.secondhand.dashboard.dto.SellerDashboardDto;

import java.time.LocalDateTime;

public interface IDashboardService {
    
    SellerDashboardDto getSellerDashboard(Long sellerId, LocalDateTime startDate, LocalDateTime endDate);
    
    BuyerDashboardDto getBuyerDashboard(Long buyerId, LocalDateTime startDate, LocalDateTime endDate);
}
