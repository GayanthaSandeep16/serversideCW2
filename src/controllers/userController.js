const { registerUser, loginUser, followUser, unfollowUser,getUserProfile,getFollowersbyId,getFollowingByUserId,updateUserProfile,getAllUsersExceptCurrent } = require('../services/userService.js');
const { HTTP_STATUS } = require('../utils/constants.js');

async function register(req, res, next) {
  try {
    const { email, password, username } = req.body;
    const user = await registerUser(email, password, username);
    res.status(HTTP_STATUS.CREATED).json(user);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
}

async function follow(req, res, next) {
  try {
    const { followeeId } = req.body;
    const followerId = req.user.id;
    const result = await followUser(followerId, followeeId);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
}

async function unfollow(req, res, next) {
  try {
    const { followeeId } = req.body;
    const followerId = req.user.id;
    const result = await unfollowUser(followerId, followeeId);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res) {
  const user = await getUserProfile(req.user.id);
  res.status(200).json(user);
}

async function updateProfile(req, res) {
  const { email, username } = req.body;
  const user = await updateUserProfile(req.user.id, { email, username });
  res.status(200).json(user);
}

async function getFollowers(req, res) {
  const { userId } = req.params;
  const followers = await getFollowersbyId(userId);
  res.status(200).json(followers);
}

async function getFollowing(req, res) {
  const { userId } = req.params;
  const following = await getFollowingByUserId(userId);
  res.status(200).json(following);
}

async function getAllUsers(req, res) {
  try {
    const users = await getAllUsersExceptCurrent(req.user.id);
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}



module.exports = { register, login, follow, unfollow, getProfile, updateProfile, getFollowers, getFollowing, getAllUsers };