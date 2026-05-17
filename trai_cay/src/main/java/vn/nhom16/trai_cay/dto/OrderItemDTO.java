package vn.nhom16.trai_cay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Long id;
    private String productName;
    private Double price;
    private Integer quantity;
    private Double subtotal;
    private Long productId;
}
