import API from "./api";

// GET all requests
export async function getRequests() {
  const res = await API.get("/requests");
  return res.data;
}
// Completed Requests
export const completeRequest = async (id, headers) => {
  const res = await API.put(`/requests/${id}/complete`, {}, { headers });
  return res.data;
};

// CREATE a new request
export async function createRequest(data, headers) {
  const res = await API.post("/requests", data, { headers });
  return res.data;
}

//  TOGGLE shortlist / unshortlist
export async function shortlistRequest(id, headers) {
  const res = await API.put(`/requests/${id}/shortlist`, {}, { headers });
  return res.data.request; //  return the updated request only
}

// DELETE a request (Admin only)
export async function deleteRequest(id, headers) {
  const res = await API.delete(`/requests/${id}`, { headers });
  return res.data;
}
