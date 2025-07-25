// Kết nối socket.io
window.socket = io();


// Khi nhận dữ liệu cảm biến từ server
socket.on('sensorData', (data) => {
  document.getElementById('temp').innerText = data.temp;
  document.getElementById('humi').innerText = data.humi;
  document.getElementById('time').innerText = data.time;
});

