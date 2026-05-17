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
                <button class="btn-secondary" onclick="updateOrderStatus(${order.id})">Cập nhật</button>
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

function loadAdminDashboard() {
    Promise.all([
        fetch('/api/products/all').then(r => r.json()),
        fetch('/api/orders').then(r => r.json())
    ])
    .then(([products, orders]) => {
        adminProducts = products;
        adminOrders = orders;

        document.getElementById('stat-products').textContent = products.length;
        document.getElementById('stat-orders').textContent = orders.length;

        const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        document.getElementById('stat-revenue').textContent = revenue.toLocaleString('vi-VN') + 'đ';

        const uniqueCustomers = new Set(orders.map(order => order.customerName || order.phone || order.email)).size;
        document.getElementById('stat-customers').textContent = uniqueCustomers;

        const confirmedCount = orders.filter(order => order.status === 'CONFIRMED' || order.status === 'DELIVERED').length;
        const conversion = orders.length ? Math.round((confirmedCount / orders.length) * 100) : 0;
        document.getElementById('stat-conversion').textContent = conversion + '%';

        const pendingCount = orders.filter(order => order.status === 'PENDING').length;
        document.getElementById('stat-pending-orders').textContent = pendingCount;
    })
    .catch(error => console.error('Error loading dashboard:', error));
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

function updateOrderStatus(orderId) {
    const status = prompt('Nhập trạng thái mới (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED):');
    if (!status) return;

    fetch(`/api/orders/${orderId}/status?status=${status.toUpperCase()}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Cập nhật trạng thái thành công!');
            loadAdminOrders('ALL');
            closeOrderDetail();
        } else {
            alert('Cập nhật trạng thái thất bại.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Lỗi khi cập nhật trạng thái.');
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
