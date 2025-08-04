package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService implements IPaymentService {

    private final PaymentRepository paymentRepository;

    @Override
    public List<PaymentDto> getPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .map(payment -> new PaymentDto(
                        payment.getId(),
                        payment.getFromUser().getName(),
                        payment.getFromUser().getSurname(),
                        payment.getToUser().getName(),
                        payment.getToUser().getSurname(),
                        payment.getAmount(),
                        payment.getPaymentType(),
                        payment.getListingId(),
                        payment.getProcessedAt(),
                        payment.isSuccess()
                )).toList();
    }
}
