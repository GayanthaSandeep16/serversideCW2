import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import api from '../utils/axios';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  title: string;
  content: string;
  country: string;
  author: {
    username: string;
  };
  likes: number;
  createdAt: string;
}

const Home: React.FC = () => {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [recentResponse, popularResponse] = await Promise.all([
          api.get('/posts/recent'),
          api.get('/posts/popular')
        ]);
        setRecentPosts(recentResponse.data);
        setPopularPosts(popularResponse.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
          By {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
        </Card.Subtitle>
        <Card.Text>{post.content.substring(0, 150)}...</Card.Text>
        <div className="d-flex justify-content-between align-items-center">
          <Link to={`/post/${post.id}`} className="btn btn-primary">
            Read More
          </Link>
          <span className="text-muted">
            <i className="bi bi-heart-fill"></i> {post.likes} likes
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

      <h2 className="mb-4 mt-5">Popular Posts</h2>
      <Row>
        {popularPosts.map((post) => (
          <Col key={post.id} md={6} lg={4}>
            <PostCard post={post} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home; 