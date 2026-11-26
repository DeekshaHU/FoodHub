
package com.restaurant.restaurant_backend.controller;

import com.restaurant.restaurant_backend.entity.FoodItem;
import com.restaurant.restaurant_backend.repository.FoodItemRepository;
import com.restaurant.restaurant_backend.repository.RestaurantRepository;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/food-items")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodItemController {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;

    public FoodItemController(
            FoodItemRepository foodItemRepository,
            RestaurantRepository restaurantRepository) {
        this.foodItemRepository = foodItemRepository;
        this.restaurantRepository = restaurantRepository;
    }

    // 1. Add food item to a restaurant
    @PostMapping("/add/{restaurantId}")
    public FoodItem addFoodItem(
            @PathVariable Long restaurantId,
            @RequestBody FoodItem foodItem) {

        if (!restaurantRepository.existsById(restaurantId)) {
            throw new RuntimeException("Restaurant not found");
        }

        foodItem.setRestaurantId(restaurantId);

        return foodItemRepository.save(foodItem);
    }

    // 2. Get all food items
    @GetMapping
    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    // 3. Get food items by restaurant
    @GetMapping("/restaurant/{restaurantId}")
    public List<FoodItem> getFoodItemsByRestaurant(
            @PathVariable Long restaurantId) {

        return foodItemRepository.findByRestaurantId(restaurantId);
    }

    // 4. Update food item
    @PutMapping("/{id}")
    public FoodItem updateFoodItem(
            @PathVariable Long id,
            @RequestBody FoodItem updatedFoodItem) {

        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));

        foodItem.setFoodName(updatedFoodItem.getFoodName());
        foodItem.setDescription(updatedFoodItem.getDescription());
        foodItem.setPrice(updatedFoodItem.getPrice());
        foodItem.setCategory(updatedFoodItem.getCategory());
        foodItem.setAvailable(updatedFoodItem.isAvailable());

        return foodItemRepository.save(foodItem);
    }

    // 5. Delete food item
    @DeleteMapping("/{id}")
    public String deleteFoodItem(@PathVariable Long id) {

        if (!foodItemRepository.existsById(id)) {
            return "Food item not found";
        }

        foodItemRepository.deleteById(id);

        return "Food item deleted successfully";
    }
}
