import authRoutes from "./auth.route.js";
import profileRoutes from "./profile.route.js";
import categoryRoutes from "./category.route.js";

export default (app) => {
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/profiles", profileRoutes);
  app.use("/api/v1/categories", categoryRoutes);
};
