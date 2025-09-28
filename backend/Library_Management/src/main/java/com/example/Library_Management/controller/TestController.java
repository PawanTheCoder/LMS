package com.example.Library_Management.controller;

import com.example.Library_Management.entity.User;
import com.example.Library_Management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @Autowired
    private UserService userService;

    @GetMapping("/test")
    public String test() {
        return "Hello from Spring Boot!";
    }

    @GetMapping("/test-auth")
    public String testAuth(@RequestParam String username, @RequestParam String password) {
        try {
            User user = userService.findByUsername(username).orElse(null);
            if (user == null) {
                return "User not found: " + username;
            }

            boolean matches = password.equals(user.getPassword());
            return "User: " + username + ", Password matches: " + matches + ", Stored password: " + user.getPassword();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}