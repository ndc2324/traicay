
    let currentSlideIndex = 0;

    function changeSlide(n) {
        showSlide(currentSlideIndex += n);
    }

    function currentSlide(n) {
        showSlide(currentSlideIndex = n);
    }

    function showSlide(n) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        if (slides.length === 0) return;

        if (n >= slides.length) currentSlideIndex = 0;
        if (n < 0) currentSlideIndex = slides.length - 1;

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        slides[currentSlideIndex].classList.add('active');
        dots[currentSlideIndex].classList.add('active');
    }

    setInterval(() => {
        const slides = document.querySelectorAll('.slide');
        if (slides.length > 0) changeSlide(1);
    }, 5000);


    // ==================== STATE ====================
    let cart = [];
    let productsFromDb = [];
    let currentUser = null;
    let authToken = null;
    let quickBuyProductId = null;
    let lastOrderData = null;
    let featuredOffset = 0;
    const FEATURED_PER_PAGE = 4;


    // ==================== INIT ====================
    document.addEventListener('DOMContentLoaded', function () {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                navigateTo(this.getAttribute('data-page'));
            });
        });
        document.querySelector('.cart-icon')?.addEventListener('click', () => navigateTo('cart'));
        document.getElementById('user-avatar-btn')?.addEventListener('click', handleUserIconClick);
        document.querySelector('.fab-chat')?.addEventListener('click', () => {
            alert('Tính năng chat sẽ được cập nhật sau!');
        });
        // Forms
        document.getElementById('login-form')?.addEventListener('submit', handleLogin);
        document.getElementById('register-form')?.addEventListener('submit', handleRegister);
        document.getElementById('profile-form')?.addEventListener('submit', handleProfileUpdate);
        // Popup
        setTimeout(showPopup, 3000);
        // Load data
        loadCart();
        loadUser();
        loadProductsFromDb();
    });
    // ==================== NAVIGATION ====================
    function navigateTo(page) {
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        document.getElementById(page)?.classList.add('active');

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) link.classList.add('active');
        });
        // Ẩn/hiện nav "Thanh toán"
        const checkoutNavItem = document.getElementById('checkout-nav-item');
        if (checkoutNavItem) {
            checkoutNavItem.style.display = page === 'checkout' ? 'block' : 'none';
        }

        if (page === 'cart') renderCart();
        if (page === 'checkout') renderCheckout();
        if (page === 'profile') {
            if (!currentUser) {
                alert('Vui lòng đăng nhập để xem hồ sơ');
                navigateTo('login');
                return;
            }
            renderProfile();
        }

        window.scrollTo(0, 0);
    }


    // ==================== USER AUTH ====================
    function loadUser() {
        const savedUser = localStorage.getItem('currentUser');
        const savedToken = localStorage.getItem('authToken');
        if (savedUser && savedToken) {
            currentUser = JSON.parse(savedUser);
            authToken = savedToken;
            updateUserUI();
        }
    }

    function saveUser() {
        if (currentUser && authToken) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('authToken', authToken);
        }
    }

    function updateUserUI() {
        const profileLink = document.getElementById('profile-link');
        const defaultIcon = document.getElementById('user-icon-default');
        const avatarImg = document.getElementById('user-avatar-img');
        const userText = document.getElementById('user-text-default');

        if (currentUser) {
            if (profileLink) profileLink.style.display = 'block';
            if (defaultIcon) defaultIcon.style.display = 'none';
            if (avatarImg) {
                avatarImg.src = currentUser.avatarUrl || 'assets/images/default-avatar.png';
                avatarImg.style.display = 'block';
            }

           if (userText) userText.style.display = 'none';

               } else {
                   if (profileLink) profileLink.style.display = 'none';
                   if (defaultIcon) defaultIcon.style.display = 'block';
                   if (avatarImg) avatarImg.style.display = 'none';
                   if (userText) {
                       userText.style.display = 'inline';
                       userText.textContent = 'Đăng nhập';
                   }
               }
           }

    // Click vào icon user trên header
    function handleUserIconClick() {
        if (currentUser) {
            navigateTo('profile');
        } else {
            navigateTo('login');
        }
    }

    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => {
            if (!res.ok) throw new Error('Đăng nhập thất bại');
            return res.json();
        })
        .then(data => {
            currentUser = {
                username: data.username,
                role: data.role,
                userId: data.userId,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone || '',
                address: data.address || '',
                avatarUrl: data.avatarUrl || 'assets/images/default-avatar.png'
            };
            authToken = data.token;
            saveUser();
            updateUserUI();
            alert('Đăng nhập thành công!');
            document.getElementById('login-form').reset();
            if (data.role && data.role.toUpperCase().includes('ADMIN')) {
                window.location.href = '/admin.html';
            } else {
                navigateTo('home');
            }
        })
        .catch(() => alert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'));
    }

    function handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const fullName = document.getElementById('register-fullname').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const address = document.getElementById('register-address').value;

        fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, fullName, email, phone, address })
        })
        .then(res => {
            if (!res.ok) throw new Error('Đăng ký thất bại');
            return res.json();
        })
        .then(data => {
            currentUser = {
                username: data.username,
                role: data.role,
                userId: data.userId,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone || '',
                address: data.address || '',
                avatarUrl: data.avatarUrl || 'assets/images/default-avatar.png'
            };
            authToken = data.token;
            saveUser();
            updateUserUI();
            alert('Đăng ký thành công!');
            document.getElementById('register-form').reset();
            navigateTo('home');
        })
        .catch(() => alert('Đăng ký thất bại. Vui lòng thử lại.'));
    }

    function logout() {
        currentUser = null;
        authToken = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        updateUserUI();
        alert('Đã đăng xuất');
        navigateTo('home');
    }


    // ==================== PROFILE ====================
    function renderProfile() {
        if (!currentUser) return;

        document.getElementById('display-fullname').textContent =
            currentUser.fullName || currentUser.username || 'Người dùng';
        document.getElementById('user-avatar').src =
            currentUser.avatarUrl || 'assets/images/default-avatar.png';
        document.getElementById('profile-fullname').value = currentUser.fullName || '';
        document.getElementById('profile-email').value = currentUser.email || '';
        document.getElementById('profile-phone').value = currentUser.phone || '';
        document.getElementById('profile-address').value = currentUser.address || '';

        loadOrderHistory();
    }

    function showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.profile-nav .nav-item').forEach(item => item.classList.remove('active'));

        document.getElementById('tab-' + tabName)?.classList.add('active');

        const tabIndex = ['info', 'orders', 'address', 'coupon'].indexOf(tabName);
        const navItems = document.querySelectorAll('.profile-nav .nav-item');
        if (navItems[tabIndex]) navItems[tabIndex].classList.add('active');
    }

    function handleAvatarChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64 = e.target.result;

            // Cập nhật avatar trong sidebar profile
            const profileAvatar = document.getElementById('user-avatar');
            if (profileAvatar) profileAvatar.src = base64;

            // Cập nhật avatar trên header
            const headerAvatar = document.getElementById('user-avatar-img');
            if (headerAvatar) headerAvatar.src = base64;

            // Lưu vào user
            currentUser.avatarUrl = base64;
            saveUser();

            alert('Cập nhật ảnh đại diện thành công!');
        };
        reader.readAsDataURL(file);
    }

    function handleProfileUpdate(e) {
        e.preventDefault();
        const fullName = document.getElementById('profile-fullname').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const address = document.getElementById('profile-address').value.trim();

        // Gọi API cập nhật
        fetch(`/api/users/${currentUser.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({ fullName, phone, address })
        })
        .then(res => {
            // Dù API thành công hay thất bại đều lưu local
            currentUser.fullName = fullName;
            currentUser.phone = phone;
            currentUser.address = address;
            saveUser();

            // Cập nhật tên hiển thị
            const displayName = document.getElementById('display-fullname');
            if (displayName) displayName.textContent = fullName;

            alert('Cập nhật thông tin thành công!');
        })
        .catch(() => {
            // Fallback: lưu local nếu chưa có API
            currentUser.fullName = fullName;
            currentUser.phone = phone;
            currentUser.address = address;
            saveUser();

            const displayName = document.getElementById('display-fullname');
            if (displayName) displayName.textContent = fullName;

            alert('Cập nhật thông tin thành công!');
        });
    }

    function filterOrderTab(el, type) {
        document.querySelectorAll('#tab-orders .f-tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        // TODO: filter theo type khi có dữ liệu thực
    }

    function loadOrderHistory() {
        if (!currentUser?.userId) return;

        const orderHistory = document.getElementById('order-history');
        if (!orderHistory) return;

        orderHistory.innerHTML = '<p style="color:#aaa; padding:20px;">Đang tải đơn hàng...</p>';

        fetch(`/api/orders/user/${currentUser.userId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        })
        .then(res => {
            if (!res.ok) throw new Error('Lỗi tải đơn hàng');
            return res.json();
        })
        .then(orders => {
            if (!orders || orders.length === 0) {
                orderHistory.innerHTML = `
                    <div class="empty-data-msg">
                        <i class="fas fa-box-open"></i>
                        <p>Chưa có đơn hàng nào</p>
                    </div>`;
                return;
            }

            const statusLabel = {
                PENDING: 'Chờ xác nhận',
                CONFIRMED: 'Đã xác nhận',
                SHIPPED: 'Đang giao',
                DELIVERED: 'Đã giao',
                CANCELLED: 'Đã hủy'
            };

            orderHistory.innerHTML = orders.map(order => `
                <div class="order-history-item">
                    <div class="order-history-header">
                        <div>
                            <strong>Đơn hàng #${order.id}</strong>
                            <span class="order-date">${new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <span class="order-status ${order.status}">
                            ${statusLabel[order.status] || order.status}
                        </span>
                    </div>
                    <div class="order-history-body">
                        <p>Tổng tiền: <strong>${formatPrice(order.totalAmount || 0)}</strong></p>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => {
            orderHistory.innerHTML = `
                <div class="empty-data-msg">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Không thể tải đơn hàng. Vui lòng thử lại.</p>
                </div>`;
        });
    }


    // ==================== PRODUCTS ====================
    function loadProductsFromDb() {
        fetch('/api/products/all')
            .then(res => res.json())
            .then(products => {
                productsFromDb = products || [];
                renderHomeFeaturedProducts(productsFromDb);
                renderProductPage(productsFromDb);
                renderCategoryGrid('vn');
                renderCategoryGrid('foreign');
            })
            .catch(err => console.error('Error loading products:', err));
        /*fetch('/api/categories')
                .then(res => res.json())
                .then(categories => {
                    renderCategoryDropdown(categories || []);
                })
                .catch(err => console.error('Error loading categories:', err));*/

    }

    function generateProductCardHTML(product) {
        return `
            <div class="product-card ${!product.available ? 'out-of-stock' : ''}">
                <div class="product-image-wrapper" style="cursor:pointer;" onclick="showProductDetail(${product.id})">
                    <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='assets/images/default-product.png'">
                    ${!product.available ? '<div class="out-of-stock-overlay">Hết hàng</div>' : ''}
                </div>

                <h3 style="cursor:pointer; transition: color 0.2s;"
                    onmouseover="this.style.color='#4A7C2C'"
                    onmouseout="this.style.color='#333'"
                    onclick="showProductDetail(${product.id})">${product.name}</h3>
                <p>${product.origin}</p>
                <div class="price-row">
                    <div class="price">${formatPrice(product.price)}</div>
                    <div class="price-old">${formatPrice(product.price * 1.15)}</div>
                    <div class="discount-badge ${!product.available ? 'badge-out' : ''}">
                        ${product.available ? 'Còn hàng' : 'Hết hàng'}
                    </div>
                </div>

                <button class="btn-add-cart"
                                    ${!product.available ? 'disabled' : ''}
                                    onclick="${product.available ? `addDirectToCart(${product.id})` : ''}">
                                    ${product.available ? 'Thêm vào giỏ' : 'Hết hàng'}
                                </button>
            </div>
        `;
    }

    function renderHomeFeaturedProducts(products, resetOffset = true) {
        const grid = document.getElementById('home-product-grid');
        if (!grid) return;

        if (resetOffset) featuredOffset = 0;
        const slice = resetOffset ? products.slice(0, FEATURED_PER_PAGE) : products;

        if (slice.length === 0) {
            grid.innerHTML = '<div class="empty-msg">Chưa có sản phẩm nổi bật</div>';
            return;
        }

        grid.innerHTML = slice.map(product => generateProductCardHTML(product)).join('');
        updateFeaturedNav();
    }

    function renderProductPage(products) {
        const container = document.getElementById('product-list-container');
        if (!container) return;

        if (!products || products.length === 0) {
            container.innerHTML = '<div class="empty-msg">Chưa có sản phẩm</div>';
            return;
        }

        container.innerHTML = products.map(product => generateProductCardHTML(product)).join('');
    }

    function filterProducts() {
        const selectedRegions = Array.from(
            document.querySelectorAll('input[name="region"]:checked')
        ).map(i => i.value);
        const selectedCategories = Array.from(
            document.querySelectorAll('input[name="category"]:checked')
        ).map(i => i.value);

        let filtered = [...productsFromDb];
        if (selectedRegions.length) {
            filtered = filtered.filter(p => selectedRegions.includes(p.origin));
        }
        if (selectedCategories.length) {
            filtered = filtered.filter(p => selectedCategories.includes(p.category?.name));
        }
        renderProductPage(filtered);
    }

    function resetFilters() {
        document.querySelectorAll('input[name="region"]').forEach(i => i.checked = false);
        document.querySelectorAll('input[name="category"]').forEach(i => i.checked = false);
        const searchInput = document.getElementById('home-search-input');
        if (searchInput) searchInput.value = '';
        renderProductPage(productsFromDb);
    }

    function executeSearch() {
        const searchInput = document.getElementById('home-search-input');
        if (!searchInput) return;

        const query = searchInput.value.trim().toLowerCase();

        // 1. Chuyển sang trang Sản phẩm (nếu chưa ở trang đó)
        if (!document.getElementById('products').classList.contains('active')) {
            navigateTo('products');
        }

        // 2. Xóa các dấu tick ở bộ lọc cũ để tránh xung đột
        document.querySelectorAll('input[name="region"]').forEach(i => i.checked = false);
        document.querySelectorAll('input[name="category"]').forEach(i => i.checked = false);

        // 3. Tiến hành lọc và hiển thị sản phẩm
        searchProducts(query);
    }

    function searchProducts(query) {
        if (!query) {
            renderProductPage(productsFromDb);
            return;
        }

        const filtered = productsFromDb.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.category?.name || '').toLowerCase().includes(query) ||
            (p.origin || '').toLowerCase().includes(query)
        );
        renderProductPage(filtered);
    }


    // ==================== QUICK BUY ====================
    function showQuickBuyFromProduct(productId) {
        const product = productsFromDb.find(p => p.id === productId);
        if (!product) return;

        quickBuyProductId = productId;
        document.getElementById('quickbuy-image').src = product.imageUrl;
        document.getElementById('quickbuy-image').alt = product.name;
        document.getElementById('quickbuy-name').textContent = product.name;
        document.getElementById('quickbuy-tagline').textContent = product.category?.name || 'Sản phẩm tươi ngon';
        document.getElementById('quickbuy-price').textContent = formatPrice(product.price);
        document.getElementById('quickbuy-old-price').textContent = formatPrice(product.price * 1.1);
        document.getElementById('quickbuy-discount').textContent = product.available ? 'Còn hàng' : 'Hết hàng';
        document.getElementById('quickbuy-description').textContent = product.description;
        document.getElementById('quickbuy-origin').textContent = '📍 ' + product.origin;
        document.getElementById('quickbuy-weight').textContent = '📦 ' + (product.quantity || 0) + ' trong kho';
        document.getElementById('quickbuy-category').textContent = '🏷 ' + (product.category?.name || 'Khác');
        document.getElementById('quickbuy-quantity').value = '1';

        document.getElementById('quickbuy-modal').classList.add('active');
    }

    function closeQuickBuy() {
        document.getElementById('quickbuy-modal')?.classList.remove('active');
    }

    function changeQuickBuyQuantity(change) {
        const input = document.getElementById('quickbuy-quantity');
        let value = parseInt(input.value) || 1;
        value = Math.max(1, value + change);
        input.value = value;
    }

    function quickBuyAddToCart() {
        if (!quickBuyProductId) return;
        const product = productsFromDb.find(p => p.id === quickBuyProductId);
        const quantity = parseInt(document.getElementById('quickbuy-quantity').value) || 1;
        if (product) {
            addToCart(product.name, product.price, quantity);
        }
        closeQuickBuy();
    }


    // ==================== CART ====================
    function addDirectToCart(productId) {
            const product = productsFromDb.find(p => p.id === productId);
            if (product) {
                addToCart(product.name, product.price, 1);
            }
        }
    function addToCart(name, price, quantity = 1) {
        if (!currentUser) {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            navigateTo('login');
            return;
        }

        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ name, price, quantity });
        }

        updateCartBadge();
        saveCart();
        alert(`Đã thêm "${name}" vào giỏ hàng!`);
    }

    function updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function loadCart() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            cart = JSON.parse(saved);
            updateCartBadge();
        }
    }
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:60px 20px; color:#888;">
                    <i class="fas fa-shopping-bag" style="font-size:48px; margin-bottom:16px; opacity:0.3;"></i><br>
                    Giỏ hàng của bạn đang trống
                </td>
            </tr>`;
        document.getElementById('subtotal').textContent = '0đ';
        document.getElementById('total').textContent = '0đ';
        return;
    }

    let subtotal = 0;

    cartItems.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const prod = productsFromDb.find(p => p.name === item.name);
        const imgUrl = prod ? prod.imageUrl : 'https://via.placeholder.com/80';

        return `
            <tr>
                <td>
                    <div class="cart-product">
                        <img src="${imgUrl}" alt="${item.name}">
                        <div>
                            <strong>${item.name}</strong>
                        </div>
                    </div>
                </td>
                <td>${formatPrice(item.price)}</td>
                <td>
                    <div class="quantity-box">
                        <button onclick="updateQuantity(${index}, -1)">–</button>
                        <input type="number" value="${item.quantity}" onchange="setQuantity(${index}, this.value)">
                        <button onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </td>
                <td><strong>${formatPrice(itemTotal)}</strong></td>
                <td>
                    <button class="btn-delete" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('total').textContent = formatPrice(subtotal);
}
    function updateQuantity(index, change) {
        cart[index].quantity = Math.max(1, cart[index].quantity + change);
        updateCartBadge();
        saveCart();
        renderCart();
    }

    function setQuantity(index, value) {
        const qty = parseInt(value);
        if (qty > 0) {
            cart[index].quantity = qty;
            updateCartBadge();
            saveCart();
            renderCart();
        }
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartBadge();
        saveCart();
        renderCart();
    }
  function applyCoupon() {
      const code = document.getElementById('checkout-coupon')?.value.trim().toUpperCase();
      if (!code) return;

      // Danh sách mã giảm giá mẫu - thay bằng API thật
      const coupons = {
          'FRESH10': 0.10,
          'WELCOME20': 0.20,
          'SUMMER15': 0.15
      };

      const discountRate = coupons[code];
      const discountRow = document.getElementById('discount-row');
      const discountAmount = document.getElementById('discount-amount');
      const totalEl = document.getElementById('checkout-total');

      if (discountRate) {
          const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const discount = Math.round(subtotal * discountRate);
          const finalTotal = subtotal - discount;

          if (discountRow) discountRow.style.display = 'flex';
          if (discountAmount) discountAmount.textContent = '-' + formatPrice(discount);
          if (totalEl) totalEl.textContent = formatPrice(finalTotal);

          alert(`Áp dụng mã "${code}" thành công! Giảm ${(discountRate * 100).toFixed(0)}%`);
      } else {
          alert('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      }
  }

  // Override renderCheckout để cập nhật UI mới
  const _originalRenderCheckout = typeof renderCheckout === 'function' ? renderCheckout : null;

function renderCheckout() {
      const checkoutItems = document.getElementById('checkout-items');
      if (!checkoutItems) return;

      if (cart.length === 0) {
          checkoutItems.innerHTML = '<p class="empty-cart">Không có sản phẩm</p>';
          ['checkout-subtotal', 'checkout-total'].forEach(id => {
              const el = document.getElementById(id);
              if (el) el.textContent = '0đ';
          });
          return;
      }

      let subtotal = 0;
      checkoutItems.innerHTML = cart.map(item => {
          const itemTotal = item.price * item.quantity;
          subtotal += itemTotal;
          return `
              <div class="order-item">
                  <div class="order-item-name">
                      <span>${item.name}</span>
                      <span class="order-item-qty">x${item.quantity}</span>
                  </div>
                  <span>${formatPrice(itemTotal)}</span>
              </div>
          `;
      }).join('');

      ['checkout-subtotal', 'checkout-total'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = formatPrice(subtotal);
      });

      // Điền sẵn thông tin nếu đã đăng nhập
      if (currentUser) {
          const fullnameEl = document.getElementById('fullname');
          const phoneEl = document.getElementById('phone');
          const addressEl = document.getElementById('address');
          if (fullnameEl && !fullnameEl.value) fullnameEl.value = currentUser.fullName || '';
          if (phoneEl && !phoneEl.value) phoneEl.value = currentUser.phone || '';
          if (addressEl && !addressEl.value) addressEl.value = currentUser.address || '';
      }
  }

function placeOrder() {
    if (cart.length === 0) {
        alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
        return;
    }
    if (!currentUser) {
        alert('Vui lòng đăng nhập để đặt hàng');
        navigateTo('login');
        return;
    }

    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const notes = document.getElementById('notes') ? document.getElementById('notes').value.trim() : '';

    if (!fullname || !phone || !address) {
        alert('Vui lòng điền đầy đủ thông tin giao hàng.');
        return;
    }

    // 1. Tính toán tổng tiền cuối cùng sau khi áp dụng coupon (nếu có)
    let totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountRow = document.getElementById('discount-row');
    const discountAmountEl = document.getElementById('discount-amount');

    if (discountRow && discountRow.style.display !== 'none' && discountAmountEl) {
        const discountText = discountAmountEl.textContent.replace(/[^\d]/g, '');
        const discountValue = parseInt(discountText) || 0;
        totalAmount = Math.max(0, totalAmount - discountValue);
    }

    // 2. Chuyển đổi mảng cart thành cấu trúc khớp với OrderDetailDTO/Entity ở Backend
    // Tìm kiếm id của sản phẩm dựa trên tên sản phẩm trong giỏ hàng
    const formattedItems = cart.map(item => {
        const matchingProduct = productsFromDb.find(p => p.name === item.name);
        return {
            product: {
                id: matchingProduct ? matchingProduct.id : null // Truyền đối tượng chứa ID để JPA Mapping hoạt động
            },
            productName: item.name,
            quantity: item.quantity,
            price: item.price
        };
    });

    // Kiểm tra tính hợp lệ dữ liệu ID sản phẩm
    const hasInvalidItem = formattedItems.some(item => item.product.id === null);
    if (hasInvalidItem) {
        alert('Phát hiện sản phẩm không hợp lệ trong giỏ hàng. Vui lòng làm mới trang.');
        return;
    }

    // 3. Khởi tạo Payload gửi lên Spring Boot API
    const orderPayload = {
        customerName: fullname,
        phone: phone,
        address: address,
        notes: notes,
        paymentMethod: 'COD',
        totalAmount: totalAmount,
        status: 'PENDING',
        items: formattedItems,
        user: {
            id: currentUser.userId
        }
    };

    console.log("Dữ liệu đơn hàng gửi lên Backend:", orderPayload); // Bạn có thể F12 Console để xem thử log

    if (!authToken) {
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        logout();
        navigateTo('login');
        return;
    }

    // 4. Tiến hành gọi API lưu đơn hàng
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers['Authorization'] = 'Bearer ' + authToken;
    }

    fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
    })
    .then(res => {
        if (!res.ok) {
            // Log chi tiết lỗi từ server để dễ debug nếu backend trả ra message cụ thể
            return res.text().then(text => { throw new Error(text || 'Đặt hàng thất bại từ hệ thống.'); });
        }
        return res.json();
    })
    .then(savedOrder => {
        // Xóa giỏ hàng khi đặt hàng thành công
        cart = [];
        updateCartBadge();
        saveCart();
        renderCart();
        renderCheckout();

        // Reset form nhập liệu thông tin
        document.getElementById('order-form')?.reset();

        // Hiển thị modal thông báo đặt hàng thành công
        showOrderSuccessModal(savedOrder);
    })
    .catch(error => {
        console.error('Lỗi chi tiết từ hệ thống:', error);
        alert('Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng kiểm tra log hệ thống.');
    });
}

function showOrderConfirmation(data) {
    renderOrderConfirmationPage(data);
    navigateTo('order-confirmation');
}

function renderOrderConfirmationPage(orderData) {
    if (!orderData) return;
    lastOrderData = orderData;

    document.getElementById('confirm-order-id').textContent = '#' + (orderData.id || '---');
    document.getElementById('confirm-total').textContent = formatPrice(orderData.totalAmount || orderData.total || 0);
    document.getElementById('confirm-status').textContent = orderData.status === 'PENDING' ? 'Chờ xác nhận' : (orderData.status || 'Đang xử lý');
    document.getElementById('confirm-payment').textContent = formatPaymentMethod(orderData.paymentMethod);
    document.getElementById('confirm-name').textContent = orderData.customerName || '';
    document.getElementById('confirm-phone').textContent = orderData.phone || '';
    document.getElementById('confirm-address').textContent = orderData.address || '';
    document.getElementById('confirm-date').textContent = formatDateTime(orderData.createdAt);

    const itemsContainer = document.getElementById('confirm-order-items');
    if (itemsContainer) {
        if (orderData.items && orderData.items.length > 0) {
            itemsContainer.innerHTML = orderData.items.map(item => {
                const subtotal = item.subtotal || (item.price * item.quantity);
                return `
                    <div class="order-item-row">
                        <div class="item-name">${item.productName || 'Sản phẩm'}</div>
                        <div class="item-quantity">${item.quantity || 0}</div>
                        <div class="item-price">${formatPrice(item.price || 0)}</div>
                        <div class="item-subtotal">${formatPrice(subtotal)}</div>
                    </div>
                `;
            }).join('');
        } else {
            itemsContainer.innerHTML = '<p class="empty-order-items">Không có sản phẩm trong đơn hàng.</p>';
        }
    }
}

function formatPaymentMethod(method) {
    if (!method) return 'COD';
    const upper = String(method).toUpperCase();
    if (upper === 'COD') return 'Thanh toán khi nhận hàng (COD)';
    if (upper === 'TRANSFER') return 'Chuyển khoản';
    if (upper === 'EWALLET') return 'Ví điện tử';
    return upper;
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function setTextContentIfExists(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
    return el;
}

// ==================== ORDER SUCCESS MODAL ====================
function showOrderSuccessModal(orderData) {
    if (!orderData) return;
    lastOrderData = orderData;

    setTextContentIfExists('modal-order-id', '#' + (orderData.id || '---'));
    setTextContentIfExists('modal-order-total', formatPrice(orderData.totalAmount || orderData.total || 0));
    setTextContentIfExists('modal-order-status', orderData.status === 'PENDING' ? 'Chờ xác nhận' : (orderData.status || 'Đang xử lý'));
    setTextContentIfExists('modal-payment-method', formatPaymentMethod(orderData.paymentMethod));
    setTextContentIfExists('modal-customer-name', orderData.customerName || '-');
    setTextContentIfExists('modal-customer-phone', orderData.phone || '-');
    setTextContentIfExists('modal-customer-address', orderData.address || '-');
    setTextContentIfExists('modal-order-date', formatDateTime(orderData.createdAt));

    const modal = document.getElementById('order-success-modal');
    const overlay = document.getElementById('order-success-overlay');
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
    }
}

function closeOrderSuccessModal() {
    const modal = document.getElementById('order-success-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function viewOrderDetailFromModal() {
    closeOrderSuccessModal();
    if (lastOrderData) {
        renderOrderConfirmationPage(lastOrderData);
    }
    navigateTo('order-confirmation');
}

function continueShoppingFromModal() {
    closeOrderSuccessModal();
    navigateTo('home');
}


    // ==================== POPUP ====================
    function showPopup() {
        document.getElementById('popup-notification')?.classList.add('show');
        setTimeout(closePopup, 5000);
    }

    function closePopup() {
        document.getElementById('popup-notification')?.classList.remove('show');
    }


    // ==================== UTILS ====================
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    }

    function handleBuyNow() {
        if (!currentUser) {
            alert('Vui lòng đăng nhập để mua sản phẩm');
            navigateTo('login');
            return;
        }
        navigateTo('products');
    }
    // ==================== FEATURED SLIDER ====================
    function slideFeatured(direction) {
        const total = productsFromDb.length;
        if (total <= FEATURED_PER_PAGE) return;

        featuredOffset += direction * FEATURED_PER_PAGE;

        if (featuredOffset >= total) featuredOffset = 0;
        if (featuredOffset < 0) {
            featuredOffset = Math.floor((total - 1) / FEATURED_PER_PAGE) * FEATURED_PER_PAGE;
        }

        const slice = productsFromDb.slice(featuredOffset, featuredOffset + FEATURED_PER_PAGE);
        renderHomeFeaturedProducts(slice, false);
    }

    function updateFeaturedNav() {
        const total = productsFromDb.length;
        const show = total > FEATURED_PER_PAGE;
        const prevBtn = document.getElementById('featured-prev');
        const nextBtn = document.getElementById('featured-next');
        if (prevBtn) prevBtn.style.display = show ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = show ? 'flex' : 'none';
    }
    // ==================== CATEGORY DROPDOWN ====================
    function renderCategoryDropdown(categories) {
        const dropdown = document.getElementById('category-dropdown');
        if (!dropdown) return;

        // Giữ lại item "Tất cả" ở đầu
        const allItem = dropdown.querySelector('li:first-child');
        dropdown.innerHTML = '';
        if (allItem) dropdown.appendChild(allItem);

        categories.forEach(cat => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="#" onclick="filterByCategory('${cat.name}')">
                    <i class="fas fa-tag"></i> ${cat.name}
                </a>
            `;
            dropdown.appendChild(li);
        });
    }

    function filterByCategory(categoryName) {
        // Chuyển sang trang sản phẩm
        navigateTo('products');

        // Bỏ chọn tất cả filter cũ
        document.querySelectorAll('input[name="region"]').forEach(i => i.checked = false);
        document.querySelectorAll('input[name="category"]').forEach(i => i.checked = false);

        if (!categoryName) {
            // Hiển thị tất cả
            renderProductPage(productsFromDb);
            return;
        }

        // Tick checkbox danh mục tương ứng nếu có
        const checkbox = document.querySelector(
            `input[name="category"][value="${categoryName}"]`
        );
        if (checkbox) {
            checkbox.checked = true;
        }

        // Lọc sản phẩm theo danh mục
        const filtered = productsFromDb.filter(p =>
            (p.category?.name || '') === categoryName
        );
        renderProductPage(filtered);
    }

    // ===== CATEGORY SLIDER (Việt Nam / Nước ngoài) =====
    const categoryOffsets = { vn: 0, foreign: 0 };
    const CATEGORY_PER_PAGE = 3;

    const VN_ORIGINS = ['việt nam', 'hà nội', 'hồ chí minh', 'đà lạt',
                        'tiền giang', 'bến tre', 'long an', 'vĩnh long',
                        'sóc trăng', 'bình phước', 'đồng nai'];

    function isVietnamese(origin) {
        return VN_ORIGINS.some(o => (origin || '').toLowerCase().includes(o));
    }

    function renderCategoryGrid(type) {
        const gridId  = type === 'vn' ? 'vn-product-grid' : 'foreign-product-grid';
        const grid    = document.getElementById(gridId);
        if (!grid || productsFromDb.length === 0) return;

        const filtered = productsFromDb.filter(p =>
            type === 'vn' ? isVietnamese(p.origin) : !isVietnamese(p.origin)
        );

        const offset = categoryOffsets[type];
        const slice  = filtered.slice(offset, offset + CATEGORY_PER_PAGE);

        if (slice.length === 0) {
            grid.innerHTML = '<div class="empty-msg">Không có sản phẩm</div>';
            return;
        }

        grid.innerHTML = slice.map(product => generateProductCardHTML(product)).join('');
    }

    function slideCategory(type, direction) {
        const filtered = productsFromDb.filter(p =>
            type === 'vn' ? isVietnamese(p.origin) : !isVietnamese(p.origin)
        );
        const total = filtered.length;
        if (total <= CATEGORY_PER_PAGE) return;

        categoryOffsets[type] += direction * CATEGORY_PER_PAGE;
        if (categoryOffsets[type] >= total) categoryOffsets[type] = 0;
        if (categoryOffsets[type] < 0)
            categoryOffsets[type] = Math.floor((total - 1) / CATEGORY_PER_PAGE) * CATEGORY_PER_PAGE;

        renderCategoryGrid(type);
    }

    function filterByCategory(type) {
        // Reset filter checkboxes
        document.querySelectorAll('input[name="region"]').forEach(i => i.checked = false);
        document.querySelectorAll('input[name="category"]').forEach(i => i.checked = false);

        if (type === 'vn') {
            const vnCheckbox = document.querySelector('input[name="region"][value="Việt Nam"]');
            if (vnCheckbox) vnCheckbox.checked = true;
        } else if (type === 'foreign') {
            const foreignCheckbox = document.querySelector('input[name="region"][value="Trái cây nhập khẩu"]');
            if (foreignCheckbox) foreignCheckbox.checked = true;
        }

        filterProducts();
    }

    function filterByMenu(filterName) {
        navigateTo('products');
        document.querySelectorAll('input[name="region"]').forEach(i => i.checked = false);
        document.querySelectorAll('input[name="category"]').forEach(i => i.checked = false);
        const regionNames = ['Việt Nam', 'Trái cây nhập khẩu', 'Châu Á', 'Châu Phi', 'Châu Mỹ'];

        if (regionNames.includes(filterName)) {
            const checkbox = document.querySelector(`input[name="region"][value="${filterName}"]`);
            if (checkbox) checkbox.checked = true;
        } else {
            const checkbox = document.querySelector(`input[name="category"][value="${filterName}"]`);
            if (checkbox) checkbox.checked = true;
        }
        filterProducts();
    }


    // ==================== PROMO POPUP ====================
    document.addEventListener('DOMContentLoaded', function () {
        if (!sessionStorage.getItem('promoShown')) {
            setTimeout(showPromoPopup, 1000);
        }
    });

    function showPromoPopup() {
        const popup = document.getElementById('promo-popup');
        if (popup) {
            popup.classList.add('active');
            sessionStorage.setItem('promoShown', 'true'); // Đánh dấu là đã xem
        }
    }

    function closePromoPopup() {
        const popup = document.getElementById('promo-popup');
        if (popup) {
            popup.classList.remove('active');
        }
    }

    document.getElementById('promo-popup')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closePromoPopup();
        }
    });

    // ==================== TRANG CHI TIẾT SẢN PHẨM ====================
    let currentDetailProduct = null;

    function showProductDetail(productId) {
        const product = productsFromDb.find(p => p.id === productId);
        if (!product) return;

        currentDetailProduct = product;

        // 1. Cập nhật Breadcrumb (Đường dẫn phía trên cùng)
        const breadcrumbName = document.getElementById('breadcrumb-product-name');
        if (breadcrumbName) breadcrumbName.textContent = product.name;

        // 2. Điền thông tin vào trang chi tiết
        document.getElementById('detail-image').src = product.imageUrl;
        document.getElementById('detail-name').textContent = product.name;
        document.getElementById('detail-category').textContent = product.category?.name || 'Trái cây tươi';
        document.getElementById('detail-price').textContent = formatPrice(product.price);
        document.getElementById('detail-old-price').textContent = formatPrice(product.price * 1.15);

        // Tự động tính toán % giảm giá
        const discount = Math.round((1 - 1/1.15) * 100);
        document.getElementById('detail-discount-percent').textContent = `-${discount}%`;

        document.getElementById('detail-desc').textContent = product.description || 'Sản phẩm tươi sạch, đảm bảo chất lượng từ nhà vườn đến bàn ăn. Đang cập nhật mô tả chi tiết...';
        document.getElementById('detail-origin').textContent = product.origin || 'Việt Nam';

        // Xử lý tình trạng kho hàng và màu sắc
        const stockEl = document.getElementById('detail-stock');
        if (product.available) {
            stockEl.textContent = 'Còn hàng';
            stockEl.classList.add('in-stock-text');
            stockEl.style.color = '#27ae60';
        } else {
            stockEl.textContent = 'Hết hàng';
            stockEl.classList.remove('in-stock-text');
            stockEl.style.color = '#e74c3c';
        }

        document.getElementById('detail-quantity').value = 1;

        // 3. Tìm và hiển thị Sản phẩm liên quan
        const relatedGrid = document.getElementById('related-product-grid');
        if (relatedGrid) {
            let related = productsFromDb.filter(p =>
                p.id !== productId &&
                ((p.category?.name === product.category?.name) || (p.origin === product.origin))
            );

            // Nếu tìm không thấy SP liên quan thì lấy đại 4 SP khác
            if (related.length === 0) {
                related = productsFromDb.filter(p => p.id !== productId);
            }
            relatedGrid.innerHTML = related.slice(0, 4).map(p => generateProductCardHTML(p)).join('');
        }

        // 4. Chuyển trang
        navigateTo('product-detail');
    }

    // Hàm hỗ trợ Tăng/Giảm số lượng trong trang chi tiết
    function changeDetailQuantity(change) {
        const input = document.getElementById('detail-quantity');
        let val = parseInt(input.value) || 1;
        val = Math.max(1, val + change);
        input.value = val;
    }

    // Hàm hỗ trợ "Thêm vào giỏ" trong trang chi tiết
    function addDetailToCart() {
        if (!currentDetailProduct) return;
        const qty = parseInt(document.getElementById('detail-quantity').value) || 1;
        addToCart(currentDetailProduct.name, currentDetailProduct.price, qty);
    }

    // Hàm hỗ trợ "Mua ngay"
    function buyDetailNow() {
        if (!currentDetailProduct) return;
        addDetailToCart();
        navigateTo('cart');
    }
let testimonialIndex = 0;

function showTestimonial(index) {
    const items =
        document.querySelectorAll('.testimonial-content');

    const dots =
        document.querySelectorAll('.t-dot');

    items.forEach(item =>
        item.classList.remove('active')
    );

    dots.forEach(dot =>
        dot.classList.remove('active')
    );

    items[index].classList.add('active');
    dots[index].classList.add('active');
}

setInterval(() => {
    const items =
        document.querySelectorAll('.testimonial-content');

    if (!items.length) return;

    testimonialIndex++;

    if (testimonialIndex >= items.length) {
        testimonialIndex = 0;
    }

    showTestimonial(testimonialIndex);

}, 4000);