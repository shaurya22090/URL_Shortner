const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
require("dotenv").config();
const connect = require("../connection/connect");
connect();
const urlDb = require("../models/DbsSchema");
const usersDb = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const Code = require("../models/shortCodeGenrater");
const jwt = require("jsonwebtoken");
const JWT_Secrete_key = process.env.JWT_Secrete_key;
const authMiddleware = require("../middleware/authMiddleware");

app.listen(3000, () => {
  console.log("Server has started");
});

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

app.use(express.json());

//creating urls or giving urls previous urls
app.post("/urls", authMiddleware, async (req, res) => {
  try {
    const { LongURL } = req.body;
    if (!LongURL) {
      return res.status(400).send("enter the url please");
    }

    if (!isValidUrl(LongURL)) {
      return res.status(400).send("not a valid url");
    }

    const existing = await urlDb.findOne({ LongURL: LongURL });
    if (existing) {
      return res.send(existing);
    }

    let newCode = Code();
    const baseShortUrl = "http://localhost:3000/";

    let newShortUrl = baseShortUrl + newCode;

    let isExist = await urlDb.findOne({ ShortURL: newShortUrl });
    while (isExist) {
      newCode = Code();
      newShortUrl = baseShortUrl + newCode;
      isExist = await urlDb.findOne({ ShortURL: newShortUrl });
    }

    const time = new Date();

    const newObject = new urlDb({
      LongURL: LongURL,
      ShortURL: newShortUrl,
      Clicks: 0,
      CreatedAt: time,
      CreatedBy: req.user.userId,
    });

    await newObject.save();

    return res.send(newObject);
  } catch (err) {
    console.log(err);
    return res.status(500).send("somthing went wrong");
  }
});

//giving urls to user which are genrated by the usre till now
app.get("/urls", authMiddleware, async (req, res) => {
  try {
    const userUrls = await urlDb.find({ CreatedBy: req.user.userId });

    if (userUrls.length === 0) {
      return res.status(404).send("You haven't created any short urls yet");
    }

    return res.send(userUrls);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
});

//geting a perticular urls info
app.get("/urls/:shortCode", authMiddleware, async (req, res) => {
  try {
    const baseShortUrl = "http://localhost:3000/";
    const newShortUrl = baseShortUrl + req.params.shortCode;
    const existing = await urlDb.findOne({ ShortURL: newShortUrl });

    if (existing) {
      if (
        !existing.CreatedBy ||
        existing.CreatedBy.toString() !== req.user.userId
      ) {
        return res
          .status(403)
          .send("You do not have permission to view this URL's info.");
      }
      res.send(existing);
    } else {
      res.status(404).send("Info not found");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send("somthing went wrong");
  }
});

//SignUp
app.post("/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const isUsernameExist = await usersDb.findOne({ username: username });

    if (isUsernameExist) {
      return res
        .status(400)
        .send("username already in use, choose a diffrent username");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new usersDb({
      username: username,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, JWT_Secrete_key, {
      expiresIn: "1h",
    });

    return res.send({ message: "SignUp successful!", token: token });
  } catch (err) {
    console.log("CRASH ERROR:", err);
    return res.status(500).send("somthing went wrong");
  }
});

//LogIn
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const isUsernameExist = await usersDb.findOne({ username: username });

    if (!isUsernameExist) {
      return res.status(401).send("Invalid credentials");
    }

    const hashedPassword = isUsernameExist.password;
    const isCorrectPassword = await bcrypt.compare(password, hashedPassword);

    if (!isCorrectPassword) {
      return res.status(401).send("Invalid credentials");
    }

    const token = jwt.sign({ userId: isUsernameExist._id }, JWT_Secrete_key, {
      expiresIn: "1h",
    });

    return res.send({ message: "Login successful!", token: token });
  } catch (err) {
    console.log(err);
    return res.status(500).send("somthing went wrong");
  }
});

//redirecting
app.get("/:shortcode", async (req, res) => {
  try {
    const baseShortUrl = "http://localhost:3000/";

    const newShortUrl = baseShortUrl + req.params.shortcode;

    const existing = await urlDb.findOne({ ShortURL: newShortUrl });

    if (existing) {
      const longUrl = existing.LongURL;
      existing.Clicks += 1;
      await existing.save();
      res.redirect(longUrl);
    } else {
      res.status(404).send("URL not found");
    }
  } catch (err) {
    return res.status(500).send("somthing went wrong");
  }
});
