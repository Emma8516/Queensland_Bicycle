const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
const port = 3000;

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(cors());
app.use(express.json());

// 測試用 API
app.get("/", (req, res) => {
  res.send("Emma’s backend is running!");
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});

// 取得使用者資訊 
app.get("/api/user/profile/:uid", async (req, res) => {
    const uid = req.params.uid;
  
    try {
      const userRef = db.collection("users").doc(uid);
      const doc = await userRef.get();
  
      if (!doc.exists) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json(doc.data());
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // 更新使用者暱稱與頭像
app.put("/api/user/update/:uid", async (req, res) => {
    const uid = req.params.uid;
    const { name, avatarUrl } = req.body;
  
    if (!name || !avatarUrl) {
      return res.status(422).json({ message: "Please provide name and avatarUrl" });
    }
  
    try {
      const userRef = db.collection("users").doc(uid);
      await userRef.update({
        name,
        avatarUrl
      });
  
      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  //使用這提交反饋
  app.post("/api/feedback/submit/:uid", async (req, res) => {
    const uid = req.params.uid;
    const { feedbackText, rating } = req.body;
  
    //  檢查必填欄位
    if (!feedbackText || !rating) {
      return res.status(422).json({
        message: "Please provide both feedbackText and rating"
      });
    }
  
    //  檢查評分合法性
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5"
      });
    }
  
    try {
      const feedbackRef = db.collection("feedback").doc(); // 自動產生 ID
      await feedbackRef.set({
        uid,
        feedbackText,
        rating,
        submittedAt: admin.firestore.FieldValue.serverTimestamp()
      });
  
      res.status(201).json({ message: "Feedback submitted successfully" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
