# Hướng dẫn kiểm thử thủ công MIVA từ đầu đến cuối

Tài liệu đối chiếu với mã nguồn hiện tại ngày 21/10/2026. Đây là kịch bản và tiêu chí cần kiểm chứng, không phải biên bản khẳng định tất cả chức năng đã đạt.

## 1. Chuẩn bị môi trường

Mở 5 terminal tại `C:\DoAnHTTDN\htttdn`. Nếu ứng dụng đã chạy thì dùng các phiên hiện có.

| Phần mềm | Thư mục | Lệnh khởi động | Địa chỉ |
|---|---|---|---|
| Backend | `backend` | `npm run start:dev` | http://localhost:3000/api |
| Khách hàng | `frontend` | `npm run dev` | http://localhost:5173 |
| Admin | `admin` | `npm run dev` | http://localhost:5174 |
| Vendor | `vendor` | `npm run dev` | http://localhost:5175 |
| Employee | `employee` | `npm run dev` | http://localhost:5176 |

Kiểm tra PostgreSQL đang chạy và backend báo khởi động thành công. Dùng nhất quán hostname `localhost`.

Mở 4 cửa sổ hoặc 4 tab để quan sát các vai trò cùng lúc. Dùng hồ sơ trình duyệt riêng khi cần đăng nhập hai tài khoản cùng một vai trò.

| Vai trò | Email | Mật khẩu | Địa chỉ |
|---|---|---|---|
| Admin | `admin1@miva.vn` | `admin123` | http://localhost:5174/login |
| Vendor | `vendor1@miva.vn` | `admin123` | http://localhost:5175/login |
| Employee | `employee1@miva.vn` | `admin123` | http://localhost:5176 |
| Khách hàng | Tự đăng ký tài khoản test mới | Tự chọn, ít nhất 6 ký tự | http://localhost:5173/register |

Ba tài khoản mẫu trên đã được kiểm tra tồn tại, đang hoạt động và khớp mật khẩu. Các tài khoản bổ sung phải kiểm tra trạng thái trước khi dùng.

Quy ước kết quả: PASS = đúng toàn bộ kỳ vọng; FAIL = có sai khác; BLOCKED = không thể chạy do thiếu tiền điều kiện. Với ca realtime, giữ nguyên màn hình quan sát, không F5 hoặc bấm tải lại. Chọn mục tiêu kiểm thử trong môi trường local là dữ liệu xuất hiện trong 1–3 giây; đây là ngưỡng đánh giá đề xuất, không phải cam kết tốc độ của hệ thống.

## 2. Tạo bộ dữ liệu test dễ đối chiếu

1. Khách đăng ký email mới, ví dụ `manual.test.01@example.com`. Nếu đã tồn tại thì đổi hậu tố. Đăng ký thành công phải chuyển về trang đăng nhập với thông báo thành công và email điền sẵn; nhập mật khẩu để tự đăng nhập.
2. Admin tạo danh mục `TEST-MANUAL-01` nếu chưa có.
3. Vendor 1 tạo sản phẩm `TEST-AO-MANUAL-01`, chọn danh mục trên, trạng thái đang bán, màu Đen, size M, giá 100.000đ, tồn kho 10, có ảnh.
4. Tạo thêm size L giá 120.000đ, tồn kho 3 để kiểm tra đổi biến thể.
5. Chạy luồng COD cơ bản trước, chưa dùng voucher. Test tạo voucher admin và vendor riêng theo mục 8.1–8.4 bên dưới; có bảng nhập mẫu và các điểm giao diện hiện còn thiếu. Không cần tạo được voucher mới tiếp tục các ca mua hàng COD không dùng mã.
6. Ghi lại tồn kho, số đơn, lượt dùng voucher, doanh thu của bộ lọc đang xem trước mỗi ca.
7. Dùng các đơn riêng: Đơn A giao thành công; Đơn B khách hủy; Đơn C thanh toán demo; Đơn D giao thất bại; Đơn E mua nhiều vendor. Ghi mã thật sau khi đặt.

Không chạy lại seed/reset database giữa các bước vì sẽ mất dữ liệu đối chiếu.

## 3. Luồng chính: mua hàng COD đến giao thành công

| Mã | Vai trò, thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| E01 | Khách vào trang chủ, tìm `TEST-AO-MANUAL-01` và mở chi tiết | Đúng tên, ảnh, shop, màu/size, giá và tồn kho | |
| E02 | Chọn M, thêm 2 sản phẩm vào giỏ | Đúng biến thể, số lượng 2, thành tiền 200.000đ | |
| E03 | Thay số lượng trong giỏ 2 → 1 → 2; mở lại giỏ | Số lượng và tổng tiền được lưu đúng, không sinh dòng trùng ngoài ý muốn | |
| E04 | Thanh toán, điền người nhận/SĐT/địa chỉ; luồng COD cơ bản chưa dùng voucher | Với riêng mặt hàng này: tiền hàng 200.000đ, chưa giảm giá, cộng phí giao hàng đúng số hiển thị. Test áp dụng mã riêng ở mục 8.3 | |
| E05 | Chọn COD, đặt Đơn A và ghi mã đơn | Tạo đơn thành công; thông tin nhận hàng đúng; chỉ các dòng đã mua được loại khỏi giỏ | |
| E06 | Kiểm tra tồn kho size M; nếu đơn thuộc ca test voucher, kiểm tra thêm lượt dùng mã | Tồn 10 → 8 nếu đây là lần mua đầu; đơn không dùng mã không tăng lượt voucher; đơn dùng mã hợp lệ tăng đúng 1 lượt; mở lại trang không trừ/tăng lại | |
| E07 | Admin mở `/orders`, tìm đúng mã Đơn A | Có đúng đơn, tổng tiền, khách hàng, payment, các kiện và lịch sử; danh sách đang mở nhận được đơn mới qua realtime | |
| E08 | Admin kiểm tra người được phân công; nếu khác Employee 1, phân công lại cho Employee 1 trong chi tiết đơn | Vận đơn gắn đúng nhân viên, có ghi vết phân công | |
| E09 | Employee 1 mở `/orders`, tìm Đơn A | Đơn được phân công xuất hiện; các thao tác hiện đúng quyền | |
| E10 | Employee xác nhận đơn, rồi chuyển cho vendor nếu có thao tác tương ứng | Đơn đi từ chờ xác nhận sang đã xác nhận/đang xử lý; lịch sử ghi người thực hiện, thời điểm và ghi chú | |
| E11 | Vendor mở `/fulfillment`, tìm kiện theo mã đơn/kiện | Đơn chưa xác nhận: nút đóng gói bị khóa và hiển thị chờ MIVA xác nhận. Admin/employee xác nhận: kiện chuyển `confirmed`, nút tự mở không F5; không tạo trùng kiện/vận đơn | |
| E12 | Bấm “Tiếp nhận & Bắt đầu đóng gói”, sau đó “Đã đóng gói xong - Sẵn sàng bàn giao” | Kiện đi qua `confirmed → processing → ready_for_pickup`; đơn giữ `processing`, vận đơn `picking_up`. Chỉ khi bấm “Xác nhận bưu tá đã lấy hàng” mới chuyển kiện/đơn sang `shipping`, vận đơn `in_transit`; các màn hình tự cập nhật | |
| E13 | Employee hoặc admin mở `/shipping`, tìm vận đơn của Đơn A | Có vận đơn, đúng kiện và nhân viên phụ trách | |
| E14 | Cập nhật lần lượt đang luân chuyển → đang giao → giao thành công; mỗi lần thêm vị trí và mô tả | Có sự kiện giao hàng mới, giữ đúng thứ tự và người thao tác; đơn/kiện cập nhật phù hợp | |
| E15 | Giao thành công tất cả vận đơn thuộc Đơn A | Đơn `completed`, kiện liên quan `delivered`, thanh toán COD `paid`; ngày giao và lịch sử được lưu | |
| E16 | Khách mở đơn và đánh giá sản phẩm, ví dụ 5 sao với nội dung có mã test | Đánh giá gắn đúng đơn/sản phẩm; gửi lại cùng dòng hàng bị chặn | |
| E17 | Vendor/Admin xem đánh giá; khách mở lại chi tiết sản phẩm | Đúng nội dung, khách và số sao sau khi tải dữ liệu mới; kiểm tra lại số lượng/điểm đánh giá | |
| E18 | Vendor xem dashboard; admin mở báo cáo với bộ lọc ngày chứa Đơn A | Đơn hoàn thành, doanh thu và khoản giảm giá được tính theo đúng định nghĩa chỉ tiêu; không cộng hai lần | |

