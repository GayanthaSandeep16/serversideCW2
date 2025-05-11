import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Spinner, Button, Tabs, Tab } from 'react-bootstrap';
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

interface CountryDetails {
  name: string;
  capital: string;
  flag: string;
  currency: {
    symbol: string;
    name: string;
  };
  languages: string[];
}

const CountrySearch: React.FC = () => {
  // Post Search States
  const [countryFilter, setCountryFilter] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const postsPerPage = 10;

  // Country Details Search States
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countryDetails, setCountryDetails] = useState<CountryDetails | null>(null);
  const [loadingCountry, setLoadingCountry] = useState(false);
  const [countrySearchInput, setCountrySearchInput] = useState('');
  const [showCountryDetailsSuggestions, setShowCountryDetailsSuggestions] = useState(false);
  const [filteredCountryDetails, setFilteredCountryDetails] = useState<string[]>([]);
  const [countriesError, setCountriesError] = useState(false);

  // Fetch all country names on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get('/countries/all');
        const countryNames = Array.isArray(response.data)
          ? response.data
          : response.data.map((c: any) => c.name);
        setCountries(countryNames.sort());
        setCountriesError(false);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountriesError(true);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries based on input for post search
  useEffect(() => {
    if (countryFilter.trim()) {
      const filtered = countries.filter(country =>
        country.toLowerCase().includes(countryFilter.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries([]);
    }
  }, [countryFilter, countries]);

  // Filter countries for details search
  useEffect(() => {
    if (countrySearchInput.trim()) {
      const filtered = countries.filter(country =>
        country.toLowerCase().includes(countrySearchInput.toLowerCase())
      );
      setFilteredCountryDetails(filtered);
    } else {
      setFilteredCountryDetails([]);
    }
  }, [countrySearchInput, countries]);

  // Fetch posts when filters or page changes
  useEffect(() => {
    const searchPosts = async () => {
      if (!countryFilter.trim() && !usernameFilter.trim()) {
        setPosts([]);
        setError('');
        return;
      }

      setLoading(true);
      try {
        const params: any = { page, limit: postsPerPage };
        if (countryFilter.trim()) {
          params.country = countryFilter;
        }
        if (usernameFilter.trim()) {
          params.username = usernameFilter;
        }

        const response = await api.get('/blogs/search', { params });
        setPosts(response.data);
        setHasMore(response.data.length === postsPerPage);
        setError('');
      } catch (error) {
        setError('No posts found matching your criteria');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchPosts, 500);
    return () => clearTimeout(debounceTimer);
  }, [countryFilter, usernameFilter, page]);

  const handleCountrySelect = (country: string) => {
    setCountryFilter(country);
    setShowCountrySuggestions(false);
  };

  const handleCountrySelectDetails = async (country: string) => {
    setSelectedCountry(country);
    setLoadingCountry(true);
    try {
      const response = await api.post('/countries/', { country });
      setCountryDetails(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching country details:', error);
      setCountryDetails(null);
    } finally {
      setLoadingCountry(false);
    }
  };

  const handleCountryDetailsSelect = (country: string) => {
    setCountrySearchInput(country);
    setShowCountryDetailsSuggestions(false);
    handleCountrySelectDetails(country);
  };

  const PostCard: React.FC<{ post: Post }> = ({ post }) => (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{post.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          By {post.username} • {new Date(post.created_at).toLocaleDateString()} • {post.country}
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

  const CountryDetailsCard: React.FC = () => (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{selectedCountry}</Card.Title>
        {loadingCountry ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : countryDetails ? (
          <>
            <Card.Text>Capital: {countryDetails.capital}</Card.Text>
            <Card.Text>Currency: {countryDetails.currency.name} ({countryDetails.currency.symbol})</Card.Text>
            <Card.Text>Languages: {countryDetails.languages.join(', ')}</Card.Text>
            {countryDetails.flag && (
              <img src={countryDetails.flag} alt={`${selectedCountry} flag`} style={{ maxWidth: '200px' }} />
            )}
          </>
        ) : (
          <Card.Text>No country details found</Card.Text>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <div className="container">
      <h2 className="mb-4">Search</h2>
      <Tabs defaultActiveKey="posts" className="mb-4">
        <Tab eventKey="posts" title="Search Posts">
          {countriesError && (
            <div className="alert alert-danger">
              Unable to load country list. Please try again later.
            </div>
          )}
          <Form className="mb-4">
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search country..."
                      value={countryFilter}
                      onChange={(e) => {
                        setCountryFilter(e.target.value);
                        setShowCountrySuggestions(true);
                      }}
                      onFocus={() => setShowCountrySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                    />
                    {showCountrySuggestions && filteredCountries.length > 0 && (
                      <div 
                        className="position-absolute w-100 bg-white border rounded-bottom shadow-sm"
                        style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                      >
                        {filteredCountries.map((country) => (
                          <div
                            key={country}
                            className="p-2 hover-bg-light cursor-pointer"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleCountrySelect(country)}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {country}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by username..."
                    value={usernameFilter}
                    onChange={(e) => setUsernameFilter(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="text-danger mb-4">{error}</div>
          ) : posts.length > 0 ? (
            <>
              <h3 className="mb-4">
                Posts
                {(countryFilter || usernameFilter) && (
                  <small className="text-muted">
                    {countryFilter && ` about ${countryFilter}`}
                    {usernameFilter && ` by ${usernameFilter}`}
                  </small>
                )}
              </h3>
              <Row>
                {posts.map((post) => (
                  <Col key={post.id} xs={12} md={6} lg={4}>
                    <PostCard post={post} />
                  </Col>
                ))}
              </Row>
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
            </>
          ) : (countryFilter || usernameFilter) ? (
            <div className="text-muted mb-4">No posts found matching your criteria.</div>
          ) : (
            <div className="text-muted mb-4">Please enter a country or username to search for posts.</div>
          )}
        </Tab>

        <Tab eventKey="countryDetails" title="Country Details">
          {countriesError && (
            <div className="alert alert-danger">
              Unable to load country list. Please try again later.
            </div>
          )}
          <Form className="mb-4">
            <Form.Group>
              <Form.Label>Search Country</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Type country name..."
                  value={countrySearchInput}
                  onChange={(e) => {
                    setCountrySearchInput(e.target.value);
                    setShowCountryDetailsSuggestions(true);
                  }}
                  onFocus={() => setShowCountryDetailsSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCountryDetailsSuggestions(false), 200)}
                />
                {showCountryDetailsSuggestions && filteredCountryDetails.length > 0 && (
                  <div 
                    className="position-absolute w-100 bg-white border rounded-bottom shadow-sm"
                    style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {filteredCountryDetails.map((country) => (
                      <div
                        key={country}
                        className="p-2 hover-bg-light cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCountryDetailsSelect(country)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {country}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Form.Group>
          </Form>

          {selectedCountry && <CountryDetailsCard />}
        </Tab>
      </Tabs>
    </div>
  );
};

export default CountrySearch;