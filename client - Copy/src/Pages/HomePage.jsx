import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { BsCashStack, BsArrowRight } from 'react-icons/bs';
import { motion } from 'framer-motion';

import HomeImage from "../assets/Images/homeImage.png";
import option1 from "../assets/Json/option1.json";
import Particle from "../components/Particle";
import HomeLayout from "../layouts/HomeLayout";
import axiosInstance from "../helpers/AxiosInstance";

// Featured funding schemes for homepage
const FEATURED_SCHEMES = [
  {
    name: "MUDRA Loan Scheme",
    description: "Financial support for micro enterprises with loans up to ₹10 lakhs",
    amount: "Up to ₹10 lakhs",
    category: "Micro Enterprises",
    icon: "💰"
  },
  {
    name: "Stand-Up India Scheme",
    description: "Empowering SC/ST and women entrepreneurs with business loans",
    amount: "₹10 lakhs to ₹1 crore",
    category: "SC/ST/Women Entrepreneurs",
    icon: "🚀"
  },
  {
    name: "Credit Guarantee Fund",
    description: "Supporting MSMEs with credit guarantee coverage",
    amount: "Up to ₹2 crores",
    category: "Small & Medium Enterprises",
    icon: "🏦"
  }
];

const HomePage = () => {
  const { data } = useSelector((state) => state.auth);
  const [subscribedCourses, setSubscribedCourses] = useState([]);

  useEffect(() => {
    // Fetch user's subscribed courses
    const fetchSubscribedCourses = async () => {
      try {
        const response = await axiosInstance.get('/course/subscribed');
        setSubscribedCourses(response.data.courses);
      } catch (error) {
        console.error("Failed to fetch subscribed courses:", error);
      }
    };

    if (data) {
      fetchSubscribedCourses();
    }
  }, [data]);

  return (
    <HomeLayout>
      <Particle option={option1} />
      <div className="h-screen flex lg:px-8 px-4 pb-8 lg:pb-0 flex-col lg:flex-row justify-around items-center bg-white">
        <div className="lg:px-4 md:px-4 space-y-8 lg:w-1/2 text-gray-800">
          <h1 className="lg:text-5xl text-3xl font-bold">
            Discover the Best{" "}
            <span className="text-yellow-500 font-bold">Online Courses</span>
          </h1>
          <p className="text-gray-600 lg:text-xl tracking-wider">
            Explore our extensive library of courses taught by expert
            instructors at affordable prices.
          </p>
          <div className="flex gap-4 lg:flex-row md:flex-row items-center">
            <Link to={"/courses"} className="w-fit">
              <button className="rounded-md lg:w-48 md:w-48 w-36 py-2 lg:text-lg md:text-lg font-semibold bg-yellow-500 hover:bg-yellow-400 transition-all ease-in-out duration-300 text-white border-2 border-transparent hover:border-yellow-500 cursor-pointer">
                Explore Courses
              </button>
            </Link>
            <Link to={"/mentor-home"} className="w-fit">
              <button className="rounded-md lg:w-48 md:w-48 w-36 py-2 lg:text-lg md:text-lg font-semibold bg-transparent text-yellow-500 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-white transition-all ease-in-out duration-300 cursor-pointer">
                Mentorship
              </button>
            </Link>
          </div>
        </div>
        <div>
          <img
            src={HomeImage}
            alt="image"
            className="bg-transparent w-full h-full rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Funding Schemes Section */}
      <div className="min-h-[60vh] bg-gradient-to-b from-white to-gray-50 py-16 px-4 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">Business Funding Schemes</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover government-backed funding opportunities to help grow your business. Access loans, 
                grants, and financial support tailored for entrepreneurs.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_SCHEMES.map((scheme, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 relative overflow-hidden group"
              >
                <div className="text-4xl mb-4">{scheme.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{scheme.name}</h3>
                <p className="text-gray-600 mb-4">{scheme.description}</p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Amount:</span>{" "}
                    <span className="text-green-600 font-semibold">{scheme.amount}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Category:</span>{" "}
                    <span className="text-blue-600">{scheme.category}</span>
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-16 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    to="/dashboard/funding-schemes" 
                    className="flex items-center text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Learn More <BsArrowRight className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link 
              to="/dashboard/funding-schemes"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
            >
              <BsCashStack className="text-xl" />
              <span>View All Funding Schemes</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* My Courses Section */}
      {data && subscribedCourses.length > 0 && (
        <div className="min-h-[90vh] pt-12 px-4 lg:px-20">
          <h2 className="text-3xl font-bold mb-8 text-center">My Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscribedCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={course.thumbnail.secure_url} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <Link 
                    to={`/course/${course._id}/lectures`}
                    className="bg-primary text-white px-4 py-2 rounded-md inline-block hover:bg-primary-dark transition-colors"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </HomeLayout>
  );
};

export default HomePage;
