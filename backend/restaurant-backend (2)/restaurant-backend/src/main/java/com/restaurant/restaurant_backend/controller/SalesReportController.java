package com.restaurant.restaurant_backend.controller;

import com.restaurant.restaurant_backend.entity.Bill;
import com.restaurant.restaurant_backend.repository.BillRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class SalesReportController {

    private final BillRepository billRepository;

    public SalesReportController(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    // 1. Get total sales
    @GetMapping("/sales")
    public double getTotalSales() {
        List<Bill> bills = billRepository.findAll();

        return bills.stream()
                .mapToDouble(Bill::getTotalAmount)
                .sum();
    }

    // 2. Get number of bills
    @GetMapping("/bill-count")
    public long getBillCount() {
        return billRepository.count();
    }

    // 3. Get all sales records
    @GetMapping("/sales-records")
    public List<Bill> getSalesRecords() {
        return billRepository.findAll();
    }
}