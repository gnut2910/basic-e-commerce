import sequelize from "../config/dbConnection.js";
import { DataTypes, Model } from "sequelize";
import Profile from "./profile.model.js";

export class User extends Model {}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "user_id",
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "name",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "email",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password",
    },
    role: {
      type: DataTypes.ENUM("buyer", "seller", "admin"),
      allowNull: false,
      defaultValue: "buyer",
    },
    status: {
      type: DataTypes.ENUM("Active", "Banned"),
      defaultValue: "Active",
    },
    resetToken: {
      type: DataTypes.STRING,
      field: "reset_token",
    },
    resetTokenExpires: {
      type: DataTypes.DATE,

      field: "reset_token_expires",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

// Quan hệ 1-1 với Profile
User.hasOne(Profile, { foreignKey: "user_id" });
Profile.belongsTo(User, { foreignKey: "user_id" });

export default User;
