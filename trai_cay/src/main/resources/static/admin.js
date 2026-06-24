let adminProducts = [];
let adminOrders = [];
let adminCategories = [];
let currentUser = null;
let authToken = null;

const orderStatusLabel = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy'
};

function showAdminTab(tabName, event) {
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));

    const clicked = event?.currentTarget;
    if (clicked) {
        clicked.classList.add('active');
    }

    const panel = document.getElementById(`admin-${tabName}`);
    if (panel) {
        panel.classList.add('active');
    }

    document.getElementById('page-title').textContent =
        tabName === 'dashboard' ? 'Tổng quan' :
        tabName === 'products' ? 'Sản phẩm' :
        tabName === 'orders' ? 'Đơn hàng' :
        tabName === 'categories' ? 'Danh mục' :
        'Cài đặt';

    if (tabName === 'dashboard') {
        loadAdminDashboard();
    } else if (tabName === 'products') {
        loadAdminProducts();
    } else if (tabName === 'orders') {
        loadAdminOrders('ALL');
    } else if (tabName === 'categories') {
        loadAdminCategories();
    }
}

function adminSearch(query) {
    const term = query.trim().toLowerCase();
    if (!term) {
        if (document.getElementById('admin-products').classList.contains('active')) {
            renderProductTable(adminProducts);
        } else if (document.getElementById('admin-orders').classList.contains('active')) {
            renderOrderTable(adminOrders);
        }
        return;
    }

    if (document.getElementById('admin-products').classList.contains('active')) {
        renderProductTable(adminProducts.filter(product =>
            product.name.toLowerCase().includes(term) ||
            (product.category?.name || '').toLowerCase().includes(term)
        ));
    }
    if (document.getElementById('admin-orders').classList.contains('active')) {
        renderOrderTable(adminOrders.filter(order =>
            (`#${order.id}`).toLowerCase().includes(term) ||
            (order.customerName || '').toLowerCase().includes(term) ||
            (order.status || '').toLowerCase().includes(term)
        ));
    }
}

function renderProductTable(products) {
    const tbody = document.getElementById('products-list');
    tbody.innerHTML = '';
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Không có dữ liệu</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price.toLocaleString('vi-VN')}đ</td>
            <td>${product.quantity}</td>
            <td>${product.category?.name || 'Chưa phân loại'}</td>
            <td><span class="badge ${product.available ? 'badge-success' : 'badge-danger'}">${product.available ? 'Có sẵn' : 'Hết hàng'}</span></td>
            <td>
                <button class="btn-secondary" onclick="editProduct(${product.id})">Sửa</button>
                <button class="btn-secondary" onclick="deleteProduct(${product.id})">Xóa</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderOrderTable(orders) {
    const tbody = document.getElementById('orders-list');
    tbody.innerHTML = '';
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Không có dữ liệu</td></tr>';
        return;
    }

    orders.forEach(order => {
        const statusClass =
            order.status === 'PENDING' ? 'badge-warning' :
            order.status === 'CONFIRMED' ? 'badge-success' :
            order.status === 'SHIPPED' ? 'badge-warning' :
            order.status === 'DELIVERED' ? 'badge-success' :
            'badge-danger';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customerName || 'Khách lạ'}</td>
            <td>${(order.totalAmount || 0).toLocaleString('vi-VN')}đ</td>
            <td><span class="badge ${statusClass}">${orderStatusLabel[order.status] || 'Khác'}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
            <td>
                <button class="btn-secondary" onclick="openOrderDetail(${order.id})">Xem</button>
                <button class="btn-secondary" onclick="updateOrderStatus(${order.id}, this)">Cập nhật</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderCategoryTable(categories) {
    const tbody = document.getElementById('categories-list');
    tbody.innerHTML = '';
    if (!categories || categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Không có dữ liệu</td></tr>';
        return;
    }

    categories.forEach(category => {
        // Đếm số lượng sản phẩm thực tế thuộc về danh mục này
        const productCount = adminProducts.filter(p => p.category && p.category.id === category.id).length;

        // Ưu tiên số liệu từ Backend nếu Backend có trả về trường productCount, nếu không dùng số vừa đếm
        const displayCount = category.productCount !== undefined ? category.productCount : productCount;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.description || 'Không có mô tả'}</td>
            <td><strong>${displayCount}</strong></td> <td>
                <button class="btn-secondary" onclick="editCategory(${category.id})">Sửa</button>
                <button class="btn-secondary" onclick="deleteCategory(${category.id})">Xóa</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}



function loadAdminProducts() {
    const options = {};
    if (authToken) {
        options.headers = {
            'Authorization': 'Bearer ' + authToken
        };
    }
    fetch('/api/products/all', options)
        .then(response => response.json())
        .then(products => {
            adminProducts = products;
            renderProductTable(products);
        })
        .catch(error => console.error('Error loading products:', error));
}

function loadAdminOrders(status = 'ALL') {
    const options = {
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    };
    fetch('/api/orders', options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(orders => {
            adminOrders = orders;
            const filtered = status === 'ALL' ? orders : orders.filter(order => order.status === status);
            renderOrderTable(filtered);
        })
        .catch(error => console.error('Error loading orders:', error));
}

function loadAdminCategories() {
    // Gọi song song cả API sản phẩm (nếu chưa có) và API danh mục để lấy dữ liệu đếm số lượng
    const fetchProducts = adminProducts.length === 0 ?
        fetch('/api/products/all', { headers: { 'Authorization': 'Bearer ' + authToken } }).then(r => r.json()) :
        Promise.resolve(adminProducts);

    const fetchCategories = fetch('/api/categories').then(r => r.json());

    return Promise.all([fetchProducts, fetchCategories])
        .then(([products, categories]) => {
            // Lưu lại data sản phẩm để dùng cho việc đếm
            adminProducts = Array.isArray(products) ? products : (products.data || products.content || []);
            adminCategories = categories;
            renderCategoryTable(categories);
            return categories;
        })
        .catch(error => {
            console.error('Error loading data:', error);
            return [];
        });
}
function populateCategorySelect() {
    const categorySelect = document.getElementById('product-category');
    if (!categorySelect) return;
    categorySelect.innerHTML = '';

    if (!adminCategories || adminCategories.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Không có danh mục';
        categorySelect.appendChild(option);
        return;
    }

    adminCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

let editingProductId = null;

function openProductModal(product = null) {
    editingProductId = product ? product.id : null;
    document.getElementById('product-modal-title').textContent = product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới';
    document.getElementById('product-form').reset();
    populateCategorySelect();

    if (product) {
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-origin').value = product.origin || '';
        document.getElementById('product-quantity').value = product.quantity || '';
        document.getElementById('product-image-url').value = product.imageUrl || '';
        document.getElementById('product-available').value = product.available ? 'true' : 'false';
        if (product.category?.id) {
            document.getElementById('product-category').value = product.category.id;
        }
    } else {
        document.getElementById('product-available').value = 'true';
    }

    document.getElementById('product-modal').classList.add('show');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('show');
}

function showAddProductForm() {
    if (!adminCategories || adminCategories.length === 0) {
        loadAdminCategories().then(() => openProductModal(null));
    } else {
        openProductModal(null);
    }
}

function submitProductForm(event) {
    event.preventDefault();

    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const origin = document.getElementById('product-origin').value.trim();
    const quantity = parseInt(document.getElementById('product-quantity').value, 10);
    const imageUrl = document.getElementById('product-image-url').value.trim() || 'https://via.placeholder.com/300';
    const available = document.getElementById('product-available').value === 'true';
    const categoryId = parseInt(document.getElementById('product-category').value, 10);

    if (!name || !description || Number.isNaN(price) || !origin || Number.isNaN(quantity) || Number.isNaN(categoryId)) {
        alert('Vui lòng điền tất cả các trường bắt buộc.');
        return;
    }

    const product = {
        name,
        description,
        price,
        origin,
        quantity,
        available,
        imageUrl,
        category: { id: categoryId }
    };

    const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
    const method = editingProductId ? 'PUT' : 'POST';

    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify(product)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text || 'Lỗi khi lưu sản phẩm.'); });
        }
        return response.json();
    })
    .then(() => {
        alert(editingProductId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        closeProductModal();
        loadAdminProducts();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Lỗi khi lưu sản phẩm!');
    });
}

