import { Model, DataTypes } from "sequelize";
import sequelize from "../config/dbConnection.js";
import User from "./auth.model.js";

export class Store extends Model {}

Store.init(
  {
    store_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("processing", "approved", "rejected"),
      defaultValue: "processing",
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
    modelName: "Store",
    tableName: "stores",
    timestamps: false,
    underscored: true,
  }
);

Store.belongsTo(User, { foreignKey: "seller_id" });
User.hasOne(Store, { foreignKey: "seller_id" });