Lưu ý: mã đơn hàng, mã kiện vendor và mã vận đơn là ba mã khác nhau. Ghi đủ để tìm trên từng màn hình. Một đơn mới có thể được hệ thống tự phân công cho nhân viên khác, nên E08 là bước cần kiểm tra.

## 4. Ma trận test realtime

Mỗi lần chỉ thực hiện một thay đổi để xác định chính xác màn hình nào nhận sự kiện. Đánh dấu riêng kết quả của danh sách, badge và hộp chi tiết đang mở.

| Mã | Thao tác ở cửa sổ A | Quan sát ở cửa sổ B, không F5 | Kết quả thực tế |
|---|---|---|---|
| RT01 | Vendor sửa giá hoặc tồn kho sản phẩm test | Trang danh sách/chi tiết sản phẩm của khách đăng nhập và khách vãng lai tự cập nhật | |
| RT02 | Khách đặt đơn mới | Danh sách đơn admin và vendor xuất hiện đơn; số liệu dashboard liên quan thay đổi | |
| RT03 | Admin phân công lại đơn cho Employee 1 | Danh sách đơn và vận chuyển của Employee 1 cập nhật | |
| RT04 | Vendor cập nhật trạng thái kiện | Khách, admin và employee thấy tiến trình liên quan cập nhật | |
| RT05 | Employee cập nhật vận đơn | Khách, admin và vendor thấy vận đơn/đơn mới nhất | |
| RT06 | Admin gửi thông báo cho Employee 1 | Badge chưa đọc tăng ngay; mở danh sách thấy đúng thông báo | |
| RT07 | Giữ sẵn cửa sổ thông báo của Employee 1 mở, rồi admin gửi tiếp | Kiểm tra cả badge và nội dung danh sách đang mở; không coi badge đổi là đủ PASS | |
| RT08 | Khách đọc thông báo trong tab 1 | Tab 2 đăng nhập cùng khách cập nhật số chưa đọc; danh sách đang mở cập nhật trạng thái đọc | |
| RT09 | Admin/vendor gửi khảo sát đúng đối tượng | Khách đủ điều kiện nhận badge và lời mời; không có lời mời gửi trùng | |
| RT10 | Mất mạng ở một tab, thay đổi dữ liệu ở tab khác, rồi nối lại mạng | Socket kết nối lại và màn hình tải dữ liệu mới; không chỉ chờ sự kiện tiếp theo | |
| RT11 | Đăng xuất rồi đăng nhập tài khoản khác cùng vai trò | Không nhận dữ liệu riêng hoặc sự kiện thuộc tài khoản trước | |
| RT12 | Hai tab cùng sửa số lượng/đặt mua biến thể còn 1 sản phẩm | Không bán quá tồn; một lần mua hợp lệ, lần còn lại nhận lỗi rõ ràng; tồn không âm | |
| RT13 | Admin tạo, đổi tên rồi xóa danh mục trong khi các màn hình khác đang mở | Trang chủ, menu danh mục, bộ lọc sản phẩm và lựa chọn danh mục của admin/vendor tự cập nhật, không F5 | |

Không mặc định tất cả module đều realtime. Bảng lương, hồ sơ, đánh giá và phê duyệt vendor phải kiểm tra riêng khả năng tải dữ liệu mới. Dashboard/analytics vendor đã nhận thay đổi đơn, sản phẩm và vận đơn; chưa có sự kiện cho đánh giá mới. Ghi rõ cần chuyển trang/F5 nếu màn hình chưa có nhận sự kiện.

Có thể chạy lại kiểm tra danh mục trên hai cửa sổ trình duyệt tự động bằng `node test/category-realtime.manual.cjs` trong thư mục `backend`, khi backend/frontend/admin đang chạy. Script dùng tài khoản admin mẫu, xác nhận tạo/sửa/xóa và tạo lại danh mục đã xóa hiện ngay ở trang chủ, rồi tự dọn danh mục test đã tạo. Mặc định dùng Edge đã cài trên Windows; biến `MIVA_BROWSER_CHANNEL` cho phép chọn kênh Playwright khác đã cài.

### Kết quả kiểm tra đồng bộ vendor ngày 21/10/2026

Đã chạy `node test/vendor-sync.manual.cjs` trong `backend` với backend/frontend/admin/vendor đang mở. Script dùng khách, danh mục, sản phẩm và đơn test riêng; tự dọn dữ liệu sau khi chạy. Các thay đổi được thực hiện qua API thật, thao tác đóng gói bằng giao diện trình duyệt và quan sát các trang đang mở; không tải lại trang.

