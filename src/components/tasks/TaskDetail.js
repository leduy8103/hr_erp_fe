import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Form, Row, Col, ListGroup, Alert, Spinner } from 'react-bootstrap';
import taskService from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import employeeService from '../../services/employeeService';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusOptions] = useState(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']);
  const [priorityOptions] = useState(['LOW', 'MEDIUM', 'HIGH']);
  const { token, user } = useAuth();
  const [assigneeName, setAssigneeName] = useState('');

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        const taskData = await taskService.getTaskById(taskId, token);
        setTask(taskData);

        if (taskData.user_id) {
          const name = await employeeService.getEmployeeNameById(taskData.user_id);
          setAssigneeName(name);
        }

        const commentsData = await taskService.getTaskComments(taskId, token);
        setComments(commentsData);
      } catch (err) {
        setError('Failed to load task details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [taskId, token]);

  const handleStatusChange = async (e) => {
    try {
      const newStatus = e.target.value;
      await taskService.updateTaskStatus(taskId, { status: newStatus }, token);
      setTask(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  const handlePriorityChange = async (e) => {
    try {
      const newPriority = e.target.value;
      await taskService.updateTaskPriority(taskId, { priority: newPriority }, token);
      setTask(prev => ({ ...prev, priority: newPriority }));
    } catch (err) {
      setError('Failed to update priority');
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData = {
        content: newComment,
        userId: user.id
      };
      const response = await taskService.addTaskComment(taskId, commentData, token);
      setComments([...comments, response]);
      setNewComment('');
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'info'
    };
    return colors[priority] || 'secondary';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      PENDING: 'secondary',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      BLOCKED: 'danger'
    };
    return colors[status] || 'light';
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!task) return <Alert variant="warning">Task not found</Alert>;

  return (
    <div className="task-detail">
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3>{task.title}</h3>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <p className="text-muted">Created by: {task.creator?.name} on {new Date(task.createdAt).toLocaleDateString()}</p>
              <div className="mb-4">
                <h5>Description</h5>
                <p>{task.description || 'No description provided'}</p>
              </div>
            </Col>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <div className="mb-3">
                    <strong>Status:</strong>
                    <Form.Select 
                      value={task.status} 
                      onChange={handleStatusChange}
                      className="mt-1"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Priority:</strong>
                    <Form.Select 
                      value={task.priority} 
                      onChange={handlePriorityChange}
                      className="mt-1"
                    >
                      {priorityOptions.map(priority => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Assigned to:</strong>
                    <p className="mt-1">{assigneeName || 'Unassigned'}</p>
                  </div>
                  
                  <div>
                    <strong>Due Date:</strong>
                    <p className="mt-1">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <hr />
          
          <h5>Comments</h5>
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            <ListGroup className="mb-3">
              {comments.map(comment => (
                <ListGroup.Item key={comment.id}>
                  <div className="d-flex justify-content-between">
                    <strong>{comment.user?.name}</strong>
                    <small>{new Date(comment.createdAt).toLocaleString()}</small>
                  </div>
                  <p className="mb-0 mt-1">{comment.content}</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          
          <Form onSubmit={handleCommentSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Add a comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit Comment
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TaskDetail;