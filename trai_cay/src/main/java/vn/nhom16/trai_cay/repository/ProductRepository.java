package vn.nhom16.trai_cay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.nhom16.trai_cay.entity.Category;
import vn.nhom16.trai_cay.entity.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(Category category);
    List<Product> findByCategoryName(String categoryName);
    List<Product> findByAvailableTrue();
    List<Product> findByAvailableTrueOrderByPriceAsc();
    List<Product> findByNameContainingIgnoreCase(String name);
}
