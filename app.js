const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

mongoose.connect('mongodb://127.0.0.1:27017/contactbook', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const contactsRouter = require("./app/routes/contact.route");
const ApiError = require("./app/api-error");

app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:8000']
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: "Welcome to contact book application. hehe" })
})

app.use("/api/contacts", contactsRouter);
app.use((req, res, next) => {
  // Code ở đây sẽ chạy khi không có route được định nghĩa nào
  // khớp với yêu cầu. Gọi next() để chuyển sang middleware xử lý lỗi
  // res.status(404).send("Sorry can't find that!")
  return next(new ApiError(404, "Resource not found"));
});
app.use((err, req, res, next) => {
  // Middleware xử lý lỗi tập trung.
  // Trong các đoạn code xử lý ở các route, gọi next(error)
  // sẽ chuyển về middleware xử lý lỗi này
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app