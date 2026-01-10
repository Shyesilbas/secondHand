package com.serhat.secondhand.favoritelist.repository;

import com.serhat.secondhand.favoritelist.entity.FavoriteList;
import com.serhat.secondhand.favoritelist.entity.FavoriteListLike;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteListLikeRepository extends JpaRepository<FavoriteListLike, Long> {

    Optional<FavoriteListLike> findByFavoriteListAndUser(FavoriteList favoriteList, User user);

    boolean existsByFavoriteListAndUser(FavoriteList favoriteList, User user);

    @Query("SELECT COUNT(fll) FROM FavoriteListLike fll WHERE fll.favoriteList = :list")
    long countByFavoriteList(@Param("list") FavoriteList list);

    void deleteByFavoriteListAndUser(FavoriteList favoriteList, User user);

    @Query("SELECT CASE WHEN COUNT(fll) > 0 THEN true ELSE false END FROM FavoriteListLike fll WHERE fll.favoriteList.id = :listId AND fll.user.id = :userId")
    boolean isLikedByUser(@Param("listId") Long listId, @Param("userId") Long userId);
}

