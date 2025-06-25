import React from "react";
import UserTicket from "./Hero";

const users = [
  {
    name: "Rahul Kumar",
    number: "12345 67890",
    taluka: "Vadodar",
    district: "Rajkot",
    crop: "Wheat",
  },
  {
    name: "Suman Patel",
    number: "23456 78901",
    taluka: "Vadodara",
    district: "Vadodara",
    crop: "Rice",
  },
  {
    name: "Vijay Singh",
    number: "34567 89012",
    taluka: "Surat",
    district: "Surat",
    crop: "Cotton",
  },
  {
    name: "Priya Desai",
    number: "45678 90123",
    taluka: "Ahmedabad",
    district: "Ahmedabad",
    crop: "Maize",
  },
];

const UserList = () => {
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {users.map((user, index) => (
        <UserTicket key={index} user={user} />
      ))}
    </div>
  );
};

export default UserList;
