package com.example.Library_Management.controller;

import com.example.Library_Management.entity.Borrowing;
import com.example.Library_Management.entity.User;
import com.example.Library_Management.entity.Book;
import com.example.Library_Management.service.BorrowingService;
import com.example.Library_Management.service.UserService;
import com.example.Library_Management.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/borrowings")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class BorrowingController {

    @Autowired
    private BorrowingService borrowingService;

    @Autowired
    private UserService userService;

    @Autowired
    private BookService bookService;

    // GET all borrowings
    @GetMapping
    public ResponseEntity<List<Borrowing>> getAllBorrowings() {
        List<Borrowing> borrowings = borrowingService.getAllBorrowings();
        return ResponseEntity.ok(borrowings);
    }

    // GET borrowings by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Borrowing>> getUserBorrowings(@PathVariable Long userId) {
        Optional<User> user = userService.getUserById(userId);
        if (user.isPresent()) {
            List<Borrowing> borrowings = borrowingService.getUserBorrowings(user.get());
            return ResponseEntity.ok(borrowings);
        }
        return ResponseEntity.notFound().build();
    }

    // GET active borrowings by user ID
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<Borrowing>> getUserActiveBorrowings(@PathVariable Long userId) {
        Optional<User> user = userService.getUserById(userId);
        if (user.isPresent()) {
            List<Borrowing> borrowings = borrowingService.getUserActiveBorrowings(user.get());
            return ResponseEntity.ok(borrowings);
        }
        return ResponseEntity.notFound().build();
    }

    // CHECK if user can borrow more books
    @GetMapping("/user/{userId}/can-borrow")
    public ResponseEntity<Map<String, Boolean>> canUserBorrow(@PathVariable Long userId) {
        Optional<User> user = userService.getUserById(userId);
        Map<String, Boolean> response = new HashMap<>();

        if (user.isPresent()) {
            boolean canBorrow = borrowingService.canUserBorrow(user.get());
            response.put("canBorrow", canBorrow);
            return ResponseEntity.ok(response);
        }

        response.put("canBorrow", false);
        return ResponseEntity.ok(response);
    }

    // BORROW a book
    @PostMapping("/borrow")
    public ResponseEntity<?> borrowBook(@RequestParam Long userId, @RequestParam Long bookId) {
        try {
            Optional<User> user = userService.getUserById(userId);
            Optional<Book> book = bookService.getBookById(bookId);

            if (user.isPresent() && book.isPresent()) {
                Borrowing borrowing = borrowingService.borrowBook(user.get(), book.get());
                return ResponseEntity.ok(borrowing);
            }
            return ResponseEntity.badRequest().body("User or book not found");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // RETURN a book
    @PostMapping("/return/{borrowingId}")
    public ResponseEntity<?> returnBook(@PathVariable Long borrowingId) {
        try {
            Borrowing borrowing = borrowingService.returnBook(borrowingId);
            return ResponseEntity.ok(borrowing);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET overdue borrowings
    @GetMapping("/overdue")
    public ResponseEntity<List<Borrowing>> getOverdueBorrowings() {
        List<Borrowing> borrowings = borrowingService.getOverdueBorrowings();
        return ResponseEntity.ok(borrowings);
    }

    // GET borrowing by ID
    @GetMapping("/{id}")
    public ResponseEntity<Borrowing> getBorrowingById(@PathVariable Long id) {
        Optional<Borrowing> borrowing = borrowingService.getBorrowingById(id);
        return borrowing.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}