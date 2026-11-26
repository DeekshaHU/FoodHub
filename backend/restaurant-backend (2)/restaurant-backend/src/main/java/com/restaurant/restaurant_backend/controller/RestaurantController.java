
package com.restaurant.restaurant_backend.controller;

import com.restaurant.restaurant_backend.entity.Restaurant;
import com.restaurant.restaurant_backend.repository.RestaurantRepository;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://localhost:5173")
public class RestaurantController {

    private final RestaurantRepository restaurantRepository;

    public RestaurantController(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    // 1. Register a new restaurant
    @PostMapping("/register")
    public Restaurant registerRestaurant(@RequestBody Restaurant restaurant) {
        restaurant.setApproved(false);
        return restaurantRepository.save(restaurant);
    }

    // 2. Get all restaurants
    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    // 3. Get restaurant by ID
    @GetMapping("/{id}")
    public Restaurant getRestaurantById(@PathVariable Long id) {
        return restaurantRepository.findById(id).orElse(null);
    }

    // 4. Admin approves a restaurant
    @PutMapping("/{id}/approve")
    public Restaurant approveRestaurant(@PathVariable Long id) {

        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setApproved(true);

        return restaurantRepository.save(restaurant);
    }
}