| Luồng kiểm tra | Kết quả thực tế |
|---|---|
| Admin đổi danh mục → bộ chọn danh mục vendor | PASS, không F5 |
| Vendor tạo sản phẩm, sửa giá/tồn → trang vendor và chi tiết sản phẩm của khách vãng lai | PASS, không F5 |
| Khách đặt hàng → đơn admin/vendor/khách, kiện và vận đơn; tồn trừ đúng số lượng | PASS, không F5 |
| Đơn chưa được MIVA xác nhận | PASS, UI khóa đóng gói; API từ chối thao tác đóng gói sớm |
| Xác nhận → đóng gói → sẵn sàng bàn giao → bưu tá lấy hàng | PASS, đối chiếu đúng trạng thái đơn/kiện/vận đơn trong database; không tạo trùng |
| Giao thành công → kiện, đơn, COD, doanh thu dashboard/analytics | PASS, doanh thu tăng đúng tiền hàng test, không F5 |
| Quyền client và quyền sở hữu kiện của vendor | PASS, sai vai trò nhận 403; kiện shop khác nhận 404 |
| Lỗi JavaScript và tải lại các trang quan sát trong lượt chạy | Không có lỗi JavaScript; số lần tải lại trang bằng 0 |

Đã chạy thêm 14 unit test trong `orders.fulfillment.spec.ts`, kiểm tra kiểu backend và build admin/vendor thành công. Đã đồng bộ lại 1 kiện cũ đang `pending` trong đơn đã chuyển `processing`, qua API có ghi chú lịch sử; sau đối chiếu không còn kiện `pending` thuộc đơn `confirmed`/`processing`.

Các mục chưa được xác nhận PASS toàn bộ: realtime đánh giá mới, kết quả khảo sát, cập nhật hồ sơ/phê duyệt, ngắt mạng/kết nối lại và bản desktop. Tạo/sửa voucher và giá sau giảm trên cả form vendor, sản phẩm, giỏ hàng/thanh toán đã kiểm chứng ở mục 8. Dashboard/analytics hiện tổng hợp tối đa 100 sản phẩm, lấy đánh giá cho tối đa 30 sản phẩm; cần kiểm tra riêng khi dữ liệu vượt ngưỡng này.

## 5. Test đăng nhập, phiên và phân quyền

| Mã | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| AU01 | Đăng nhập đúng từng tài khoản ở đúng cổng | Vào đúng giao diện và đúng tên người dùng | |
| AU02 | Sai mật khẩu, email không tồn tại, bỏ trống, email sai định dạng | Báo lỗi rõ, không tạo phiên đăng nhập | |
| AU03 | Đăng ký email đã tồn tại; mật khẩu dưới 6 ký tự | Chặn và chỉ đúng lỗi nhập liệu | |
| AU04 | F5, đóng/mở tab khi vẫn còn phiên | Thông tin phiên được phục hồi đúng; không đổi vai trò | |
| AU05 | Đăng nhập admin, vendor, employee và khách trong cùng trình duyệt | Các phiên theo vai trò hoạt động độc lập | |
| AU06 | Đăng xuất một vai trò | Trang bảo vệ của vai trò đó bị chặn; các vai trò khác vẫn hoạt động | |
| AU07 | Chưa đăng nhập nhưng mở URL trang quản trị/checkout/đơn hàng | Chuyển đăng nhập hoặc báo không có quyền; không lộ dữ liệu | |
| AU08 | Dùng tài khoản sai vai trò ở một cổng | Không truy cập được thao tác/dữ liệu dành cho vai trò khác; kiểm tra cả API bị từ chối trong Network | |
| AU09 | Hai khách khác nhau; thử truy cập URL chi tiết đơn của khách còn lại nếu giao diện có đường dẫn | Không xem hoặc sửa được đơn của người khác | |
| AU10 | Vendor 2 hoặc employee không được phân công thử truy cập dữ liệu của bên khác qua đường dẫn có sẵn | API từ chối tài nguyên ngoài quyền; đổi mã trên URL không được vượt quyền | |
| AU11 | Đăng ký khách/vendor mới trong phiên chưa đăng nhập, rồi thử vào trang cần tài khoản trước khi đăng nhập | Chuyển về đăng nhập sau khi đăng ký, không cấp cookie phiên; trang bảo vệ bị chặn. Email chưa đăng ký hoặc mật khẩu sai không đăng nhập được; chỉ đăng nhập đúng mới vào hệ thống | |

Khi kiểm tra quyền bằng giao diện mà không tạo được yêu cầu tới API, đánh dấu phần kiểm tra API là BLOCKED/chưa kiểm chứng. Một nút bị ẩn chưa chứng minh backend đã chặn quyền.

Chạy kiểm tra tự động luồng đăng ký → đăng nhập của khách và vendor bằng `node test/registration-login.manual.cjs` trong thư mục `backend`, khi backend/frontend/vendor đang chạy. Script đăng ký các tài khoản test mới qua UI, kiểm tra chưa có phiên trước khi đăng nhập, kiểm tra truy cập trang bảo vệ và đăng nhập thủ công, rồi tự dọn các tài khoản đã tạo.

## 6. Test sản phẩm, tìm kiếm, giỏ và địa chỉ

| Mã | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| PR01 | Vendor thêm/sửa sản phẩm, màu, size, giá, ảnh và tồn kho | Lưu đúng; khách và admin đọc được giá trị mới; F5 vẫn còn | |
| PR02 | Bỏ tên/danh mục, nhập giá âm/tồn âm/size trùng | Bị chặn; không lưu một phần dữ liệu sai | |
| PR03 | Ẩn hoặc xóa mềm sản phẩm test | Không còn mua mới được; dữ liệu đơn cũ và tên/giá đã mua vẫn đúng | |
| PR04 | Tìm theo tên có dấu/không có kết quả, lọc danh mục/giá, chuyển trang | Kết quả phù hợp, số trang và tổng số đúng; không giữ nhầm trang cũ sau đổi lọc | |
| PR05 | Thay màu/size trên chi tiết | Giá, ảnh, tồn kho và biến thể thêm giỏ tương ứng | |
| PR06 | Thêm số lượng 0, âm, lớn hơn tồn; mua biến thể hết hàng | Chặn số lượng không hợp lệ ở thời điểm đặt; tồn không âm | |
| PR07 | Chỉ chọn một phần giỏ hoặc một shop để mua | Chỉ các dòng đã chọn được đặt và loại khỏi giỏ; các dòng khác còn nguyên | |
| PR08 | Thêm/bỏ yêu thích, đăng xuất/đăng nhập lại | Trạng thái yêu thích lưu đúng theo tài khoản | |
| PR09 | Tạo/sửa/xóa địa chỉ, đổi địa chỉ mặc định | Checkout nhận đúng địa chỉ; địa chỉ trên đơn đã đặt không tự đổi theo hồ sơ | |
| PR10 | Đổi hồ sơ khách/vendor/employee rồi mở lại | Lưu và đọc lại đúng; không đổi nhầm thông tin vai trò khác | |

