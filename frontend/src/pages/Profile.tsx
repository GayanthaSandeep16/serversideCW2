import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, ListGroup, Modal, Form } from 'react-bootstrap';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile using JWT token
        const userResponse = await api.get('/users/profile');
        const userData = userResponse.data;
        
        // Fetch followers count
        const followersResponse = await api.get(`/users/${userData.id}/followers`);
        const followersCount = followersResponse.data.length;
        
        // Fetch following count
        const followingResponse = await api.get(`/users/${userData.id}/following`);
        const followingCount = followingResponse.data.length;
        
        // Set user data with counts
        setUser({
          ...userData,
          followers: followersCount,
          following: followingCount
        });
        
        setFollowers(followersResponse.data);
        setFollowing(followingResponse.data);

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

        // Check if current user is following this user
        if (currentUser && currentUser.id !== userData.id) {
          const isFollowingUser = followersResponse.data.some(
            (follower: FollowUser) => follower.id === currentUser.id
          );
          setIsFollowing(isFollowingUser);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

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

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put('/users/profile', editForm);
      // Update both the user state and currentUser in auth context
      setUser(response.data);
      // Update the currentUser in auth context if it's the current user's profile
      if (currentUser && currentUser.id === user?.id) {
        // Update the auth context with new user data
        const updatedUser: User = {
          id: currentUser.id,
          username: response.data.username,
          email: response.data.email,
          followers: user?.followers || 0,
          following: user?.following || 0
        };
        setUser(updatedUser);
      }
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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
            <div className="d-flex gap-2">
              {currentUser && currentUser.id === user.id ? (
                <Button variant="outline-primary" onClick={() => {
                  setEditForm({ username: user.username, email: user.email });
                  setShowEditModal(true);
                }}>
                  Edit Profile
                </Button>
              ) : currentUser && (
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </div>
          </div>
          <div className="d-flex gap-4 mt-3">
            <div>
              <strong>{user.followers || 0}</strong> followers
            </div>
            <div>
              <strong>{user.following || 0}</strong> following
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
                <ListGroup.Item key={follower.id} className="text-decoration-none">
                  {follower.username}
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
                <ListGroup.Item key={followed.id} className="text-decoration-none">
                  {followed.username}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

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