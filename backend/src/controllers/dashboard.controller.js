import * as dashBoardService from "../services/dashboard.service.js";

export const overview = async (req, res) => {
  try {
    const data = await dashBoardService.getDashboardMetrics();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
