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
        if (bookRepository.count() == 0) {
            createSampleBooks();
        }
    }

    private void createSampleBooks() {
        Book[] books = {
                new Book("The Great Gatsby", "F. Scott Fitzgerald", "978-0-7432-7356-5", "Fiction",
                        1925,
                        "A classic American novel about the Jazz Age", 1),
                new Book("To Kill a Mockingbird", "Harper Lee", "978-0-06-112008-4", "Fiction", 1960,
                        "A story of racial injustice and childhood innocence", 2),
                new Book("1984", "George Orwell", "978-0-452-28423-4", "Dystopian Fiction", 1949,
                        "A dystopian social science fiction novel", 1),
                new Book("Pride and Prejudice", "Jane Austen", "978-0-14-143951-8", "Romance", 1813,
                        "A romantic novel of manners", 2),
                new Book("The Catcher in the Rye", "J.D. Salinger", "978-0-316-76948-0", "Fiction",
                        1951,
                        "A coming-of-age story", 3),
                new Book("Lord of the Flies", "William Golding", "978-0-571-05686-5", "Fiction", 1954,
                        "A story about British boys stranded on an uninhabited island", 2),
                new Book("The Hobbit", "J.R.R. Tolkien", "978-0-547-92822-7", "Fantasy", 1937,
                        "A fantasy novel about a hobbit's adventure", 1),
                new Book("Harry Potter and the Philosopher's Stone", "J.K. Rowling",
                        "978-0-7475-3269-6", "Fantasy", 1997,
                        "The first book in the Harry Potter series", 1),
                new Book("The Chronicles of Narnia", "C.S. Lewis", "978-0-06-447119-0", "Fantasy", 1950,
                        "A series of fantasy novels", 1),
                new Book("The Alchemist", "Paulo Coelho", "978-0-06-112241-5", "Fiction", 1988,
                        "A philosophical novel about a young shepherd", 1),
                new Book("Naruto Shippuden", "Zeke yeager", "100-0-06-112241-5", "Manga", 2001,
                        "Manag on journey of naruto of becoming ninja", 1)
        };

        for (Book book : books) {
            book.setAvailableCopies(book.getTotalCopies());
            book.setRating(Math.random() * 5); // Random rating between 0-5
            bookRepository.save(book);
        }
    }
}