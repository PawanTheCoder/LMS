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
        return null;
    }
    
    public List<Borrowing> getUserBorrowings(User user) {
        return borrowingRepository.findByUserOrderByBorrowDateDesc(user);
    }
    
    public List<Borrowing> getUserActiveBorrowings(User user) {
        return borrowingRepository.findByUserAndStatus(user, BorrowStatus.BORROWED);
    }
    
    public List<Borrowing> getUserBorrowingHistory(User user) {
        return borrowingRepository.findByUserOrderByBorrowDateDesc(user);
    }
    
    public List<Borrowing> getOverdueBorrowings() {
        return borrowingRepository.findOverdueBorrowings(LocalDateTime.now());
    }
    
    public Optional<Borrowing> getBorrowingById(Long id) {
        return borrowingRepository.findById(id);
    }
    
    public List<Borrowing> getAllBorrowings() {
        return borrowingRepository.findAll();
    }
}
