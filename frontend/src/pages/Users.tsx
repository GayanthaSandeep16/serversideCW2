import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  followers: number;
  following: number;
  isFollowed: boolean;
}

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users. Please try again later.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (followeeId: number) => {
    try {
      const user = users.find(u => u.id === followeeId);
      if (!user) return;

      if (user.isFollowed) {
        await api.delete('/users/unfollow', {
          data: { followeeId }
        });
      } else {
        await api.post('/users/follow', {
          followeeId
        });
      }

      // Update users list with new following status
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === followeeId 
            ? {
                ...user,
                isFollowed: !user.isFollowed,
                followers: user.isFollowed ? user.followers - 1 : user.followers + 1
              }
            : user
        )
      );
    } catch (err: any) {
      console.error('Error following/unfollowing user:', err);
      // Show error message to user
      setError(err.response?.data?.message || 'Failed to follow/unfollow user. Please try again.');
      // Refresh the users list to ensure correct state
      fetchUsers();
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container text-center mt-5">
        <h3>Please log in to view users</h3>
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
      <h2 className="mb-4">Discover Users</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {users.length === 0 && !error && (
        <div className="alert alert-info">No users to discover.</div>
      )}

      <Row>
        {users.map((user) => (
          <Col key={user.id} md={6} lg={4}>
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title>{user.username}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {user.email}
                    </Card.Subtitle>
                  </div>
                  <Button
                    variant={user.isFollowed ? 'secondary' : 'primary'}
                    onClick={() => handleFollow(user.id)}
                  >
                    {user.isFollowed ? 'Unfollow' : 'Follow'}
                  </Button>
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
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Users;