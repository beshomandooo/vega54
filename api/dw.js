
import fs from "fs/promises";
import path from "path";

function generateRandomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getUserId(ip) {
  return ip || 'UNKNOWN_IP';
}

function getCrcIndex(str, count) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % count;
}

export default async function handler(req, res) {
  const ip = req.headers["x-forwarded-for"] || "UNKNOWN_IP";
  const token = req.query.token || null;

  if (!token) {
    res.status(401).send("Unauthorized access. No token.");
    return;
  }

  const userId = getUserId(ip);
  const sessionFile = path.join("/tmp", `session-${userId}.json`);
  let finalLink = null;

  try {
    const cached = JSON.parse(await fs.readFile(sessionFile, "utf-8"));
    finalLink = cached.link;
  } catch {
    let links;
    try {
      links = await fs.readFile(path.join(__dirname, "links.txt"), "utf-8");
    } catch {
      res.status(500).send("No valid download links found.");
      return;
    }

    const linkList = links
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    if (linkList.length === 0) {
      res.status(500).send("No valid links.");
      return;
    }

    const index = getCrcIndex(userId, linkList.length);
    const baseLink = linkList[index];
    const randomString = generateRandomString(500);
    finalLink = baseLink.replace("ENCODED_VALUE_HERE", randomString);

    await fs.writeFile(sessionFile, JSON.stringify({ link: finalLink }));
  }

  if (!/^https?:\/\//i.test(finalLink)) {
    res.status(400).send("Invalid download URL.");
    return;
  }

  const filename = path.basename(finalLink);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Location", finalLink);
  res.status(302).end();
}
