


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


app.post('/posts', upload.single('image'), async (req, res) => {
  const { title, body: content } = req.body;
  let imagePath = null;

  if (req.file) {
   
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

// Add comment in your website
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
    
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully (alter:true)');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
});
