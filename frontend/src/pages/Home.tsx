import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Button } from 'react-bootstrap';
import api from '../utils/axios';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  title: string;
  content: string;
  country: string;
  username: string;
  like_count: number | null;
  created_at: string;
}

const Home: React.FC = () => {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [recentPage, setRecentPage] = useState(1);
  const [popularPage, setPopularPage] = useState(1);
  const [hasMoreRecent, setHasMoreRecent] = useState(true);
  const [hasMorePopular, setHasMorePopular] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const [recentResponse, popularResponse] = await Promise.all([
          api.get('/blogs/search', {
            params: {
              sortBy: 'newest',
              page: recentPage,
              limit: 10,
            },
          }),
          api.get('/blogs/search', {
            params: {
              sortBy: 'mostLiked',
              page: popularPage,
              limit: 10,
            },
          }),
        ]);

        setRecentPosts(recentResponse.data);
        setPopularPosts(popularResponse.data);

        // Check if there are more posts to load
        setHasMoreRecent(recentResponse.data.length === 10);
        setHasMorePopular(popularResponse.data.length === 10);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [recentPage, popularPage]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const PostCard: React.FC<{ post: Post }> = ({ post }) => (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{post.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          By {post.username} • {new Date(post.created_at).toLocaleDateString()}
        </Card.Subtitle>
        <Card.Text>{post.content.substring(0, 150)}...</Card.Text>
        <div className="d-flex justify-content-between align-items-center">
          <Link to={`/post/${post.id}`} className="btn btn-primary">
            Read More
          </Link>
          <span className="text-muted">
            <i className="bi bi-heart-fill"></i> {post.like_count ?? 0} likes
          </span>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="container">
      <h2 className="mb-4">Recent Posts</h2>
      <Row>
        {recentPosts.map((post) => (
          <Col key={post.id} md={6} lg={4}>
            <PostCard post={post} />
          </Col>
        ))}
      </Row>
      <div className="d-flex justify-content-between mb-5">
        <Button
          variant="outline-primary"
          onClick={() => setRecentPage((prev) => Math.max(prev - 1, 1))}
          disabled={recentPage === 1}
        >
          Previous
        </Button>
        <span>Page {recentPage}</span>
        <Button
          variant="outline-primary"
          onClick={() => setRecentPage((prev) => prev + 1)}
          disabled={!hasMoreRecent}
        >
          Next
        </Button>
      </div>

      <h2 className="mb-4 mt-5">Popular Posts</h2>
      <Row>
        {popularPosts.map((post) => (
          <Col key={post.id} md={6} lg={4}>
            <PostCard post={post} />
          </Col>
        ))}
      </Row>
      <div className="d-flex justify-content-between mb-5">
        <Button
          variant="outline-primary"
          onClick={() => setPopularPage((prev) => Math.max(prev - 1, 1))}
          disabled={popularPage === 1}
        >
          Previous
        </Button>
        <span>Page {popularPage}</span>
        <Button
          variant="outline-primary"
          onClick={() => setPopularPage((prev) => prev + 1)}
          disabled={!hasMorePopular}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Home;