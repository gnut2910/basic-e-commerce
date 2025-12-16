import { DataTypes, Model } from "sequelize";
import sequelize from "../config/dbConnection.js";

class Profile extends Model {}

Profile.init(
  {
    profile_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    birthday: { type: DataTypes.DATE, field: "date_of_birth" },
  },
  {
    sequelize,
    modelName: "Profile",
    tableName: "profiles",
    timestamps: false,
  }
);

export default Profile;