## 7. Test hủy, giao thất bại và nhiều vendor

| Mã | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| OR01 | Tạo Đơn B COD mua 2 sản phẩm, rồi khách hủy khi còn chờ xác nhận | Đơn hủy; tồn tăng lại đúng 2; hoàn lượt voucher theo chính sách; payment và vận đơn cập nhật phù hợp | |
| OR02 | Thử hủy lại Đơn B hoặc mở hai tab bấm hủy gần đồng thời | Không hoàn tồn/voucher hai lần; trạng thái không thay đổi sai | |
| OR03 | Khách thử hủy đơn đã được xác nhận/đang giao/hoàn thành | Không cho hủy ngoài quy tắc hiện tại | |
| OR04 | Vendor hủy kiện, rồi admin hủy đơn cha nếu thao tác còn được phép | Không hoàn kho hai lần; tổng tiền/trạng thái thanh toán và các kiện nhất quán | |
| OR05 | Tạo Đơn D, vận chuyển báo thất bại với lý do, sau đó hoàn hàng | Có lý do và timeline; không tự ghi nhận giao thành công hoặc thu COD; kiểm tra kho và payment khi chốt xử lý | |
| OR06 | Employee lập sự cố/chuyển tiếp admin hoặc thông báo vendor | Đúng bên nhận, đúng mã đơn/nội dung, có lịch sử; chuông và danh sách thông báo cập nhật | |
| OR07 | Tạo Đơn E gồm hàng của Vendor 1 và một vendor khác | Hệ thống hiện tách đơn theo vendor: tổng tiền các đơn con đúng tổng đã chọn, mỗi shop chỉ thấy phần của mình | |
| OR08 | Giao một đơn thuộc Đơn E, để đơn shop còn lại chưa giao | Chỉ đơn/kiện đã giao được hoàn thành; đơn shop khác không bị cập nhật theo | |
| OR09 | Hai cửa sổ thao tác trạng thái cùng một đơn/kiện | Không làm trạng thái lùi trái quy tắc, không tạo tác dụng phụ lặp; lịch sử đủ để xác định thao tác | |
| OR10 | F5 hoặc đóng trình duyệt sau khi đặt thành công | Đơn vẫn tồn tại một lần; không đặt lại do tải lại trang | |

Nếu một bước trong OR04/OR05/OR09 cho kết quả bất nhất, ghi FAIL theo từng thành phần thay vì chỉ nhìn nhãn trạng thái đơn.

## 8. Test thanh toán và voucher

| Mã | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| PV01 | COD: đặt đơn, xác nhận, giao xong | Chờ thanh toán trước khi giao; chỉ ghi nhận đã thu theo quy trình giao thành công | |
| PV02 | Tạo Đơn C thanh toán trực tuyến, chọn mô phỏng thành công | Payment thành `paid`, số tiền đúng; khách/admin/vendor nhận dữ liệu mới | |
| PV03 | Một đơn demo khác, chọn thất bại rồi thử lại | Hiển thị thất bại; không ghi đã thanh toán; thử lại không tạo thêm đơn hoặc thu hai lần | |
| PV04 | Nhấp thanh toán hai lần, mở hai tab thanh toán cùng đơn | Không xử lý hai lần hoặc đổi payment đã hoàn tất sang trạng thái sai | |
| PV05 | Voucher đúng mã và đủ điều kiện | Tiền giảm đúng phần trăm/số tiền, có giới hạn giảm tối đa và đúng phạm vi shop/sản phẩm | |
| PV06 | Sai mã, hết hạn, chưa tới ngày, hết lượt, không đủ tiền tối thiểu, vượt lượt mỗi khách | Từ chối đúng lý do; không thay đổi lượt dùng | |
| PV07 | Đặt hàng nhiều shop với voucher riêng Vendor 1 | Chỉ giảm trên hàng đủ điều kiện của Vendor 1; không áp dụng nhầm cho shop khác | |
| PV08 | Hủy đơn đã dùng voucher rồi kiểm tra lại | Lượt sử dụng/khả năng dùng lại đúng chính sách, không hoàn nhiều lần | |

Điểm cần chú ý từ mã nguồn: `payments.controller.ts` hiện gửi trạng thái `completed` khi mô phỏng thành công, trong khi payment service dùng enum `paid`. Vì vậy PV02 có nguy cơ lỗi ngay cả khi luồng COD hoạt động. Ghi nhận lỗi này nếu tái hiện; không đánh dấu PASS chỉ vì có thông báo trên màn hình.

### 8.1. Admin tạo voucher toàn sàn — từng bước

Mục đích: admin tạo mã toàn sàn. Phạm vi được backend tự xác định theo tài khoản admin, không cần chọn shop hoặc sản phẩm.

1. Vào http://localhost:5174/login, đăng nhập `admin1@miva.vn` / `admin123`.
2. Mở **Quản lý Voucher** tại http://localhost:5174/vouchers.
3. Bấm **Thêm Voucher**. Hộp thoại có tiêu đề **Add New Voucher**.
4. Nhập các trường theo bảng sau. Các số nhập dạng số thường, không thêm dấu chấm hoặc ký hiệu tiền.

| Trường đang có trên form | Giá trị mẫu | Ý nghĩa cần kiểm tra |
|---|---|---|
| Voucher Code * | `TEST-ADMIN10-01` | Mã duy nhất, tự đổi thành chữ hoa |
| Voucher Name * | `TEST Admin giảm 10 phần trăm` | Tên quản lý, khác với mã khách dùng |
| Discount Type | `Percentage (%)` | Giảm theo phần trăm |
| Discount Value * | `10` | Giảm 10%, không nhập `0.1` hoặc `10%` |
| Start Date | Ngày hôm qua | Mã đã bắt đầu có hiệu lực khi test |
| End Date | Ngày sau hôm nay 7 ngày | Phải sau ngày bắt đầu và sau thời điểm mua |
| Quantity Limit | `10` | Tổng cộng được dùng tối đa 10 lượt |
| Status | `Active` | Cho phép áp dụng khi đủ điều kiện |

