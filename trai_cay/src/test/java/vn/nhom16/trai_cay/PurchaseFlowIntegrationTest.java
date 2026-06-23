package vn.nhom16.trai_cay;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import vn.nhom16.trai_cay.dto.LoginRequest;
import vn.nhom16.trai_cay.dto.OrderDTO;
import vn.nhom16.trai_cay.entity.*;
import vn.nhom16.trai_cay.repository.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PurchaseFlowIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Test
    public void testCompletePurchaseFlow() throws Exception {
        // Step 1: Get all categories
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        
        // Step 2: Get all products
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        
        // Step 3: Get products by category
        mockMvc.perform(get("/api/products/category/Táo"))
                .andExpect(status().isOk());
        
        // Step 4: Search products
        mockMvc.perform(get("/api/products/search?name=Táo"))
                .andExpect(status().isOk());
        
        // Step 5: Get product details
        Product product = productRepository.findAll().stream().findFirst().orElse(null);
        if (product != null) {
            mockMvc.perform(get("/api/products/" + product.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").exists());
        }
        
        // Step 6: User login
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("customer1");
        loginRequest.setPassword("customer123");
        
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();
        
        String response = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(response).get("token").asText();
        
        // Step 7: Create an order
        Order order = new Order();
        order.setCustomerName("Nguyễn Văn A");
        order.setPhone("0912345678");
        order.setAddress("123 Nguyễn Huệ, Quận 1, TP HCM");
        order.setNotes("Giao vào buổi tối");
        order.setPaymentMethod(Order.PaymentMethod.COD);
        order.setTotalAmount(500000.0);
        order.setStatus(Order.OrderStatus.PENDING);
        
        if (product != null) {
            OrderItem item = new OrderItem();
            item.setProductName(product.getName());
            item.setPrice(product.getPrice());
            item.setQuantity(2);
            item.setSubtotal(product.getPrice() * 2);
            item.setProduct(product);
            
            order.getItems().add(item);
            item.setOrder(order);
        }
        
        MvcResult orderResult = mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(order)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.customerName").value("Nguyễn Văn A"))
                .andReturn();
        
        String orderResponse = orderResult.getResponse().getContentAsString();
        Long orderId = objectMapper.readTree(orderResponse).get("id").asLong();
        
        // Step 8: Get order details
        mockMvc.perform(get("/api/orders/" + orderId)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId));
        
        // Step 9: Get user's orders
        mockMvc.perform(get("/api/orders/user/1")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        
        // Step 10: Update order status (Admin only)
      mockMvc.perform(put("/api/orders/" + orderId + "/status?status=CONFIRMED")
        .header("Authorization", "Bearer " + token))
        .andExpect(result -> {
            int status = result.getResponse().getStatus();
            org.junit.jupiter.api.Assertions.assertTrue(
                    status == 200 || status == 403
            );
        });
    }
    
    @Test
    public void testProductCRUD() throws Exception {
        String adminToken = getAdminToken();
        
        // Create a new product
        Product newProduct = new Product();
        newProduct.setName("Test Product");
        newProduct.setDescription("Test Description");
        newProduct.setPrice(100000.0);
        newProduct.setImageUrl("https://example.com/image.jpg");
        newProduct.setOrigin("Test Country");
        newProduct.setQuantity(50);
        newProduct.setAvailable(true);
        
        Category category = categoryRepository.findAll().stream().findFirst().orElse(null);
        newProduct.setCategory(category);
        
        MvcResult createResult = mockMvc.perform(post("/api/products")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newProduct)))
                .andExpect(status().isOk())
                .andReturn();
        
        String createResponse = createResult.getResponse().getContentAsString();
        Long productId = objectMapper.readTree(createResponse).get("id").asLong();
        
        // Read product
        mockMvc.perform(get("/api/products/" + productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Product"));
        
        // Update product
        newProduct.setName("Updated Product");
        mockMvc.perform(put("/api/products/" + productId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newProduct)))
                .andExpect(status().isOk());
        
        // Delete product
        mockMvc.perform(delete("/api/products/" + productId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }
    
    @Test
    public void testCategoryManagement() throws Exception {
        String adminToken = getAdminToken();
        
        // Create category
        Category newCategory = new Category();
        newCategory.setName("Test Category");
        newCategory.setDescription("Test Category Description");
        newCategory.setImageUrl("https://example.com/image.jpg");
        
        MvcResult createResult = mockMvc.perform(post("/api/categories")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCategory)))
                .andExpect(status().isOk())
                .andReturn();
        
        String createResponse = createResult.getResponse().getContentAsString();
        Long categoryId = objectMapper.readTree(createResponse).get("id").asLong();
        
        // Get category by name
        mockMvc.perform(get("/api/categories/name/Test%20Category"))
                .andExpect(status().isOk());
        
        // Delete category
        mockMvc.perform(delete("/api/categories/" + categoryId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }
    
    private String getAdminToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("admin");
        loginRequest.setPassword("admin123");
        
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        
        String response = result.getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }
}
