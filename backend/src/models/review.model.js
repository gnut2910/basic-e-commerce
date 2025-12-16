import { DataTypes, Model } from "sequelize";
import sequelize from "../config/dbConnection.js";
import { Product } from "./product.model.js";
import User from "./auth.model.js";
class Review extends Model {}

Review.init(
  {
    review_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false, field: "buyer_id" },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    timestamps: false,
  }
);

Review.belongsTo(Product, { foreignKey: "product_id" });

Review.belongsTo(User, { foreignKey: "buyer_id" });

export default Review;
