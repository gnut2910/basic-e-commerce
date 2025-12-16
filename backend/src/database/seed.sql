USE electronics_app;

-- ===== USERS =====
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@example.com', '123456', 'admin'),
('Nguyễn Văn A', 'buyer1@gmail.com', '123456', 'buyer'),
('Trần Thị B', 'buyer2@gmail.com', '123456', 'buyer'),
('Lê Minh C', 'seller1@gmail.com', '123456', 'seller'),
('Phạm Văn D', 'seller2@gmail.com', '123456', 'seller');

-- ===== STORES =====
INSERT INTO stores (seller_id, name, description) VALUES
(4, 'Cửa hàng Điện tử Minh Phát', 'Chuyên đồ điện tử, phụ kiện, linh kiện'),
(5, 'Shop Gia Dụng Việt', 'Chuyên đồ gia dụng và thiết bị nhà bếp');

-- ===== CATEGORIES =====
INSERT INTO categories (name, image) VALUES
('Điện thoại', 'phone.jpg'),
('Laptop', 'laptop.jpg'),
('Tai nghe', 'headphones.jpg'),
('Phụ kiện', 'accessories.jpg'),
('Tivi', 'tv.jpg'),
('Máy ảnh', 'camera.jpg'),
('Đồng hồ', 'watch.jpg'),
('Đồ gia dụng', 'home_appliance.jpg'),
('Thiết bị thông minh', 'smart_device.jpg'),
('Máy lọc không khí', 'air_purifier.jpg');

-- ===== PRODUCTS =====
INSERT INTO products 
(store_id, category_id, name, description, price, discount_price, discount_expiry, stock, image, status) VALUES
(1, 1, 'iPhone 15 Pro', 'Điện thoại cao cấp Apple với chip A17 Pro', 29990000, 26990000, NULL, 20, 'iphone15pro.jpg', 'approved'),
(1, 1, 'Samsung Galaxy S24 Ultra', 'Điện thoại Samsung hiệu năng mạnh mẽ', 25990000, 22990000, NULL, 15, 's24ultra.jpg', 'approved'),
(1, 2, 'MacBook Air M3', 'Laptop mỏng nhẹ, hiệu năng cao cho sinh viên và dân văn phòng', 28990000, 25990000, NULL, 10, 'macbookairm3.jpg', 'approved'),
(1, 2, 'ASUS TUF Gaming F15', 'Laptop gaming hiệu năng mạnh với RTX 4060', 24990000, 21990000, NULL, 12, 'asus_tuf_f15.jpg', 'approved'),
(1, 3, 'AirPods Pro 2', 'Tai nghe không dây chống ồn chủ động', 5490000, 4990000, NULL, 30, 'airpodspro2.jpg', 'approved'),
(1, 3, 'Sony WH-1000XM5', 'Tai nghe chống ồn hàng đầu thế giới', 7990000, 6990000, NULL, 25, 'sonyxm5.jpg', 'approved'),
(1, 4, 'Cáp sạc USB-C Anker', 'Cáp sạc nhanh bền bỉ', 299000, 249000, NULL, 100, 'anker_cable.jpg', 'approved'),
(1, 4, 'Sạc dự phòng Xiaomi 20000mAh', 'Dung lượng cao, hỗ trợ sạc nhanh', 899000, 799000, NULL, 60, 'xiaomi_powerbank.jpg', 'approved'),
(1, 5, 'Smart Tivi LG 55 inch 4K', 'Màn hình siêu nét, hỗ trợ AI ThinQ', 12990000, 11490000, NULL, 8, 'lg_tivi55.jpg', 'approved'),
(1, 6, 'Canon EOS R50', 'Máy ảnh mirrorless cảm biến APS-C', 16990000, 14990000, NULL, 6, 'canon_r50.jpg', 'approved'),
(2, 7, 'Đồng hồ thông minh Huawei Watch GT 4', 'Theo dõi sức khỏe và luyện tập', 4990000, 4390000, NULL, 20, 'huawei_gt4.jpg', 'approved'),
(2, 7, 'Apple Watch Series 9', 'Đồng hồ cao cấp, tích hợp cảm biến sức khỏe', 11990000, 10490000, NULL, 10, 'applewatch9.jpg', 'approved'),
(2, 8, 'Nồi chiên không dầu Lock&Lock', 'Dung tích 5.5L, tiết kiệm điện', 1990000, 1690000, NULL, 25, 'locknlock_airfryer.jpg', 'approved'),
(2, 8, 'Máy ép chậm Philips HR1889', 'Giữ trọn vitamin, ít ồn', 3490000, 2990000, NULL, 10, 'philips_hr1889.jpg', 'approved'),
(2, 8, 'Ấm siêu tốc Kangaroo KG18', 'Công suất 1800W, thân inox', 499000, 399000, NULL, 50, 'kg18.jpg', 'approved'),
(2, 8, 'Bình giữ nhiệt Tiger 500ml', 'Giữ nóng/lạnh đến 12 giờ', 890000, 790000, NULL, 45, 'tiger_500ml.jpg', 'approved'),
(2, 9, 'Đèn bàn thông minh Yeelight', 'Điều khiển qua app, hỗ trợ Google Home', 799000, 699000, NULL, 35, 'yeelight_lamp.jpg', 'approved'),
(2, 9, 'Đèn LED cảm ứng Xiaomi', 'Tự động bật khi phát hiện chuyển động', 399000, 349000, NULL, 40, 'xiaomi_led.jpg', 'approved'),
(2, 10, 'Máy lọc không khí Sharp FP-J40E', 'Lọc HEPA, khử mùi hiệu quả', 2990000, 2590000, NULL, 20, 'sharp_fp_j40e.jpg', 'approved'),
(2, 10, 'Máy lọc không khí Daikin MC30VVM-A', 'Thiết kế nhỏ gọn, hiệu suất cao', 3590000, 3190000, NULL, 15, 'daikin_mc30.jpg', 'approved');

-- ===== CART_ITEMS =====
INSERT INTO cart_items (buyer_id, product_id, quantity) VALUES
-- Buyer 2
(2, 1, 1),   -- iPhone 15 Pro
(2, 5, 2),   -- AirPods Pro 2
(2, 7, 1),   -- Cáp sạc USB-C Anker
(2, 8, 1),   -- Sạc dự phòng Xiaomi 20000mAh
(2, 11, 1),  -- Huawei Watch GT 4
(2, 16, 1),  -- Đèn bàn thông minh Yeelight
-- Buyer 3
(3, 3, 1),   -- MacBook Air M3
(3, 6, 1),   -- Sony WH-1000XM5
(3, 9, 1),   -- Smart Tivi LG 55 inch 4K
(3, 12, 1),  -- Apple Watch Series 9
(3, 14, 1),  -- Máy ép chậm Philips HR1889
(3, 20, 2);  -- Bình giữ nhiệt Tiger 500ml


