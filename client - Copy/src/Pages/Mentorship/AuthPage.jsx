import React, { useState } from "react";
import "./chat.css";
import { FaUser, FaUsers } from 'react-icons/fa'; // Import icons
import { toast } from 'react-toastify';

const AuthPage = (props) => {
  const [username, setUsername] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      return; // Don't submit if username is empty
    }

    setIsLoading(true);
    try {
      // Generate a consistent userId based on username
      const userId = username.toLowerCase().replace(/[^a-z0-9]/g, '-');

      const userData = {
        userId,
        username: username.trim(),
        groupName: groupName.trim() || 'General Chat', // Use default if no group name provided
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      };

      await props.onAuth(userData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h3 className="auth-title">Join Chat Group</h3>
        <form onSubmit={onSubmit} className="auth-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Your Name..."
              required
              className="auth-input"
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <FaUsers className="input-icon" />
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter Group Name (optional)"
              className="auth-input"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Join Chat'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
