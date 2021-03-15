const express = require("express");
const fileUpload = require("express-fileupload");
const faceApiService = require("./faceApiService");

const app = express();
const port = process.env.PORT || 3000;

app.use(fileUpload());

app.post("/upload", async (req, res) => {
  const { file } = req.files;

  const result = await faceApiService.detect(file.data, file.name);

  res.json({
    detectedFaces: result.length,
    url: `http://localhost:3000/out/${file.name}`,
  });
});

app.use("/out", express.static("out"));

app.listen(port, () => {
  console.log("Server started on port" + port);
});
