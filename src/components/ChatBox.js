import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../assets/styles/ChatBox.css';
import axios from 'axios';

const socket = io('http://localhost:3000'); // Thay bằng URL server của bạn

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    // Lấy danh sách nhân viên
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/chat/employees');
        setEmployees(response.data.employees);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };

    fetchEmployees();

    // Lắng nghe sự kiện từ server
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() && selectedEmployee) {
      const message = {
        sender_id: 'currentUserId', // Thay bằng ID người dùng hiện tại
        receiver_id: selectedEmployee.id, // ID của nhân viên được chọn
        content: newMessage,
      };

      socket.emit('sendMessage', message); // Gửi tin nhắn đến server
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className={`chat-box ${isOpen ? 'open' : ''}`}>
      <div className="chat-header" onClick={() => setIsOpen(!isOpen)}>
        Chat
      </div>
      {isOpen && (
        <div className="chat-body">
          <div className="employee-list">
            <h4>Danh sách nhân viên</h4>
            <ul>
              {employees.map((employee) => (
                <li
                  key={employee.id}
                  className={selectedEmployee?.id === employee.id ? 'selected' : ''}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  {employee.full_name} - {employee.position}
                </li>
              ))}
            </ul>
          </div>
          {selectedEmployee && (
            <>
              <div className="messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender_id === 'currentUserId' ? 'sent' : 'received'}`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;