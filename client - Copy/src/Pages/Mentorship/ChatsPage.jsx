import React from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { App as SendbirdApp } from "@sendbird/uikit-react";
import { IoArrowBack } from "react-icons/io5";
import HomeLayout from "../../layouts/HomeLayout";
import "@sendbird/uikit-react/dist/index.css";

function ChatsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    navigate('/chat-mentor');
    return null;
  }

  return (
    <HomeLayout>
      <div className="relative h-screen">
        {/* Back button */}
        <button 
          onClick={handleBack}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IoArrowBack size={20} />
          <span>Back</span>
        </button>

        <div className="h-[calc(100vh-64px)]">
          <SendbirdApp
            appId="2A230D68-C679-4077-8FEB-AB1ED1CEB8F5"
            userId={user.userId}
            nickname={user.username}
            accessToken={user.token}
            defaultChannelUrl={user.channelUrl}
          />
        </div>
      </div>
    </HomeLayout>
  );
}

export default ChatsPage;
