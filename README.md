# TMS Logistics PWA

Ứng dụng web tiến bộ (Progressive Web App) mẫu dành cho quản lý vận tải và logistics, được tối ưu hoá cho thiết bị di động.

## Tính năng

| Tính năng | Mô tả |
|---|---|
| 📊 **Dashboard** | KPI tổng quan, thao tác nhanh, đơn hàng gần đây |
| 📦 **Đơn hàng** | Danh sách đầy đủ, lọc theo trạng thái, tìm kiếm |
| 🧑‍✈️ **Tài xế** | Trạng thái hoạt động, thông tin phương tiện |
| 🗺️ **Tuyến đường** | Điểm dừng, tiến độ tuyến đường |
| 📲 **Cài đặt như app** | Web App Manifest – thêm vào màn hình chính |
| 📶 **Offline** | Service Worker – hoạt động không cần mạng |

## Chạy và xem thử

### Cách 1 — VS Code Live Server (khuyên dùng)
1. Cài extension **Live Server** trong VS Code
2. Mở thư mục dự án, nhấp chuột phải vào `index.html` → **Open with Live Server**
3. Trình duyệt mở tự động tại `http://127.0.0.1:5500`

### Cách 2 — Python (không cần cài thêm gì)
```bash
# Python 3
python -m http.server 8080
# Python 2
python -m SimpleHTTPServer 8080
```
Mở trình duyệt tại: **http://localhost:8080**

### Cách 3 — Node.js `serve`
```bash
npx serve .
```
Mở trình duyệt tại: **http://localhost:3000**

> **Lưu ý:** Service Worker yêu cầu phải chạy qua HTTP server (không mở trực tiếp file `index.html` từ hệ thống tệp).

## Xem trên di động
1. Kết nối máy tính và điện thoại vào cùng mạng WiFi
2. Chạy một trong các lệnh server trên
3. Tìm địa chỉ IP của máy tính (ví dụ `192.168.1.5`)
4. Mở trình duyệt di động tại: `http://192.168.1.5:8080`
5. Nhấn **"Thêm vào màn hình chính"** để cài như app thật

## Cài như PWA (trên máy tính)
1. Mở Chrome/Edge, truy cập địa chỉ server
2. Nhấp biểu tượng cài đặt (⊕) trên thanh địa chỉ
3. Chọn **"Cài đặt TMS Logistics"**

## Cấu trúc dự án

```
WEBAPP_TMS/
├── index.html              # Trang chính (app shell)
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service Worker (offline)
├── css/
│   └── style.css           # Giao diện mobile-first
├── js/
│   └── app.js              # Logic ứng dụng & dữ liệu mẫu
├── icons/
│   ├── icon-192.svg        # Icon 192×192
│   └── icon-512.svg        # Icon 512×512
└── README.md
```

## Tuỳ chỉnh

- **Dữ liệu:** Chỉnh sửa đối tượng `DATA` trong `js/app.js`
- **Màu sắc:** Thay đổi CSS custom properties (`:root`) trong `css/style.css`
- **Icon:** Thay thế file trong thư mục `icons/` bằng hình PNG/SVG thực tế
- **Tích hợp API:** Thay thế mảng `DATA` bằng `fetch()` tới backend của bạn
