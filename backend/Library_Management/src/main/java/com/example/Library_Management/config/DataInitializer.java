package com.example.Library_Management.config;

import com.example.Library_Management.entity.User;
import com.example.Library_Management.entity.Book;
import com.example.Library_Management.repository.UserRepository;
import com.example.Library_Management.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private BookRepository bookRepository;

        @Override
        public void run(String... args) throws Exception {
                // Create default admin user
                if (!userRepository.existsByUsername("Admin")) {
                        System.out.println("Creating admin user...");
                        User admin = new User();
                        admin.setUsername("Admin");
                        admin.setPassword("1155"); // Simple password without encoding
                        admin.setEmail("admin@library.com");
                        admin.setFirstName("Admin");
                        admin.setLastName("User");
                        admin.setRole(User.Role.ADMIN);
                        userRepository.save(admin);
                        System.out.println("Admin user created successfully");
                } else {
                        System.out.println("Admin user already exists");
                }

                // Create sample books

        }
}