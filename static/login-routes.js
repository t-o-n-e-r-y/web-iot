const path = require('path');
const session = require('express-session'); // nếu chưa có thì thêm

module.exports = function (app) {
  // Dữ liệu user mẫu
  const USER = {
    username: 'admin',
    password: 'nmp'
  };

  // Route xử lý login
  app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === USER.username && password === USER.password) {
      req.session.user = username;
      res.redirect('/sensor/html/dashboard.html');
    } else {
      res.send(`
        <h1>Đăng nhập thất bại</h1>
        <p>Sai tên đăng nhập hoặc mật khẩu.</p>
        <a href="/login.html">Thử lại</a>
      `);
    }
  });

  // Route logout
  app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
  });
};
