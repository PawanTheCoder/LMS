import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children, requiredRole = null }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    if (!token) {
        // Not logged in, redirect to login page with the return url
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    if (requiredRole) {
        try {
            const decoded = jwtDecode(token);
            const userRole = decoded.role;

            if (userRole !== requiredRole) {
                // Role doesn't match, redirect to home page
                return <Navigate to="/" replace />;
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            return <Navigate to="/signin" replace />;
        }
    }

    return children;
};

export default PrivateRoute;