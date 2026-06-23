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
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.description || 'Không có mô tả'}</td>
            <td>${category.products?.length || 0}</td>
            <td>
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
    return fetch('/api/categories')
        .then(response => response.json())
        .then(categories => {
            adminCategories = categories;
            renderCategoryTable(categories);
            return categories;
        })
        .catch(error => {
            console.error('Error loading categories:', error);
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

function showAddCategoryForm() {
    const name = prompt('Tên danh mục:');
    if (!name) return;

    const description = prompt('Mô tả:');
    const category = {
        name,
        description: description || '',
        imageUrl: 'https://via.placeholder.com/300'
    };

    fetch('/api/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify(category)
    })
    .then(response => response.json())
    .then(() => {
        alert('Thêm danh mục thành công!');
        loadAdminCategories();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Lỗi khi thêm danh mục.');
    });
}

function editCategory(categoryId) {
    alert('Chức năng chỉnh sửa danh mục sẽ được thêm vào sau!');
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

        // Inject demo orders for visualization (only once)
        if (demoOrdersEnabled && !demoInjected) {
            const demos = generateDemoOrders();
            adminOrders = adminOrders.concat(demos);
            demoInjected = true;
        }

        // ---- Stat cards ----
        document.getElementById('stat-products').textContent = adminProducts.length;
        document.getElementById('stat-orders').textContent   = adminOrders.length;

        const revenue = adminOrders
            .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        document.getElementById('stat-revenue').textContent = revenue.toLocaleString('vi-VN') + 'đ';

        const uniqueCustomers = new Set(adminOrders.map(o => o.customerName || o.phone || o.email)).size;
        document.getElementById('stat-customers').textContent = uniqueCustomers;

        const confirmedCount = adminOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED').length;
        const conversion = adminOrders.length ? Math.round((confirmedCount / adminOrders.length) * 100) : 0;
        document.getElementById('stat-conversion').textContent = conversion + '%';

        const countByStatus = (status) => adminOrders.filter(o => o.status === status).length;
        document.getElementById('stat-pending-orders').textContent   = countByStatus('PENDING');
        if (document.getElementById('stat-shipped-orders'))
            document.getElementById('stat-shipped-orders').textContent = countByStatus('SHIPPED');
        if (document.getElementById('stat-cancelled-orders'))
            document.getElementById('stat-cancelled-orders').textContent = countByStatus('CANCELLED');

        // ---- Biểu đồ ----
        setTimeout(() => {
            // ensure granularity controls and defaults are rendered
            renderRevenueDateControls();
            setRevenueChartGranularity(currentRevenueGranularity, document.querySelector('.granularity-controls .chart-filter-btn.active'));
            drawStatusChart(adminOrders);
            drawTopProductsChart(adminOrders);
            renderRecentOrders(adminOrders);
        }, 100);
    })
    .catch(error => {
        console.error('Error loading dashboard:', error);
        document.getElementById('stat-products').textContent = adminProducts.length || 0;
    });
}

// ---- Biểu đồ doanh thu theo tháng (clean implementation) ----
function drawRevenueOverview(orders = [], granularity = 'month', period = 12) {
    const mainCtx = document.getElementById('revenue-chart');
    if (!mainCtx) return;

    const labels = [];
    const revenueData = [];
    // optional start/end as 4th/5th args
    const startArg = arguments[3] ? new Date(arguments[3]) : null;
    const endArg = arguments[4] ? new Date(arguments[4]) : null;

    // If user selected a month/year (we receive an endArg), render full 12 months for that year
    if (endArg) {
        const year = endArg.getFullYear();
        for (let m = 0; m < 12; m++) {
            labels.push(`T${m+1}`);
            const rev = orders
                .filter(o => {
                    const od = new Date(o.createdAt);
                    return od.getFullYear() === year && od.getMonth() === m;
                })
                .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
                .reduce((s, o) => s + (o.totalAmount || 0), 0);
            revenueData.push(rev);
        }
    } else {
        // fallback: last `period` months up to now (but our UI will use 12)
        const now = new Date();
        for (let i = period - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(`T${d.getMonth() + 1}`);
            const rev = orders
                .filter(o => {
                    const od = new Date(o.createdAt);
                    return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
                })
                .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
                .reduce((s, o) => s + (o.totalAmount || 0), 0);
            revenueData.push(rev);
        }
    }

    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(mainCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Doanh thu',
                data: revenueData,
                backgroundColor: '#1e4f1f',
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const idx = items[0].dataIndex + 1;
                            const year = endArg ? endArg.getFullYear().toString().slice(2) : (new Date()).getFullYear().toString().slice(2);
                            return `T${idx}/${year}`;
                        },
                        label: (ctx) => ` ${ctx.raw.toLocaleString('vi-VN')}đ`
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { maxRotation: 0 } },
                y: { min: 0, max: 6000000, ticks: { stepSize: 2000000, callback: v => (v/1000000) + 'M' }, grid: { color: 'rgba(0,0,0,0.04)' } }
            }
        }
    });

    // update KPI and change
    const total = revenueData.reduce((s, v) => s + v, 0);
    const kpiEl = document.getElementById('revenue-kpi');
    if (kpiEl) kpiEl.textContent = total.toLocaleString('vi-VN') + 'đ';
    const changeEl = document.getElementById('revenue-kpi-change');
    if (changeEl) {
        const last = revenueData[11] || 0;
        const prev = revenueData[10] || 0;
        const pct = prev ? Math.round(((last - prev) / prev) * 100) : 0;
        changeEl.textContent = `${pct >= 0 ? '+' + pct + '%' : pct + '%'} ${pct >= 0 ? '▲' : '▼'} (so với tháng trước)`;
    }
}