Ví dụ nếu test ngày 21/10/2026: chọn Start Date là 20/10/2026, End Date là 28/10/2026. Khi test ngày khác phải đổi lại thời hạn. Nếu mã mẫu đã tồn tại, dùng hậu tố mới như `TEST-ADMIN10-02`; mã voucher đã xóa mềm vẫn có thể bị giữ bởi ràng buộc duy nhất.

5. Bấm **Save Voucher** một lần. Kết quả cần đạt: hộp thoại đóng, mã xuất hiện trong danh sách, loại giảm 10%, đã dùng 0/10, trạng thái Active.
6. Tìm bằng mã `TEST-ADMIN10-01`, F5 trang quản lý để kiểm tra dữ liệu đã lưu thật. Ở bước kiểm tra lưu này được phép F5.
7. Mở sửa mã vừa tạo, đổi tên hiển thị rồi lưu. Kỳ vọng chỉ trường đã đổi được cập nhật, không mất hạn dùng/số lượng.
8. Thử tạo lại cùng mã trong một voucher khác. Kỳ vọng bị báo trùng, không xuất hiện bản ghi thứ hai.

Giới hạn giao diện hiện tại: form chưa có ô tiền tối thiểu, giảm tối đa hoặc giới hạn mỗi khách. Không tìm các ô này khi test tay. API mặc định giới hạn mỗi khách là 1 lượt nếu không gửi cấu hình khác.

**Đã sửa và kiểm tra trên trình duyệt ngày 21/10/2026:** form admin chuyển ngày sang ISO đúng múi giờ; khi tạo mới áp dụng từ đầu ngày bắt đầu đến hết ngày kết thúc (có thể chọn cùng một ngày). Lựa chọn giảm cố định gửi `fixed_amount`. Khi sửa, form giữ nguyên giờ hiệu lực nếu không đổi ngày và chỉ gửi các trường API cho phép. Lỗi như trùng mã hiển thị ngay trong hộp thoại; dữ liệu đã nhập được giữ lại để sửa.

| Mã | Cách test riêng cho admin | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| VA01 | Tạo mã phần trăm theo bảng mẫu | Lưu được mã toàn sàn 10%, còn 10 lượt, đúng thời hạn | |
| VA02 | Khách mua 2 sản phẩm giá 100.000đ thuộc một shop, dùng riêng mã admin | Tiền hàng 200.000đ, giảm 20.000đ, còn 180.000đ trước phí giao hàng | |
| VA03 | Một khách khác mua sản phẩm của shop khác và dùng mã admin | Không bị giới hạn riêng vào Vendor 1; tính giảm trên hàng đủ điều kiện của đơn đó | |
| VA04 | Tạo mã trùng, bỏ mã/tên, nhập 0, âm hoặc phần trăm 101 | Bị chặn, không lưu dữ liệu sai; không trả lỗi nội bộ 500 | |
| VA05 | Đặt ngày kết thúc trước ngày bắt đầu; thử mã Inactive/hết hạn | Ngày sai không lưu được; mã không có hiệu lực không được áp dụng | |
| VA06 | Tạo mã khác, chọn `Fixed Amount (VND)`, giá trị `20000` | Mã giảm tiền cố định 20.000đ; số giảm không vượt tiền hàng đủ điều kiện | |
| VA07 | Sửa tên/hạn dùng của mã admin vừa tạo | Lưu được thay đổi và đọc lại đúng; không gửi các trường hệ thống gây HTTP 400 | |

Có thể chạy lại bằng `node test/admin-voucher.manual.cjs` trong thư mục `backend` khi backend/admin đang chạy. Đã PASS: tạo phần trăm, tạo giảm cố định 20.000đ, thời hạn trọn một ngày theo múi giờ Bangkok, sửa tên giữ nguyên thời hạn và không gửi trường hệ thống, báo trùng mã HTTP 409 ngay trong form, chặn ngày kết thúc trước ngày bắt đầu, phần trăm trên 100 và số lượng 0. Script tự dọn voucher test. Kết quả này xác nhận chức năng tạo/sửa quản trị; các ca áp dụng mã tại checkout vẫn phụ thuộc mục 8.3.

### 8.2. Vendor tạo voucher của shop — từng bước

Mục đích: vendor chỉ tạo mã cho những sản phẩm được chọn thuộc shop của mình. Backend yêu cầu chọn ít nhất một sản phẩm; mã vendor không mặc định áp dụng cho toàn bộ sản phẩm trong shop.

1. Vào http://localhost:5175/login, đăng nhập `vendor1@miva.vn` / `admin123`.
2. Vào **Products**, xác nhận shop đã có sản phẩm `TEST-AO-MANUAL-01`, giá 100.000đ và còn đủ hàng. Đây là sản phẩm P1 dùng để đối chiếu.
3. Mở **Shop Vouchers** tại http://localhost:5175/vouchers.
4. Bấm **Create Voucher**. Hộp thoại có tiêu đề **Create Shop Voucher**.
5. Nhập các trường sau:

| Trường đang có trên form | Giá trị mẫu | Ý nghĩa cần kiểm tra |
|---|---|---|
| Voucher Code * | `TEST-SHOP20-01` | Mã riêng cho ca vendor, không trùng mã admin |
| Voucher Name * | `TEST Vendor 1 giảm 20 phần trăm` | Tên hiển thị trong quản lý |
| Discount Type | `Percentage (%)` | Giảm theo phần trăm |
| Discount Value * | `20` | Giảm 20% trên sản phẩm được chọn |
| Start Date | Ngày hôm qua | Đã bắt đầu có hiệu lực |
| End Date | Ngày sau hôm nay 7 ngày | Chưa hết hạn khi test |
| Quantity Limit | `10` | Tổng 10 lượt sử dụng |
| Status | `Active` | Đang hoạt động |

6. Trong **Sản phẩm áp dụng**, tìm `TEST-AO-MANUAL-01` bằng ô **Tìm sản phẩm của shop...**, rồi tích chọn P1. Danh sách chỉ có sản phẩm của shop đang đăng nhập; cần chọn từ 1 đến 100 sản phẩm. Nếu danh sách tải lỗi, bấm **Thử lại**; nếu shop chưa có sản phẩm, tạo sản phẩm trước.
7. Bấm **Save Voucher**. Kết quả cần đạt: có mã 20%, 0/10 lượt, đúng thời hạn và gắn với P1 của Vendor 1. Khi tạo mới, thời hạn bao phủ đầu ngày bắt đầu đến hết ngày kết thúc theo múi giờ trình duyệt. Nếu báo trùng mã hoặc dữ liệu sai, lỗi hiện ngay trong form để chỉnh sửa.
8. F5 trang quản lý, tìm lại mã để xác nhận đã lưu. Sau đó dùng tài khoản Vendor 2 trong hồ sơ trình duyệt khác để kiểm tra không quản lý được voucher của Vendor 1.

