
// ======================= KẾT NỐI MQTT & XỬ LÝ DỮ LIỆU ========================
const mqtt = require('mqtt');                   
const fs = require('fs');
const path = require('path');

let latestData = { temp: null, humi: null, time: null };
let lastWrittenMinute = -1;
let client = null;

module.exports = function(io) {
  // === 1. Kết nối MQTT Broker ===
  client = mqtt.connect('mqtt://localhost');
  client.on('connect', () => {
    console.log('✅ MQTT đã kết nối!');
    client.subscribe('home/dht11');   // Cảm biến 1: Nhiệt độ / độ ẩm
    client.subscribe('home/led/status');     // Trạng thái phản hồi từ ESP32
    client.subscribe('home/gas');     // 👉 CẢM BIẾN THỨ 3 (ví dụ khí gas) — THÊM Ở ĐÂY
    // THÊM CÁC ĐƯỜNG DẪN TOPIC TẠI ĐÂY
    // ----------------------------------------------
    // |                                            |
    // |                                            |
    // |                                            |
    // ----------------------------------------------
  });

  // === 2. Lắng nghe kết nối từ Web Client
  io.on('connection', (socket) => {
    console.log('🌐 Web client đã kết nối');

    // 2.1. Nhận lệnh điều khiển LED từ giao diện Web
    socket.on('led', (status) => {
      console.log('⚡ Web yêu cầu điều khiển LED:', status);
      if (client && client.connected) {
        client.publish('home/led/status', status);  // Gửi xuống ESP32
      }
    });
  });

  // === 3. Nhận tất cả dữ liệu từ MQTT Broker
  client.on('message', (topic, message) => {
    if (topic === 'home/dht11') handleSensor(message);        // 👉 Xử lý cảm biến nhiệt độ/độ ẩm
    else if (topic === 'home/led/status') handleLedStatus(message);  // 👉 Xử lý trạng thái LED phản hồi
    else if (topic === 'home/gas') handleGasSensor(message);  // 👉 XỬ LÝ CẢM BIẾN THỨ 3 — THÊM Ở ĐÂY
    // THÊM CÁC TOPIC CẢM BIẾN 4,5,6,.. Ở ĐÂY
    // ----------------------------------------------
    // |                                            |
    // |                                            |
    // |                                            |
    // ----------------------------------------------
  });

  // === 3.1. Hàm xử lý dữ liệu từ cảm biến nhiệt độ/độ ẩm
  function handleSensor(message) {
    try {
      const { temp, humi } = JSON.parse(message.toString());
      const now = new Date();
      const time = now.toTimeString().slice(0, 8);
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      if (minutes % 1 === 0 && seconds === 0 && minutes !== lastWrittenMinute) {
        lastWrittenMinute = minutes;

        const line = `${time},${temp},${humi}\n`;
        const filePath = path.join(__dirname, '../data_temp.csv');

        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, 'Thời gian,Nhiệt độ,Độ ẩm\n');
        }

        fs.appendFile(filePath, line, err => {
          if (err) console.error('❌ Lỗi ghi file:', err.message);
          else console.log(`🕒 Ghi: ${temp}°C / ${humi}%`);
        });
      }

      latestData = { temp, humi, time };
      console.log('📡 Dữ liệu cảm biến:', latestData);

      if (io) io.emit('sensorData', latestData);

    } catch (err) {
      console.error('❌ Lỗi xử lý JSON cảm biến:', err.message);
    }
  }

  // === 3.2. Hàm xử lý trạng thái LED từ ESP32 phản hồi
  function handleLedStatus(message) {
    const status = message.toString();
    console.log('💡 ESP32 phản hồi trạng thái LED:', status);
    if (io) io.emit('ledStatus', status);
  }

  // === 3.3. 👉 HÀM XỬ LÝ CẢM BIẾN THỨ 3 — VIẾT HẲN RIÊNG PHẦN NÀY
  function handleGasSensor(message) {
    try {
      const gasValue = JSON.parse(message.toString()).gas;
      const time = new Date().toTimeString().slice(0, 8);

      console.log(`💨 Nồng độ khí gas: ${gasValue} ppm (${time})`);

      // Ghi file CSV riêng cho gas
      const filePath = path.join(__dirname, '../data_gas.csv');
      const line = `${time},${gasValue}\n`;
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'Thời gian,Nồng độ khí gas (ppm)\n');
      }
      fs.appendFile(filePath, line, err => {
        if (err) console.error('❌ Lỗi ghi file gas:', err.message);
      });

      // Gửi realtime về giao diện Web
      if (io) io.emit('gasData', { gas: gasValue, time });

    } catch (err) {
      console.error('❌ Lỗi xử lý dữ liệu gas:', err.message);
    }
  }
  // === 3.3. 👉 HÀM XỬ LÝ DỮ LIỆU CÁC CẢM BIẾN THỨ 4,5,6 — VIẾT RIÊNG TỪNG PHẦN TẠI ĐÂY
    // ----------------------------------------------
    // |                                            |
    // |                                            |
    // |                                            |
    // ----------------------------------------------
};

// === 4. Truy xuất dữ liệu mới nhất nếu cần từ module khác
module.exports.getLatest = () => latestData;
