import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Question from "./models/Question.js";
// import aiRoutes from "./routes/ai.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoutes);

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("✅ Connected to MongoDB"));

// ✅ Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found or incorrect password" });
    }

    return res.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Register
app.post("/register", async (req, res) => {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(409).json({ success: false, message: "Username or email already exists" });
    }

    const newUser = new User({ name, email, username, password });
    await newUser.save();

    return res.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Store Community Questions
app.post("/community", async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    const allQuestions = await Question.find({}).sort({ createdAt: -1 });
    console.log("🟢 Saved to DB:", question.text);
    res.json({ success: true, message: "Question saved", questions: allQuestions });
  } catch (err) {
    console.error("❌ Error saving question:", err);
    res.status(500).json({ success: false, message: "Error saving question" });
  }
});

// ✅ Get All Questions
app.get("/community", async (req, res) => {
  try {
    const questions = await Question.find({}).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching questions" });
  }
});

// ✅ Delete Question by ID
app.delete("/community/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    const updatedQuestions = await Question.find({}).sort({ createdAt: -1 });
    console.log("🗑️ Deleted question with ID:", req.params.id);
    res.json({ success: true, questions: updatedQuestions });
  } catch (err) {
    console.error("❌ Error deleting question:", err);
    res.status(500).json({ success: false });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import User from "./models/User.js";
// import Question from "./models/Question.js";

// dotenv.config();
// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// // ✅ Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "MongoDB connection error:"));
// db.once("open", () => console.log("✅ Connected to MongoDB"));

// // 🟢 Login
// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Username and password are required" });
//   }

//   try {
//     const user = await User.findOne({ username, password });
//     if (!user) {
//       return res
//         .status(401)
//         .json({ success: false, message: "User not found or incorrect password" });
//     }

//     return res.json({
//       success: true,
//       message: "Login successful!",
//       user: {
//         id: user._id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // 🟢 Register
// app.post("/register", async (req, res) => {
//   const { name, email, username, password } = req.body;

//   if (!name || !email || !username || !password) {
//     return res
//       .status(400)
//       .json({ success: false, message: "All fields are required" });
//   }

//   try {
//     const existingUser = await User.findOne({ $or: [{ email }, { username }] });

//     if (existingUser) {
//       return res
//         .status(409)
//         .json({ success: false, message: "Username or email already exists" });
//     }

//     const newUser = new User({ name, email, username, password });
//     await newUser.save();

//     return res.json({
//       success: true,
//       message: "User registered successfully",
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         username: newUser.username,
//         email: newUser.email,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // 🟢 Store Community Questions
// app.post("/community", async (req, res) => {
//   try {
//     const question = new Question(req.body);
//     await question.save();
//     console.log("🟢 Saved to DB:", question.text);
//     res.json({ success: true, message: "Question saved to DB", question });
//   } catch (err) {
//     console.error("❌ Error saving question:", err);
//     res.status(500).json({ success: false, message: "Error saving question" });
//   }
// });

// // 🟢 Get All Questions
// app.get("/community", async (req, res) => {
//   const questions = await Question.find({});
//   res.json(questions);
// });

// // 🟢 Delete Question by ID (NEW)
// app.delete("/community/:id", async (req, res) => {
//   try {
//     await Question.findByIdAndDelete(req.params.id);
//     console.log("🗑️ Deleted question with ID:", req.params.id);
//     res.json({ success: true });
//   } catch (err) {
//     console.error("❌ Error deleting question:", err);
//     res.status(500).json({ success: false });
//   }
// });

// app.listen(port, () => {
//   console.log(`🚀 Server running at http://localhost:${port}`);
// });


// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import User from "./models/User.js";
// import Question from "./models/Question.js";

// dotenv.config();
// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// // ✅ Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "MongoDB connection error:"));
// db.once("open", () => console.log("✅ Connected to MongoDB"));

// // ✅ Login
// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ success: false, message: "Username and password are required" });
//   }

//   try {
//     const user = await User.findOne({ username, password });
//     if (!user) {
//       return res.status(401).json({ success: false, message: "User not found or incorrect password" });
//     }

//     return res.json({
//       success: true,
//       message: "Login successful!",
//       user: {
//         id: user._id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ✅ Register
// app.post("/register", async (req, res) => {
//   const { name, email, username, password } = req.body;

//   if (!name || !email || !username || !password) {
//     return res.status(400).json({ success: false, message: "All fields are required" });
//   }

//   try {
//     const existingUser = await User.findOne({ $or: [{ email }, { username }] });

//     if (existingUser) {
//       return res.status(409).json({ success: false, message: "Username or email already exists" });
//     }

//     const newUser = new User({ name, email, username, password });
//     await newUser.save();

//     return res.json({
//       success: true,
//       message: "User registered successfully",
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         username: newUser.username,
//         email: newUser.email,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ✅ Create a community question
// app.post("/community", async (req, res) => {
//   try {
//     const question = new Question(req.body);
//     await question.save();
//     console.log("🟢 Saved to DB:", question.text);
//     res.json({ success: true, message: "Question saved to DB", id: question._id });
//   } catch (err) {
//     console.error("❌ Error saving question:", err);
//     res.status(500).json({ success: false, message: "Error saving question" });
//   }
// });

// // ✅ Get all community questions
// app.get("/community", async (req, res) => {
//   try {
//     const questions = await Question.find({});
//     res.json(questions);
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Error fetching questions" });
//   }
// });

// // ✅ Delete a question by ID
// app.delete("/community/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const deleted = await Question.findByIdAndDelete(id);
//     if (!deleted) {
//       return res.status(404).json({ success: false, message: "Question not found" });
//     }

//     res.json({ success: true, message: "Question deleted", id });
//   } catch (err) {
//     console.error("❌ Error deleting question:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// app.listen(port, () => {
//   console.log(`🚀 Server running at http://localhost:${port}`);
// });

// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import User from "./models/User.js";
// import Question from "./models/Question.js";

// dotenv.config();
// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// // ✅ Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "MongoDB connection error:"));
// db.once("open", () => console.log("✅ Connected to MongoDB"));

// // 🟢 Login
// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ success: false, message: "Username and password are required" });
//   }

//   try {
//     const user = await User.findOne({ username, password });
//     if (!user) {
//       return res.status(401).json({ success: false, message: "User not found or incorrect password" });
//     }

//     return res.json({
//       success: true,
//       message: "Login successful!",
//       user: {
//         id: user._id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // 🟢 Register
// app.post("/register", async (req, res) => {
//   const { name, email, username, password } = req.body;

//   if (!name || !email || !username || !password) {
//     return res.status(400).json({ success: false, message: "All fields are required" });
//   }

//   try {
//     const existingUser = await User.findOne({ $or: [{ email }, { username }] });

//     if (existingUser) {
//       return res.status(409).json({ success: false, message: "Username or email already exists" });
//     }

//     const newUser = new User({ name, email, username, password });
//     await newUser.save();

//     return res.json({
//       success: true,
//       message: "User registered successfully",
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         username: newUser.username,
//         email: newUser.email,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // 🟢 Store Community Questions
// // app.post("/community", async (req, res) => {
// //   const question = new Question(req.body);
// //   await question.save();
// //   console.log("🟢 Saved to DB:", question.text);
// //   res.json({ success: true, message: "Question saved to DB" });
// // });
// // 🟢 Store Community Questions
// app.post("/community", async (req, res) => {
//   try {
//     const question = new Question(req.body);
//     await question.save();
//     console.log("🟢 Saved to DB:", question.text);
//     res.json({ success: true, message: "Question saved to DB", id: question._id });
//   } catch (err) {
//     console.error("❌ Error saving question:", err);
//     res.status(500).json({ success: false, message: "Error saving question" });
//   }
// });


// // 🟢 Get All Questions
// app.get("/community", async (req, res) => {
//   const questions = await Question.find({});
//   res.json(questions);
// });




// app.listen(port, () => {
//   console.log(`🚀 Server running at http://localhost:${port}`);
// });

// import express from "express";
// import cors from "cors";

// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// let users = [];
// let currentId = 1;

// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
//   console.log("Login attempt for:", username);
  
//   const user = users.find(u => 
//     u.username === username && u.password === password
//   );

//   if (user) {
//     console.log("Login successful for:", username);
//     res.json({ 
//       success: true, 
//       message: "Login successful!",
//       user: {
//         id: user.id,
//         name: user.name,
//         username: user.username,
//         email: user.email
//       }
//     });
//   } else {
//     console.log("Login failed for:", username);
//     res.status(401).json({ success: false, message: "Invalid username or password" });
//   }
// });

// app.post('/register', (req, res) => {
//   const { name, email, username, password } = req.body;
//   console.log("Registration attempt for:", username, email);
  
//   if (!name || !email || !username || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }
  
//   const existingUser = users.find(u => 
//     u.username === username || u.email === email
//   );
  
//   if (existingUser) {
//     console.log("Registration failed - user exists:", username, email);
//     return res.status(409).json({ message: "Username or email already exists" });
//   }
  
//   const newUser = {
//     id: currentId++,
//     name,
//     email,
//     username,
//     password
//   };
  
//   users.push(newUser);
//   console.log("New user registered:", newUser);
  
//   res.json({ 
//     message: "User created successfully", 
//     user: {
//       id: newUser.id,
//       name: newUser.name,
//       username: newUser.username,
//       email: newUser.email
//     }
//   });
// });

// app.get('/users', (req, res) => {
//   const safeUsers = users.map(user => {
//     const { password, ...safeData } = user;
//     return safeData;
//   });
//   res.json(safeUsers);
// });

// let communityData = {
//   questions: [],
//   nextQuestionId: 1,
//   nextCommentId: 1
// };

// // Get all questions
// app.get('/api/questions', (req, res) => {
//   console.log("Fetching all questions");
//   res.json(communityData.questions);
// });

// // Create new question
// app.post('/api/questions', (req, res) => {
//   const { text, user } = req.body;
//   console.log("New question received:", { text, user });
  
//   const newQuestion = {
//     id: communityData.nextQuestionId++,
//     text,
//     user,
//     comments: [],
//     likes: 0,
//     timestamp: new Date().toISOString()
//   };
  
//   communityData.questions.unshift(newQuestion);
//   console.log("Question added:", newQuestion);
  
//   res.status(201).json(newQuestion);
// });

// // Update question likes
// app.put('/api/questions/:id/like', (req, res) => {
//   const id = parseInt(req.params.id);
//   console.log("Like request for question:", id);
  
//   const question = communityData.questions.find(q => q.id === id);
  
//   if (!question) {
//     console.log("Question not found:", id);
//     return res.status(404).send('Question not found');
//   }
  
//   question.likes += 1;
//   console.log(`Question ${id} liked. New count: ${question.likes}`);
  
//   res.json(question);
// });

// // Delete question
// app.delete('/api/questions/:id', (req, res) => {
//   const id = parseInt(req.params.id);
//   console.log("Delete request for question:", id);
  
//   const initialLength = communityData.questions.length;
//   communityData.questions = communityData.questions.filter(q => q.id !== id);
  
//   if (communityData.questions.length === initialLength) {
//     console.log("Question not found for deletion:", id);
//     return res.status(404).send('Question not found');
//   }
  
//   console.log(`Question ${id} deleted successfully`);
//   res.sendStatus(204);
// });

// // Add comment to question
// app.post('/api/questions/:id/comments', (req, res) => {
//   const id = parseInt(req.params.id);
//   const { text, user } = req.body;
//   console.log(`New comment for question ${id}:`, { text, user });
  
//   const question = communityData.questions.find(q => q.id === id);
  
//   if (!question) {
//     console.log("Question not found for comment:", id);
//     return res.status(404).send('Question not found');
//   }
  
//   const newComment = {
//     id: communityData.nextCommentId++,
//     text,
//     user,
//     timestamp: new Date().toISOString()
//   };
  
//   question.comments.push(newComment);
//   console.log("Comment added:", newComment);
  
//   res.status(201).json(newComment);
// });

// // Delete comment - FIXED PARAMETER NAMES
// app.delete('/api/questions/:questionId/comments/:commentId', (req, res) => {
//   const questionId = parseInt(req.params.questionId);
//   const commentId = parseInt(req.params.commentId);
//   console.log(`Delete comment request: Q${questionId} C${commentId}`);
  
//   const question = communityData.questions.find(q => q.id === questionId);
  
//   if (!question) {
//     console.log("Question not found for comment deletion:", questionId);
//     return res.status(404).send('Question not found');
//   }
  
//   const initialLength = question.comments.length;
//   question.comments = question.comments.filter(c => c.id !== commentId);
  
//   if (question.comments.length === initialLength) {
//     console.log("Comment not found:", commentId);
//     return res.status(404).send('Comment not found');
//   }
  
//   console.log(`Comment ${commentId} deleted from question ${questionId}`);
//   res.sendStatus(204);
// });

// app.listen(port, () => {
//   console.log(`Backend running on http://localhost:${port}`);
//   console.log(`Temporary user storage enabled. ${users.length} users registered.`);
// });

// import express from "express";
// import cors from "cors";

// // const express = require('express');
// // const cors = require('cors'); // Make sure to install cors: npm install cors
// const app = express();
// const port = 5000;

// // Enable CORS for all routes
// app.use(cors());

// // Middleware to parse JSON
// app.use(express.json());

// // Temporary user storage (in-memory "database")
// let users = [];
// let currentId = 1;

// // Login API endpoint
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
  
//   // Find user in our temporary array
//   const user = users.find(u => 
//     u.username === username && u.password === password
//   );

//   if (user) {
//     // Successful login - return user without password
//     res.json({ 
//       success: true, 
//       message: "Login successful!",
//       user: {
//         id: user.id,
//         name: user.name,
//         username: user.username,
//         email: user.email
//       }
//     });
//   } else {
//     // Failed login
//     res.status(401).json({ success: false, message: "Invalid username or password" });
//   }
// });

// // Registration endpoint
// app.post('/register', (req, res) => {
//   const { name, email, username, password } = req.body;
  
//   // Validate required fields
//   if (!name || !email || !username || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }
  
//   // Check if username or email exists
//   const existingUser = users.find(u => 
//     u.username === username || u.email === email
//   );
  
//   if (existingUser) {
//     return res.status(409).json({ message: "Username or email already exists" });
//   }
  
//   // Create new user
//   const newUser = {
//     id: currentId++,
//     name,
//     email,
//     username,
//     password // Note: In real apps, you should hash passwords!
//   };
  
//   users.push(newUser);
//   console.log("Registered user:", newUser);
  
//   // Return user data without password
//   res.json({ 
//     message: "User created successfully", 
//     user: {
//       id: newUser.id,
//       name: newUser.name,
//       username: newUser.username,
//       email: newUser.email
//     }
//   });
// });

// // Optional: Get all users (for debugging)
// app.get('/users', (req, res) => {
//   // Return users without passwords
//   const safeUsers = users.map(user => {
//     const { password, ...safeData } = user;
//     return safeData;
//   });
//   res.json(safeUsers);
// });

// // Add after existing user routes but before app.listen()

// // Community data storage
// let communityData = {
//   questions: [],
//   nextQuestionId: 1,
//   nextCommentId: 1
// };

// // Get all questions
// app.get('/api/questions', (req, res) => {
//   res.json(communityData.questions);
// });

// // Create new question
// app.post('/api/questions', (req, res) => {
//   const { text, user } = req.body;
//   const newQuestion = {
//     id: communityData.nextQuestionId++,
//     text,
//     user,
//     comments: [],
//     likes: 0,
//     timestamp: new Date().toISOString()
//   };
//   communityData.questions.unshift(newQuestion);
//   res.status(201).json(newQuestion);
// });

// // Update question likes
// app.put('/api/questions/:id/like', (req, res) => {
//   const id = parseInt(req.params.id);
//   const question = communityData.questions.find(q => q.id === id);
  
//   if (!question) return res.status(404).send('Question not found');
  
//   question.likes += 1;
//   res.json(question);
// });

// // Delete question
// app.delete('/api/questions/:id', (req, res) => {
//   const id = parseInt(req.params.id);
//   const initialLength = communityData.questions.length;
  
//   communityData.questions = communityData.questions.filter(q => q.id !== id);
  
//   if (communityData.questions.length === initialLength) {
//     return res.status(404).send('Question not found');
//   }
//   res.sendStatus(204);
// });

// // Add comment to question
// app.post('/api/questions/:id/comments', (req, res) => {
//   const id = parseInt(req.params.id);
//   const { text, user } = req.body;
//   const question = communityData.questions.find(q => q.id === id);
  
//   if (!question) return res.status(404).send('Question not found');
  
//   const newComment = {
//     id: communityData.nextCommentId++,
//     text,
//     user,
//     timestamp: new Date().toISOString()
//   };
  
//   question.comments.push(newComment);
//   res.status(201).json(newComment);
// });

// // Delete comment
// app.delete('/api/questions/:qId/comments/:cId', (req, res) => {
//   const qId = parseInt(req.params.qId);
//   const cId = parseInt(req.params.cId);
//   const question = communityData.questions.find(q => q.id === qId);
  
//   if (!question) return res.status(404).send('Question not found');
  
//   const initialLength = question.comments.length;
//   question.comments = question.comments.filter(c => c.id !== cId);
  
//   if (question.comments.length === initialLength) {
//     return res.status(404).send('Comment not found');
//   }
//   res.sendStatus(204);
// });




// // Start server
// app.listen(port, () => {
//   console.log(`Backend running on http://localhost:${port}`);
//   console.log(`Temporary user storage enabled. ${users.length} users registered.`);
// });


// import express from "express";
// import cors from "cors";

// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// // In-memory user storage
// let users = [];
// let currentId = 1;

// // ✅ Login Endpoint
// app.post("/login", (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Username and password are required" });
//   }

//   const user = users.find(
//     (u) => u.username === username && u.password === password
//   );

//   if (user) {
//     return res.json({
//       success: true,
//       message: "Login successful!",
//       user: {
//         id: user.id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } else {
//     return res
//       .status(401)
//       .json({ success: false, message: "Invalid username or password" });
//   }
// });

// // ✅ Registration Endpoint
// app.post("/register", (req, res) => {
//   const { name, email, username, password } = req.body;

//   if (!name || !email || !username || !password) {
//     return res
//       .status(400)
//       .json({ success: false, message: "All fields are required" });
//   }

//   const existingUser = users.find(
//     (u) => u.username === username || u.email === email
//   );

//   if (existingUser) {
//     return res
//       .status(409)
//       .json({ success: false, message: "Username or email already exists" });
//   }

//   const newUser = {
//     id: currentId++,
//     name,
//     email,
//     username,
//     password, // ⚠ In real apps, always hash passwords!
//   };

//   users.push(newUser);
//   console.log("✅ Registered user:", newUser);

//   return res.json({
//     success: true,
//     message: "User registered successfully",
//     user: {
//       id: newUser.id,
//       name: newUser.name,
//       username: newUser.username,
//       email: newUser.email,
//     },
//   });
// });

// // ✅ (Optional) Debug: Get all users without passwords
// app.get("/users", (req, res) => {
//   const safeUsers = users.map(({ password, ...user }) => user);
//   res.json(safeUsers);
// });

// // ✅ Start Server
// app.listen(port, ()=>{
//   console.log(`server running on port ${port}`);
  
// })


// import express from "express";
// import cors from "cors";

// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// // In-memory user storage
// let users = [];
// let currentId = 1;

// app.post("/login", (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Username and password are required" });
//   }

//   const user = users.find(
//     (u) => u.username === username && u.password === password
//   );

//   if (user) {
//     return res.json({
//       success: true,
//       message: "Login successful!",
//       user: {
//         id: user.id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } else {
//     return res
//       .status(401)
//       .json({ success: false, message: "Invalid username or password" });
//   }
// });

// // ✅ Registration Endpoint
// app.post("/register", (req, res) => {
//   const { name, email, username, password } = req.body;

//   if (!name || !email || !username || !password) {
//     return res
//       .status(400)
//       .json({ success: false, message: "All fields are required" });
//   }

//   const existingUser = users.find(
//     (u) => u.username === username || u.email === email
//   );

//   if (existingUser) {
//     return res
//       .status(409)
//       .json({ success: false, message: "Username or email already exists" });
//   }

//   const newUser = {
//     id: currentId++,
//     name,
//     email,
//     username,
//     password, // ⚠ In real apps, always hash passwords!
//   };

//   users.push(newUser);
//   console.log("✅ Registered user:", newUser);

//   return res.json({
//     success: true,
//     message: "User registered successfully",
//     user: {
//       id: newUser.id,
//       name: newUser.name,
//       username: newUser.username,
//       email: newUser.email,
//     },
//   });
// });


// app.get("/users", (req, res) => {
//   const safeUsers = users.map(({ password, ...user }) => user);
//   res.json(safeUsers);
// });


// app.post("/community", (req, res) => {
//   const question = req.body;
//   console.log("🟢 New community question received:", question);
//   res.json({ success: true, message: "Question logged on backend" });
// });

// app.listen(port, () => {
//   console.log(`server running on port ${port}`);
// });

