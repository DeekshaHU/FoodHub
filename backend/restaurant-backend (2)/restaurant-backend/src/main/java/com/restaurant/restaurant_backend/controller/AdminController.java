package com.restaurant.restaurant_backend.controller;

import com.restaurant.restaurant_backend.entity.User;
import com.restaurant.restaurant_backend.entity.Restaurant;
import com.restaurant.restaurant_backend.entity.Order;
import com.restaurant.restaurant_backend.entity.Bill;

import com.restaurant.restaurant_backend.repository.UserRepository;
import com.restaurant.restaurant_backend.repository.RestaurantRepository;
import com.restaurant.restaurant_backend.repository.OrderRepository;
import com.restaurant.restaurant_backend.repository.BillRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;
    private final BillRepository billRepository;

    public AdminController(
            UserRepository userRepository,
            RestaurantRepository restaurantRepository,
            OrderRepository orderRepository,
            BillRepository billRepository) {

        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.orderRepository = orderRepository;
        this.billRepository = billRepository;
    }

    // 1. View all users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 2. View all restaurants
    @GetMapping("/restaurants")
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    // 3. View all orders
    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 4. View all bills
    @GetMapping("/bills")
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    // 5. View pending restaurants
    @GetMapping("/restaurants/pending")
    public List<Restaurant> getPendingRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .filter(restaurant -> !restaurant.isApproved())
                .toList();
    }

    // 6. Approve restaurant
    @PutMapping("/restaurants/{id}/approve")
    public Restaurant approveRestaurant(@PathVariable Long id) {

        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setApproved(true);

        return restaurantRepository.save(restaurant);
    }
}