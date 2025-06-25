import React, { useEffect, useState } from "react";
import { Phone } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = "/api";

const allowedStatuses = [
  "pending",
  "called",
  "on-the-way",
  "visited",
  "not-ready",
  "farm-didnt-pick",
  "submitted",
];

const Home = () => {
  const [tickets, setTickets] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fieldUserId = "0664969d-a6ec-4d67-b02d-aceca6fe9008";

  const refreshAccessToken = async () => {
    if (isRefreshing) return false;
    setIsRefreshing(true);
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Token refresh failed");

      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return true;
    } catch (err) {
      console.error("Refresh failed:", err);
      localStorage.clear();
      window.location.href = "/";
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    const accessToken = localStorage.getItem("accessToken");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    };

    let response = await fetch(url, { ...options, headers });
    if (response.status === 401 && !isRefreshing) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = localStorage.getItem("accessToken");
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetchWithAuth(
          `${API_URL}/field-ticket/${fieldUserId}`
        );
        if (!res.ok) throw new Error("Failed to fetch tickets");
        const data = await res.json();
        setTickets(data);
      } catch (err) {
        console.error("Error loading tickets:", err);
      }
    };

    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/field-ticket`, {
        method: "PUT",
        body: JSON.stringify({ id: ticketId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId ? { ...t, status: updated.status } : t
        )
      );
    } catch (err) {
      alert("Status update failed.");
    }
  };

  const initiateCall = async (ticket) => {
    const payload = {
      fromId: ticket.field_guyId,
      toId: ticket.farmerId,
      cropId: ticket.cropId || null,
      cropName: ticket.cropName || "Tender Coconut",
      serviceNumber: "+918035737250",
    };

    try {
      const res = await fetchWithAuth(`${API_BASE}/calls/initiate`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Call failed");

      if (res.status === 201) {
        window.location.href = `tel:${payload.serviceNumber}`;
      } else {
        alert("Call initiated successfully");
      }
    } catch (err) {
      alert("Call initiation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-4">
      {tickets.length === 0 ? (
        <p className="text-center text-gray-500 text-sm">
          No open tickets found.
        </p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow border border-green-100 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            >
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-semibold text-green-800">
                  {ticket.farmername}
                </h2>
                <p className="text-green-700 font-medium text-sm">
                  {ticket.farmernumber.replace("+91", "")}
                </p>
                <p className="text-gray-700 text-sm">
                  Taluk: <b>{ticket.taluk}</b> | District:{" "}
                  <b>{ticket.district}</b>
                </p>
                <p className="text-sm text-gray-600">
                  Crop: <b>{ticket.cropName}</b>
                </p>
                <div className="flex gap-2 mt-2">
                  <select
                    className="bg-green-100 text-green-800 font-medium px-3 py-1 rounded-md border border-green-300 text-sm"
                    value={ticket.status || "pending"}
                    onChange={(e) =>
                      handleStatusChange(ticket._id, e.target.value)
                    }
                  >
                    {allowedStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button className="text-green-700 border border-green-300 px-3 py-1 rounded-md text-sm hover:bg-green-50">
                    Form
                  </button>
                </div>
              </div>
              <button
                onClick={() => initiateCall(ticket)}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full flex items-center justify-center shadow-md transition-all"
              >
                <Phone className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
