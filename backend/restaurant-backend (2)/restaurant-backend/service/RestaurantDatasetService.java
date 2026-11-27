
package com.restaurant.restaurant_backend.service;

import com.restaurant.restaurant_backend.entity.FoodItem;
import com.restaurant.restaurant_backend.entity.Restaurant;
import com.restaurant.restaurant_backend.repository.FoodItemRepository;
import com.restaurant.restaurant_backend.repository.RestaurantRepository;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class RestaurantDatasetService {

    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;

    public RestaurantDatasetService(
            RestaurantRepository restaurantRepository,
            FoodItemRepository foodItemRepository) {

        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
    }

    @Transactional
    public String importDataset(MultipartFile file) throws Exception {

        // Prevent accidental duplicate imports
        boolean alreadyImported = restaurantRepository.findAll()
                .stream()
                .anyMatch(r -> r.getDescription() != null
                        && r.getDescription().startsWith("KAGGLE_DATASET:"));

        if (alreadyImported) {
            return "Dataset has already been imported.";
        }

        Map<String, Restaurant> restaurants = new LinkedHashMap<>();
        List<DatasetRow> rows = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {

            for (CSVRecord record : parser) {

                String restaurantName = record.get("Restaurant_Name");
                String city = record.get("City");
                String place = record.get("Place_Name");
                String cuisine = record.get("Cuisine");
                String foodName = record.get("Item_Name");
                String priceText = record.get("Prices");

                if (restaurantName.isBlank() || foodName.isBlank()
                        || priceText.isBlank()) {
                    continue;
                }

                double price;

                try {
                    String cleanedPrice = priceText.replaceAll("[^0-9.]", "");
                    price = Double.parseDouble(cleanedPrice);

                    if (price <= 0) {
                        continue;
                    }
                } catch (NumberFormatException e) {
                    continue;
                }

                String key = restaurantName.trim().toLowerCase()
                        + "|" + city.trim().toLowerCase()
                        + "|" + place.trim().toLowerCase()
                        + "|" + cuisine.trim().toLowerCase();

                if (!restaurants.containsKey(key)) {

                    Restaurant restaurant = new Restaurant();

                    restaurant.setRestaurantName(restaurantName.trim());
                    restaurant.setOwnerName("Dataset");
                    restaurant.setMobileNumber(null);
                    restaurant.setAddress(place.trim());
                    restaurant.setCity(city.trim());
                    restaurant.setCuisine(cuisine.trim());
                    restaurant.setDescription("KAGGLE_DATASET: Zomato demo listing");
                    restaurant.setApproved(true);

                    restaurants.put(key, restaurant);
                }

                rows.add(new DatasetRow(key, foodName.trim(), price, cuisine.trim()));
            }
        }

        // Save unique restaurants
        restaurantRepository.saveAll(restaurants.values());

        // Create food items associated with restaurant IDs
        List<FoodItem> batch = new ArrayList<>();
        int importedItems = 0;

        for (DatasetRow row : rows) {

            Restaurant restaurant = restaurants.get(row.restaurantKey());

            FoodItem foodItem = new FoodItem();

            foodItem.setFoodName(row.foodName());
            foodItem.setPrice(row.price());
            foodItem.setCategory(row.cuisine());
            foodItem.setDescription("Imported from Kaggle Zomato dataset");
            foodItem.setAvailable(true);
            foodItem.setRestaurantId(restaurant.getId());

            batch.add(foodItem);

            if (batch.size() >= 500) {
                foodItemRepository.saveAll(batch);
                importedItems += batch.size();
                batch.clear();
            }
        }

        // Save remaining items
        if (!batch.isEmpty()) {
            foodItemRepository.saveAll(batch);
            importedItems += batch.size();
        }

        return "Dataset imported successfully! Restaurants: "
                + restaurants.size() + ", Food items: " + importedItems;
    }

    private record DatasetRow(
            String restaurantKey,
            String foodName,
            double price,
            String cuisine) {
    }
}
