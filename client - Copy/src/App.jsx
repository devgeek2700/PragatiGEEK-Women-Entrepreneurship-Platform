import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import About from "./pages/About";
import LogIn from "./pages/auth/LogIn";
import RequiredAuth from "./pages/auth/RequiredAuth";
import SignUp from "./pages/auth/SignUp";
import UnprotectedRoute from "./pages/auth/UnprotectedRoute";
import Contact from "./pages/Contact";
import CourseDescription from "./pages/course/CourseDescription";
import CourseList from "./pages/course/CourseList";
import CreateCourse from "./pages/course/CreateCourse";
import EditCourse from "./pages/course/EditCourse";
import AddCourseLecture from "./pages/dashboard/AddCourseLecture";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import CourseLectures from "./pages/dashboard/CourseLectures";
import EditCourseLecture from "./pages/dashboard/EditCourseLecture";
import HomePage from "./Pages/HomePage";
import NotFound from "./Pages/NotFound";
import ChangePassword from "./pages/password/ChangePassword";
import ResetPassword from "./pages/password/ResetPassword";
import Checkout from "./Pages/payments/Checkout";
import CheckoutFail from "./Pages/payments/CheckoutFail";
import CheckoutSuccess from "./Pages/payments/CheckoutSuccess";
import Profile from "./pages/Profile";
import MentorHomr from "./Pages/Mentorship/MentorHome";
import Existbusform from "./Pages/Mentorship/Existbusform";
import Aspiringbusform from "./Pages/Mentorship/Aspiringbusform";
import MentorDetail from "./Pages/Mentorship/MentorDetail";
import MeetMentor from "./Pages/Mentorship/MeetMentor";
import ChatMentor from "./Pages/Mentorship/ChatMentor";
import AuthPage from "./Pages/Mentorship/AuthPage";
import ChatsPage from "./Pages/Mentorship/ChatsPage";
import SellerDashboard from "./Pages/dashboard/SellerDashboard";
import SellerEarnings from "./components/SellerEarnings";
import SellerOrders from "./Pages/user/SellerOrders";
import SellerProducts from "./Pages/SellerProducts";
import BuyerOrders from "./Pages/BuyerOrders";
import AddProduct from "./Pages/AddProduct";
import Shop from "./Pages/Shop";
import ProductDetail from "./Pages/ProductDetail";
import OrderedProduct from './Pages/OrderedProduct';
import EnrolledCourses from "./Pages/course/EnrolledCourses";
import FundingSchemes from "./Pages/dashboard/FundingSchemes";
// import PaymentSuccess from "./pages/payments/PaymentSuccess";
// import PaymentCancel from './pages/payments/PaymentCancel';

// import '@stream-io/stream-chat-css/dist/css/index.css';

function App() {
  const location = useLocation();
  useEffect(() => {
    const setTitle = () => {
      const path = location.pathname;
      if (path === "/") {
        document.title = "Learning Management System";
      } else if (path === "/about") {
        document.title = "About - Learning Management System";
      } else if (path === "/contact") {
        document.title = "Contact - Learning Management System";
      } else if (path === "/signup") {
        document.title = "Sign Up - Learning Management System";
      } else if (path === "/login") {
        document.title = "Log In - Learning Management System";
      } else if (path === "/courses") {
        document.title = "All courses - Learning Management System";
      } else if (path === "/course/description") {
        document.title = "Course description - Learning Management System";
      } else if (path === "/course/create") {
        document.title = "Create course - Learning Management System";
      } else if (path === "/admin/dashboard") {
        document.title = "Admin dashboard - Learning Management System";
      } else if (path === "/profile") {
        document.title = "Profile - Learning Management System";
      } else if (path === "/profile/changePassword") {
        document.title = "Change Password - Learning Management System";
      } else if (path === "/seller/dashboard") {
        document.title = "Seller Dashboard - Learning Management System";
      } else if (path === "/seller/earnings") {
        document.title = "Seller Earnings - Learning Management System";
      } else if (path === "/seller/products") {
        document.title = "Seller Products - Learning Management System";
      }
    };

    setTitle();
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="*" element={<NotFound />} />

        <Route path="/" element={<HomePage />} />

        <Route element={<UnprotectedRoute />}>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
        </Route>

        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mentor-home" element={<MentorHomr />} />
        <Route
          path="/mentor-home/exist-business-form"
          element={<Existbusform />}
        />

        <Route path="/mentor-list/:id" element={<MentorDetail />} />
        <Route path="/chat-mentor" element={<ChatMentor />} />
        <Route path="/AuthPage" element={<AuthPage />} />
        <Route path="/ChatsPage" element={<ChatsPage />} />
        <Route path="/meet-mentor" element={<MeetMentor />} />

        <Route
          path="/mentor-home/aspiring-user-form"
          element={<Aspiringbusform />}
        />

        <Route path="/courses" element={<CourseList />} />
        <Route path="/course/description" element={<CourseDescription />} />
        <Route element={<RequiredAuth allowedRole={["ADMIN", "USER", "SELLER"]} />}>
          <Route path="/course/create" element={<CreateCourse />} />
          <Route path="/course/:name/:id/editCourse" element={<EditCourse />} />
          <Route
            path="/course/:name/:id/lectures/addlecture"
            element={<AddCourseLecture />}
          />
          <Route
            path="/course/:name/:id/lectures/editlecture"
            element={<EditCourseLecture />}
          />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/course/:name/checkout" element={<Checkout />} />
          <Route path="/course/:name/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/course/:name/checkout/fail" element={<CheckoutFail />} />
          <Route path="/course/:name/:id/lectures" element={<CourseLectures />} />
          <Route path="/product/:id/checkout" element={<Checkout />} />
          <Route path="/product/:id/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/product/:id/checkout/fail" element={<CheckoutFail />} />
          <Route path="/courses/enrolled" element={<EnrolledCourses />} />
        </Route>
        <Route element={<RequiredAuth allowedRole={["ADMIN", "USER", "SELLER"]} />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/changePassword" element={<ChangePassword />} />
          <Route path="/orders" element={<BuyerOrders />} />
          <Route path="/shop" element={<Shop />} />
        </Route>
        <Route element={<RequiredAuth allowedRole={["SELLER"]} />}>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/earnings" element={<SellerEarnings />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/products/new" element={<AddProduct />} />
          <Route path="/dashboard/funding-schemes" element={<FundingSchemes />} />
        </Route>
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/product/order/:id" element={<OrderedProduct />} />
        {/* <Route path="/payment/success" element={<PaymentSuccess />} /> */}
        {/* <Route path="/payment/cancel" element={<PaymentCancel />} /> */}
      </Routes>
    </>
  );
}

export default App;
