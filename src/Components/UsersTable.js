import React from "react";

const UsersTable = ({
  usersData,
  search,
  setSearch,
  joinDateSearch,
  setJoinDateSearch,
}) => {
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
      user.phone.includes(search) &&
      (joinDateSearch
        ? formatDateOnly(user.created_at) === joinDateSearch
        : true)
  );

  return (
    <>
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

      {/* Enhanced record count */}
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
