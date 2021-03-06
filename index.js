import { setupServer } from "./src/server/server.js";

const PORT = process.env.PORT || 3001;
const app = setupServer();
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