Không có ô chọn phạm vi toàn sàn trên form vendor: backend tự gắn phạm vi shop và người sở hữu theo tài khoản đăng nhập. Việc tự đổi tên mã thành mã giống admin không biến voucher shop thành voucher toàn sàn.

| Mã | Cách test riêng cho vendor | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| VV01 | Tạo mã theo bảng, chỉ chọn P1 của Vendor 1 | Lưu thành công, đúng shop, đúng danh sách sản phẩm áp dụng | |
| VV02 | Không chọn sản phẩm | Báo cần chọn ít nhất một sản phẩm; form phải có cách chọn để hoàn tất ca VV01 | |
| VV03 | Khách mua 2 P1 giá 100.000đ, dùng riêng mã shop | Tiền hàng 200.000đ, giảm 40.000đ, còn 160.000đ trước phí giao hàng | |
| VV04 | Khách chỉ mua sản phẩm P2 của cùng shop nhưng P2 không được chọn cho mã | Không giảm trên P2; thông báo không có sản phẩm phù hợp | |
| VV05 | Khách chỉ mua hàng của Vendor 2 và nhập mã Vendor 1 | Không giảm cho hàng của Vendor 2 | |
| VV06 | Vendor 2 thử xem/sửa/xóa voucher của Vendor 1 bằng đường dẫn có sẵn | Backend từ chối; không thay đổi dữ liệu của Vendor 1 | |
| VV07 | Vendor tạo mã trùng mã đã có của admin hoặc vendor khác | Bị báo trùng vì mã voucher duy nhất trên hệ thống | |
| VV08 | Vendor sửa mã của mình, đổi sản phẩm áp dụng hoặc tắt mã | Cập nhật đúng; các sản phẩm đã bỏ khỏi phạm vi không còn được giảm; mã tắt không dùng được | |
| VV09 | Tạo mã cố định `20000`, hoặc nhập phần trăm 101/giá trị âm | Mã cố định hợp lệ dùng đúng 20.000đ; phần trăm trên 100 và giá trị âm bị chặn | |

Nếu giao diện không cho tạo yêu cầu kiểm tra quyền hoặc chọn sản phẩm khác shop, phần kiểm tra đó là BLOCKED/chưa kiểm chứng. Không kết luận backend an toàn chỉ vì không nhìn thấy nút.

**Đã sửa và kiểm tra ngày 21/10/2026:** chạy `node test/vendor-voucher.manual.cjs` trong thư mục `backend` khi backend/vendor đang chạy. Đã PASS trên trình duyệt: chọn sản phẩm của shop, chặn lưu nếu chưa chọn, tạo mã 20% và giảm cố định 20.000đ, sửa sản phẩm áp dụng và giữ thời hạn, báo trùng mã ngay trong form, tải lại danh sách sản phẩm sau lỗi. Đã kiểm tra bằng API thật: 2 sản phẩm giá 100.000đ giảm 20% còn 160.000đ; sản phẩm không được chọn không được giảm; tạo mã với sản phẩm shop khác nhận 403; thiếu sản phẩm nhận 400. Script dùng sản phẩm/voucher test riêng và tự dọn sau khi chạy. Các kiểm tra tính tiền trong script này dùng API preview; luồng nhập mã tại giao diện giỏ hàng/checkout được xác nhận riêng tại mục 8.3.

### 8.3. Khách áp dụng voucher và đối chiếu tiền

Tiền điều kiện: đã có mã admin/vendor hợp lệ, ngày hiệu lực bao phủ lúc mua, còn lượt và khách test chưa dùng hết lượt cá nhân. Để kiểm tra riêng từng mã, dùng khách test khác nhau hoặc mã mới; API mặc định mỗi khách 1 lượt cho mỗi mã.

1. Đăng nhập khách tại http://localhost:5173/login.
2. Thêm 2 P1 của Vendor 1, mỗi sản phẩm 100.000đ; chỉ chọn một shop trong ca đối chiếu này.
3. Trong **Giỏ hàng**, tìm phần **Mã giảm giá** bên phải. Mỗi shop có ô mã riêng. Bấm **Dùng mã TEST-SHOP20-01**, hoặc nhập mã vào ô của shop rồi bấm **Áp dụng**. Đối chiếu giảm 40.000đ, còn 160.000đ.
4. Thêm mã admin 10% bằng nút **Dùng mã TEST-ADMIN10-01** hoặc nhập hai mã ngăn cách bằng dấu phẩy. Đối chiếu tổng còn 144.000đ. Bấm **Mua hàng**, kiểm tra mã và số tiền được giữ sang trang thanh toán; chọn địa chỉ và COD. Có thể áp dụng/bỏ mã ngay tại trang thanh toán. Mỗi đơn shop dùng tối đa 1 mã shop và 1 mã toàn sàn.
5. Đặt đơn, ghi mã thật, đối chiếu giảm giá và tổng tiền trên chi tiết đơn ở khách/admin/vendor. Kiểm tra lượt dùng voucher chỉ tăng sau đặt thành công, không tăng khi chỉ xem trước giá.

**Đã có đủ 3 nơi hiển thị giá sau giảm:** form tạo/sửa voucher vendor có bảng giá dự kiến cho đơn mua 1 sản phẩm; thẻ và chi tiết sản phẩm của khách hiển thị giá kèm mã và điều kiện; giỏ hàng/thanh toán dùng API tính giá thật theo sản phẩm, số lượng, cửa hàng và tài khoản. Voucher giảm cố định áp dụng một lần trên tiền hàng đủ điều kiện của đơn, không nhân theo từng sản phẩm. Trang sản phẩm vẫn ghi rõ cần chọn mã khi thanh toán; lượt dùng cá nhân được xác minh tại giỏ hàng/đặt hàng.

Các con số dưới là kết quả đối chiếu:

| Dữ liệu trên một đơn của Vendor 1 | Tiền hàng | Giảm shop | Giảm toàn sàn | Còn lại trước phí giao hàng |
|---|---:|---:|---:|---:|
| Không dùng mã | 200.000đ | 0đ | 0đ | 200.000đ |
| Chỉ `TEST-ADMIN10-01` | 200.000đ | 0đ | 20.000đ | 180.000đ |
| Chỉ `TEST-SHOP20-01` áp dụng đủ 2 P1 | 200.000đ | 40.000đ | 0đ | 160.000đ |
| Kết hợp mã shop 20% và mã admin 10% | 200.000đ | 40.000đ | 16.000đ | 144.000đ |

