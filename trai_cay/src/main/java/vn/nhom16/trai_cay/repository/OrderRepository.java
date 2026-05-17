package vn.nhom16.trai_cay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.nhom16.trai_cay.entity.Order;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser_Id(Long userId);
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByOrderByCreatedAtDesc();
}
