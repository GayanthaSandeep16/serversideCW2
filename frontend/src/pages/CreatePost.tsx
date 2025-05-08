import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [country, setCountry] = useState('');
  const [dateOfVisit, setDateOfVisit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    setLoading(true);
    try {
      await api.post('/blogs', {
        title,
        content,
        country,
        dateOfVisit
      });
      navigate('/');
    } catch (error) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Card className="mt-4">
        <Card.Body>
          <h2 className="mb-4">Create New Post</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter post title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                placeholder="Enter country name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date of Visit</Form.Label>
              <Form.Control
                type="date"
                value={dateOfVisit}
                onChange={(e) => setDateOfVisit(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Write your travel story..."
              />
            </Form.Group>

            {error && <div className="text-danger mb-3">{error}</div>}

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreatePost; 