import React, { useState } from "react";
import api from "../services/Api";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";

const DeleteUser = () => {
  const [role, setRole] = useState("LAWYER");
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    try {
      const endpoint = role === "LAWYER" ? `/registrar/delete-lawyer/${userName}` : `/registrar/delete-judge/${userName}`;
      await api.delete(endpoint);
      setMessage(`${role} deleted successfully.`);
    } catch (err) {
      setMessage("Error deleting user.");
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-3xl font-bold text-[#106EBE] mb-4">Delete {role}</h2>
        <div className="flex space-x-4 mb-4">
          <Button onClick={() => setRole("LAWYER")}>Lawyer</Button>
          <Button onClick={() => setRole("JUDGE")}>Judge</Button>
        </div>
        <Input
          label="Username"
          name="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <div className="mt-4">
          <Button onClick={handleDelete}>Delete {role}</Button>
        </div>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default DeleteUser;