Theo logic backend hiện tại, giảm shop được tính trước, giảm toàn sàn tính trên tiền còn lại. Trường hợp kết hợp trên không phải giảm thẳng 30%. Chỉ cộng phí giao hàng nếu màn hình có thu phí. Với giỏ nhiều vendor, hệ thống tách đơn theo shop, nên phải đối chiếu từng đơn riêng và giới hạn lượt mã; không dùng máy móc bảng một shop để kết luận tổng toàn giỏ.

**Kết quả thực tế ngày 21/10/2026:** chạy `node test/voucher-pricing.manual.cjs` trong `backend` khi backend/vendor/admin/frontend đang chạy. Đã PASS trên trình duyệt: form vendor hiện 100.000đ → 80.000đ cho mã 20%; trang sản phẩm khách vãng lai nhận giá kèm mã không F5; giỏ hàng và thanh toán giữ đúng hai mã, tính 200.000đ → 160.000đ → 144.000đ; tắt/bật mã cập nhật trang thanh toán đang mở. Đối chiếu database: đơn, thanh toán và kiện đều 144.000đ, giảm 56.000đ, mỗi mã tăng đúng 1 lượt. Đã kiểm tra mã không tồn tại bị từ chối, chọn mã riêng từng shop, giới hạn mỗi người trên nhiều shop và tổng tiền thay đổi bị HTTP 409, không tạo đơn/trừ tồn/tăng lượt khi thất bại. Script tự dọn dữ liệu test.

### 8.4. Ca kiểm tra bổ sung và cách ghi kết quả voucher

| Mã | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| VC01 | Xem trước/áp dụng mã nhưng chưa đặt đơn; lặp lại nhiều lần | Số lượt đã dùng không tăng | |
| VC02 | Đặt thành công đơn dùng một mã | Voucher tăng đúng 1 lượt, đơn lưu đúng mức giảm, F5 không tăng lại | |
| VC03 | Cùng khách dùng lại mã giới hạn 1 lượt | Bị từ chối sau lần dùng thành công đầu, không trừ tồn hoặc tăng lượt khi đặt thất bại | |
| VC04 | Nhập hai mã khác nhau cùng phạm vi toàn sàn, hoặc hai mã shop | Bị chặn vì mỗi phạm vi chỉ dùng một voucher | |
| VC05 | Nhập lặp lại cùng mã trong một lần áp dụng | Giao diện gộp mã trùng; API từ chối payload trùng; không nhân đôi số giảm | |
| VC06 | Dùng mã sai/hết hạn/Inactive/hết số lượng | Báo không hợp lệ; không đặt được đơn với mức giảm giả | |
| VC07 | Hủy đơn đang chờ đã dùng voucher | Hoàn tồn và hoàn lượt theo quy tắc; hủy lặp lại không hoàn thêm | |
| VC08 | Admin xem mã shop trong danh sách toàn hệ thống | Xem được thông tin. Không được sửa nội dung hoặc xóa mã của vendor; quyền đổi trạng thái cần kiểm tra riêng qua chức năng vô hiệu hóa nếu UI có hỗ trợ | |

Mỗi lỗi cần ghi rõ đang tạo bằng **admin** hay **vendor**, mã đã nhập, ngày bắt đầu/kết thúc, sản phẩm áp dụng, HTTP status và nội dung phản hồi. F12 → Network → chọn `POST /api/vouchers` để xem payload khi Save lỗi. Khi so sánh với API: ngày phải là ISO có giờ/múi giờ; giảm cố định dùng `fixed_amount`; voucher vendor cần `productIds` còn voucher toàn sàn không nhận danh sách này.

Kết quả tạo/sửa voucher và áp dụng mã qua giao diện được ghi riêng ở mục 8.1–8.3. Đánh dấu độc lập các ca chưa chạy trong bảng này; không coi một lượt đặt thành công là đã kiểm chứng toàn bộ ca giới hạn, hủy đơn hoặc mua đồng thời.

## 9. Test khảo sát, đánh giá và thông báo

| Mã | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| SV01 | Admin/vendor tạo khảo sát nháp: câu rating, text, chọn một/chọn nhiều | Lưu đúng thứ tự và lựa chọn; loại câu chọn cần ít nhất 2 phương án | |
| SV02 | Kích hoạt khảo sát gửi thủ công đúng nhóm người nhận | Chỉ khách đủ điều kiện nhận lời mời; nháp không tự gửi | |
| SV03 | Khách mở lời mời, bỏ trống câu bắt buộc rồi gửi | Bị chặn và chỉ đúng câu thiếu | |
| SV04 | Gửi câu trả lời hợp lệ, kể cả nhiều lựa chọn | Lưu đủ đáp án; trạng thái đã trả lời; không nộp trùng | |
| SV05 | Đóng/hết hạn khảo sát hoặc mở lời mời thuộc khách khác | Không cho trả lời sai đối tượng hoặc ngoài thời hạn | |
| SV06 | Admin/vendor xem kết quả | Tổng phản hồi, số theo trạng thái, biểu đồ và nội dung khớp dữ liệu vừa gửi | |
| SV07 | Khảo sát đặt trigger sau đặt hàng/hoàn tất | Chỉ phát sinh ở đúng trigger đã chọn; kiểm tra riêng nhánh giao hoàn tất qua vận chuyển | |
| SV08 | Khách đánh giá đơn chưa hoàn thành hoặc đánh giá hai lần | Bị chặn; chỉ chủ dòng hàng trong đơn hoàn thành được đánh giá | |
| SV09 | Admin kiểm duyệt/xóa đánh giá | Danh sách công khai và thống kê đọc lại đúng; không ảnh hưởng dữ liệu đơn | |
| SV10 | Đọc từng thông báo/đọc tất cả, mở nhiều tab cùng tài khoản | Số chưa đọc không âm; trạng thái đọc nhất quán giữa các tab | |

## 10. Test quản trị, đăng ký vendor, nhân viên và lương

