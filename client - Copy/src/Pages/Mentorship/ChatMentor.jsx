import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoArrowBack } from "react-icons/io5";
import HomeLayout from "../../layouts/HomeLayout";
import AuthPage from "./AuthPage";
import './chat.css';
import React from 'react';

function JoinChat() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleAuth = async (userData) => {
    try {
      console.log('Sending user data:', userData);

      const response = await axios.post('http://localhost:8000/chat/token', {
        userId: userData.userId,
        username: userData.username,
        groupName: userData.groupName
      });

      console.log('Server Response:', response.data);

      if (response.data && response.data.appId) {
        const userInfo = {
          userId: userData.userId,
          username: userData.username,
          token: response.data.session || null,
          channelUrl: response.data.channelUrl,
          isExisting: response.data.isExisting
        };

        if (userInfo.isExisting) {
          toast.info(`Welcome back, ${userData.username}!`);
        } else {
          toast.success(`Welcome, ${userData.username}!`);
        }

        navigate('/ChatsPage', {
          state: {
            user: userInfo
          }
        });
      } else {
        toast.error('Failed to connect to chat server');
      }
    } catch (error) {
      console.error('Error getting chat token:', error);
      if (error.response?.data?.message === 'Username already taken') {
        toast.error('This username is already in use. Please choose another one.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to connect to chat');
      }
      throw error;
    }
  };

  return (
    <HomeLayout>
      <div className="relative">
        {/* Back button */}
        <button 
          onClick={handleBack}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IoArrowBack size={20} />
          <span>Back</span>
        </button>

        <div className="chat-container">
          <AuthPage onAuth={handleAuth} />
        </div>
      </div>
    </HomeLayout>
  );
}

export default JoinChat;