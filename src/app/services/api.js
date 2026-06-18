"use client";

// Helper for generic API requests
async function request(endpoint, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new Error(errorData?.error || `API Error: ${response.status}`);
  }

  return response.json();
}

export const CampaignService = {
  getCampaigns: () => request("/api/campaigns/get", { method: "POST", body: JSON.stringify({ mode: "ALL" }) }),
  getAllLeads: () => request("/api/campaigns/get", { method: "POST", body: JSON.stringify({ mode: "ALL_LEADS" }) }),
  getAllLogs: () => request("/api/campaigns/get", { method: "POST", body: JSON.stringify({ mode: "ALL_LOGS" }) }),
  getCampaignLeads: (id) => request("/api/campaigns/get", { method: "POST", body: JSON.stringify({ mode: "LEADS", id }) }),
  getCampaignLogs: (id) => request("/api/campaigns/get", { method: "POST", body: JSON.stringify({ mode: "LOGS", id }) }),
  
  createCampaign: (payload) => request("/api/campaigns/save", { method: "POST", body: JSON.stringify({ action: "ADD", payload }) }),
  deleteCampaign: (id) => request("/api/campaigns/save", { method: "POST", body: JSON.stringify({ action: "DELETE", id }) }),
  triggerCampaign: (id) => request("/api/campaigns/save", { method: "POST", body: JSON.stringify({ action: "TRIGGER", id }) }),
  stopCampaign: (id) => request("/api/campaigns/save", { method: "POST", body: JSON.stringify({ action: "STOP", id }) }),
  retryCampaign: (id) => request("/api/campaigns/save", { method: "POST", body: JSON.stringify({ action: "RETRY", id }) }),
};

export const AuthService = {
  login: (username, password) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  changePassword: (oldPassword, newPassword) => request("/api/auth/change-password", { method: "POST", body: JSON.stringify({ oldPassword, newPassword }) }),
};

export const HealthService = {
  check: () => fetch("/api/health").then(res => res.json()), // public unauthenticated endpoint
};
