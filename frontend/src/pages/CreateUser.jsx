import React, { useState } from "react";
import api from "../services/Api";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";

const CreateUser = () => {
  const [role, setRole] = useState("LAWYER");
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    password: "",
    email: "",
    contactNumber: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = role === "LAWYER" ? "/registrar/create-lawyer" : "/registrar/create-judge";
      await api.post(endpoint, formData);
      setMessage(`${role} created successfully.`);
    } catch (err) {
      setMessage("Error creating user.");
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-3xl font-bold text-[#106EBE] mb-4">Create {role}</h2>
        <div className="flex space-x-4 mb-4">
          <Button onClick={() => setRole("LAWYER")}>Lawyer</Button>
          <Button onClick={() => setRole("JUDGE")}>Judge</Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
          <Input label="Username" name="userName" value={formData.userName} onChange={handleChange} />
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
          <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
          <Input label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
          <Button type="submit">Create {role}</Button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default CreateUser;
