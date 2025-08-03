import React, { useState } from "react";

const UsersTable = ({
  usersData,
  search,
  setSearch,
  joinDateSearch,
  setJoinDateSearch,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    language: "en",
  });
  const [error, setError] = useState("");

  const formatDateTimeToIST = (utcDateStr) => {
    const date = new Date(utcDateStr);
    if (isNaN(date.getTime())) return utcDateStr;

    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    return new Intl.DateTimeFormat("en-GB", options)
      .format(date)
      .replace(",", "");
  };

  const formatDateOnly = (utcDateStr) => {
    const date = new Date(utcDateStr);
    if (isNaN(date.getTime())) return utcDateStr;

    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(date); // returns YYYY-MM-DD
  };

  const filteredUsers = usersData.filter(
    (user) =>
      user.phone.toString().includes(search) &&
      (joinDateSearch
        ? formatDateOnly(user.created_at) === joinDateSearch
        : true)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async () => {
    const token = localStorage.getItem("access_token"); // Adjust for AsyncStorage in React Native
    const fullPhone = `91${formData.phone}`; // Prepend 91
    const payload = {
      id: parseInt(fullPhone), // Integer ID
      phone: parseInt(fullPhone), // Integer phone
      name: formData.name,
      lastlogin: new Date().toISOString().replace("Z", ""), // Current UTC time
      language: formData.language,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error((await response.json()).error || "Failed to add user");
      }

      setError("");
      setIsModalOpen(false);
      setFormData({ phone: "", name: "", language: "en" });
      alert("User added successfully!");
      // Optionally, trigger a refresh of usersData via parent component
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="controls-container">
        <div className="controls">
          <input
            type="text"
            placeholder="Search by phone number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <input
            type="date"
            value={joinDateSearch}
            onChange={(e) => setJoinDateSearch(e.target.value)}
            className="search-input"
            style={{ marginLeft: "10px" }}
          />
        </div>
        <button className="add-user-btn" onClick={() => setIsModalOpen(true)}>
          Add User
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New User</h2>
            {error && <p className="error">{error}</p>}
            <div className="phone-input-container">
              <span className="phone-prefix">+91</span>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number (e.g., 61996440)"
                value={formData.phone}
                onChange={handleInputChange}
                className="modal-input phone-input"
              />
            </div>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              className="modal-input"
            />
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="modal-input">
              <option value="en">English</option>
              <option value="ml">Malayalam</option>
              <option value="hi">Hindi</option>
            </select>
            <div className="modal-actions">
              <button onClick={handleAddUser}>Submit</button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="record-count">Total Users: {filteredUsers.length}</div>

      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>User ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Language</th>
            <th>Join Date (IST)</th>
            <th>Last Login (IST)</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.phone}</td>
              <td>{user.language}</td>
              <td>{formatDateTimeToIST(user.created_at)}</td>
              <td>{formatDateTimeToIST(user.lastlogin)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>
        {`
          .controls-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          .controls {
            display: flex;
            gap: 10px;
          }
          .search-input {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          .add-user-btn {
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
          }
          .add-user-btn:hover {
            background-color: #0056b3;
          }
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            width: 300px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .modal-content h2 {
            margin: 0 0 10px;
            font-size: 18px;
            color: #333;
          }
          .modal-input {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
          }
          .phone-input-container {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .phone-prefix {
            font-size: 14px;
            color: #333;
            padding: 8px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px 0 0 4px;
          }
          .phone-input {
            flex: 1;
            border-left: none;
            border-radius: 0 4px 4px 0;
          }
          .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
          }
          .modal-actions button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          .modal-actions button:first-child {
            background-color: #007bff;
            color: white;
          }
          .modal-actions button:first-child:hover {
            background-color: #0056b3;
          }
          .modal-actions button:last-child {
            background-color: #ccc;
            color: #333;
          }
          .modal-actions button:last-child:hover {
            background-color: #bbb;
          }
          .error {
            color: red;
            font-size: 14px;
            margin: 0;
          }
          .record-count {
            margin: 12px 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
            text-align: left;
          }
        `}
      </style>
    </>
  );
};

export default UsersTable;
