import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, ListGroup } from 'react-bootstrap';
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

interface FollowUser {
  id: string;
  username: string;
}

const Profile: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile using JWT token
        const userResponse = await api.get('/users/profile');
        const userData = userResponse.data;
        setUser(userData);

        // Fetch user's posts
        const postsResponse = await api.get('/blogs/search', {
          params: {
            sortBy: 'mostLiked',
            page: 1,
            limit: 10,
            username: userData.username
          }
        });
        setPosts(postsResponse.data);

        // Fetch followers
        const followersResponse = await api.get(`/users/${userData.id}/followers`);
        setFollowers(followersResponse.data);

        // Fetch following
        const followingResponse = await api.get(`/users/${userData.id}/following`);
        setFollowing(followingResponse.data);
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
        setFollowers(prev => prev.filter(f => f.id !== currentUser?.id));
      } else {
        await api.post(`/users/${user?.username}/follow`);
        if (currentUser) {
          setFollowers(prev => [...prev, { id: currentUser.id, username: currentUser.username }]);
        }
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

      <Row className="mb-4">
        <Col md={6}>
          <h4>Followers</h4>
          {followers.length === 0 ? (
            <p>No followers yet.</p>
          ) : (
            <ListGroup>
              {followers.map((follower) => (
                <ListGroup.Item key={follower.id}>
                  <Link to={`/profile/${follower.username}`}>{follower.username}</Link>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={6}>
          <h4>Following</h4>
          {following.length === 0 ? (
            <p>Not following anyone.</p>
          ) : (
            <ListGroup>
              {following.map((followed) => (
                <ListGroup.Item key={followed.id}>
                  <Link to={`/profile/${followed.username}`}>{followed.username}</Link>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>

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
    </div>
  );
};

export default Profile;