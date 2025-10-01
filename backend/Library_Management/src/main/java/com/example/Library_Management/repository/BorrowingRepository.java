package com.example.Library_Management.repository;

import com.example.Library_Management.entity.Borrowing;
import com.example.Library_Management.entity.User;
import com.example.Library_Management.entity.Book;
import com.example.Library_Management.entity.Borrowing.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {

    // Basic CRUD operations
    List<Borrowing> findByUser(User user);

    List<Borrowing> findByUserAndStatus(User user, BorrowStatus status);

    List<Borrowing> findByBook(Book book);

    List<Borrowing> findByStatus(BorrowStatus status);

    // Custom queries
    @Query("SELECT b FROM Borrowing b WHERE b.user = :user ORDER BY b.borrowDate DESC")
    List<Borrowing> findByUserOrderByBorrowDateDesc(@Param("user") User user);

    @Query("SELECT b FROM Borrowing b WHERE b.dueDate < :currentDate AND b.status = 'BORROWED'")
    List<Borrowing> findOverdueBorrowings(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT COUNT(b) FROM Borrowing b WHERE b.user = :user AND b.status = 'BORROWED'")
    Long countActiveBorrowingsByUser(@Param("user") User user);

    boolean existsByUserAndBookAndStatus(User user, Book book, BorrowStatus status);
}