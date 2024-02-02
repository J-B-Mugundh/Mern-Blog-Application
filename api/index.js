const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const Post = require("./models/Post");

const salt = bcrypt.genSaltSync(10);
const secret = 'mugundh';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://mugundhjb:mugundh123@cluster0.cin9jqd.mongodb.net/?retryWrites=true&w=majority');

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json(e);
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.findOne({ username });
        if (!userDoc) {
            return res.status(400).json("User not found");
        }
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            // logged in
            jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json('ok');
            });
        } else {
            res.status(400).json("Wrong credentials!");
        }
    } catch (e) {
        res.status(500).json(e);
    }
});

app.get("/profile", (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) {
            return res.status(401).json("Unauthorized");
        }
        res.json(info);
    });
});

app.post("/logout", (req, res) => {
    res.clearCookie('token').json("Logged out successfully");
});

app.post("/post", uploadMiddleware.single('file'), async (req, res) => {
    try {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext
        fs.renameSync(path, newPath);

        const { token } = req.cookies;
        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) throw err;
            const { title, summary, content } = req.body;
            const postDoc = await Post.create({
                title,
                summary,
                content,
                cover: newPath,
                author: info.id
            });

            res.json(postDoc);
        });
    } catch (error) {
        res.status(500).json(error.message);
    }
});

app.get("/post", async (req, res) => {
    try {
        res.json(
            await Post.find()
              .populate('author', ['username'])
              .sort({createdAt: -1})
              .limit(20)
          );
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {id,title,summary,content} = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await Post.updateOne(
        { _id: id },
        {
          $set: {
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
          }
        }
      );
  
      // Fetch the updated document after the update
      const updatedPostDoc = await Post.findById(id);
  
      res.json(updatedPostDoc);
  });

});

app.get("/post/:id", async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  })

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
