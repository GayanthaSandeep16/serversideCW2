import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner, Pagination } from 'react-bootstrap';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: string;
  title: string;
  content: string;
  country: string;
  username: string;
  like_count: number | null;
  created_at: string;
  flag: string;
  currency: string;
  capital: string;
  date_of_visit: string;
}

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
    } catch (err) {
      setError('Failed to load your feed. Please try again later.');
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
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
                <div className="d-flex justify-content-between align-items-center">
                  <Button variant="primary" href={`/post/${post.id}`}>
                    Read More
                  </Button>
                  <span className="text-muted">
                    <i className="bi bi-heart-fill"></i> {post.like_count ?? 0} likes
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {posts.length > 0 && (
        <div className="d-flex justify-content-center LIFmt-4">
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