| Mã | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| AD01 | Tạo/sửa danh mục; kiểm tra bộ lọc ở khách/vendor | Tên và liên kết sản phẩm đúng sau khi lấy dữ liệu mới; không mất sản phẩm do đổi tên danh mục | |
| AD02 | Đăng ký vendor mới ở `/register` cổng vendor, admin xem `/vendor-registrations` | Hồ sơ xuất hiện với thông tin shop/gói và trạng thái chờ duyệt đúng | |
| AD03 | Duyệt một vendor test, từ chối một vendor test khác | Đúng người duyệt/lý do, thời hạn gói/phí/hoa hồng; giao diện vendor hiển thị trạng thái sau khi lấy dữ liệu mới | |
| AD04 | Nhân viên có và không có quyền duyệt vendor thử thao tác | Quyền được thực thi ở backend, không chỉ ẩn nút trên UI | |
| AD05 | Admin tạo nhân viên test, sửa hồ sơ, trạng thái và lịch làm | Dữ liệu lưu đúng; đăng nhập và phạm vi thao tác phù hợp; kiểm tra lại sau F5 | |
| AD06 | Admin gửi thông báo cho một nhân viên rồi gửi tất cả | Đúng người nhận; không gửi nhầm/trùng; badge và danh sách đúng | |
| AD07 | Sửa lương nhân viên test, xem lịch sử lương | Lương mới và lịch sử đúng người, thời gian, mức thay đổi; không ảnh hưởng nhân viên khác | |
| AD08 | Tại UI có hỗ trợ, ghi nhận chấm công và tính bảng lương tháng test; thử tính lại cùng tháng | Đối chiếu các khoản hiển thị và tổng thực lĩnh; không tạo bảng lương trùng ngoài quy tắc; nếu không có UI, ghi BLOCKED phần test tay | |
| AD09 | Employee mở hồ sơ/phiếu lương, so với dữ liệu admin | Đúng dữ liệu cá nhân; không xem được lương/hồ sơ riêng của người khác ngoài quyền | |
| AD10 | Chọn cùng khoảng ngày ở báo cáo admin/vendor | Số đơn, tiền hàng, giảm giá, doanh thu/hoa hồng theo đúng định nghĩa từng chỉ tiêu; không so sánh hai chỉ tiêu khác nghĩa | |
| AD11 | Lọc/tìm/phân trang trên người dùng, vendor, employee, đơn và vận chuyển | Kết quả đúng bộ lọc; không mất bộ lọc khi đổi trang; trang rỗng có thông báo rõ | |
| AD12 | Xóa danh mục rồi tạo lại cùng tên; sau đó thử tạo trùng lần nữa khi danh mục đang hiển thị | Tạo lại danh mục đã xóa khôi phục bản ghi cũ, giữ ID và liên kết sản phẩm, cập nhật realtime; tạo trùng danh mục đang tồn tại bị chặn | |

## 11. Test giao diện và sự cố kết nối

| Mã | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| UI01 | Thu cửa sổ xuống kích thước điện thoại, mở menu/form/modal/bảng | Không mất nút chính, không tràn làm không thao tác được; bảng rộng cuộn được | |
| UI02 | Mạng chậm, bấm lưu/đặt hàng liên tục | Có trạng thái chờ; không tạo bản ghi trùng ngoài ý muốn | |
| UI03 | Mất mạng lúc lưu rồi bật lại | Không báo thành công sai; có thể thử lại; kiểm tra dữ liệu trước khi gửi lại để tránh trùng | |
| UI04 | Khởi động lại backend local rồi quan sát các tab | Có thể có `ECONNREFUSED/ECONNRESET` trong khoảng gián đoạn; sau phục hồi socket tự nối lại và dữ liệu được làm mới | |
| UI05 | Mở URL không tồn tại, dữ liệu đã bị xóa, ảnh tải lỗi | Có trạng thái lỗi/không tìm thấy phù hợp; không trắng trang | |
| DT01 | Nếu cần test desktop: chạy `npm run dev` trong `desktop` khi backend/frontend đang chạy, đăng nhập và thực hiện E01–E06 | Mua hàng trên desktop dùng cùng nguồn dữ liệu với web; admin/vendor nhận được đơn | |
| DT02 | Với frontend đã build, chạy `npm start` trong `desktop`; mở sản phẩm, đăng nhập, đặt hàng và F5 ở trang con | File tĩnh, API, ảnh và điều hướng trang con hoạt động ở chế độ dùng bản build | |
| DT03 | Giữ bản desktop dùng frontend đã build mở, vendor sửa giá/tồn hoặc employee cập nhật đơn | Desktop nhận cập nhật realtime, kể cả sau mất kết nối và nối lại; kiểm tra độc lập với chế độ dev | |

Desktop hiện có local server chuyển tiếp `/api` và `/uploads`, chưa thấy chuyển tiếp `/socket.io` hoặc xử lý WebSocket upgrade trong `desktop/main.js`. Vì vậy DT03 là điểm có nguy cơ chưa đạt ở bản build, dù realtime trên web/dev đã kết nối được.

F12 → Network: kiểm tra Fetch/XHR và WS, bật Preserve log khi cần tái hiện mất kết nối. Phân biệt HTTP 401/403 do quyền đăng nhập với HTTP 500 hoặc lỗi proxy không kết nối được backend. Chỉ ghi mã trạng thái và nội dung lỗi cần thiết; bỏ cookie/token khi chia sẻ log.

## 12. Cách ghi lỗi và chốt kết quả

Mỗi lỗi cần có:

- Mã ca test và tiêu đề, ví dụ `RT07 - Danh sách thông báo đang mở chưa cập nhật`.
- Vai trò, tài khoản test, trang đang mở và mã đơn/sản phẩm/kiện/vận đơn liên quan.
- Tiền điều kiện và các bước tái hiện, đánh số từ 1.
- Kết quả mong đợi và kết quả thực tế.
- Ảnh/video hai màn hình nếu lỗi đồng bộ; thời gian xảy ra lỗi.
- API bị lỗi, HTTP status, thông báo phản hồi/console nếu có.
- Có cần F5 mới thấy dữ liệu hay không; sau F5 dữ liệu có còn đúng hay không.

Ví dụ:

```text
Ca test: RT03
Vai trò: Admin + employee1@miva.vn
Mã đơn: <mã thực tế>
Bước: Admin phân công đơn cho Employee 1, giữ trang /orders của Employee 1 mở.
Mong đợi: Đơn xuất hiện trong khoảng kiểm thử 1–3 giây, không F5.
Thực tế: Sau 10 giây chưa xuất hiện; F5 thì thấy.
Kết luận: FAIL cập nhật realtime; dữ liệu lưu backend cần kiểm tra riêng.
```

Chỉ chốt luồng A–Z đạt khi E01–E18 chạy được, các ca quyền không bị vượt quyền, số tiền/tồn kho không lệch, và các ca realtime được kiểm chứng trên đúng màn hình cần cập nhật. Báo riêng PASS/FAIL/BLOCKED theo từng nhóm, không thay thế test tay bằng kết quả build.

Trong lượt kiểm tra trước, build của các ứng dụng đã thành công và các kết nối Socket.IO đã được kiểm tra. Bộ test backend vẫn còn 4 ca lỗi ở test đơn hàng/khảo sát; điều này không xác nhận các ca manual ở trên đã đạt.
