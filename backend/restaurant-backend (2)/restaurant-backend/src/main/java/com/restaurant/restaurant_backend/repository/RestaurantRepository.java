
package com.restaurant.restaurant_backend.repository;

import com.restaurant.restaurant_backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
}
