import React from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import TaskList from './TaskList';

const TasksPage = () => {
  const { projectId } = useParams();

  return (
    <Container className="py-4">
      <h2>Project Tasks</h2>
      <TaskList projectId={projectId} />
    </Container>
  );
};

export default TasksPage;
