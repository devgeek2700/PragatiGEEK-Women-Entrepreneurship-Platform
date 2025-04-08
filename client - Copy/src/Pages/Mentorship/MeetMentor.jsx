import * as React from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import HomeLayout from "../../layouts/HomeLayout";
import "./joinMeet.css";

function randomID(len) {
  let result = "";
  if (result) return result;
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
  const roomID = getUrlParams().get("roomID") || randomID(5);

  const handleBack = () => {
    navigate(-1);
  };

  let myMeeting = async (element) => {
    // generate Kit Token
    const appID = 1062543863;
    const serverSecret = "7fac88804bf696ccb14f5359f6154f54";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      randomID(5),
      randomID(5)
    );

    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // start the call
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: "Copy link",
          url:
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?roomID=" +
            roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
      },
    });
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
