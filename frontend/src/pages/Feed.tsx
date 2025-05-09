import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner, Pagination, Form, ListGroup } from 'react-bootstrap';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  content: string;
  country: string;
  username: string;
  created_at: string;
  flag: string;
  currency: string;
  capital: string;
  date_of_visit: string;
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

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean | undefined }>({});
  const postsPerPage = 10;

  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/blogs/feed', {
        params: {
          page,
          limit: postsPerPage,
        },
      });
      setPosts(response.data);
      setHasMore(response.data.length === postsPerPage);
      
      response.data.forEach((post: Post) => {
        fetchComments(post.id);
        fetchPostLikes(post.id);
      });
    } catch (err) {
      setError('Failed to load your feed. Please try again later.');
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostLikes = async (postId: number) => {
    try {
      const [likesResponse, userLikeResponse] = await Promise.all([
        api.get(`/blogs/${postId}`),
        api.get(`/blogs/${postId}/likes`)
      ]);
      
      const userLike = userLikeResponse.data.find((like: any) => like.user_id === user?.id);
      
      setLikedPosts(prev => ({
        ...prev,
        [postId]: userLike ? userLike.is_like : undefined
      }));

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              like_count: likesResponse.data.like_count,
              dislike_count: likesResponse.data.dislike_count
            }
          : post
      ));
    } catch (err) {
      console.error('Error fetching post likes:', err);
    }
  };

  const fetchComments = async (postId: number) => {
    try {
      const response = await api.get(`/blogs/${postId}/comments`);
      setComments(prev => ({
        ...prev,
        [postId]: response.data
      }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLikeClick = async (postId: number) => {
    try {
      if (likedPosts[postId] === true) {
        // Unlike
        await api.delete('/blogs/like', { data: { postId } });
      } else if (likedPosts[postId] === false) {
        // Change from dislike to like
        await api.delete('/blogs/like', { data: { postId } });
        await api.post('/blogs/like', { postId, isLike: true });
      } else {
        // New like
        await api.post('/blogs/like', { postId, isLike: true });
      }
      // Always fetch latest state from backend
      await fetchPostLikes(postId);
    } catch (err) {
      console.error('Error handling like:', err);
    }
  };

  const handleDislikeClick = async (postId: number) => {
    try {
      if (likedPosts[postId] === false) {
        // Undislike
        await api.delete('/blogs/like', { data: { postId } });
      } else if (likedPosts[postId] === true) {
        // Change from like to dislike
        await api.delete('/blogs/like', { data: { postId } });
        await api.post('/blogs/like', { postId, isLike: false });
      } else {
        // New dislike
        await api.post('/blogs/like', { postId, isLike: false });
      }
      // Always fetch latest state from backend
      await fetchPostLikes(postId);
    } catch (err) {
      console.error('Error handling dislike:', err);
    }
  };

  const handleComment = async (postId: number) => {
    try {
      const content = newComment[postId];
      if (!content?.trim()) return;

      await api.post('/blogs/comment', {
        postId,
        content
      });
      setNewComment(prev => ({
        ...prev,
        [postId]: ''
      }));
      fetchComments(postId);
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: number, postId: number) => {
    try {
      await api.delete('/blogs/comment', { data: { commentId } });
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId)
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts(currentPage);
    }
  }, [currentPage, user]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!user) {
    return (
      <div className="container text-center mt-5">
        <h3>Please log in to view your feed</h3>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mb-4">Your Feed</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {posts.length === 0 && !error && (
        <div className="alert alert-info">No posts to show. Follow some users to see their posts!</div>
      )}

      <Row>
        {posts.map((post) => (
          <Col key={post.id} md={6} lg={4}>
            <Card className="mb-4">
              <Card.Img
                variant="top"
                src={post.flag}
                alt={`${post.country} flag`}
                style={{ height: '100px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Posted by {post.username} in {post.country} on{' '}
                  {new Date(post.created_at).toLocaleDateString()}
                </Card.Subtitle>
                <Card.Text>{post.content.substring(0, 150)}...</Card.Text>
                
                <div className="d-flex align-items-center mb-3">
                  <Button
                    variant={likedPosts[post.id] === true ? "primary" : "outline-primary"}
                    size="sm"
                    className="me-2"
                    onClick={() => handleLikeClick(post.id)}
                    disabled={!user}
                  >
                    <i className="bi bi-hand-thumbs-up"></i> {post.like_count ?? 0}
                  </Button>
                  <Button
                    variant={likedPosts[post.id] === false ? "danger" : "outline-danger"}
                    size="sm"
                    className="me-2"
                    onClick={() => handleDislikeClick(post.id)}
                    disabled={!user}
                  >
                    <i className="bi bi-hand-thumbs-down"></i> {post.dislike_count ?? 0}
                  </Button>
                  <Link to={`/post/${post.id}`} className="btn btn-primary btn-sm">
                    Read More
                  </Link>
                </div>

                <div className="mt-3">
                  <h6>Comments</h6>
                  <ListGroup className="mb-3">
                    {comments[post.id]?.map((comment) => (
                      <ListGroup.Item key={comment.id} className="d-flex justify-content-between align-items-start">
                        <div>
                          <small className="text-muted">{comment.username}</small>
                          <p className="mb-0">{comment.content}</p>
                          <small className="text-muted">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        {comment.user_id === parseInt(user?.id || '0') && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id, post.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Write a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment(prev => ({
                        ...prev,
                        [post.id]: e.target.value
                      }))}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleComment(post.id)}
                    >
                      Post Comment
                    </Button>
                  </Form.Group>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {posts.length > 0 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            <Pagination.Item active={true}>{currentPage}</Pagination.Item>
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasMore}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Feed;