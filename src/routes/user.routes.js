const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
let users = []; // vaqtinchalik database
let currentId = 1;
// 1) GET - hamma userlarni olish


// 2) POST - yangi user qo'shish
router.post("/", (req, res) => {
 const { name } = req.body;

const newUser = {
  id: currentId++,
  name: name
};
  users.push(newUser);

  res.json({
    message: "User qo'shildi",
    user: newUser
  });
});
// 3) PUT - user yangilash
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;

  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User topilmadi" });
  }

  user.name = name;

  res.json({
    message: "User yangilandi",
    user: user
  });
});
// 4) DELETE - user o'chirish
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "User topilmadi" });
  }

  const deletedUser = users.splice(index, 1);

  res.json({
    message: "User o'chirildi",
    user: deletedUser[0]
  });
});
// 5) GET - hamma userlarni olish
router.get("/", (req, res) => {
  res.json({
    message: "Barcha userlar",
    users: users
  });
});
// SUPABASE TEST
router.get("/test", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});
module.exports = router;