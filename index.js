const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

const {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  REDIRECT_URI,
} = process.env;
console.log(FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, REDIRECT_URI);
// Step 1: Generate Facebook login URL
app.get('/api/auth/facebook/login', (req, res) => {
  const fbLoginUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=email,public_profile,user_posts,user_photos,user_videos,instagram_basic,pages_show_list,pages_read_engagement`;
  res.redirect(fbLoginUrl);
});

// Step 2: Handle Facebook callback and get access token
app.get('/api/auth/facebook/callback', async (req, res) => {
  const { code } = req.query;
  console.log(code, 'code received from Facebook');
  try {
    const tokenRes = await axios.get(
      `https://graph.facebook.com/v20.0/oauth/access_token`,
      {
        params: {
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        },
      }
    );

    const access_token = tokenRes.data.access_token;
    res.json({ message: 'Login success', access_token });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

// Step 3: Use access token to fetch Facebook profile
app.get('/api/facebook/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const profileRes = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
    );
    res.json(profileRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Step 4: Fetch Facebook photos (example)
app.get('/api/facebook/photos', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const photosRes = await axios.get(
      `https://graph.facebook.com/me/photos?fields=images,name,created_time&access_token=${token}`
    );
    res.json(photosRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
