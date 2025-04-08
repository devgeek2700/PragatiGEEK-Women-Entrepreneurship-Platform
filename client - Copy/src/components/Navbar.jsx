import { BsShop } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { FaUserCog } from 'react-icons/fa';

{user?.role === "ADMIN" && (
    <Link 
        to="/admin/dashboard" 
        className="nav-link flex items-center gap-2 hover:text-primary transition-colors"
    >
        <FaUserCog className="text-lg" />
        <span>Admin Dashboard</span>
    </Link>
)}

{user?.role === "SELLER" && (
    <Link 
        to="/seller/dashboard" 
        className="nav-link flex items-center gap-2 hover:text-primary transition-colors"
    >
        <BsShop className="text-lg" />
        <span>Seller Dashboard</span>
    </Link>
)}

{isLoggedIn && (
    <Link 
        to="/courses/enrolled" 
        className="nav-link hover:text-primary transition-colors"
    >
        My Courses
    </Link>
)} 