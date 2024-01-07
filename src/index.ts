import app from "./app.js";

const port = process.env.PORT || 3001;

const server = app.listen(port, () =>
  console.log(`Server is ready on port ${port}`)
);

server.close((err) => {
  console.log("Server is closed");
  process.exit(err ? 1 : 0);
});

export default server;
