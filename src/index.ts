import app from "./app.js";

const port = process.env.PORT || 3001;

const server = app.listen(port, () =>
  console.log(`Server is ready on port ${port}`)
);

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  console.log("Closing http server.");
  server.close((err) => {
    console.log("Http server closed.");
    process.exit(err ? 1 : 0);
  });
});

export default server;
