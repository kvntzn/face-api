const fs = require("fs");
const path = require("path");

const baseDir = path.resolve(__dirname, "../out");

function saveFile(fileName, buf) {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }

  fs.writeFileSync(path.resolve(baseDir, fileName), buf);
}

module.exports = {
  saveFile,
};
