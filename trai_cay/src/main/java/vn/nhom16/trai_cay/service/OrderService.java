package vn.nhom16.trai_cay.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.nhom16.trai_cay.entity.Order;
import vn.nhom16.trai_cay.entity.OrderItem;
import vn.nhom16.trai_cay.repository.OrderRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

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


        order.setCreatedAt(LocalDateTime.now());
        order.setPaymentMethod(
                Order.PaymentMethod.COD
        );

        order.setStatus(
                Order.OrderStatus.PROCESSING
        );
        double total = 0;

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {

                item.setSubtotal(
                        item.getPrice()
                                * item.getQuantity()
                );

                item.setOrder(order);

                total += item.getSubtotal();
            }
        }

        order.setTotalAmount(total);

        // đơn mới mặc định đang xử lý
        order.setStatus(
                Order.OrderStatus.PROCESSING
        );

        return orderRepository.save(order);
    }

    public Order updateOrderStatus(
            Long id,
            Order.OrderStatus status
    ) {

        Order order =
                orderRepository
                        .findById(id)
                        .orElse(null);

        if (order == null) {
            return null;
        }

        order.setStatus(status);

        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}