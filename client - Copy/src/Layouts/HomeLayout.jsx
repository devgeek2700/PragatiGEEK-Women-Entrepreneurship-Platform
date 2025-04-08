import Cookies from "js-cookie";
import { FiMenu } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BsShop, BsGraphUp, BsBoxSeam, BsCashStack } from 'react-icons/bs';

import { logout } from "../redux/slices/AuthSlice";

// Import the Particle component and options
import Particle from "../components/Particle";
import option2 from "../assets/Json/option2.json";

function HomeLayout({ children }) {
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
  const role = useSelector((state) => state?.auth?.role);
  const avatar = useSelector((state) => state?.auth?.data?.avatar?.secure_url);
  const name = useSelector((state) => state?.auth?.data?.name);
  const firstName = name ? name.split(" ")[0] : "";
  async function onLogout() {
    await dispatch(logout());
    Cookies.remove("authToken");
  }

  return (
    <div className="min-h-screen w-full bg-[#E5E7EB] relative">
      <Particle option={option2} />
      
      {/* Main drawer container */}
      <div className="drawer">
        {/* This is the hidden checkbox that controls the drawer */}
        <input id="drawer-sidebar" type="checkbox" className="drawer-toggle" />
        
        {/* Drawer content - the main page content */}
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <div className="w-full navbar bg-white shadow-sm">
            <div className="flex-none">
              {/* Hamburger button - must use htmlFor that matches the checkbox id */}
              <label htmlFor="drawer-sidebar" className="btn btn-square btn-ghost drawer-button">
                <FiMenu size={24} />
              </label>
            </div>
            <div className="flex-1 px-2">
              <Link to="/" className="text-xl font-bold">LMS</Link>
            </div>
          </div>
          
          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
        
        {/* Drawer sidebar - this slides in from the side */}
        <div className="drawer-side z-50">
          <label htmlFor="drawer-sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 min-h-full bg-white">
            {/* User profile section - only shown when logged in */}
            {isLoggedIn && (
              <div className="flex gap-3 items-center px-2 w-full mb-4">
                <img
                  src={avatar}
                  alt="profile photo"
                  className="w-10 h-10 rounded-full border border-gray-300"
                />
                <p className="text-sm text-gray-600 italic">
                  Welcome, <br />{" "}
                  <span className="font-semibold capitalize text-gray-800">
                    {firstName}
                  </span>
                </p>
              </div>
            )}

            {/* Admin Dashboard - only shown for admin users */}
            {isLoggedIn && role === "ADMIN" && (
              <li>
                <Link to={"/admin/dashboard"} className="hover:bg-gray-100">
                  Admin Dashboard
                </Link>
              </li>
            )}

            {/* Common navigation links - shown to all users */}
            <li>
              <Link to={"/"} className="hover:bg-gray-100">
                Home
              </Link>
            </li>
            <li>
              <Link to={"/courses"} className="hover:bg-gray-100">
                All Courses
              </Link>
            </li>
            <li>
              <Link to={"/contact"} className="hover:bg-gray-100">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to={"/mentor-home"} className="hover:bg-gray-100">
                Mentorship
              </Link>
            </li>
            <li>
              <Link to={"/about"} className="hover:bg-gray-100">
                About Us
              </Link>
            </li>

            {/* Logged-in user specific links */}
            {isLoggedIn && (
              <>
                <li>
                  <Link to={"/shop"} className="hover:bg-gray-100">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to={"/courses/enrolled"} className="hover:bg-gray-100">
                    My Courses
                  </Link>
                </li>
                <li>
                  <Link to={"/profile"} className="hover:bg-gray-100">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to={"/orders"} className="hover:bg-gray-100">
                    My Orders
                  </Link>
                </li>

                {/* Seller specific links */}
                {role === "SELLER" && (
                  <>
                    <li>
                      <Link to="/seller/dashboard" className="hover:bg-gray-100">
                        <BsShop className="text-xl" />
                        <span>Seller Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/seller/earnings" className="hover:bg-gray-100">
                        <BsCashStack className="text-xl" />
                        <span>Earnings</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/seller/orders" className="hover:bg-gray-100">
                        <BsBoxSeam className="text-xl" />
                        <span>Orders</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/seller/products" className="hover:bg-gray-100">
                        <BsBoxSeam className="text-xl" />
                        <span>Products</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/seller/analytics" className="hover:bg-gray-100">
                        <BsGraphUp className="text-xl" />
                        <span>Analytics</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard/funding-schemes" className="hover:bg-gray-100">
                        <BsCashStack className="text-xl" />
                        <span>Funding Schemes</span>
                      </Link>
                    </li>
                  </>
                )}

                {/* Logout button with updated styling */}
                <div className="mt-4 border-t pt-4">
                  <button 
                    onClick={onLogout} 
                    className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}

            {/* Login/Signup buttons for non-logged-in users */}
            {!isLoggedIn && (
              <div className="mt-auto border-t pt-4">
                <Link to={"/login"} className="w-full block mb-2">
                  <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                    Login
                  </button>
                </Link>
                <Link to={"/signup"} className="w-full block">
                  <button className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HomeLayout;
