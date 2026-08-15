const mongoose = require("mongoose");
const express = require("express");
const app = express();
const connect = require("../connection/connect");
connect();
const urlDb = require("../models/DbsSchema");
const usersDb = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const Code = require("../models/shortCodeGenrater");

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

app.post("/URL_Shortener", async (req, res) => {
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
    });

    await newObject.save();

    return res.send(newObject);
  } catch (err) {
    return res.status(500).send("somthing went wrong");
  }
});

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

app.get("/info/:shortCode", async (req, res) => {
  try {
    const baseShortUrl = "http://localhost:3000/";
    const newShortUrl = baseShortUrl + req.params.shortCode;
    const existing = await urlDb.findOne({ ShortURL: newShortUrl });

    if (existing) {
      res.send(existing);
    } else {
      res.status(404).send("Info not found");
    }
  } catch (err) {
    return res.status(500).send("somthing went wrong");
  }
});

app.post("/URL_Shortener/signUp", async (req, res) => {
  try {
    const { username, password } = req.body;

    const isUsernameExist = await usersDb.findOne({ username: username });

    if (isUsernameExist) {
      return res.send("username already in use, choose a diffrent username");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new usersDb({
      username: username,
      password: hashedPassword,
    });

    await newUser.save();

    return res.send(username);
  } catch (err) {
    console.log("CRASH ERROR:", err);
    return res.status(500).send("somthing went wrong");
  }
});
