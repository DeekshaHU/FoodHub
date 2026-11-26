package com.restaurant.restaurant_backend.controller;

import com.restaurant.restaurant_backend.entity.Bill;
import com.restaurant.restaurant_backend.entity.Order;
import com.restaurant.restaurant_backend.repository.BillRepository;
import com.restaurant.restaurant_backend.repository.OrderRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "http://localhost:5173")
public class BillController {

    private final BillRepository billRepository;
    private final OrderRepository orderRepository;

    public BillController(
            BillRepository billRepository,
            OrderRepository orderRepository) {
        this.billRepository = billRepository;
        this.orderRepository = orderRepository;
    }

    // 1. Generate bill for an order
    @PostMapping("/generate/{orderId}")
    public Bill generateBill(@PathVariable Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Bill bill = new Bill();

        bill.setOrderId(order.getId());
        bill.setUserId(order.getUserId());
        bill.setRestaurantId(order.getRestaurantId());
        bill.setTotalAmount(order.getTotalAmount());

        return billRepository.save(bill);
    }

    // 2. Get all bills
    @GetMapping
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    // 3. Get bills by order ID
    @GetMapping("/order/{orderId}")
    public List<Bill> getBillsByOrder(@PathVariable Long orderId) {
        return billRepository.findByOrderId(orderId);
    }
}