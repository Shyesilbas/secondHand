package com.serhat.secondhand.notification.repository;

import com.serhat.secondhand.notification.repository.projection.NotificationFeedRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

@org.springframework.stereotype.Repository
public interface NotificationFeedRepository extends Repository<com.serhat.secondhand.notification.entity.Notification, UUID> {

    @Query(
            value = """
                    select 
                      n.id as id,
                      n.user_id as userId,
                      n.type as type,
                      n.title as title,
                      n.message as message,
                      n.action_url as actionUrl,
                      n.metadata as metadata,
                      n.is_read as isRead,
                      n.read_at as readAt,
                      n.created_at as createdAt
                    from notifications n
                    where n.user_id = :userId
                    
                    union all
                    
                    select
                      e.id as id,
                      cast(:userId as bigint) as userId,
                      e.type as type,
                      e.title as title,
                      e.message as message,
                      e.action_url as actionUrl,
                      e.metadata as metadata,
                      case when r.user_id is null then false else true end as isRead,
                      r.read_at as readAt,
                      e.created_at as createdAt
                    from notification_events e
                    left join notification_event_reads r
                      on r.event_id = e.id and r.user_id = :userId
                    
                    order by createdAt desc
                    """,
            countQuery = """
                    select
                      (select count(*) from notifications n where n.user_id = :userId) +
                      (select count(*) from notification_events e)
                    """,
            nativeQuery = true
    )
    Page<NotificationFeedRow> findFeed(@Param("userId") Long userId, Pageable pageable);
}

