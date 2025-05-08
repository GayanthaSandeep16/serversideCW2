import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

interface User {
  id: string;
  username: string;
  email: string;
  followers: number;
  following: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  country: string;
  likes: number;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile using JWT token
        const userResponse = await api.get('/users/profile');
        setUser(userResponse.data);

        // Fetch user's posts
        const postsResponse = await api.get('/blogs/search', {
          params: {
            sortBy: 'mostLiked',
            page: 1,
            limit: 10,
            username: userResponse.data.username
          }
        });
        setPosts(postsResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/users/${user?.username}/follow`);
      } else {
        await api.post(`/users/${user?.username}/follow`);
      }
      setIsFollowing(!isFollowing);
      if (user) {
        setUser({
          ...user,
          followers: isFollowing ? user.followers - 1 : user.followers + 1
        });
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
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

  if (!user) {
    return <div className="text-center mt-5">User not found</div>;
  }

  return (
    <div className="container">
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>{user.username}</h2>
              <p className="text-muted">{user.email}</p>
            </div>
            {currentUser && currentUser.username !== user.username && (
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                onClick={handleFollow}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
          <div className="d-flex gap-4 mt-3">
            <div>
              <strong>{user.followers}</strong> followers
            </div>
            <div>
              <strong>{user.following}</strong> following
            </div>
          </div>
        </Card.Body>
      </Card>

      <h3 className="mb-4">Posts</h3>
      <Row>
        {posts.map((post) => (
          <Col key={post.id} md={6} lg={4}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {new Date(post.createdAt).toLocaleDateString()}
                </Card.Subtitle>
                <Card.Text>{post.content.substring(0, 150)}...</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <Button variant="primary" href={`/post/${post.id}`}>
                    Read More
                  </Button>
                  <span className="text-muted">
                    <i className="bi bi-heart-fill"></i> {post.likes} likes
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Profile; 