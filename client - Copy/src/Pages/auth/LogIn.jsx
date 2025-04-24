import Cookies from "js-cookie";
import { useState } from "react";
import { BsEnvelope, BsLock } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import option2 from "../../assets/Json/option2.json";
import Particle from "../../components/Particle";
import HomeLayout from "../../layouts/HomeLayout";
import { forgotPassword, login } from "../../redux/slices/AuthSlice";
function LogIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = import.meta.env.VITE_TOKEN;
  const [logInData, setLogInData] = useState({
    email: "",
    password: "",
  });
  function handleUserInput(e) {
    const { name, value } = e.target;
    setLogInData({ ...logInData, [name]: value });
  }

  async function onLogin(event) {
    event.preventDefault();
    const response = await dispatch(login(logInData));
    if (response.payload?.success) {
      navigate("/");
      setLogInData({
        email: "",
        password: "",
      });
      Cookies.set("authToken", token, { expires: 7 });
    }
  }

  async function onForgotPassword() {
    const response = await dispatch(forgotPassword({ email: logInData.email }));
    if (response.payload?.success) {
      setLogInData({
        email: "",
        password: "",
      });
    }
  }

  return (
    <HomeLayout>
      <Particle option={option2} />
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50 px-4">
        <form
          onSubmit={onLogin}
          className="w-full max-w-[450px] p-8 flex flex-col gap-6 rounded-xl bg-white shadow-lg"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Please log in to access your account
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center w-full gap-4 border border-gray-200 px-4 rounded-lg h-14 bg-gray-50 focus-within:border-gray-400 focus-within:bg-white transition-all">
              <label htmlFor="email" className="text-xl text-gray-500">
                <BsEnvelope />
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                className="w-full h-full text-base text-gray-900 bg-transparent border-0 outline-none placeholder:text-gray-400"
                value={logInData.email}
                onChange={handleUserInput}
              />
            </div>

            <div className="flex items-center w-full gap-4 border border-gray-200 px-4 rounded-lg h-14 bg-gray-50 focus-within:border-gray-400 focus-within:bg-white transition-all">
              <label htmlFor="password" className="text-xl text-gray-500">
                <BsLock />
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                className="w-full h-full text-base text-gray-900 bg-transparent border-0 outline-none placeholder:text-gray-400"
                value={logInData.password}
                onChange={handleUserInput}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Log In
          </button>

          <div className="flex items-center justify-between text-sm">
            <p
              onClick={onForgotPassword}
              className="text-gray-600 hover:text-gray-900 cursor-pointer hover:underline"
            >
              Forgot Password?
            </p>
            <Link
              to={"/signup"}
              className="text-gray-900 font-medium hover:underline"
            >
              Create Account
            </Link>
          </div>
        </form>

        <p className="mt-6 text-base text-gray-900">
          Don't have an account?{" "}
          <Link
            to={"/signup"}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </HomeLayout>
  );
}

export default LogIn;
