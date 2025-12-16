import { Model, DataTypes } from "sequelize";
import sequelize from "../config/dbConnection.js";

export class Order extends Model {}

Order.init(
  {
    order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipping",
        "completed",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "zalopay"),
      defaultValue: "cash",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: false,
    underscored: true,
  }
);
export default Order;
