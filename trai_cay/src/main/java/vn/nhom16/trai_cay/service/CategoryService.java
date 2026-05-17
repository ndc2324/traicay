package vn.nhom16.trai_cay.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.nhom16.trai_cay.entity.Category;
import vn.nhom16.trai_cay.repository.CategoryRepository;

import java.util.List;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }
    
    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name).orElse(null);
    }
    
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(Long id, Category category) {
        Category existingCategory = categoryRepository.findById(id).orElse(null);
        if (existingCategory != null) {
            existingCategory.setName(category.getName());
            existingCategory.setDescription(category.getDescription());
            existingCategory.setImageUrl(category.getImageUrl());
            return categoryRepository.save(existingCategory);
        }
        return null;
    }
    
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
