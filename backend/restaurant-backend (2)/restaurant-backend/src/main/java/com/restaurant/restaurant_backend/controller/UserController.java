
package com.restaurant.restaurant_backend.controller;

import com.restaurant.restaurant_backend.entity.User;
import com.restaurant.restaurant_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {

        if (user.getMobileNumber() == null ||
                user.getMobileNumber().isBlank()) {
            return ResponseEntity.badRequest().body("Mobile number is required");
        }

        if (userRepository.findByMobileNumber(user.getMobileNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Mobile number already registered");
        }

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
