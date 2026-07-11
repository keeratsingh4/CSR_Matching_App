import API from "./api";

export async function getLatestNotification(headers) {
  const res = await API.get("/notifications/latest", { headers });
  return res.data;
}

export async function broadcastNotification(message, expiresAt, headers) {
  const res = await API.post(
    "/notifications/broadcast",
    { message, expiresAt },
    { headers }
  );
  return res.data;
}
