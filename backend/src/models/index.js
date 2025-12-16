import User from "./auth.model.js";
import { Order } from "./order.model.js";
import OrderItem from "./order_item.model.js";
import { Product } from "./product.model.js";
import { StoreOrder } from "./store_order.model.js";

const models = { User, Order, OrderItem, Product, StoreOrder, OrderItem };

//Associate

models.Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
models.Order.belongsTo(models.User, { foreignKey: "buyer_id" });

models.OrderItem.belongsTo(models.Product, { foreignKey: "product_id" });
models.OrderItem.belongsTo(models.Order, { foreignKey: "order_id" });

models.Product.hasMany(models.OrderItem, { foreignKey: "product_id" });

models.User.hasMany(models.Order, { foreignKey: "buyer_id" });

// Association between StoreOrder and Order
models.StoreOrder.belongsTo(models.Order, { foreignKey: "order_id" });
models.Order.hasMany(models.StoreOrder, { foreignKey: "order_id" });
// Order 1 - n OrderItem
models.Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
models.OrderItem.belongsTo(models.Order, { foreignKey: "order_id" });

export default models;
