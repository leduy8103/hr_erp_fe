import React, { useState, useEffect } from 'react';
import '../assets/styles/ChatBox.css';
// filepath: c:\Users\Crims\Documents\Src code FE\hr_erp_fe\src\components\ChatBox.js
import { 
  sendMessage, 
  getMessages, 
  getAllEmployees,
  socket // Import the socket directly
} from '../services/chatService';

const ChatBox = () => {
  const [isSending, setIsSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isOpen, setIsOpen] = useState(true); // Set default to true to keep chat open
  
  // Define fetchEmpData function inside the component scope
  const fetchEmpData = async () => {
    try {
      const response = await getAllEmployees();
      console.log("Employees response:", response);
      
      if (response.success && Array.isArray(response.data)) {
        // Process employees to handle missing data
        const processedEmployees = response.data.map(emp => ({
          ...emp,
          full_name: emp.full_name || emp.name || emp.email || 'Unknown User',
          position: emp.position || 'No position',
          id: emp.id || 'unknown'
        }));
        
        setEmployees(processedEmployees);
        console.log("Processed employees:", processedEmployees);
      } else {
        console.error('Employees data is not an array:', response);
        setEmployees([]); 
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]); 
    }
  };
  
  // Fetch lịch sử tin nhắn
  const loadChatHistory = async (user1Id, user2Id) => {
    try {
      console.log(`Loading chat history between ${user1Id} and ${user2Id}`);
      const response = await getMessages(user1Id, user2Id);
      if (response.success && Array.isArray(response.data)) {
        console.log("Chat history loaded:", response.data.length, "messages");
        setMessages(response.data);
      } else {
        console.error('Messages data is not an array:', response);
        setMessages([]); // Đảm bảo messages luôn là array
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]); // Đảm bảo messages luôn là array khi có lỗi
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedEmployee || !currentUser) {
      console.warn("Cannot send message - missing data:", { 
        hasMessage: !!newMessage.trim(), 
        hasEmployee: !!selectedEmployee, 
        hasCurrentUser: !!currentUser 
      });
      return;
    }

    setIsSending(true);
    console.log("Sending message to:", selectedEmployee.id);
  
    const messageData = {
      sender_id: currentUser,
      receiver_id: selectedEmployee.id,
      message: newMessage.trim()
    };
    
    // Hiển thị tin nhắn ngay lập tức ở phía người gửi
    const tempMessage = {
      ...messageData,
      id: 'temp-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    
    // Update UI immediately
    setMessages((prev) => {
      const newMessages = Array.isArray(prev) ? [...prev, tempMessage] : [tempMessage];
      return newMessages;
    });
    setNewMessage('');
  
    // Send the message via service
    try {
      // Make sure socket is connected before sending
      if (!socket.connected) {
        console.log("Socket not connected, attempting to connect...");
        socket.connect();
        
        // Wait a bit for connection
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const response = await sendMessage(messageData);
      console.log("Message send response:", response);
      
      if (!response.success) {
        console.error('Error sending message:', response.message);
        // You might want to show an error to the user here
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle errors, maybe show a notification to the user
    } finally {
      setIsSending(false);
    }
  };

  // Get employees on component mount
  useEffect(() => {
    fetchEmpData();
  }, []);
  
  // useEffect: Load chat history when employee is selected
  useEffect(() => {
    if (selectedEmployee && currentUser) {
      console.log(`Selected employee changed, loading chat with: ${selectedEmployee.id}`);
      loadChatHistory(currentUser, selectedEmployee.id);
    }
  }, [selectedEmployee, currentUser]);
  
  // useEffect: Initialize socket and listen for events
  useEffect(() => {
    console.log("ChatBox component mounted - initializing socket");
    
    // Parse user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData.user?.id || userData.id;
    const userName = userData.user?.full_name || userData.full_name;
    setCurrentUser(userId);
    
    if (!userId) {
      console.error("No user ID found in localStorage");
      return; // Exit early if no user ID
    }
    
    // Define event handlers
    const handleConnect = () => {
      console.log("Socket connected in ChatBox component", socket.id);
      setSocketConnected(true);
      
      // Send join event on connection with user data
      socket.emit('join', { id: userId, name: userName });
      console.log("Join event emitted for user:", userId);
    };
    
    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    };
    
    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    };
    
    // Message handlers
    const handleReceiveMessage = (message) => {
      console.log('New message received:', message);
      setMessages((prev) => {
        if (!Array.isArray(prev)) return [message];
        return [...prev, message];
      });
    };
    
    const handleUserList = (users) => {
      console.log('Online users updated:', users);
      setEmployees((prevEmployees) => {
        if (!Array.isArray(prevEmployees)) return [];
        return prevEmployees.map((employee) => ({
          ...employee,
          isOnline: Array.isArray(users) && users.some((user) => user.id === employee.id)
        }));
      });
    };
    
    // Register all event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userList', handleUserList);
    
    // If socket is already connected, manually trigger connect handler
    if (socket.connected) {
      handleConnect();
    } else {
      // Try to connect if not already connected
      console.log("Socket not connected, attempting to connect...");
      socket.connect();
    }
    
    // Cleanup function
    return () => {
      console.log("ChatBox component unmounting, cleaning up socket listeners");
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userList', handleUserList);
      
      // Don't disconnect socket here, as it may be used elsewhere
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '700px',
      boxShadow: '0 0 10px rgba(0,0,0,0.2)',
      borderRadius: '8px',
      overflow: 'hidden',
      zIndex: 1000,
      background: 'white'
    }}>
      <div 
        style={{
          background: '#007bff',
          color: 'white',
          padding: '10px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Chat {selectedEmployee ? `- ${selectedEmployee.full_name || 'Unknown'}` : ''}</span>
        {!socketConnected && <span style={{ color: 'yellow', marginLeft: '10px' }}>⚠️ Disconnected</span>}
        <span>{isOpen ? '▼' : '▲'}</span>
      </div>

      {isOpen && (
        <div style={{ display: 'flex', height: '400px', borderTop: '1px solid #eee' }}>
          <div className="employee-list" style={{ width: '30%', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
            <h4>Nhân viên</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {Array.isArray(employees) && employees.length > 0 ? (
                employees.map((employee) => (
                  <li
                    key={employee.id}
                    onClick={() => setSelectedEmployee(employee)}
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid #eee',
                      background: selectedEmployee?.id === employee.id ? '#e6f7ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {employee.full_name || 'Unknown'} - {employee.position || 'No position'}
                    <span style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: employee.isOnline ? 'green' : 'gray',
                      marginLeft: '5px'
                    }}></span>
                  </li>
                ))
              ) : (
                <li style={{ padding: '8px' }}>Không có nhân viên</li>
              )}
            </ul>
          </div>

          {selectedEmployee && (
            <div style={{ display: 'flex', flexDirection: 'column', width: '70%', height: '100%' }}>
              <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {Array.isArray(messages) && messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        alignSelf: msg.sender_id === currentUser ? 'flex-end' : 'flex-start',
                        background: msg.sender_id === currentUser ? '#dcf8c6' : '#f1f0f0',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        marginBottom: '8px',
                        maxWidth: '70%'
                      }}
                    >
                      {msg.message}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>Chưa có tin nhắn</div>
                )}
              </div>
              <div style={{ 
                display: 'flex', 
                padding: '10px',
                borderTop: '1px solid #eee' 
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button 
                  onClick={handleSendMessage} 
                  disabled={isSending}
                  style={{
                    marginLeft: '8px',
                    padding: '8px 16px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSending ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;