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
  const fieldUserId = "0664969d-a6ec-4d67-b02d-aceca6fe9008";
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to refresh access token
  const refreshAccessToken = async () => {
    if (isRefreshing) return false;
    setIsRefreshing(true);

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");

      const res = await fetch(`/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to refresh token");

      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      console.log("Access token refreshed successfully", data.data.accessToken);
      console.log(
        "Refresh token refreshed successfully",
        data.data.refreshToken
      );
      return true;
    } catch (err) {
      console.error("Token refresh failed:", err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("fieldUserId");
      window.location.href = "/";
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generic fetch with auth and retry on 401
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
        const newAccessToken = localStorage.getItem("accessToken");
        headers.Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  };

  // Fetch tickets
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchWithAuth(
          `${API_URL}/field-ticket/${fieldUserId}`
        );
        if (!res.ok) throw new Error("Failed to fetch tickets");
        const data = await res.json();
        setTickets(data);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      }
    };

    fetchData();
  }, [fieldUserId]);

  // Handle status change
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/field-ticket`, {
        method: "PUT",
        body: JSON.stringify({ id: ticketId, status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      const updatedTicket = await res.json();
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId
            ? { ...ticket, status: updatedTicket.status }
            : ticket
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  // Initiate call with redirect on 201
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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Call initiation failed");
      }

      const result = await res.json();
      console.log("Call initiated:", result);

      if (res.status === 201) {
        window.location.href = `tel:${payload.serviceNumber}`;
      } else {
        alert("Call initiated successfully!");
      }
    } catch (err) {
      console.error("Call error:", err);
      alert("Failed to initiate call.");
    }
  };

  return (
    <div className="p-4">
      {tickets.length === 0 ? (
        <p className="text-center text-gray-500">No open tickets found.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-md flex justify-between items-start"
            >
              <div>
                <h2 className="text-lg font-bold">{ticket.farmername}</h2>
                <p>{ticket.farmernumber.replace("+91", "")}</p>
                <p className="text-gray-700 text-sm">
                  Taluk: {ticket.taluk} District: {ticket.district}
                </p>
                <p className="text-gray-700 text-sm">Crop: {ticket.cropName}</p>
                <div className="mt-3 flex gap-2">
                  <select
                    value={ticket.status || "pending"}
                    onChange={(e) =>
                      handleStatusChange(ticket._id, e.target.value)
                    }
                    className="bg-blue-100 text-black px-3 py-1 rounded-md border border-blue-300"
                  >
                    {allowedStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button className="border border-gray-400 px-4 py-1 rounded-md text-black">
                    Form
                  </button>
                </div>
              </div>
              <div>
                <button
                  onClick={() => initiateCall(ticket)}
                  className="bg-green-500 p-3 rounded-md flex items-center justify-center"
                >
                  <Phone className="text-black w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
