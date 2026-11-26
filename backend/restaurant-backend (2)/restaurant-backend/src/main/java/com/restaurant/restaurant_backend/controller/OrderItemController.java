package com.restaurant.restaurant_backend.controller;

import com.restaurant.restaurant_backend.entity.OrderItem;
import com.restaurant.restaurant_backend.repository.OrderItemRepository;
import com.restaurant.restaurant_backend.repository.OrderRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderItemController {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;

    public OrderItemController(
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository) {
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
    }

    // 1. Add item to an order
    @PostMapping("/add/{orderId}")
    public OrderItem addOrderItem(
            @PathVariable Long orderId,
            @RequestBody OrderItem orderItem) {

        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found");
        }

        orderItem.setOrderId(orderId);

        return orderItemRepository.save(orderItem);
    }

    // 2. Get all order items
    @GetMapping
    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    // 3. Get items by order ID
    @GetMapping("/order/{orderId}")
    public List<OrderItem> getOrderItemsByOrder(
            @PathVariable Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    // 4. Delete order item
    @DeleteMapping("/{id}")
    public String deleteOrderItem(@PathVariable Long id) {
        if (!orderItemRepository.existsById(id)) {
            return "Order item not found";
        }

        orderItemRepository.deleteById(id);
        return "Order item deleted successfully";
    }
}