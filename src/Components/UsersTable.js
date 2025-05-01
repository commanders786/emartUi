import React from "react";

const UsersTable = ({
  usersData,
  search,
  setSearch,
  joinDateSearch,
  setJoinDateSearch,
}) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toISOString().split("T")[0];
  };

  const filteredUsers = usersData.filter(
    (user) =>
      user.phone.includes(search) &&
      (joinDateSearch ? formatDate(user.created_at) === joinDateSearch : true)
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
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Language</th>
            <th>Join Date</th>
            <th>Last Login</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.phone}</td>
              <td>{user.language}</td>
              <td>{formatDate(user.created_at)}</td>
              <td>{formatDate(user.lastlogin)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default UsersTable;
