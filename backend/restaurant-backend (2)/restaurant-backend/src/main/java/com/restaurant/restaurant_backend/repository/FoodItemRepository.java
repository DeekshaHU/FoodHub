
package com.restaurant.restaurant_backend.repository;

import com.restaurant.restaurant_backend.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    // Find all food items belonging to a restaurant
    List<FoodItem> findByRestaurantId(Long restaurantId);
}
