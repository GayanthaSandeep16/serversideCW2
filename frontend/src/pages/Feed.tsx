import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner, Pagination, Form, ListGroup } from 'react-bootstrap';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

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
  like_count?: number;
  dislike_count?: number;
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
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({});
  const [dislikeCounts, setDislikeCounts] = useState<{ [key: number]: number }>({});
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
        fetchLikes(post.id);
        fetchComments(post.id);
      });
    } catch (err) {
      setError('Failed to load your feed. Please try again later.');
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async (postId: number) => {
    try {
      const response = await api.get(`/blogs/${postId}/likes`);
      const likes = response.data.filter((like: any) => like.is_like === true).length;
      const dislikes = response.data.filter((like: any) => like.is_like === false).length;
      setLikeCounts(prev => ({ ...prev, [postId]: likes }));
      setDislikeCounts(prev => ({ ...prev, [postId]: dislikes }));
      const userLike = response.data.find((like: any) => like.user_id === user?.id);
      setLikedPosts(prev => ({
        ...prev,
        [postId]: userLike ? userLike.is_like : undefined
      }));
    } catch (err) {
      console.error('Error fetching likes:', err);
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
        await api.delete('/blogs/like', { data: { postId } });
        setLikedPosts(prev => ({ ...prev, [postId]: undefined }));
      } else {
        await api.post('/blogs/like', { postId, isLike: true });
        setLikedPosts(prev => ({ ...prev, [postId]: true }));
      }
      fetchLikes(postId);
    } catch (err) {
      console.error('Error handling like:', err);
    }
  };

  const handleDislikeClick = async (postId: number) => {
    try {
      if (likedPosts[postId] === false) {
        await api.delete('/blogs/like', { data: { postId } });
        setLikedPosts(prev => ({ ...prev, [postId]: undefined }));
      } else {
        await api.post('/blogs/like', { postId, isLike: false });
        setLikedPosts(prev => ({ ...prev, [postId]: false }));
      }
      fetchLikes(postId);
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
                  >
                    <i className="bi bi-hand-thumbs-up"></i> {likeCounts[post.id] || 0}
                  </Button>
                  <Button
                    variant={likedPosts[post.id] === false ? "danger" : "outline-danger"}
                    size="sm"
                    className="me-2"
                    onClick={() => handleDislikeClick(post.id)}
                  >
                    <i className="bi bi-hand-thumbs-down"></i> {dislikeCounts[post.id] || 0}
                  </Button>
                  <Button variant="primary" size="sm" href={`/post/${post.id}`}>
                    Read More
                  </Button>
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