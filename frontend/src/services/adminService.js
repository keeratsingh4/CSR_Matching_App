import API from "./api";

export async function toggleUserSuspend(userId, headers) {
  const res = await API.put(`/admin/users/${userId}/suspend`, {}, { headers });
  return res.data;
}
