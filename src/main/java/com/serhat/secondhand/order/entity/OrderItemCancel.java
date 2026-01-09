package com.serhat.secondhand.order.entity;

import com.serhat.secondhand.order.entity.enums.CancelRefundReason;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "order_item_cancels")
@EntityListeners(AuditingEntityListener.class)
public class OrderItemCancel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false)
    private CancelRefundReason reason;

    @Column(name = "reason_text", length = 1000)
    private String reasonText;

    @Column(name = "cancelled_quantity", nullable = false)
    private Integer cancelledQuantity;

    @Column(name = "refund_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}



