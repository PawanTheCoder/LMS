package com.example.Library_Management.service;

import com.example.Library_Management.entity.Borrowing;
import com.example.Library_Management.entity.User;
import com.example.Library_Management.entity.Book;
import com.example.Library_Management.entity.Borrowing.BorrowStatus;
import com.example.Library_Management.repository.BorrowingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BorrowingService {

    @Autowired
    private BorrowingRepository borrowingRepository;

    @Autowired
    private BookService bookService;

    public Borrowing borrowBook(User user, Book book) {
        // Check if book is available
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is not available for borrowing");
        }

        // Check if user can borrow more books
        if (!canUserBorrow(user)) {
            throw new RuntimeException("Cannot borrow more books. Please return your current books first.");
        }

        // Check if user already has this book borrowed
        if (borrowingRepository.existsByUserAndBookAndStatus(user, book, BorrowStatus.BORROWED)) {
            throw new RuntimeException("User has already borrowed this book");
        }

        // Create borrowing record
        Borrowing borrowing = new Borrowing(user, book);

        // Update book availability
        bookService.borrowBook(book.getId());

        return borrowingRepository.save(borrowing);
    }

    public Borrowing returnBook(Long borrowingId) {
        Optional<Borrowing> borrowingOpt = borrowingRepository.findById(borrowingId);
        if (borrowingOpt.isPresent()) {
            Borrowing borrowing = borrowingOpt.get();
            borrowing.setStatus(BorrowStatus.RETURNED);
            borrowing.setReturnDate(LocalDateTime.now());

            // Update book availability
            bookService.returnBook(borrowing.getBook().getId());

            return borrowingRepository.save(borrowing);
        }
        throw new RuntimeException("Borrowing record not found");
    }

    public List<Borrowing> getUserBorrowings(User user) {
        return borrowingRepository.findByUserOrderByBorrowDateDesc(user);
    }

    public List<Borrowing> getUserActiveBorrowings(User user) {
        return borrowingRepository.findByUserAndStatus(user, BorrowStatus.BORROWED);
    }

    public List<Borrowing> getOverdueBorrowings() {
        return borrowingRepository.findOverdueBorrowings(LocalDateTime.now());
    }

    public List<Borrowing> getAllBorrowings() {
        return borrowingRepository.findAll();
    }

    public Optional<Borrowing> getBorrowingById(Long id) {
        return borrowingRepository.findById(id);
    }

    // NEW METHOD: Check if user can borrow more books
    public boolean canUserBorrow(User user) {
        Long activeBorrowingsCount = borrowingRepository.countActiveBorrowingsByUser(user);
        // Allow borrowing only if user has no active borrowings
        return activeBorrowingsCount == 0;
    }

    // Alternative method if you want to allow multiple books with limit:
    /*
     * public boolean canUserBorrow(User user) {
     * Long activeBorrowingsCount =
     * borrowingRepository.countActiveBorrowingsByUser(user);
     * int maxBooksAllowed = 3; // Change this number as needed
     * return activeBorrowingsCount < maxBooksAllowed;
     * }
     */
}