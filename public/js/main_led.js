// led.js — chỉ xử lý điều khiển LED

// 1. Kết nối socket (nếu không có global socket)

// 2. Khi nhận trạng thái LED từ ESP32
socket.on('ledStatus', (status) => {
  document.getElementById('led-status').innerText = status.toUpperCase();
});

// 3. Gửi lệnh khi nhấn nút
document.getElementById('btn-on').addEventListener('click', () => {
  socket.emit('led', 'on');
  console.log('on')
});

document.getElementById('btn-off').addEventListener('click', () => {
  socket.emit('led', 'off');
  console.log('off')
});
