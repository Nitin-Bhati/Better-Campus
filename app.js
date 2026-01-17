// const express = require('express');
// const path = require('path');
// const expressLayouts = require('express-ejs-layouts');
// const { Sequelize } = require('sequelize');  // For database connection
// const app = express();
// const port = 3000;  // Or use const PORT = process.env.PORT || 3000;
// const sequelize = require('./db');  // Import your database connection
// const Post = require('./models/Post');  // Import Post model
// const Comment = require('./models/Comment');  // Import Comment model

// // Middleware setup
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(expressLayouts);
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // Test database connection
// sequelize.authenticate()
//   .then(() => console.log('MySQL connected successfully!'))
//   .catch(err => console.error('MySQL connection error:', err));

// // Routes (updated to use database instead of in-memory array)

// // Homepage: List all posts from the database
// app.get('/', async (req, res) => {
//   try {
//     const posts = await Post.findAll();  // Fetch posts from DB
//     res.render('index', { posts });  // Pass posts to the view
//   } catch (err) {
//     console.error('Error fetching posts:', err);
//     res.status(500).send('Error loading posts');
//   }
// });

// // Create new post (form submission) - save to database
// app.post('/posts', async (req, res) => {
//   const { title, body: content } = req.body;  // 'body' in form maps to 'content' in DB
//   if (title && content) {
//     try {
//       await Post.create({ userId: 'anonymous', title, content });  // Save to DB
//       res.redirect('/');
//     } catch (err) {
//       console.error('Error creating post:', err);
//       res.status(500).send('Error creating post');
//     }
//   } else {
//     res.status(400).send('Title and content are required');
//   }
// });

// // View single post and its comments from the database
// app.get('/posts/:id', async (req, res) => {
//   try {
//     const post = await Post.findByPk(req.params.id, { include: Comment });  // Fetch post and comments
//     if (!post) return res.status(404).send('Post not found');
//     res.render('post', { post });  // Pass post to the view
//   } catch (err) {
//     console.error('Error fetching post:', err);
//     res.status(500).send('Error loading post');
//   }
// });

// // Add comment to a post - save to database
// app.post('/posts/:id/comments', async (req, res) => {
//   const { comment: content } = req.body;
//   if (content) {
//     try {
//       const post = await Post.findByPk(req.params.id);
//       if (!post) return res.status(404).send('Post not found');
//       await Comment.create({ postId: req.params.id, userId: 'anonymous', content });  // Save to DB
//       res.redirect(`/posts/${req.params.id}`);
//     } catch (err) {
//       console.error('Error adding comment:', err);
//       res.status(500).send('Error adding comment');
//     }
//   } else {
//     res.status(400).send('Comment content is required');
//   }
// });

// // API endpoint for live updates
// app.get('/api/posts', async (req, res) => {
//   try {
//     const posts = await Post.findAll({ include: Comment });  // Fetch posts and comments from DB
//     res.json(posts);
//   } catch (err) {
//     console.error('Error fetching API posts:', err);
//     res.status(500).json({ error: 'Error loading posts' });
//   }
// });

// // Start the server and sync the database
// app.listen(port, async () => {
//   console.log(`Server running at http://localhost:${port}`);
//   try {
//     await sequelize.sync({ force: false });  // Sync database
//     console.log('Database synced successfully');
//   } catch (err) {
//     console.error('Error syncing database:', err);
//   }
// });


// app.js
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

const sequelize = require('./db');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

// views & static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve public + uploaded images
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads')); // uploads folder in project root
  },
  filename: function (req, file, cb) {
    // keep the original extension
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (adjust as needed)
  fileFilter: (req, file, cb) => {
    // accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('MySQL connected successfully!'))
  .catch(err => console.error('MySQL connection error:', err));

// Routes

// Homepage - list posts
app.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
    res.render('index', { posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).send('Error loading posts');
  }
});

// Create new post with optional image
// Use upload.single('image') — name must match form input
app.post('/posts', upload.single('image'), async (req, res) => {
  const { title, body: content } = req.body;
  let imagePath = null;

  if (req.file) {
    // store relative path that is accessible via /uploads route
    imagePath = `/uploads/${req.file.filename}`;
  }

  if (title && content) {
    try {
      await Post.create({ userId: 'anonymous', title, content, image: imagePath });
      res.redirect('/');
    } catch (err) {
      console.error('Error creating post:', err);
      res.status(500).send('Error creating post');
    }
  } else {
    res.status(400).send('Title and content are required');
  }
});

// View single post and comments
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, { include: Comment });
    if (!post) return res.status(404).send('Post not found');
    res.render('post', { post });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).send('Error loading post');
  }
});

// Add comment
app.post('/posts/:id/comments', async (req, res) => {
  const { comment: content } = req.body;
  if (!content) return res.status(400).send('Comment content is required');
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).send('Post not found');
    await Comment.create({ postId: req.params.id, userId: 'anonymous', content });
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).send('Error adding comment');
  }
});

// API endpoint
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({ include: Comment });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching API posts:', err);
    res.status(500).json({ error: 'Error loading posts' });
  }
});

// Start server and sync DB
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  try {
    // alter:true updates table to match model (safe for dev). Remove or set force:false for production.
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully (alter:true)');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
});
