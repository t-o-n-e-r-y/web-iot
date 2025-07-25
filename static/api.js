const fs = require('fs');
const path = require('path');

module.exports = function (app) {
  app.get('/api/data', (req, res) => {
    const filePath = path.join(__dirname, 'data_temp.csv');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('❌ Lỗi đọc file:', err.message);
        return res.status(500).send('Không thể đọc dữ liệu.');
      }

      const lines = data.trim().split('\n');
      if (lines.length <= 1) {
        return res.json({ labels: [], temp: [], humi: [] });
      }

      let rows = lines.slice(-15); // Lấy 15 dòng cuối
      if (/[a-zA-Z]/.test(rows[0])) {
        rows.shift(); // Bỏ dòng tiêu đề nếu có
      }

      const labels = [];
      const temp = [];
      const humi = [];

      rows.forEach((line) => {
        const [time, t, h] = line.trim().split(',');
        labels.push(time);
        temp.push(parseFloat(t));
        humi.push(parseFloat(h));
      });

      res.json({ labels, temp, humi });
    });
  });
};

const { getLatest } = require('./mqtt-handler');

module.exports = function (app) {
  app.get('/api/latest', (req, res) => {
    res.json(getLatest());
  });
};
