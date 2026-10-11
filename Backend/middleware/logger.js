const fs = require("fs");
const path = require("path");

const logger = (req, res, next) => {
  const log = `
Time   : ${new Date().toLocaleString()}
Method : ${req.method}
URL    : ${req.originalUrl}
IP     : ${req.ip}
----------------------------------
`;

  const logsDir = path.join(__dirname, "../logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  fs.appendFile(path.join(logsDir, "data.txt"), log, (err) => {
    if (err) console.log(err);
  });

  next();
};

module.exports = logger;
