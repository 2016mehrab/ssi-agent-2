const express = require("express");
const webhookRoutes = require("./src/routes/webhookRoutes.js");
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
webhookRoutes(app);
app.get("/", (req, res) => {
  res.send(`Node and express running on port ${PORT}`);
});
try {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
} catch (error) {
  console.error(error);
}
