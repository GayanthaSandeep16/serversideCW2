import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import CountrySearch from './pages/CountrySearch';
import Feed from './pages/Feed';
import Users from './pages/Users';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<CountrySearch />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/users" element={<Users />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
