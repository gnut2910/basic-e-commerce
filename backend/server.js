import app from "./src/app.js";
import "dotenv/config";
import sequelize from "./src/config/dbConnection.js";
import startOrderCleanupJob from "./src/cron/checkExpiredOrders.js";

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  console.log(`Server is running on ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log("Connected database success");
    // Khởi động cron job tự động hủy đơn pending quá hạn
    startOrderCleanupJob();
  } catch (error) {
    console.log("Connected fail", error);
  }
});
