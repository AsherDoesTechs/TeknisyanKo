import "dotenv/config";
import app from "./app.js";
import { testDatabaseConnection } from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const databaseConnected = await testDatabaseConnection();

  if (!databaseConnected) {
    console.error("Server startup aborted: Database unavailable.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log("------------------------------------");
    console.log("       TEKNISYANKO API SERVER");
    console.log("------------------------------------");
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log("------------------------------------");
  });
};

startServer();
