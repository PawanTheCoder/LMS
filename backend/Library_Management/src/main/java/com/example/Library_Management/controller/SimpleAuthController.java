package com.example.Library_Management.controller;

import com.example.Library_Management.dto.LoginRequest;
import com.example.Library_Management.dto.RegisterRequest;
import com.example.Library_Management.entity.User;
import com.example.Library_Management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class SimpleAuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("Login attempt for: " + loginRequest.getUsername());

            Optional<User> userOpt = userService.findByUsername(loginRequest.getUsername());
            if (userOpt.isEmpty()) {
                System.out.println("User not found: " + loginRequest.getUsername());
                return ResponseEntity.badRequest().body("Invalid credentials");
            }

            User user = userOpt.get();
            System.out.println("User found: " + user.getUsername());
            System.out.println("Stored password: " + user.getPassword());
            System.out.println("Input password: " + loginRequest.getPassword());

            // Simple password check (no encoding for mini project)
            if (!user.getPassword().equals(loginRequest.getPassword())) {
                System.out.println("Password mismatch");
                return ResponseEntity.badRequest().body("Invalid credentials");
            }

            System.out.println("Login successful for: " + user.getUsername());

            // Create simple response
            Map<String, Object> response = new HashMap<>();
            response.put("token", "simple-token-" + user.getId());
            response.put("user", user);
            response.put("role", user.getRole().name());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("Login error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Login failed: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            System.out.println("Registration attempt for: " + registerRequest.getUsername());

            if (userService.existsByUsername(registerRequest.getUsername())) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            if (userService.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest().body("Email already exists");
            }

            User user = new User(
                    registerRequest.getUsername(),
                    registerRequest.getPassword(), // Store password as-is for simplicity
                    registerRequest.getEmail(),
                    registerRequest.getFirstName(),
                    registerRequest.getLastName(),
                    registerRequest.getRole());

            User savedUser = userService.createUser(user);
            System.out.println("User registered successfully: " + savedUser.getUsername());

            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            System.out.println("Registration error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
}
