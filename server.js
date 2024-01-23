const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Dummy array to store users and tasks
const users = [];
const tasks = [];

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(
  session({ secret: "your-secret-key", resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy((username, password, done) => {
    const user = users.find((u) => u.username === username);
    if (!user) {
      return done(null, false, { message: "Incorrect username." });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: "Incorrect password." });
    }
    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user);
});

// Serve login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Serve register page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

// Serve dashboard page only if authenticated
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

// Serve tasks page only if authenticated
app.get("/tasks", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "tasks.html"));
});

// Handle login
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Handle logout
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

// Handle registration
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id: users.length + 1, username, password: hashedPassword };
  users.push(user);
  res.redirect("/login");
});

// Check if the user is authenticated
app.get("/user", (req, res) => {
  res.json({ user: req.isAuthenticated() ? req.user : null });
});

// Get all tasks
app.get("/api/tasks", isAuthenticated, (req, res) => {
  res.json({ tasks });
});

// Add a new task
app.post("/api/tasks", isAuthenticated, (req, res) => {
  const { text } = req.body;
  const newTask = { id: tasks.length + 1, text };
  tasks.push(newTask);
  res.json({ success: true, task: newTask });
});

// Delete a task
app.delete("/api/tasks/:id", isAuthenticated, (req, res) => {
  const taskId = parseInt(req.params.id);
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index !== -1) {
    tasks.splice(index, 1);
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Task not found" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
