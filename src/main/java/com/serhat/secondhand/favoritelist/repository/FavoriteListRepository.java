package com.serhat.secondhand.favoritelist.repository;

import com.serhat.secondhand.favoritelist.entity.FavoriteList;
import com.serhat.secondhand.favoritelist.repository.projection.FavoriteListSummaryProjection;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteListRepository extends JpaRepository<FavoriteList, Long> {


    Page<FavoriteList> findByOwnerOrderByCreatedAtDesc(User owner, Pageable pageable);

    Page<FavoriteList> findByOwnerIdAndIsPublicTrueOrderByCreatedAtDesc(Long ownerId, Pageable pageable);

    @Query("SELECT COUNT(fl) FROM FavoriteList fl WHERE fl.owner = :owner")
    long countByOwner(@Param("owner") User owner);

    @Query(value = """
            SELECT
              fl.id AS id,
              fl.name AS name,
              fl.description AS description,
              fl.isPublic AS isPublic,
              fl.coverImageUrl AS coverImageUrl,
              fl.owner.id AS ownerId,
              CONCAT(fl.owner.name, ' ', fl.owner.surname) AS ownerName,
              COUNT(DISTINCT i.id) AS itemCount,
              COUNT(DISTINCT l.id) AS likeCount,
              COALESCE(SUM(li.price), 0) AS totalPrice,
              MAX(li.currency) AS currency,
              COALESCE(fl.coverImageUrl, MAX(li.imageUrl)) AS previewImageUrl,
              fl.createdAt AS createdAt
            FROM FavoriteList fl
            LEFT JOIN fl.items i
            LEFT JOIN i.listing li
            LEFT JOIN fl.likes l
            WHERE fl.isPublic = true
            GROUP BY fl.id, fl.name, fl.description, fl.isPublic, fl.coverImageUrl, fl.owner.id, fl.owner.name, fl.owner.surname, fl.createdAt
            ORDER BY COUNT(DISTINCT l.id) DESC, fl.createdAt DESC
            """,
            countQuery = "SELECT COUNT(fl) FROM FavoriteList fl WHERE fl.isPublic = true")
    Page<FavoriteListSummaryProjection> findPopularPublicListSummaries(Pageable pageable);

    boolean existsByOwnerAndName(User owner, String name);

    @Query(value = """
            SELECT
              fl.id AS id,
              fl.name AS name,
              fl.description AS description,
              fl.isPublic AS isPublic,
              fl.coverImageUrl AS coverImageUrl,
              fl.owner.id AS ownerId,
              CONCAT(fl.owner.name, ' ', fl.owner.surname) AS ownerName,
              COUNT(DISTINCT i.id) AS itemCount,
              COUNT(DISTINCT l.id) AS likeCount,
              COALESCE(SUM(li.price), 0) AS totalPrice,
              MAX(li.currency) AS currency,
              COALESCE(fl.coverImageUrl, MAX(li.imageUrl)) AS previewImageUrl,
              fl.createdAt AS createdAt
            FROM FavoriteList fl
            LEFT JOIN fl.items i
            LEFT JOIN i.listing li
            LEFT JOIN fl.likes l
            WHERE fl.owner = :owner
            GROUP BY fl.id, fl.name, fl.description, fl.isPublic, fl.coverImageUrl, fl.owner.id, fl.owner.name, fl.owner.surname, fl.createdAt
            ORDER BY fl.createdAt DESC
            """,
            countQuery = "SELECT COUNT(fl) FROM FavoriteList fl WHERE fl.owner = :owner")
    Page<FavoriteListSummaryProjection> findMyListSummaries(@Param("owner") User owner, Pageable pageable);

    @Query(value = """
            SELECT
              fl.id AS id,
              fl.name AS name,
              fl.description AS description,
              fl.isPublic AS isPublic,
              fl.coverImageUrl AS coverImageUrl,
              fl.owner.id AS ownerId,
              CONCAT(fl.owner.name, ' ', fl.owner.surname) AS ownerName,
              COUNT(DISTINCT i.id) AS itemCount,
              COUNT(DISTINCT l.id) AS likeCount,
              COALESCE(SUM(li.price), 0) AS totalPrice,
              MAX(li.currency) AS currency,
              COALESCE(fl.coverImageUrl, MAX(li.imageUrl)) AS previewImageUrl,
              fl.createdAt AS createdAt
            FROM FavoriteList fl
            LEFT JOIN fl.items i
            LEFT JOIN i.listing li
            LEFT JOIN fl.likes l
            WHERE fl.owner.id = :ownerId AND fl.isPublic = true
            GROUP BY fl.id, fl.name, fl.description, fl.isPublic, fl.coverImageUrl, fl.owner.id, fl.owner.name, fl.owner.surname, fl.createdAt
            ORDER BY fl.createdAt DESC
            """,
            countQuery = "SELECT COUNT(fl) FROM FavoriteList fl WHERE fl.owner.id = :ownerId AND fl.isPublic = true")
    Page<FavoriteListSummaryProjection> findPublicListSummaries(@Param("ownerId") Long ownerId, Pageable pageable);

    @Query("SELECT fl FROM FavoriteList fl " +
            "LEFT JOIN FETCH fl.items " +
            "LEFT JOIN FETCH fl.likes " +
            "WHERE fl.id = :listId")
    Optional<FavoriteList> findByIdWithDetails(@Param("listId") Long listId);
}

