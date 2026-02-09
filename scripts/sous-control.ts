import net from "net";

const app = process.argv[2];
const command = process.argv[3];

if (!app || !command) {
  console.error("Usage: sous-control <app> <command>");
  console.error("Commands: start, stop, restart, status");
  process.exit(1);
}

const SOCKET_PATH = `/tmp/sous-dev-${app}.sock`;

const client = net.createConnection({ path: SOCKET_PATH }, () => {
  client.write(command);
});

client.on("data", (data) => {
  console.log(data.toString());
  client.end();
});

client.on("error", (err) => {
  console.error(`Failed to connect to ${app} (${SOCKET_PATH}):`, err.message);
  process.exit(1);
});

client.on("end", () => {
  process.exit(0);
});
