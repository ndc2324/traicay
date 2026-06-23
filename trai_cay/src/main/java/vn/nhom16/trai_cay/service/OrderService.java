package vn.nhom16.trai_cay.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.nhom16.trai_cay.entity.Order;
import vn.nhom16.trai_cay.entity.OrderItem;
import vn.nhom16.trai_cay.entity.Product;
import vn.nhom16.trai_cay.entity.User;
import vn.nhom16.trai_cay.repository.OrderRepository;
import vn.nhom16.trai_cay.repository.ProductRepository;
import vn.nhom16.trai_cay.repository.UserRepository;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findByOrderByCreatedAtDesc();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUser_Id(userId);
    }

    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public Order createOrder(Order order) {
        order.setCreatedAt(java.time.LocalDateTime.now());

        if (order.getStatus() == null) {
            order.setStatus(Order.OrderStatus.PENDING);
        }

        if (order.getUser() != null && order.getUser().getId() != null) {
            User user = userRepository.findById(order.getUser().getId()).orElse(null);
            order.setUser(user);
        }

        // Calculate total amount and resolve item relationships
        double total = 0;
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null && item.getProduct().getId() != null) {
                    Product product = productRepository.findById(item.getProduct().getId()).orElse(null);
                    if (product != null) {
                        item.setProduct(product);
                        if (item.getProductName() == null || item.getProductName().isBlank()) {
                            item.setProductName(product.getName());
                        }
                    }
                }
                if (item.getProductName() == null || item.getProductName().isBlank()) {
                    throw new IllegalArgumentException("Order item must contain a product name.");
                }
                item.setSubtotal(item.getPrice() * item.getQuantity());
                item.setOrder(order);
                total += item.getSubtotal();
            }
        }
        if (order.getTotalAmount() == null || order.getTotalAmount() < 0) {
            order.setTotalAmount(total);
        } else {
            order.setTotalAmount(Math.max(0, order.getTotalAmount()));
        }

        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
