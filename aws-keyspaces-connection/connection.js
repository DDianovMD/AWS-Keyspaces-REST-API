import cassandra from "cassandra-driver";
import fs from "node:fs";
import path from 'node:path'; 
import "dotenv/config";

const auth = new cassandra.auth.PlainTextAuthProvider(
  process.env.NICKNAME,
  process.env.PASSWORD
);

const sslOptions1 = {
  ca: [
    fs.readFileSync(
      path.join(process.cwd(), 'aws-keyspaces-connection/certificates/sf-class2-root.crt'),
      "utf-8"
    ),
  ],
  host: "cassandra.us-east-1.amazonaws.com",
  rejectUnauthorized: true,
};

export const client = new cassandra.Client({
  contactPoints: ["cassandra.us-east-1.amazonaws.com"],
  localDataCenter: "us-east-1",
  authProvider: auth,
  sslOptions: sslOptions1,
  protocolOptions: { port: 9142 },
});
