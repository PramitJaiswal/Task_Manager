const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");

const app = express();
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

app.use(express.json());
app.use(express.static("public"));

let tasks = [];
  // {
  //   id: 1,
  //   title: "Task 1",
  //   description: "Description 1",
  //   status: "Pending",
  //   pdf: null,
  // },
  // {
  //   id: 2,
  //   title: "Task 2",
  //   description: "Description 2",
  //   status: "Completed",
  //   pdf: null,
  // },
// ];

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  const newTask = req.body;
  newTask.id = tasks.length + 1;
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const updatedTask = req.body;
  tasks = tasks.map((task) =>
    task.id == id ? { ...task, ...updatedTask } : task
  );
  res.json(updatedTask);
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter((task) => task.id != id);
  res.status(204).send();
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.file;
  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  data.forEach((row, index) => {
    tasks.push({
      id: tasks.length + 1,
      title: row.Title || `Task ${tasks.length + 1}`,
      description: row.Description || "No description",
      status: row.Status || "Pending",
      pdf: null,
    });
  });

  res.send("File uploaded and processed successfully");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});