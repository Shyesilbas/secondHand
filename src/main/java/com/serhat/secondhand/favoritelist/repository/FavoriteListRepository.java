package com.serhat.secondhand.favoritelist.repository;

import com.serhat.secondhand.favoritelist.entity.FavoriteList;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteListRepository extends JpaRepository<FavoriteList, Long> {

    List<FavoriteList> findByOwnerOrderByCreatedAtDesc(User owner);

    Page<FavoriteList> findByOwnerOrderByCreatedAtDesc(User owner, Pageable pageable);

    List<FavoriteList> findByOwnerAndIsPublicTrueOrderByCreatedAtDesc(User owner);

    Page<FavoriteList> findByOwnerIdAndIsPublicTrueOrderByCreatedAtDesc(Long ownerId, Pageable pageable);

    @Query("SELECT fl FROM FavoriteList fl WHERE fl.owner.id = :ownerId AND fl.isPublic = true ORDER BY fl.createdAt DESC")
    List<FavoriteList> findPublicListsByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT fl FROM FavoriteList fl LEFT JOIN FETCH fl.items WHERE fl.id = :id")
    Optional<FavoriteList> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT fl FROM FavoriteList fl LEFT JOIN FETCH fl.likes WHERE fl.id = :id")
    Optional<FavoriteList> findByIdWithLikes(@Param("id") Long id);

    @Query("SELECT COUNT(fl) FROM FavoriteList fl WHERE fl.owner = :owner")
    long countByOwner(@Param("owner") User owner);

    @Query("SELECT fl FROM FavoriteList fl WHERE fl.isPublic = true ORDER BY SIZE(fl.likes) DESC")
    Page<FavoriteList> findPopularPublicLists(Pageable pageable);

    boolean existsByOwnerAndName(User owner, String name);
}

