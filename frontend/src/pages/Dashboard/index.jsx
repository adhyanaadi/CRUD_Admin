import React, { useContext, useState, useEffect } from 'react'
import { FaPerson } from "react-icons/fa6";
import { AiFillAccountBook, AiFillFileAdd, AiTwotoneMail } from "react-icons/ai";
import { CiMobile2 } from "react-icons/ci";
import { MdDateRange } from "react-icons/md";
import { IoFootsteps } from "react-icons/io5";
import { GoGoal } from "react-icons/go";
import { GiNightSleep } from "react-icons/gi";
import { FaFireAlt } from "react-icons/fa";
import { useHandleView } from '../../util/navigationUtil';
// import.meta.env.VITE_REACT_PORT;
// import.meta.env.VITE_CLIENT_URL;
import { CLIENT_URL, REACT_PORT, SERVER_URL } from '../../config';


const Dashboard = () => {
  const handleView = useHandleView();
  const [formData, setformData] = useState([{
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    dailyStepGoal: '',
  }]);

  const [allCustomers, setAllCustomers] = useState([]); // Array to store all submitted customer data
  const [editMode, setEditMode] = useState(false); // Toggle between edit and create mode
  const [editCustomerEmail, setEditCustomerEmail] = useState(''); // To store the email of the customer being edited
  
  const fetchAllCustomers = async()=>{
    try {
      const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/allCustomers` || `${SERVER_URL}/api/allCustomers`);
      if (response.ok) {
        const data = await response.json();
        setAllCustomers(data);
      } else {
        console.error('Failed to fetch customer data');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  }

  useEffect(() => {
    fetchAllCustomers();
  }, []);

  const fetchCustomerData = async (email) => {
    try {
      const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/customerGet/${email}` || `${SERVER_URL}/api/customerGet/${email}`);
      if (response.ok) {
        const data = await response.json();
        // Append the fetched data to the allCustomers array
        setAllCustomers(prevCustomers => [...prevCustomers, data]);
      } else {
        console.error('Failed to fetch customer data');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const handleDelete = async (index) => {
    const customerToDelete = allCustomers[index]; // Find the customer by index
    try {
      // Make a DELETE request to your Express  
      const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/customerDelete/${customerToDelete.email}` || `${SERVER_URL}/api/customerDelete/${customerToDelete.email}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        // If the deletion is successful, filter out the customer locally
        let newallCustomers = allCustomers.filter((_, i) => i !== index);
        setAllCustomers(newallCustomers); // Update state with remaining customers
      } else {
        console.error('Error deleting customer from the server');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const handleEdit = (index) => {
    const customer = allCustomers[index]; // Get the customer to edit
    setformData(customer); // Populate the form with the customer's data
    setEditMode(true); // Enable edit mode
    setEditCustomerEmail(customer.email); // Store the email for editing
  };

  const handleChange = (e) => {
    setformData({
      ...formData, 
      [e.target.name]:e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      // If in edit mode, send a PUT request
      try {
        const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/customerEdit/${editCustomerEmail}` || `${SERVER_URL}/api/customerEdit/${editCustomerEmail}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // Update the customer in the allCustomers list locally
          setAllCustomers(allCustomers.map(customer =>
            customer.email === editCustomerEmail ? formData : customer
          ));
          setEditMode(false); // Disable edit mode after updating
          setEditCustomerEmail(''); // Reset the email
          alert('Customer data updated successfully');
          // Reset the form
          setformData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dob: '',
            dailyStepGoal: '',
          });
        } else {
          alert('Error updating customer data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      // If not in edit mode, proceed with creating a new customer (POST request)
      try {
        const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/customer` || `${SERVER_URL}/api/customer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          fetchCustomerData(formData.email);
          alert('Customer data submitted successfully');
          setformData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dob: '',
            dailyStepGoal: '',
          });
        } else {
          alert('Error submitting customer data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };


  return (
    <>
      <div className='right-content w-100'>
        <div className='dashboardBoxWrapper flex'>

          <div className='dashboardBox flex flex-row justify-between items-center p-4'>
  <form className='flex flex-row w-full' onSubmit={handleSubmit}>
    {/* Left Side Inputs */}
    <div className='d1 flex flex-col w-[40%] p-4'>
      <div className='flex flex-row items-center'>
        <div className='flex flex-col w-[35%] space-y-5'>
          <h2 className='text-xl font-semibold mb-2 text-white'>First Name</h2>
          <h2 className='text-xl font-semibold mb-2 text-white'>Last Name</h2>
          <h2 className='text-xl font-semibold mb-2 text-white'>Email</h2>
        </div>
        <div className='flex flex-col w-[65%] space-y-4'>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder='Eg. Aditya' className='border border-gray-300 p-2 rounded-md' />
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder='Eg. Adhyan' className='border border-gray-300 p-2 rounded-md' />
          <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder='Eg. something@gmail.com' className='border border-gray-300 p-2 rounded-md' />
        </div>
      </div>
    </div>

    {/* Right Side Inputs */}
    <div className='d1 flex flex-col w-[40%] p-4'>
      <div className='flex flex-row items-center'>
        <div className='flex flex-col w-[35%] space-y-5'>
          <h2 className='text-xl font-semibold mb-2 text-white'>Phone</h2>
          <h2 className='text-xl font-semibold mb-2 text-white'>Date of Birth</h2>
          <h2 className='text-xl font-semibold mb-2 text-white'>Daily Goal</h2>
        </div>
        <div className='flex flex-col w-[65%] space-y-4'>
          <input type="text" name='phone' value={formData.phone} onChange={handleChange} placeholder='Eg. 8203091522' className='border border-gray-300 p-2 rounded-md' />
          <input type="date" name='dob' value={formData.dob} onChange={handleChange} placeholder='Eg. 27.09.2002' className='border border-gray-300 p-2 rounded-md' />
          <input type="text" name='dailyStepGoal' value={formData.dailyStepGoal} onChange={handleChange} placeholder='Eg. 4000 steps' className='border border-gray-300 p-2 rounded-md' />
        </div>
      </div>
    </div>

    {/* Submit Button */}
    <div className='submit w-[20%] flex justify-center items-center'>
      {/* <button onClick={handleSubmit} type="submit" className='bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-8 rounded-lg'>
        SUBMIT
      </button> */}
      <button type="submit" className='bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg'>
                  {editMode ? 'UPDATE' : 'SUBMIT'}
                </button>
    </div>
  </form>
</div>

        
        </div>


          {/* Display Submitted Data */}
          <div className='dashboardHealth flex flex-col text-white'>
            {allCustomers.map((customer, index) => (
              <div key={index} className='dashboarditem flex flex-row font-semibold mb-4'>
                <div className='ItemDetails1 flex flex-col justify-center w-[40%]'>
                  <h2 className='flex'><FaPerson className='mr-4 ml-4'/>{customer.firstName} {customer.lastName}</h2>
                  <h2 className='flex'><AiTwotoneMail className='mr-4 ml-4'/>{customer.email}</h2>
                  <h2 className='flex'><CiMobile2 className='mr-4 ml-4'/>{customer.phone}</h2>
                  <h2 className='flex'><MdDateRange className='mr-4 ml-4'/>{customer.dob}</h2>
                </div>
                <div className='ItemDetails2 flex flex-col justify-center w-[40%]'>
                  <h2 className='flex'><GoGoal className='mr-4 ml-4'/>Daily Step Goal - {customer.dailyStepGoal} steps</h2>
                  <h2 className='flex'><IoFootsteps className='mr-4 ml-4'/>Average steps - {customer.avgSteps} steps</h2>
                  <h2 className='flex'><GiNightSleep className='mr-4 ml-4'/>Average Sleep - {customer.avgSleep} hours</h2>
                  <h2 className='flex'><FaFireAlt className='mr-4 ml-4'/>Average Calories - {customer.avgCalories} cal</h2>
                </div>
                <div className='ItemButtons flex flex-col justify-center items-center space-y-1.5 w-[20%]'>
                  <button onClick={() => handleEdit(index)} className='bg-gray-700 hover:bg-gray-800 text-white text-lg font-bold py-1.5 px-2 rounded-lg w-[50%]'>Edit</button>
                  <button onClick={() => handleDelete(index)} className='bg-gray-700 hover:bg-gray-800 text-white text-lg font-bold py-1.5 px-2 rounded-lg w-[50%]'>Delete</button>
                  <button onClick={() => handleView(customer.email)} className='bg-gray-700 hover:bg-gray-800 text-white text-lg font-bold py-1.5 px-2 rounded-lg w-[50%]'>View</button>
                </div>
              </div>
            ))}
        </div>

      </div>

    </>
  )
}

export default Dashboard;
