import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Button, Form } from 'react-bootstrap';
import api from '../utils/axios';
import { Link } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  content: string;
  country: string;
  username: string;
  like_count: number | null;
  dislike_count: number | null;
  created_at: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'mostLiked' | 'mostCommented'>('newest');
  const postsPerPage = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/blogs/search', {
          params: {
            sortBy,
            page,
            limit: postsPerPage,
          },
        });

        setPosts(response.data);
        setHasMore(response.data.length === postsPerPage);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, sortBy]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as 'newest' | 'mostLiked' | 'mostCommented');
    setPage(1); // Reset to first page when sort changes
  };

  const getSectionTitle = () => {
    switch (sortBy) {
      case 'newest':
        return 'Recent Posts';
      case 'mostLiked':
        return 'Most Liked Posts';
      case 'mostCommented':
        return 'Most Commented Posts';
      default:
        return 'Posts';
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
          <div className="text-muted">
            <span className="me-3">
              <i className="bi bi-hand-thumbs-up-fill"></i> {post.like_count ?? 0}
            </span>
            <span>
              <i className="bi bi-hand-thumbs-down-fill"></i> {post.dislike_count ?? 0}
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{getSectionTitle()}</h2>
        <Form.Select
          style={{ width: '200px' }}
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="newest">Recent</option>
          <option value="mostLiked">Most Liked</option>
          <option value="mostCommented">Most Commented</option>
        </Form.Select>
      </div>

      {posts.length === 0 && (
        <div className="alert alert-info">No posts to display.</div>
      )}

      <Row>
        {posts.map((post) => (
          <Col key={post.id} xs={12} md={6} lg={4}>
            <PostCard post={post} />
          </Col>
        ))}
      </Row>

      {posts.length > 0 && (
        <div className="d-flex justify-content-between mb-5">
          <Button
            variant="outline-primary"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button
            variant="outline-primary"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;