function editProduct(productId) {
    fetch(`/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            if (product) {
                if (!adminCategories || adminCategories.length === 0) {
                    loadAdminCategories().then(() => openProductModal(product));
                } else {
                    openProductModal(product);
                }
            }
        })
        .catch(error => {
            console.error('Error loading product:', error);
            alert('Không thể tải sản phẩm để sửa.');
        });
}

function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Xóa sản phẩm thành công!');
            loadAdminProducts();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Lỗi khi xóa sản phẩm.');
    });
}



// Biến lưu trạng thái đang sửa danh mục nào (null nếu là thêm mới)
let editingCategoryId = null;

// Hàm mở Modal Danh mục
function openCategoryModal(category = null) {
    editingCategoryId = category ? category.id : null;

    // Cập nhật tiêu đề modal
    document.getElementById('category-modal-title').textContent = category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới';

    // Reset form sạch sẽ trước khi điền dữ liệu
    document.getElementById('category-form').reset();

    // Nếu là chế độ Sửa, điền dữ liệu cũ vào các ô input
    if (category) {
        document.getElementById('category-name').value = category.name || '';
        document.getElementById('category-description').value = category.description || '';
        document.getElementById('category-image-url').value = category.imageUrl || '';
    }

    // Hiển thị modal
    document.getElementById('category-modal').classList.add('show');
}

// Hàm đóng Modal Danh mục
function closeCategoryModal() {
    document.getElementById('category-modal').classList.remove('show');
}

// Hàm được gọi khi bấm nút "+ Thêm danh mục"
function showAddCategoryForm() {
    openCategoryModal(null);
}

// Hàm được gọi khi bấm nút "Sửa" trên từng dòng danh mục
function editCategory(categoryId) {
    // Tìm danh mục trong mảng dữ liệu đã load sẵn
    const category = adminCategories.find(c => c.id === categoryId);

    if (category) {
        openCategoryModal(category);
    } else {
        // Fallback: Nếu không tìm thấy, fetch lại từ API
        fetch(`/api/categories/${categoryId}`)
            .then(response => {
                if (!response.ok) throw new Error('Không thể tải dữ liệu danh mục');
                return response.json();
            })
            .then(data => openCategoryModal(data))
            .catch(error => {
                console.error('Error:', error);
                alert('Có lỗi xảy ra khi lấy thông tin danh mục.');
            });
    }
}

// Hàm xử lý khi bấm submit form lưu danh mục
function submitCategoryForm(event) {
    event.preventDefault(); // Chặn hành vi reload trang mặc định của form

    const name = document.getElementById('category-name').value.trim();
    const description = document.getElementById('category-description').value.trim();
    const imageUrl = document.getElementById('category-image-url').value.trim() || 'https://via.placeholder.com/300';

    if (!name) {
        alert('Vui lòng nhập tên danh mục.');
        return;
    }

    const categoryPayload = {
        name,
        description,
        imageUrl
    };

    // Quyết định URL và Phương thức (POST cho thêm mới, PUT cho cập nhật)
    const url = editingCategoryId ? `/api/categories/${editingCategoryId}` : '/api/categories';
    const method = editingCategoryId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify(categoryPayload)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text || 'Lỗi khi lưu danh mục.'); });
        }
        return response.json();
    })
    .then(() => {
        alert(editingCategoryId ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục mới thành công!');
        closeCategoryModal();
        loadAdminCategories(); // Load lại bảng danh mục

        // Load lại cả select box trong form sản phẩm để đồng bộ dữ liệu
        if (typeof populateCategorySelect === 'function') {
            populateCategorySelect();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Lỗi khi lưu danh mục!');
    });
}

function deleteCategory(categoryId) {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Xóa danh mục thành công!');
            loadAdminCategories();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Lỗi khi xóa danh mục.');
    });
}

function openOrderDetail(orderId) {
    fetch(`/api/orders/${orderId}`, {
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    })
        .then(response => response.json())
        .then(order => {
            document.getElementById('order-detail-code').textContent = `Mã đơn: #${order.id}`;
            document.getElementById('order-detail-customer').textContent = order.customerName || '-';
            document.getElementById('order-detail-status').textContent = orderStatusLabel[order.status] || order.status;
            document.getElementById('order-detail-date').textContent = new Date(order.createdAt).toLocaleDateString('vi-VN');
            document.getElementById('order-detail-total').textContent = (order.totalAmount || 0).toLocaleString('vi-VN') + 'đ';

            const itemsBody = document.getElementById('order-detail-items');
            itemsBody.innerHTML = '';
            if (Array.isArray(order.items) && order.items.length) {
                order.items.forEach(item => {
                    const productName = item.productName || item.name || (item.product && (item.product.name || item.product.title)) || 'Sản phẩm';
                    const quantity = (item.quantity || item.qty || 0);
                    const unitPrice = (item.price || item.unitPrice || (item.product && item.product.price) || 0);
                    const subtotal = (unitPrice * quantity) || 0;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${productName}</td>
                        <td>${quantity}</td>
                        <td>${subtotal.toLocaleString('vi-VN')}đ</td>
                    `;
                    itemsBody.appendChild(row);
                });
            } else {
                itemsBody.innerHTML = '<tr><td colspan="3">Không có sản phẩm</td></tr>';
            }

            document.getElementById('order-detail-modal').classList.add('show');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Không thể tải chi tiết đơn hàng.');
        });
}

function closeOrderDetail() {
    document.getElementById('order-detail-modal').classList.remove('show');
}

function updateOrderStatus(orderId, anchorEl) {
    // Remove any existing menu
    closeStatusMenu();

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const statusLabels = {
        PENDING: 'Chờ xác nhận',
        CONFIRMED: 'Đã xác nhận',
        SHIPPED: 'Đang giao',
        DELIVERED: 'Đã giao',
        CANCELLED: 'Đã hủy'
    };

    // Create menu container
    const menu = document.createElement('div');
    menu.className = 'status-menu';
    menu.dataset.orderId = orderId;

    validStatuses.forEach(s => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'status-option';
        btn.innerHTML = `<span class="badge ${s === 'CONFIRMED' || s === 'DELIVERED' ? 'badge-success' : s === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}">${statusLabels[s]}</span>`;
        btn.onclick = (e) => {
            e.stopPropagation();
            performStatusUpdate(orderId, s);
            closeStatusMenu();
        };
        menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    // Position menu under anchorEl
    try {
        const rect = anchorEl.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = (window.scrollY + rect.bottom + 6) + 'px';
        menu.style.left = Math.max(8, window.scrollX + rect.left - 120) + 'px';
    } catch (err) {
        // fallback center
        menu.style.position = 'fixed';
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';
    }

    // Close menu when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', onDocumentClickCloseMenu);
    }, 0);
}

function performStatusUpdate(orderId, targetStatus) {
    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(targetStatus)) {
        alert('Trạng thái không hợp lệ.');
        return;
    }

    fetch(`/api/orders/${orderId}/status?status=${targetStatus}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    })
    .then(response => {
        if (response.ok) {
            alert(`Cập nhật trạng thái đơn hàng #${orderId} thành công.`);

            // Refresh admin list or dashboard
            if (document.getElementById('admin-dashboard').classList.contains('active')) {
                loadAdminDashboard();
            } else {
                loadAdminOrders('ALL');
            }
            closeOrderDetail();
        } else {
            alert('Cập nhật trạng thái thất bại.');
        }
    })
    .catch(error => {
        console.error('Error updating order status:', error);
        alert('Lỗi kết nối khi cập nhật trạng thái.');
    });
}

function closeStatusMenu() {
    const existing = document.querySelectorAll('.status-menu');
    existing.forEach(n => n.remove());
    document.removeEventListener('click', onDocumentClickCloseMenu);
}

function onDocumentClickCloseMenu(e) {
    // close when clicking outside menu
    const menus = document.querySelectorAll('.status-menu');
    if (!menus || menus.length === 0) return;
    const clickedInside = Array.from(menus).some(m => m.contains(e.target));
    if (!clickedInside) closeStatusMenu();
}
function loadAdminUser() {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
}

function requireAdminAccess() {
    if (!currentUser || currentUser.role !== 'ADMIN') {
        alert('Bạn không có quyền truy cập trang quản trị.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('admin')) {
        return;
    }

    loadAdminUser();
    if (!requireAdminAccess()) {
        return;
    }

    loadAdminDashboard();
    loadAdminCategories();
});
let revenueChart = null;
let statusChart = null;
let topProductsChart = null;
let currentRevenuePeriod = 6;
let currentRevenueGranularity = 'month';
let demoOrdersEnabled = true;
let demoInjected = false;

// Gọi hàm này sau khi loadAdminDashboard() đã fetch xong data
// Override loadAdminDashboard để thêm vẽ biểu đồ
const _origLoadAdminDashboard = loadAdminDashboard;

function loadAdminDashboard() {
    const ordersOptions = {
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    };
    Promise.all([
        fetch('/api/products/all').then(r => r.json()),
        fetch('/api/orders', ordersOptions).then(r => r.json())
    ])
    .then(([products, orders]) => {
        adminProducts = Array.isArray(products) ? products : (products.data || products.content || []);
        adminOrders   = Array.isArray(orders)   ? orders   : (orders.data   || orders.content   || []);

        // Load dữ liệu ảo dùng cho biểu đồ (không bị mất khi qua tab khác)
        if (demoOrdersEnabled) {
            const demos = generateDemoOrders();
            adminOrders = adminOrders.concat(demos);
        }

        // ---- Điền dữ liệu vào các thẻ Stat cards ----
        document.getElementById('stat-products').textContent = adminProducts.length;
        document.getElementById('stat-orders').textContent   = adminOrders.length;

        const revenue = adminOrders
            .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        document.getElementById('stat-revenue').textContent = revenue.toLocaleString('vi-VN') + 'đ';

const completedOrdersCount = adminOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED').length;
const statCompletedEl = document.getElementById('stat-completed-orders');
if (statCompletedEl) {
    statCompletedEl.textContent = completedOrdersCount;
}
        const confirmedCount = adminOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED').length;
        const conversion = adminOrders.length ? Math.round((confirmedCount / adminOrders.length) * 100) : 0;
        document.getElementById('stat-conversion').textContent = conversion + '%';

        const countByStatus = (status) => adminOrders.filter(o => o.status === status).length;
        document.getElementById('stat-pending-orders').textContent   = countByStatus('PENDING');
        if (document.getElementById('stat-shipped-orders'))
            document.getElementById('stat-shipped-orders').textContent = countByStatus('SHIPPED');
        if (document.getElementById('stat-cancelled-orders'))
            document.getElementById('stat-cancelled-orders').textContent = countByStatus('CANCELLED');

        // ---- Render các biểu đồ (Đã sửa lỗi ngoặc nhọn ở đây) ----
        setTimeout(() => {
            try {
                renderRevenueDateControls();
                const activeBtn = document.querySelector('.granularity-controls .chart-filter-btn.active');
                setRevenueChartGranularity(currentRevenueGranularity, activeBtn);
            } catch (e) { console.error("Lỗi dựng biểu đồ doanh thu:", e); }

            try { drawStatusChart(adminOrders); } catch (e) { console.error("Lỗi biểu đồ trạng thái:", e); }

            try {
                const filterVal = document.getElementById('recent-order-filter')?.value || 'all';
                filterRecentOrders(filterVal);
            } catch (e) { console.error("Lỗi đơn hàng gần đây:", e); }

        }, 100); // <--- Chú ý vị trí đóng ngoặc ở đây
    })
    .catch(error => {
        console.error('Error loading dashboard:', error);
        if(document.getElementById('stat-products')) {
            document.getElementById('stat-products').textContent = adminProducts.length || 0;
        }
    });
}
// ---- Biểu đồ doanh thu (Mặc định 12 tháng - Chỉ đổi khi chủ động lọc) ----
// ---- Biểu đồ doanh thu (Cải tiến hiệu ứng Line Chart tách biệt và đổ bóng) ----
function drawRevenueOverview(orders = [], granularity = 'month', period, startArg, endArg, isFiltered = false) {
    const mainCtx = document.getElementById('revenue-chart');
    if (!mainCtx) return;

    const labels = [];
    const revenueData = [];

    const start = startArg ? new Date(startArg) : null;
    const end   = endArg   ? new Date(endArg)   : null;

    if (granularity === 'day' && start && end) {
        // Lọc theo từng ngày trong khoảng start → end
        const cursor = new Date(start);
        while (cursor <= end) {
            const y = cursor.getFullYear(), m = cursor.getMonth(), d = cursor.getDate();
            labels.push(`${d}/${m+1}`);
            const rev = orders
                .filter(o => {
                    const od = new Date(o.createdAt);
                    return od.getFullYear()===y && od.getMonth()===m && od.getDate()===d;
                })
                .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
                .reduce((s, o) => s + (o.totalAmount || 0), 0);
            revenueData.push(rev);
            cursor.setDate(cursor.getDate() + 1);
            if (labels.length > 60) break;
        }
    } else if (granularity === 'year' && start && end) {
        // Lọc theo từng năm
        for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
            labels.push(`${y}`);
            const rev = orders
                .filter(o => new Date(o.createdAt).getFullYear() === y)
                .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
                .reduce((s, o) => s + (o.totalAmount || 0), 0);
            revenueData.push(rev);
        }
    } else {
        // XỬ LÝ CHO GRANULARITY = 'MONTH'
        const targetDate = end ? new Date(end) : new Date();
        const targetYear = targetDate.getFullYear();

        if (isFiltered) {
            const targetMonth = targetDate.getMonth();
            const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

            for (let d = 1; d <= daysInMonth; d++) {
                labels.push(`Ngày ${d}`);
                const rev = orders
                    .filter(o => {
                        const od = new Date(o.createdAt);
                        return od.getFullYear() === targetYear &&
                               od.getMonth() === targetMonth &&
                               od.getDate() === d;
                    })
                    .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
                    .reduce((s, o) => s + (o.totalAmount || 0), 0);
                revenueData.push(rev);
            }
        } else {
            for (let m = 0; m < 12; m++) {
                labels.push(`T${m+1}`);
                const rev = orders
                    .filter(o => {
                        const od = new Date(o.createdAt);
                        return od.getFullYear() === targetYear && od.getMonth() === m;
                    })
                    .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
                    .reduce((s, o) => s + (o.totalAmount || 0), 0);
                revenueData.push(rev);
            }
        }
    }

    // Tạo hiệu ứng đổ bóng cho đường thẳng thông qua canvas context plugins
    const shadowPlugin = {
        id: 'shadowPlugin',
        beforeDraw: (chart) => {
            const { ctx } = chart;
            ctx.save();
            // Cấu hình đổ bóng (Shadow) tạo độ nổi 3D tách biệt khỏi cột
            ctx.shadowColor = 'rgba(46, 204, 113, 0.4)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 6;
        },
        afterDraw: (chart) => {
            chart.ctx.restore();
        }
    };

    if (revenueChart) revenueChart.destroy();

    const ctx2d = mainCtx.getContext('2d');
    // Tạo gradient mờ phía dưới đường thẳng tăng tính thẩm mỹ
    const fadeGradient = ctx2d.createLinearGradient(0, 0, 0, mainCtx.clientHeight);
    fadeGradient.addColorStop(0, 'rgba(46, 204, 113, 0.15)');
    fadeGradient.addColorStop(1, 'rgba(46, 204, 113, 0)');

    revenueChart = new Chart(mainCtx, {
        plugins: [shadowPlugin], // Kích hoạt plugin đổ bóng riêng cho Line
        data: {
            labels,
            datasets: [
                {
                    // --- ĐƯỜNG XU HƯỚNG CẢI TIẾN ---
                    type: 'line',
                    label: 'Xu hướng',
                    data: revenueData,
                    borderColor: '#2ecc71',         // Màu neon lục sáng bắt mắt
                    borderWidth: 4,                 // Làm dày đường nét
                    pointBackgroundColor: '#ffffff', // Tâm điểm tròn màu trắng
                    pointBorderColor: '#2ecc71',    // Viền điểm màu xanh lục
                    pointBorderWidth: 3,
                    pointRadius: 5,                 // Điểm tròn mặc định to hơn
                    pointHoverRadius: 8,            // Phóng to điểm rõ rệt khi hover
                    pointHoverBackgroundColor: '#2ecc71',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    tension: 0.35,                  // Tăng độ uốn lượn mềm mượt nghệ thuật hơn
                    fill: true,                     // Bật màu phủ gradient dưới đường thẳng
                    backgroundColor: fadeGradient,
                    order: 1                        // Đặt thứ tự vẽ lên hàng đầu (nổi trên cột)
                },
                {
                    // --- CỘT DOANH THU GỐC ---
                    type: 'bar',
                    label: 'Doanh thu',
                    data: revenueData,
                    backgroundColor: '#1e4f1f',
                    borderRadius: 6,
                    barPercentage: isFiltered ? 0.7 : 0.6,
                    order: 2                        // Vẽ nằm phía sau đường line
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // Thêm hiệu ứng Animation mượt mà khi render
            animations: {
                y: {
                    easing: 'easeInOutQuart',
                    duration: 1000,
                    from: (ctx) => {
                        if (ctx.type === 'data') {
                            if (ctx.mode === 'default' && !ctx.hadStarted) {
                                ctx.hadStarted = true;
                                return 0;
                            }
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#112d18',     // Đổi nền tooltip tối màu cực sang
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString('vi-VN')}đ`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        callback: function(val, index) {
                            if (!isFiltered) return this.getLabelForValue(val);
                            return index % 3 === 0 ? this.getLabelForValue(val) : '';
                        }
                    }
                },
                y: {
                    min: 0,
                    ticks: {
                        callback: v => {
                            if (v >= 1000000) return (v/1000000).toFixed(1) + 'M';
                            if (v >= 1000) return (v/1000).toFixed(0) + 'K';
                            return v;
                        }
                    },
                    grid: { color: 'rgba(0,0,0,0.04)' }
                }
            }
        }
    });

    // Cập nhật số tổng KPI hiển thị phía trên
    const total = revenueData.reduce((s, v) => s + v, 0);
    const kpiEl = document.getElementById('revenue-kpi');
    if (kpiEl) kpiEl.textContent = total.toLocaleString('vi-VN') + 'đ';

    // Xử lý nhãn hiển thị tăng trưởng phần trăm (%)
   const changeEl = document.getElementById('revenue-kpi-change');
       if (changeEl) {
           const targetDate = end ? new Date(end) : new Date();
           const targetYear = targetDate.getFullYear();
           const targetMonth = targetDate.getMonth(); // 0 - 11

           let currentPeriodRevenue = 0;
           let prevPeriodRevenue = 0;
           let labelText = "";

           if (!isFiltered) {
               // TRẠNG THÁI 1: TỔNG QUAN CẢ NĂM
               // Tự động tìm tháng mới nhất đang có doanh thu
               let latestMonthIndex = 11;
               for (let i = 11; i >= 0; i--) {
                   if (revenueData[i] > 0) {
                       latestMonthIndex = i;
                       break;
                   }
               }

               currentPeriodRevenue = revenueData[latestMonthIndex];
               // Lấy doanh thu của tháng liền trước đó
               prevPeriodRevenue = latestMonthIndex > 0 ? revenueData[latestMonthIndex - 1] : 0;

               // Xử lý nhãn text (Ví dụ đang ở T6 thì so sánh với T5)
               let prevMonthLabel = latestMonthIndex === 0 ? "12" : (latestMonthIndex).toString();
               labelText = `so với T${prevMonthLabel}`;

           } else {
               // TRẠNG THÁI 2: ĐÃ CHỌN LỌC 1 THÁNG CỤ THỂ
               currentPeriodRevenue = total;

               // Lùi lại 1 tháng để lấy mốc thời gian so sánh
               let prevMonth = targetMonth - 1;
               let prevYear = targetYear;
               if (prevMonth < 0) {
                   prevMonth = 11;
                   prevYear--;
               }

               // Tính tổng tiền của tháng liền trước
               prevPeriodRevenue = orders
                   .filter(o => {
                       const od = new Date(o.createdAt);
                       return od.getFullYear() === prevYear && od.getMonth() === prevMonth;
                   })
                   .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
                   .reduce((s, o) => s + (o.totalAmount || 0), 0);

               labelText = "so với tháng trước";
           }

           // --- TÍNH TOÁN VÀ HIỂN THỊ PHẦN TRĂM (%) ---
           if (currentPeriodRevenue === 0 && prevPeriodRevenue === 0) {
               changeEl.textContent = `0% (${labelText})`;
               changeEl.style.color = '#7b8b82'; // Màu xám nếu không có biến động
               changeEl.style.background = '#f1f6ef';
           } else if (prevPeriodRevenue === 0) {
               changeEl.textContent = `+100% ▲ (${labelText})`;
               changeEl.style.color = '#2f7f2f';
               changeEl.style.background = '#eaf7ea';
           } else {
               const pct = Math.round(((currentPeriodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100);
               const sign = pct >= 0 ? '+' : '';
               const arrow = pct >= 0 ? '▲' : '▼';

               changeEl.textContent = `${sign}${pct}% ${arrow} (${labelText})`;

               // Cập nhật màu sắc: Xanh lá nếu tăng/giữ nguyên, Đỏ nếu giảm
               if (pct >= 0) {
                   changeEl.style.color = '#2f7f2f';
                   changeEl.style.background = '#eaf7ea';
               } else {
                   changeEl.style.color = '#c0392b';
                   changeEl.style.background = '#fdecea';
               }
           }
       }
   }

function setRevenueChartPeriod(period, btn) {
    currentRevenuePeriod = period;
    // period buttons removed in simplified UI; just redraw with provided period
    drawRevenueOverview(adminOrders, currentRevenueGranularity, currentRevenuePeriod);
}

function setRevenueChartGranularity(granularity, btn) {
    currentRevenueGranularity = granularity;
    // Khởi tạo active class cho nút phân loại
    document.querySelectorAll('.granularity-controls .chart-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Vẽ bộ điều khiển ngày tương ứng
    renderRevenueDateControls();

    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);

    // Đảm bảo truyền tham số thứ 6 (isFiltered) là false để kích hoạt biểu đồ 12 tháng mặc định
    drawRevenueOverview(adminOrders, granularity, null, start, end, false);
}

function renderRevenueDateControls() {
    const container = document.getElementById('revenue-date-controls');
    if (!container) return;
    container.innerHTML = '';

    if (currentRevenueGranularity === 'day') {
        // Chọn khoảng ngày: từ ngày → đến ngày
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

        container.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <input type="date" id="rev-day-start" value="${monthAgo}" style="padding:6px 8px;border-radius:8px;border:1px solid #e6efe6;background:#fbfff9;">
                <span style="color:#888">→</span>
                <input type="date" id="rev-day-end" value="${todayStr}" style="padding:6px 8px;border-radius:8px;border:1px solid #e6efe6;background:#fbfff9;">
                <button onclick="applyDayFilter()" style="padding:6px 12px;border-radius:999px;background:#1a8d3e;color:#fff;border:none;cursor:pointer;font-size:13px;">Lọc</button>
            </div>
        `;

    } else if (currentRevenueGranularity === 'month') {
        // Chọn năm để xem T1-T12
        const now = new Date();
        const defaultVal = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
        container.innerHTML = `
            <input type="month" id="rev-single-month" value="${defaultVal}"
                style="padding:6px 8px;border-radius:8px;border:1px solid #e6efe6;background:#fbfff9;font-size:14px;"
                onchange="applyMonthFilter(this.value)">
        `;

    } else if (currentRevenueGranularity === 'year') {
        // Chọn khoảng năm
        const now = new Date();
        container.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;">
                <input type="number" id="rev-year-start" value="${now.getFullYear()-3}" min="2000" max="2099"
                    style="width:80px;padding:6px 8px;border-radius:8px;border:1px solid #e6efe6;background:#fbfff9;">
                <span style="color:#888">→</span>
                <input type="number" id="rev-year-end" value="${now.getFullYear()}" min="2000" max="2099"
                    style="width:80px;padding:6px 8px;border-radius:8px;border:1px solid #e6efe6;background:#fbfff9;">
                <button onclick="applyYearFilter()" style="padding:6px 12px;border-radius:999px;background:#1a8d3e;color:#fff;border:none;cursor:pointer;font-size:13px;">Lọc</button>
            </div>
        `;
    }
}
// Generate some demo orders across months to visualize charts locally
function generateDemoOrders() {
    const demo = [];
    const now = new Date();
    const year = now.getFullYear();
    let id = 200;

    // Dữ liệu fake theo từng tháng trong năm hiện tại
    const monthlyData = [
        { month: 0, count: 3, amounts: [850000, 1200000, 950000] },           // T1
        { month: 1, count: 4, amounts: [1500000, 800000, 2200000, 650000] },  // T2
        { month: 2, count: 5, amounts: [900000, 1800000, 3200000, 750000, 1100000] }, // T3
        { month: 3, count: 3, amounts: [2500000, 1350000, 880000] },           // T4
        { month: 4, count: 6, amounts: [1200000, 900000, 2800000, 1500000, 650000, 3100000] }, // T5
        { month: 5, count: 2, amounts: [4200000, 7250000] },                   // T6 (thực tế)
    ];

    monthlyData.forEach(({ month, count, amounts }) => {
        amounts.forEach((amount, i) => {
            const day = Math.min(5 + i * 4, 28);
            demo.push({
                id: id++,
                customerName: `Khách hàng Demo ${id}`,
                createdAt: new Date(year, month, day, 10, 0, 0).toISOString(),
                status: i % 4 === 3 ? 'CANCELLED' : (i % 2 === 0 ? 'DELIVERED' : 'CONFIRMED'),
                totalAmount: amount,
                items: [
                    { name: 'Táo Fuji', quantity: 2, price: Math.round(amount * 0.4) },
                    { name: 'Cam Sành', quantity: 3, price: Math.round(amount * 0.6 / 3) }
                ]
            });
        });
    });

    return demo;
}

function applyRevenueDateRange() {
    // read controls and compute labels/data accordingly
    if (currentRevenueGranularity === 'day') {
        const s = document.getElementById('rev-start-date')?.value;
        const e = document.getElementById('rev-end-date')?.value;
        if (!s || !e) { alert('Vui lòng chọn ngày bắt đầu và kết thúc'); return; }
        const start = new Date(s); const end = new Date(e);
        if (start > end) { alert('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc'); return; }
        // compute days length
        const diff = Math.ceil((end - start) / (24*3600*1000)) + 1;
        drawRevenueOverview(adminOrders, 'day', diff, start, end);
    } else if (currentRevenueGranularity === 'month') {
        const s = document.getElementById('rev-start-month')?.value;
        const e = document.getElementById('rev-end-month')?.value;
        if (!s || !e) { alert('Vui lòng chọn tháng bắt đầu và kết thúc'); return; }
        // month inputs like YYYY-MM
        const [ys, ms] = s.split('-').map(Number);
        const [ye, me] = e.split('-').map(Number);
        const start = new Date(ys, ms-1, 1);
        const end = new Date(ye, me-1, 1);
        if (start > end) { alert('Tháng bắt đầu phải nhỏ hơn hoặc bằng tháng kết thúc'); return; }
        const monthsDiff = (end.getFullYear() - start.getFullYear())*12 + (end.getMonth() - start.getMonth()) + 1;
        drawRevenueOverview(adminOrders, 'month', monthsDiff, start, end);
    } else if (currentRevenueGranularity === 'year') {
        const ys = parseInt(document.getElementById('rev-start-year')?.value,10);
        const ye = parseInt(document.getElementById('rev-end-year')?.value,10);
        if (!ys || !ye) { alert('Vui lòng nhập năm bắt đầu và kết thúc'); return; }
        if (ys > ye) { alert('Năm bắt đầu phải nhỏ hơn hoặc bằng năm kết thúc'); return; }
        const years = ye - ys + 1;
        const start = new Date(ys,0,1); const end = new Date(ye,11,31);
        drawRevenueOverview(adminOrders, 'year', years, start, end);
    }
}

// ---- Biểu đồ donut trạng thái đơn ----
function drawStatusChart(orders) {
    const ctx = document.getElementById('status-chart');
    if (!ctx) return;

    const statusConfig = {
        PENDING:   { label: 'Chờ xác nhận', color: '#f39c12' },
        CONFIRMED: { label: 'Đã xác nhận',  color: '#3498db' },
        SHIPPED:   { label: 'Đang giao',    color: '#9b59b6' },
        DELIVERED: { label: 'Đã giao',      color: '#4A7C2C' },
        CANCELLED: { label: 'Đã hủy',       color: '#e74c3c' }
    };

    const counts = {};
    Object.keys(statusConfig).forEach(k => counts[k] = 0);
    orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

    const data = Object.keys(statusConfig).map(k => counts[k]);
    const labels = Object.values(statusConfig).map(v => v.label);
    const colors = Object.values(statusConfig).map(v => v.color);

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{ data, backgroundColor: colors, borderWidth: 3, borderColor: '#fff' }]
        },
        options: {
            responsive: true,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.raw} đơn`
                    }
                }
            }
        }
    });

    // Legend tự vẽ
    const legend = document.getElementById('status-legend');
    if (legend) {
        legend.innerHTML = Object.entries(statusConfig).map(([k, v]) => `
            <div class="legend-item">
                <span class="legend-dot" style="background:${v.color}"></span>
                <span class="legend-label">${v.label}</span>
                <span class="legend-count">${counts[k]}</span>
            </div>
        `).join('');
    }
}

// ---- Biểu đồ top sản phẩm ----
function drawTopProductsChart(orders) {
    const ctx = document.getElementById('top-products-chart');
    if (!ctx) return;

    // Đếm sản phẩm từ items trong đơn hàng
    const productCount = {};
    orders.forEach(order => {
        if (!Array.isArray(order.items)) return;
        order.items.forEach(item => {
            const name = item.name || 'Sản phẩm';
            productCount[name] = (productCount[name] || 0) + (item.quantity || 1);
        });
    });

    // Nếu không có items, dùng số đơn hàng theo tên SP làm fallback
    const hasItems = Object.keys(productCount).length > 0;
    const finalData = hasItems ? productCount : {};

    const sorted = Object.entries(finalData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    if (sorted.length === 0) {
        ctx.parentElement.innerHTML += '<p style="color:#aaa;text-align:center;font-size:13px;padding:20px;">Chưa có đủ dữ liệu</p>';
        return;
    }

    const greenShades = ['#1a5c0a','#256e12','#2f7f1c','#4A7C2C','#5a9c38','#79bf53'];

    if (topProductsChart) topProductsChart.destroy();

    topProductsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(([name]) => name.length > 20 ? name.slice(0, 18) + '…' : name),
            datasets: [{
                label: 'Số lượng đặt',
                data: sorted.map(([, count]) => count),
                backgroundColor: greenShades.slice(0, sorted.length),
                borderRadius: 6,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { precision: 0 }
                },
                y: { grid: { display: false } }
            }
        }
    });
}

// ---- Đơn hàng gần đây ----
function renderRecentOrders(orders) {
    const container = document.getElementById('recent-orders-list');
    if (!container) return;

    const statusLabel = {
        PENDING: 'Chờ xử lý', CONFIRMED: 'Xác nhận',
        SHIPPED: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Hủy'
    };
    const statusClass = {
        PENDING: 'badge-warning', CONFIRMED: 'badge-success',
        SHIPPED: 'badge-warning', DELIVERED: 'badge-success', CANCELLED: 'badge-danger'
    };

    const recent = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = '<p style="color:#aaa;text-align:center;padding:20px;">Chưa có đơn hàng nào</p>';
        return;
    }

    container.innerHTML = recent.map(o => `
        <div class="recent-order-item" onclick="openOrderDetail(${o.id})">
            <div class="recent-order-left">
                <strong>#${o.id}</strong>
                <span>${o.customerName || 'Khách lạ'}</span>
            </div>
            <div class="recent-order-right">
                <span class="recent-order-amount">${(o.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                <span class="badge ${statusClass[o.status] || ''}">${statusLabel[o.status] || o.status}</span>
            </div>
        </div>
    `).join('');
}
function applyDayFilter() {
    const s = document.getElementById('rev-day-start')?.value;
    const e = document.getElementById('rev-day-end')?.value;
    if (!s || !e) return alert('Vui lòng chọn ngày bắt đầu và kết thúc');
    if (s > e) return alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
    drawRevenueOverview(adminOrders, 'day', null, new Date(s), new Date(e));
}

