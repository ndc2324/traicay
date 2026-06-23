let adminProducts = [];
let adminOrders = [];
let adminCategories = [];
let currentUser = null;
let authToken = null;

const orderStatusLabel = {
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Hoàn thành',
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

                <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="PROCESSING" ${order.status === 'PROCESSING' ? 'selected' : ''}>Đang xử lý</option>
                    <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>Đang giao</option>
                    <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Hoàn thành</option>
                    <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Đã hủy</option>
                </select>
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
    fetch('/api/products/all')
        .then(response => response.json())
        .then(products => {
            adminProducts = products;
            renderProductTable(products);
        })
        .catch(error => console.error('Error loading products:', error));
}

function loadAdminOrders(status = 'ALL') {
    fetch('/api/orders')
        .then(response => response.json())
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
    fetch(`/api/orders/${orderId}`)
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
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
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

function updateOrderStatus(id, status) {

    fetch(
        `/api/orders/${id}/status`,
        {
            method: 'PUT',
            headers: {
                'Content-Type':
                    'application/json'
            },
            body: JSON.stringify({
                status: status
            })
        }
    )
    .then(response => {
        if (!response.ok) {
            throw new Error(
                'Cập nhật thất bại'
            );
        }

        loadAdminOrders('ALL');
    })
    .catch(error => {
        console.error(error);
        alert(
            'Không thể cập nhật trạng thái.'
        );
    });
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

// Gọi hàm này sau khi loadAdminDashboard() đã fetch xong data
// Override loadAdminDashboard để thêm vẽ biểu đồ
const _origLoadAdminDashboard = loadAdminDashboard;

function loadAdminDashboard() {
    Promise.all([
        fetch('/api/products/all').then(r => r.json()),
        fetch('/api/orders').then(r => r.json())
    ])
    .then(([products, orders]) => {
        adminProducts = Array.isArray(products) ? products : (products.data || products.content || []);
        adminOrders   = Array.isArray(orders)   ? orders   : (orders.data   || orders.content   || []);

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
            drawRevenueChart(adminOrders, currentRevenuePeriod);
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

// ---- Biểu đồ doanh thu theo tháng ----
function drawRevenueChart(orders, months = 6) {
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) return;

    const labels = [];
    const revenueData = [];
    const orderCountData = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
        labels.push(label);

        const monthOrders = orders.filter(o => {
            const od = new Date(o.createdAt);
            return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
        });

        const rev = monthOrders
            .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
            .reduce((s, o) => s + (o.totalAmount || 0), 0);

        revenueData.push(rev);
        orderCountData.push(monthOrders.length);
    }

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Doanh thu (đ)',
                    data: revenueData,
                    backgroundColor: 'rgba(74,124,44,0.75)',
                    borderColor: '#4A7C2C',
                    borderWidth: 2,
                    borderRadius: 8,
                    yAxisID: 'y'
                },
                {
                    label: 'Số đơn',
                    data: orderCountData,
                    type: 'line',
                    borderColor: '#e67e22',
                    backgroundColor: 'rgba(230,126,34,0.12)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#e67e22',
                    pointRadius: 5,
                    tension: 0.4,
                    yAxisID: 'y1',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            if (ctx.datasetIndex === 0)
                                return ' Doanh thu: ' + ctx.raw.toLocaleString('vi-VN') + 'đ';
                            return ' Số đơn: ' + ctx.raw;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        callback: v => (v / 1000000).toFixed(1) + 'tr'
                    },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    grid: { display: false },
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

function setRevenueChartPeriod(months, btn) {
    currentRevenuePeriod = months;
    document.querySelectorAll('.chart-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    drawRevenueChart(adminOrders, months);
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
