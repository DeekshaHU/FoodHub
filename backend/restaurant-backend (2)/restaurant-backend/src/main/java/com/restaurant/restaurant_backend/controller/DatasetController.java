
package com.restaurant.restaurant_backend.controller;

import com.restaurant.restaurant_backend.service.RestaurantDatasetService;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/dataset")
@CrossOrigin(origins = "http://localhost:5173")
public class DatasetController {

    private final RestaurantDatasetService restaurantDatasetService;

    public DatasetController(RestaurantDatasetService restaurantDatasetService) {
        this.restaurantDatasetService = restaurantDatasetService;
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String importDataset(@RequestParam("file") MultipartFile file)
            throws Exception {

        if (file.isEmpty()) {
            return "Please upload a CSV file.";
        }

        return restaurantDatasetService.importDataset(file);
    }

    @PostMapping("/import-local")
    public String importDatasetFromLocal() throws Exception {

        return restaurantDatasetService.importDatasetFromPath(
                "C:\\Users\\deeks\\Downloads\\zomato_dataset.csv");
    }
}
