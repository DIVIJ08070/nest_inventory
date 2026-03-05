export class CreateOrderDto {
  items: {
    product_id: number;
    quantity: number;
  }[];
}
