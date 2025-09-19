import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Insights = ({ search, setSearch }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found.");
          return;
        }

        const response = await fetch(
          `${baseUrl}/orders/insights/orderSummary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        setChartData({
          labels: data.categories || [],
          datasets: [
            {
              label: data.series[0]?.name || "Orders",
              data: data.series[0]?.data || [],
              backgroundColor: "rgba(26, 155, 0, 0.6)",
              borderColor: "rgba(26, 180, 12, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching order summary:", error.message);
      }
    };

    fetchOrderSummary();
  }, [baseUrl]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Order Summary by Date",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Orders",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <div className="p-4 w-full">
      <div className="flex flex-row gap-4">
        {/* Left Graph */}
        <div
          className="bg-white p-4 rounded-lg shadow-md flex-1"
          style={{ height: "300px" }}>
          <Bar data={chartData} options={options} />
        </div>

        {/* Right Graph */}
        <div
          className="bg-white p-4 rounded-lg shadow-md flex-1"
          style={{ height: "300px" }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Insights;
