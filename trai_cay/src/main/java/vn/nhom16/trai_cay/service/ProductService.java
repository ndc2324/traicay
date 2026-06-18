package vn.nhom16.trai_cay.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.nhom16.trai_cay.entity.Category;
import vn.nhom16.trai_cay.entity.Product;
import vn.nhom16.trai_cay.repository.CategoryRepository;
import vn.nhom16.trai_cay.repository.ProductRepository;

import java.util.List;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getAvailableProducts() {
        return productRepository.findByAvailableTrue();
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }
    
    public List<Product> getProductsByCategory(String categoryName) {
        Category category = categoryRepository.findByName(categoryName).orElse(null);
        if (category != null) {
            return productRepository.findByCategory(category);
        }
        return List.of();
    }
    
    public List<Product> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, Product product) {
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct != null) {
            existingProduct.setName(product.getName());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setImageUrl(product.getImageUrl());
            existingProduct.setOrigin(product.getOrigin());
            existingProduct.setQuantity(product.getQuantity());
            existingProduct.setAvailable(product.getAvailable());
            existingProduct.setCategory(product.getCategory());
            return productRepository.save(existingProduct);
        }
        return null;
    }
    
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