function applyMonthFilter(val) {
    if (!val) return;
    const [y, m] = val.split('-').map(Number);
    // Lưu lại mốc thời gian được chọn làm mốc kết thúc (endArg)
    const selectedMonthDate = new Date(y, m - 1, 1);

    // Gọi hàm và truyền tham số thứ 6 (isFiltered) là true để biểu đồ biết là đang bấm lọc
    drawRevenueOverview(adminOrders, 'month', null, null, selectedMonthDate, true);
}

function applyYearFilter() {
    const ys = parseInt(document.getElementById('rev-year-start')?.value);
    const ye = parseInt(document.getElementById('rev-year-end')?.value);
    if (!ys || !ye) return alert('Vui lòng nhập năm');
    if (ys > ye) return alert('Năm bắt đầu phải nhỏ hơn năm kết thúc');
    drawRevenueOverview(adminOrders, 'year', null, new Date(ys, 0, 1), new Date(ye, 11, 31));
}
// Hàm xử lý lọc đơn hàng gần đây
function filterRecentOrders(filterType) {
    if (!adminOrders) return;

    const now = new Date();
    const todayY = now.getFullYear();
    const todayM = now.getMonth();
    const todayD = now.getDate();

    let filtered = adminOrders;

    if (filterType === 'day') {
        // Lọc đơn hàng sinh ra trong ngày hôm nay
        filtered = adminOrders.filter(o => {
            const od = new Date(o.createdAt);
            return od.getFullYear() === todayY && od.getMonth() === todayM && od.getDate() === todayD;
        });
    } else if (filterType === 'month') {
        // Lọc đơn hàng sinh ra trong tháng này
        filtered = adminOrders.filter(o => {
            const od = new Date(o.createdAt);
            return od.getFullYear() === todayY && od.getMonth() === todayM;
        });
    }

    renderRecentOrders(filtered);
}