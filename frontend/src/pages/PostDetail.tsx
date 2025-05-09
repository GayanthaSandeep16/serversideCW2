import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Form, ListGroup } from 'react-bootstrap';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  country: string;
  date_of_visit: string;
  flag: string;
  currency: string;
  capital: string;
  created_at: string;
  username: string;
  like_count: number | null;
  dislike_count: number | null;
}

interface Comment {
  id: number;
  user_id: number;
  content: string;
  username: string;
  created_at: string;
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState<boolean | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState<Partial<Post>>({
    title: '',
    content: '',
    country: '',
    date_of_visit: ''
  });

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${id}`);
      setPost(response.data);
      setEditedPost({
        title: response.data.title,
        content: response.data.content,
        country: response.data.country,
        date_of_visit: response.data.date_of_visit
      });
      await Promise.all([
        fetchComments(),
        fetchUserLike()
      ]);
    } catch (err) {
      setError('Failed to load post. Please try again later.');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLike = async () => {
    try {
      const response = await api.get(`/blogs/${id}/likes`);
      const userLike = response.data.find((like: any) => like.user_id === parseInt(user?.id || '0'));
      setIsLiked(userLike ? userLike.is_like : undefined);
    } catch (err) {
      console.error('Error fetching user like:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/blogs/${id}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLikeClick = async () => {
    try {
      if (isLiked === true) {
        await api.delete('/blogs/like', { data: { postId: id } });
        setIsLiked(undefined);
      } else {
        await api.post('/blogs/like', { postId: id, isLike: true });
        setIsLiked(true);
      }
      fetchPost();
    } catch (err) {
      console.error('Error handling like:', err);
    }
  };

  const handleDislikeClick = async () => {
    try {
      if (isLiked === false) {
        await api.delete('/blogs/like', { data: { postId: id } });
        setIsLiked(undefined);
      } else {
        await api.post('/blogs/like', { postId: id, isLike: false });
        setIsLiked(false);
      }
      fetchPost();
    } catch (err) {
      console.error('Error handling dislike:', err);
    }
  };

  const handleComment = async () => {
    try {
      if (!newComment.trim()) return;

      await api.post('/blogs/comment', {
        postId: id,
        content: newComment
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete('/blogs/comment', { data: { commentId } });
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleEditPost = async () => {
    try {
      await api.put('/blogs', {
        postId: id,
        title: editedPost.title,
        content: editedPost.content,
        country: editedPost.country,
        dateOfVisit: editedPost.date_of_visit
      });
      setIsEditing(false);
      fetchPost();
    } catch (err) {
      console.error('Error editing post:', err);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete('/blogs', { data: { postId: id } });
        navigate('/');
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!post) {
    return <div className="container mt-5">Post not found</div>;
  }

  return (
    <div className="container mt-4">
      <Button variant="outline-primary" className="mb-4" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left"></i> Back
      </Button>

      <Card>
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <Card.Img
            variant="top"
            src={post.flag}
            alt={`${post.country} flag`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <Card.Body>
          {isEditing ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editedPost.title}
                  onChange={(e) => setEditedPost(prev => ({ ...prev, title: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={editedPost.content}
                  onChange={(e) => setEditedPost(prev => ({ ...prev, content: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  value={editedPost.country}
                  onChange={(e) => setEditedPost(prev => ({ ...prev, country: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date of Visit</Form.Label>
                <Form.Control
                  type="date"
                  value={editedPost.date_of_visit}
                  onChange={(e) => setEditedPost(prev => ({ ...prev, date_of_visit: e.target.value }))}
                />
              </Form.Group>
              <div className="mt-2">
                <Button variant="primary" onClick={handleEditPost} className="me-2">
                  Save
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </Form>
          ) : (
            <>
              <Card.Title>{post.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Posted by {post.username} on {new Date(post.created_at).toLocaleDateString()}
              </Card.Subtitle>
              <Card.Text>{post.content}</Card.Text>

              <div className="mt-3">
                <h6>Travel Details</h6>
                <p><strong>Country:</strong> {post.country}</p>
                <p><strong>Capital:</strong> {post.capital}</p>
                <p><strong>Currency:</strong> {post.currency}</p>
                <p><strong>Date of Visit:</strong> {new Date(post.date_of_visit).toLocaleDateString()}</p>
              </div>
            </>
          )}

          <div className="d-flex align-items-center mb-3">
            <Button
              variant={isLiked === true ? "primary" : "outline-primary"}
              size="sm"
              className="me-2"
              onClick={handleLikeClick}
            >
              <i className="bi bi-hand-thumbs-up"></i> {post.like_count ?? 0}
            </Button>
            <Button
              variant={isLiked === false ? "danger" : "outline-danger"}
              size="sm"
              className="me-2"
              onClick={handleDislikeClick}
            >
              <i className="bi bi-hand-thumbs-down"></i> {post.dislike_count ?? 0}
            </Button>

            {user && parseInt(user.id) === post.user_id && (
              <div className="ms-auto">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleDeletePost}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h5>Comments</h5>
            <ListGroup className="mb-3">
              {comments.map((comment) => (
                <ListGroup.Item key={comment.id} className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className="text-muted">{comment.username}</small>
                    <p className="mb-0">{comment.content}</p>
                    <small className="text-muted">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  {user && parseInt(user.id) === comment.user_id && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </Button>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>

            {user && (
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={handleComment}
                >
                  Post Comment
                </Button>
              </Form.Group>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PostDetail; 