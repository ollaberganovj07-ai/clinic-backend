// index.js
require("dotenv").config();
const app = require("./app"); // Bu qator app.js dagi barcha sozlamalarni olib keladi

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portda muvaffaqiyatli ishga tushdi`);
});