import * as React from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useNavigate, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import HomeLayout from "../../layouts/HomeLayout";
import "./joinMeet.css";

function randomID(len) {
  let result = "";
  var chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(url = window.location.href) {
  let urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}

export default function MeetMentor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const roomID = getUrlParams().get("roomID") || randomID(5);
  const [error, setError] = React.useState(null);

  const handleBack = () => {
    navigate(-1);
  };

  let myMeeting = async (element) => {
    try {
      // Using the new Zegocloud credentials
      const appID = 81276435;  // New App ID
      const serverSecret = "6447ff6fd2495d0918e5f595d513f091";  // New Server Secret
      
      // Generate a unique user ID and name (preferably from user's session/auth)
      const userID = state?.userId || randomID(5);
      const userName = state?.username || 'User_' + randomID(3);

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
        userID,
        userName
    );

      // Create instance object from Kit Token
    const zp = ZegoUIKitPrebuilt.create(kitToken);

      // Configure the meeting options
      const meetingConfig = {
      container: element,
      sharedLinks: [
        {
            name: "Copy meeting link",
            url: `${window.location.origin}${window.location.pathname}?roomID=${roomID}`,
        },
      ],
      scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
        showPreJoinView: true,  // Show preview before joining
        showScreenSharingButton: true,  // Enable screen sharing
        showUserList: true,  // Show participant list
        showTextChat: true,  // Enable chat
        showLayoutButton: true,  // Allow layout changes
        maxUsers: 50,  // Maximum participants
        layout: "Auto",  // Default layout
        showNonVideoUser: true,  // Show users without video
        showMyCameraToggleButton: true,  // Camera control
        showMyMicrophoneToggleButton: true,  // Microphone control
        showMyScreenSharingButton: true,  // Screen sharing control
        showAudioVideoSettingsButton: true,  // Device settings
      };

      // Join the room with configuration
      await zp.joinRoom(meetingConfig);
    } catch (err) {
      console.error("Failed to join video call:", err);
      setError("Failed to join video call. Please check your camera and microphone permissions.");
    }
  };

  return (
    <HomeLayout>
      <div className="relative">
        {/* Back button */}
        <button 
          onClick={handleBack}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IoArrowBack size={20} />
          <span>Back</span>
        </button>

        {/* Error message */}
        {error && (
          <div className="absolute top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Notes button */}
        <a href="/CreateNotes" className="float" target="_blank">
          <i className="fa fa-plus my-float"></i>
        </a>

        {/* Meeting container */}
        <div
          className="myCallContainer"
          ref={myMeeting}
          style={{ width: "100vw", height: "calc(100vh - 64px)" }}
        ></div>
      </div>
    </HomeLayout>
  );
}
