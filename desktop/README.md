# HTTT Shop - Phiên Bản Desktop (Electron)

Đây là thư mục chứa mã nguồn để biến trang Web Frontend hiện tại thành một ứng dụng Desktop thực thụ (chạy trên Windows/macOS) bằng cách sử dụng **Electron**.

Cấu trúc này được thiết kế theo hướng **"Vỏ bọc" (Wrapper)**: 
- Ứng dụng Desktop sử dụng 100% code giao diện từ thư mục `frontend` (không bị lặp lại code).
- Hỗ trợ **Auto-Update**: Khách hàng tự động nhận được bản cập nhật mới khi bạn phát hành.

---

## 📦 Các Thư Viện Đã Sử Dụng
Dự án Desktop này sử dụng các thư viện chính sau:
- `electron` (v33.x): Core của ứng dụng Desktop, tạo ra một trình duyệt Chromium nhúng.
- `electron-builder` (v25.x): Đóng gói code thành file cài đặt `.exe` cho Windows hoặc `.dmg` cho macOS.
- `electron-updater` (v6.x): Hỗ trợ tự động tải xuống và cài đặt bản cập nhật mới từ xa.
- `electron-log` (v5.x): Lưu lịch sử lỗi/hoạt động của app vào file trên máy tính khách hàng để tiện debug.

---

## 🚀 Cách Cài Đặt Ban Đầu

1. Mở Terminal / Command Prompt và đi tới thư mục `desktop`:
   ```bash
   cd C:\HTTT\htttdn\desktop
   ```
2. Cài đặt các gói thư viện cần thiết:
   ```bash
   npm install
   ```
*(Lưu ý: Nếu bị lỗi trong lúc install liên quan đến giải nén Electron, hãy xem lại log chat hoặc tải thủ công file zip của Electron rồi giải nén vào `node_modules/electron/dist`).*

---

## 💻 Cách Chạy Trong Lúc Lập Trình (Dev Mode)

Trong lúc bạn đang code tính năng mới, bạn sẽ muốn sửa giao diện Web và thấy nó thay đổi ngay lập tức trên Desktop.

**Bước 1:** Khởi động Backend của bạn:
```bash
cd backend
npm run start:dev
```

**Bước 2:** Khởi động Frontend Web:
```bash
cd frontend
npm run dev
```

**Bước 3:** Mở cửa sổ Desktop:
```bash
cd desktop
npm run dev
```
Bây giờ, cửa sổ Desktop mở lên thực chất đang nhúng `http://localhost:5173`. Bạn **sửa code bên thư mục frontend**, ứng dụng Desktop sẽ tự động reload ngay lập tức (HMR). Bạn hoàn toàn không cần sửa gì trong folder `desktop` này nữa.

---

## 🔨 Cách Đóng Gói (Build ra file .exe)

Khi bạn code xong tính năng và muốn gửi bản hoàn chỉnh cho khách hàng cài đặt.

1. Hãy chắc chắn bạn đã cấu hình xong `BACKEND_URL` trong file `main.js` (Trỏ về link API thật trên server thay vì `localhost:3000`).
2. Nếu bạn thiết lập Auto Update, nhớ vào `package.json` chỉnh sửa thông tin `"publish"` (Thay `YOUR_GITHUB_USERNAME` thành tên của bạn).
3. Chạy lệnh đóng gói:
   ```bash
   cd desktop
   npm run dist
   ```
   *(Lưu ý: Nếu dùng Windows và bị lỗi `Cannot create symbolic link`, hãy chạy VS Code / Terminal bằng quyền **Run as administrator** hoặc bật **Developer Mode** của Windows lên rồi chạy lại lệnh này).*

Kết quả: File cài đặt sẽ nằm ở thư mục `desktop/release/HTTT Shop Setup x.x.x.exe`. Gửi file này cho khách hàng!

---

## 🔄 Cơ Chế Auto Update Hoạt Động Ra Sao?

Trong file `main.js`, mình đã viết sẵn logic kiểm tra cập nhật (chỉ chạy ở bản đã đóng gói `.exe`, không chạy ở môi trường Dev).

**Luồng hoạt động cho khách hàng:**
1. Khách hàng đang dùng bản `v1.0.0`. Bạn code tính năng mới, tăng version trong `package.json` lên `1.0.1`.
2. Bạn build ra file `.exe` mới và đưa file cài đặt đó (kèm file `latest.yml` do electron-builder tự sinh ra) lên mạng (Ví dụ: Release của GitHub).
3. Lần tới khi khách hàng mở app, `electron-updater` sẽ kiểm tra link GitHub đó, phát hiện có bản `1.0.1`.
4. App sẽ tự động tải file `.exe` mới về chạy ngầm (Sẽ có log báo "Đã tìm thấy bản cập nhật...").
5. Tải xong, một bảng thông báo sẽ bật lên hỏi khách hàng: *"Một phiên bản mới đã được tải xuống. Khởi động lại ứng dụng để áp dụng bản cập nhật."*. Khách hàng bấm OK -> App tự động cài bản mới và mở lại.

Đơn giản và không cần khách phải tự đi download lại từ đầu!
