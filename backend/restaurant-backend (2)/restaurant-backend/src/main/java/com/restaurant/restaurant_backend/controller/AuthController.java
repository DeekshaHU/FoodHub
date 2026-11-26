
package com.restaurant.restaurant_backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam String mobileNumber) {

        // Temporary OTP for development
        return "OTP sent successfully to " + mobileNumber
                + ". Your test OTP is 123456";
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(
            @RequestParam String mobileNumber,
            @RequestParam String otp) {

        if (otp.equals("123456")) {
            return "OTP verified successfully!";
        }

        return "Invalid OTP";
    }
}
