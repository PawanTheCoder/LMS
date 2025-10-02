package com.example.Library_Management.dto;

import java.time.LocalDateTime;

public class BorrowingDTO {

    private Long id;
    private Long userId;
    private String username;
    private Long bookId;
    private String bookTitle;
    private String status;
    private LocalDateTime borrowDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;

    // Constructor
    public BorrowingDTO(Long id, Long userId, String username, Long bookId, String bookTitle,
            String status, LocalDateTime borrowDate, LocalDateTime dueDate, LocalDateTime returnDate) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.status = status;
        this.borrowDate = borrowDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public Long getBookId() {
        return bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getBorrowDate() {
        return borrowDate;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public LocalDateTime getReturnDate() {
        return returnDate;
    }
}
