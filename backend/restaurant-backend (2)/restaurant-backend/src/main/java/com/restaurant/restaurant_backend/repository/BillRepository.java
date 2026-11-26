package com.restaurant.restaurant_backend.repository;

import com.restaurant.restaurant_backend.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByOrderId(Long orderId);
}