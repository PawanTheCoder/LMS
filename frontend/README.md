# Library Management System - Frontend

A modern, responsive library management system built with React 19, Vite, and modern web technologies.

## 🚀 Features

- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Responsive Design**: Mobile-first design that works on all devices
- **Authentication**: Complete user authentication and role-based access control
- **Book Management**: Add, edit, delete, and search books with advanced filtering
- **User Management**: Comprehensive user management with role assignments
- **Dashboard**: Real-time statistics and activity monitoring
- **Dark Theme**: Beautiful dark theme with customizable color scheme
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with latest features
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icon library
- **CSS Modules** - Scoped styling with CSS modules

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript** - Type checking (optional)
- **Vite** - Build tool and dev server

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run clean` - Clean build directory
- `npm run build:analyze` - Analyze bundle size

## 🏗️ Project Structure

```
src/
├── Components/           # React components
│   ├── Auth/            # Authentication components
│   ├── Dashboard/       # Dashboard components
│   ├── Books/           # Book management components
│   ├── Users/           # User management components
│   ├── ManageBooks/     # Book CRUD operations
│   ├── AboutDev/        # About page
│   ├── Navbar.jsx       # Navigation component
│   ├── ErrorBoundary.jsx # Error boundary
│   └── LoadingSpinner.jsx # Loading component
├── assets/              # Static assets
├── App.jsx             # Main app component
├── main.jsx            # Entry point
├── index.css           # Global styles
└── theme.css           # CSS variables and theming
```

## 🎨 Styling

The project uses CSS Modules for component-scoped styling with a comprehensive design system:

- **CSS Variables**: Centralized theming with CSS custom properties
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Theme**: Beautiful dark theme with light theme support
- **Consistent Spacing**: Standardized spacing scale
- **Typography**: Consistent font hierarchy and sizing

## 🔧 Configuration

### Vite Configuration
The project is configured with optimized Vite settings:
- Code splitting for better performance
- Tree shaking for smaller bundles
- Hot module replacement for development
- Path aliases for cleaner imports

### ESLint Configuration
Modern ESLint configuration with:
- React Hooks rules
- React Refresh plugin
- Recommended JavaScript rules

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Performance Optimizations

- **Code Splitting**: Automatic code splitting with React.lazy
- **Bundle Optimization**: Optimized chunk splitting for better caching
- **Tree Shaking**: Dead code elimination
- **Image Optimization**: Optimized image loading
- **CSS Optimization**: Minified and optimized CSS

## 🔒 Security Features

- **XSS Protection**: Proper input sanitization
- **CSRF Protection**: Secure form handling
- **Content Security Policy**: CSP headers
- **Secure Authentication**: JWT-based authentication

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📦 Build and Deployment

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Pawan Fuke** - Full Stack Developer
- **Mayur Darji** - Backend Developer  
- **Omkar Deshpande** - Frontend Developer

## 📞 Support

For support, email support@librarymanagement.com or create an issue in the repository.

---

Built with ❤️ by the development team