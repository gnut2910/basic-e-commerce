import { Model, DataTypes } from "sequelize";
import sequelize from "../config/dbConnection.js";

export class StoreOrderItem extends Model {}

StoreOrderItem.init(
  {
    store_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    order_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "StoreOrderItem",
    tableName: "store_order_items",
    timestamps: false,
  }
);