function setRevenueChartPeriod(period, btn) {
    currentRevenuePeriod = period;
    // period buttons removed in simplified UI; just redraw with provided period
    drawRevenueOverview(adminOrders, currentRevenueGranularity, currentRevenuePeriod);
}

function setRevenueChartGranularity(granularity, btn) {
    currentRevenueGranularity = granularity;
    // toggle granularity buttons
    document.querySelectorAll('.granularity-controls .chart-filter-btn').forEach(b=>b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // always render a single calendar picker; chart will show fixed 12 months ending at selected date
    renderRevenueDateControls();
    // default: show last 12 months ending now
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
    drawRevenueOverview(adminOrders, 'month', null, start, end);
}

function renderRevenueDateControls() {
    const container = document.getElementById('revenue-date-controls');
    if (!container) return;
    container.innerHTML = '';
    // single input: opens native calendar; on change, chart shows 12 months ending at chosen date
    if (currentRevenueGranularity === 'day') {
        const inp = document.createElement('input'); inp.type = 'date'; inp.id = 'rev-single-date'; inp.title = 'Chọn ngày';
        inp.onchange = () => {
            const v = inp.value; if (!v) return;
            const end = new Date(v);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            const start = new Date(endMonth.getFullYear(), endMonth.getMonth() - 11, 1);
            drawRevenueOverview(adminOrders, 'month', null, start, endMonth);
        };
        // default to today
        const today = new Date();
        inp.value = today.toISOString().slice(0,10);
        container.appendChild(inp);
    } else if (currentRevenueGranularity === 'month') {
        const inp = document.createElement('input'); inp.type = 'month'; inp.id = 'rev-single-month'; inp.title = 'Chọn tháng';
        inp.onchange = () => {
            const v = inp.value; if (!v) return;
            const [y,m] = v.split('-').map(Number);
            const endMonth = new Date(y, m-1, 1);
            const start = new Date(endMonth.getFullYear(), endMonth.getMonth() - 11, 1);
            drawRevenueOverview(adminOrders, 'month', null, start, endMonth);
        };
        // default to current month
        const now = new Date();
        const defaultVal = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
        inp.value = defaultVal;
        container.appendChild(inp);
    } else if (currentRevenueGranularity === 'year') {
        // use a month input to select a month within the year (native calendar fallback), then show 12 months ending that month
        const inp = document.createElement('input'); inp.type = 'month'; inp.id = 'rev-single-year-month'; inp.title = 'Chọn năm (mở lịch và chọn bất kỳ tháng trong năm)';
        inp.onchange = () => {
            const v = inp.value; if (!v) return;
            const [y,m] = v.split('-').map(Number);
            const endMonth = new Date(y, m-1, 1);
            const start = new Date(endMonth.getFullYear(), endMonth.getMonth() - 11, 1);
            drawRevenueOverview(adminOrders, 'month', null, start, endMonth);
        };
        container.appendChild(inp);
    }
}

// Generate some demo orders across months to visualize charts locally
function generateDemoOrders() {
    const demo = [];
    const now = new Date();
    const idsStart = 100;
    // create orders for past 6 months and a few other months
    for (let m = 0; m < 8; m++) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, Math.min(10 + m, 25));
        const order = {
            id: idsStart + m,
            customerName: 'Demo User ' + (m+1),
            createdAt: d.toISOString(),
            status: m % 3 === 0 ? 'CONFIRMED' : 'DELIVERED',
            totalAmount: 50000 + (m * 45000),
            items: [{ name: 'Táo', quantity: 1, price: 30000 }, { name: 'Cam', quantity: 2, price: 10000 }]
        };
        demo.push(order);
    }
    // some older months
    for (let m = 4; m < 12; m += 3) {
        const d = new Date(now.getFullYear(), now.getMonth() - m - 2, 15);
        demo.push({ id: idsStart + 50 + m, customerName: 'DemoUser', createdAt: d.toISOString(), status: 'DELIVERED', totalAmount: 120000 + (m*10000), items: [{name:'Xoài', quantity:2, price:60000}] });
    }
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
