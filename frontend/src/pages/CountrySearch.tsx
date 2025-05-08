import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import api from '../utils/axios';
import { Link } from 'react-router-dom';

interface Country {
  name: string;
  capital: string;
  currency: string;
  flag: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  likes: number;
  createdAt: string;
}

const CountrySearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [country, setCountry] = useState<Country | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const searchCountry = async () => {
      if (!searchTerm.trim()) {
        setCountry(null);
        setPosts([]);
        return;
      }

      setLoading(true);
      try {
        const [countryResponse, postsResponse] = await Promise.all([
          api.get(`/countries/${searchTerm}`),
          api.get(`/posts/country/${searchTerm}`)
        ]);
        setCountry(countryResponse.data);
        setPosts(postsResponse.data);
        setError('');
      } catch (error) {
        setError('Country not found');
        setCountry(null);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCountry, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className="container">
      <h2 className="mb-4">Search Countries</h2>
      <Form className="mb-4">
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Enter country name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>
      </Form>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {error && <div className="text-danger mb-4">{error}</div>}

      {country && (
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex align-items-center">
              <img
                src={country.flag}
                alt={`${country.name} flag`}
                style={{ width: '100px', marginRight: '20px' }}
              />
              <div>
                <h3>{country.name}</h3>
                <p className="mb-1">Capital: {country.capital}</p>
                <p className="mb-0">Currency: {country.currency}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {posts.length > 0 && (
        <>
          <h3 className="mb-4">Posts about {country?.name}</h3>
          <Row>
            {posts.map((post) => (
              <Col key={post.id} md={6} lg={4}>
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
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default CountrySearch; 