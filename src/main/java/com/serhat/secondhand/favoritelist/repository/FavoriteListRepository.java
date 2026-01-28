package com.serhat.secondhand.favoritelist.repository;

import com.serhat.secondhand.favoritelist.entity.FavoriteList;
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

    @Query("SELECT fl FROM FavoriteList fl WHERE fl.isPublic = true ORDER BY SIZE(fl.likes) DESC")
    Page<FavoriteList> findPopularPublicLists(Pageable pageable);

    boolean existsByOwnerAndName(User owner, String name);

    @Query(value = "SELECT DISTINCT fl FROM FavoriteList fl " +
            "LEFT JOIN FETCH fl.items " +
            "LEFT JOIN FETCH fl.likes " +
            "WHERE fl.owner = :owner",
            countQuery = "SELECT COUNT(fl) FROM FavoriteList fl WHERE fl.owner = :owner")
    Page<FavoriteList> findByOwnerWithDetails(@Param("owner") User owner, Pageable pageable);

    @Query(value = "SELECT DISTINCT fl FROM FavoriteList fl " +
            "LEFT JOIN FETCH fl.items " +
            "LEFT JOIN FETCH fl.likes " +
            "WHERE fl.owner.id = :ownerId AND fl.isPublic = true",
            countQuery = "SELECT COUNT(fl) FROM FavoriteList fl WHERE fl.owner.id = :ownerId AND fl.isPublic = true")
    Page<FavoriteList> findPublicByOwnerIdWithDetails(@Param("ownerId") Long ownerId, Pageable pageable);

    @Query("SELECT fl FROM FavoriteList fl " +
            "LEFT JOIN FETCH fl.items " +
            "LEFT JOIN FETCH fl.likes " +
            "WHERE fl.id = :listId")
    Optional<FavoriteList> findByIdWithDetails(@Param("listId") Long listId);
}

