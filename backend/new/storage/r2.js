/**
 * Cloudflare R2 (S3-compatible) object storage.
 * Credentials stay on the server — never sent to clients or logged.
 */
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

function readConfig() {
  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();
  const bucket = (process.env.R2_BUCKET_NAME || "").trim();
  const endpoint =
    (process.env.R2_ENDPOINT || "").trim() ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

  return { accountId, accessKeyId, secretAccessKey, bucket, endpoint };
}

function isConfigured() {
  const { accessKeyId, secretAccessKey, bucket, endpoint } = readConfig();
  return Boolean(accessKeyId && secretAccessKey && bucket && endpoint);
}

function getStatus() {
  return {
    ready: isConfigured(),
    provider: "r2",
  };
}

let cachedClient = null;
let cachedSignature = "";

function getClient() {
  const cfg = readConfig();
  if (!isConfigured()) {
    const err = new Error("File storage is not configured.");
    err.status = 503;
    throw err;
  }

  const signature = `${cfg.endpoint}|${cfg.bucket}|${cfg.accessKeyId}`;
  if (!cachedClient || cachedSignature !== signature) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: cfg.endpoint,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
    cachedSignature = signature;
  }

  return { client: cachedClient, bucket: cfg.bucket };
}

function publicError(status, message) {
  const err = new Error(message);
  err.status = status;
  err.statusCode = status;
  return err;
}

async function putObject({ key, body, contentType }) {
  const { client, bucket } = getClient();
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
  } catch (err) {
    console.error("R2 putObject failed:", err.name || "Error");
    throw publicError(502, "Upload failed. Please try again.");
  }
}

async function getObject(key) {
  const { client, bucket } = getClient();
  try {
    return await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === "NoSuchKey") {
      throw publicError(404, "File not found in storage.");
    }
    console.error("R2 getObject failed:", err.name || "Error");
    throw publicError(502, "Unable to open the file right now.");
  }
}

async function deleteObject(key) {
  if (!key || !isConfigured()) return;
  const { client, bucket } = getClient();
  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === "NoSuchKey") {
      return;
    }
    console.error("R2 deleteObject failed:", err.name || "Error");
    throw publicError(502, "Unable to remove the stored file.");
  }
}

module.exports = {
  isConfigured,
  getStatus,
  putObject,
  getObject,
  deleteObject,
};
