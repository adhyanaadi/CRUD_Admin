import React, {useEffect, useState} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'; 
import { FaPerson } from "react-icons/fa6";
import { AiTwotoneMail } from "react-icons/ai";
import { CiMobile2 } from "react-icons/ci";
import { MdDateRange } from "react-icons/md";
import { IoFootsteps } from "react-icons/io5";
import { GoGoal } from "react-icons/go";
import { GiNightSleep } from "react-icons/gi";
import { FaFireAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";  
import { Bar } from "react-chartjs-2";
import { CLIENT_URL, REACT_PORT, SERVER_URL } from '../../config';

import {
  Chart as chartjs,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";



const CustomerHealth = () => {

  const [chartType, setChartType] = useState('steps'); // 'steps', 'sleep', or 'calories'

  // Prepare the chart data based on the selected chart type
  const getChartData = () => {
    const labels = allRecords.map(record => record.date); // Assuming 'record.date' is a formatted date
    const data = allRecords.map(record => {
      switch (chartType) {
        case 'steps':
          return record.healthData[0]?.step || 0;
        case 'sleep':
          return record.healthData[0]?.sleep || 0;
        case 'calories':
          return record.healthData[0]?.calories || 0;
        default:
          return 0;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: `Datewise ${chartType}`,
          data,
          backgroundColor: 'rgba(20, 83, 101, 0.9)',
          borderWidth: 3,
          
        },
      ],
    };
  };

  const options = {};

chartjs.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

  useEffect(()=>{
    fetchAllRecords();
  }, []);
  
  const handleBack=() =>{
    navigate('/dashboard')
  }

  const handleChange = (e) => {
    setformData({
      ...formData,
      [e.target.name]: e.target.value, // Ensure `name` is provided in the input fields
    });
  };

  const handleDelete = async (index) => {
    const customerRecordToDelete = allRecords[index]; // Find the customer by index
    try {
      // Make a DELETE request to your Express  
      const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/customerHealth/${customerRecordToDelete.date}` || `${SERVER_URL}/api/customerHealth/${customerRecordToDelete.date}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        // If the deletion is successful, filter out the customer locally
        let newallRecords = allRecords.filter((_, i) => i !== index);
        setallRecords(newallRecords); // Update state with remaining customers
        fetchCustomerData();
      } else {
        console.error('Error deleting customer health data from the server');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (index) => {
    const customerHealth = allRecords[index]; // Get the customer to edit
    const formattedDate = new Date(customerHealth.date).toISOString().split('T')[0]; // Format to "YYYY-MM-DD"
  
    setformData({
      date: formattedDate, // Use the correct date from customerHealth, not healthData[0]
      step: customerHealth.healthData[0].step,
      sleep: customerHealth.healthData[0].sleep,
      calories: customerHealth.healthData[0].calories
    });
  
    setEditMode(true); // Enable edit mode
    setEdithealthDate(customerHealth.date); // Store the original date for updating
  };
  

  const location = useLocation();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const {email} = location.state || {};
  // console.log(email);

  const [customerData, setCustomerData] = useState(null); //for storing customer data
  const [loading, setLoading] = useState(true); // State to manage loading
  const [formData, setformData] = useState({
    date: '', 
    step: '', 
    sleep: '', 
    calories: '', 
  });
  const [allRecords, setallRecords] = useState([]);
  const [editHealthDate, setEdithealthDate]=useState('');

  const fetchAllRecords = async()=> {
    try {
      const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/customerHealth/${email}` || `${SERVER_URL}/api/customerHealth/${email}`);
      if (response.ok) {
        const data = await response.json();
        setallRecords(data);
      } else {
        console.error('Failed to fetch customer health records');
      }
    } catch (error) {
      console.error('Error fetching customer health records:', error);
    }
  }


  // Define the fetchCustomerData function outside useEffect
const fetchCustomerData = async (email, setLoading, setCustomerData) => {
  try {
    const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/customerGet/${email}` || `${SERVER_URL}/api/customerGet/${email}`);
    if (!response.ok) {
      throw new Error('Customer not found');
    }
    const data = await response.json();
    console.log(data);
    setCustomerData(data);
  } catch (error) {
    console.error('Error fetching customer details', error);
  } finally {
    setLoading(false); // Set loading to false when done
  }
};

// Inside the component
useEffect(() => {
  if (email) {
    setLoading(true); // Set loading to true when starting
    fetchCustomerData(email, setLoading, setCustomerData); // Use the extracted function
  }
}, [email]);


  if (loading) {
    return <div>Loading customer data...</div>;
  }

  if (!customerData) {
    return <div>No customer data available.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dailyGoal = customerData?.dailyStepGoal;
    const enteredSteps = parseInt(formData.step, 10);
  
    // Send email if the entered steps meet or exceed the daily goal
    if (enteredSteps >= dailyGoal) {
      try {
        const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/send-email` || `${SERVER_URL}/api/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: customerData.email,
            goal: customerData.dailyStepGoal,
            steps: formData.step,
            sleep: formData.sleep,
            calories: formData.calories,
          }),
        });
  
        if (response.ok) {
          console.log('Congratulations email sent');
        } else {
          console.error('Failed to send email');
        }
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  

    if (editMode) {
      // Update existing health data
      try {
        const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/customerHealth/${editHealthDate}` || `${SERVER_URL}/api/customerHealth/${editHealthDate}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          alert('Customer health data updated successfully');
          // Update local state with the updated record
          setallRecords(prevRecords =>
            prevRecords.map(record =>
              record.date === editHealthDate
                ? { ...record, healthData: [{ step: formData.step, sleep: formData.sleep, calories: formData.calories }] }
                : record
            )
          );
          
          // Call fetchCustomerData to update customer data
          fetchCustomerData();
  
          // Reset form and edit mode
          setEditMode(false);
          setEdithealthDate('');
          setformData({
            date: '',
            step: '',
            sleep: '',
            calories: '',
          });
        } else {
          alert('Error updating customer health data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      // Create new health data
      try {
        const response = await fetch(`${CLIENT_URL}:${REACT_PORT}/api/customerHealth/${email}` || `${SERVER_URL}/api/customerHealth/${email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          alert('Customer health data submitted successfully');
          const newRecord = {
            date: formData.date,
            healthData: [{ step: formData.step, sleep: formData.sleep, calories: formData.calories }]
          };
          setallRecords(prevRecords => [...prevRecords, newRecord]);
  
          // Call fetchCustomerData to update customer data
          fetchCustomerData();
  
          // Reset form data
          setformData({
            date: '',
            step: '',
            sleep: '',
            calories: '',
          });
        } else {
          alert('Error submitting customer health data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  

  return (
    <>
      <div className='right-content w-100'>

        <div className='topitems flex flex-row'>
        <div className='CustomerdashboardHealth flex flex-col text-white w-[40%] mr-4'>
        {/* {allCustomers.map((customer, index) => ( */}
          <div className='Customerdashboarditem flex'>
            <div className='ItemDetails1 flex flex-col justify-center w-[100%] space-y-2.5 font-semibold'>
            <h2 className='flex'><FaPerson className='mr-4 ml-4'/>{customerData.firstName} {customerData.lastName}</h2>
            <h2 className='flex'><AiTwotoneMail className='mr-4 ml-4'/>{customerData.email}</h2>
            <h2 className='flex'><CiMobile2 className='mr-4 ml-4'/>{customerData.phone}</h2>
            <h2 className='flex'><MdDateRange className='mr-4 ml-4'/>{new Date(customerData.dob).toLocaleDateString()}</h2>
            <h2 className='flex'><GoGoal className='mr-4 ml-4'/>Daily Step Goal - {customerData.dailyStepGoal}</h2>
            <h2 className='flex'><IoFootsteps className='mr-4 ml-4'/>Average Steps - {customerData.avgSteps}</h2>
            <h2 className='flex'><GiNightSleep className='mr-4 ml-4'/>Average Sleep - {customerData.avgSleep} hours</h2>
            <h2 className='flex'><FaFireAlt className='mr-4 ml-4'/>Average Calories - {customerData.avgCalories} cal</h2>
                <div className="flex justify-center">
                    <button onClick={()=>handleBack() } className='flex justify-center items-center bg-gray-700 hover:bg-gray-800 text-white text-lg font-bold py-1.5 px-2 rounded-lg w-[40%]'><IoMdArrowRoundBack />Back</button>
                </div>
            </div>

          </div>
        {/* ))} */}
        </div>

        <div className="timeseries flex text-white w-[60%] h-[500px] bg-yellow-400 hover:bg-yellow-450">
          <div className="Customerdashboarditem flex w-full h-full">
            <div className="w-full h-full flex flex-col items-center justify-between">
              
              {/* Chart Type Selector */}
              <div className="chart-selector flex w-full justify-around items-center h-[20%]">
                <button onClick={() => setChartType('steps')} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-md h-[50%] w-[25%] flex justify-center items-center">Steps</button>
                <button onClick={() => setChartType('sleep')} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-md h-[50%] w-[25%] flex justify-center items-center">Sleep</button>
                <button onClick={() => setChartType('calories')} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-md h-[50%] w-[25%] flex justify-center items-center">Calories</button>
              </div>

              {/* Render the Bar Chart */}
              <div className="w-full h-[80%] flex items-center justify-center text-white">
                <Bar className="w-full h-full text-white" options={options} data={getChartData()} />
              </div>
            </div>
          </div>
        </div>

        </div>

        

        <div className='CustomerdashboardBoxWrapper flex flex-col'>
  <form className='CustomerdashboardBox flex flex-row w-full p-4' onSubmit={handleSubmit}>
    
    {/* Date Input */}
    <div className='d1 flex flex-col w-[20%] justify-center p-4'>
      <div className='flex flex-row w-full'>
        <div className='w-[5%]'>
          <h2 className='text-xl font-semibold mb-2 p-1 text-white'></h2>
        </div>
        <div className='flex flex-col w-[95%] space-y-2'>
          <input name='date' type="date" value={formData.date} onChange={handleChange} placeholder='22.09.2024' className='border border-gray-300 p-2 rounded-md w-40' />
        </div>
      </div>
    </div>

    {/* Steps Input */}
    <div className='d1 flex flex-col w-[20%] justify-center p-4'>
      <div className='flex flex-row w-full'>
        <div className='w-[35%]'>
          <h2 className='text-xl font-semibold mb-2 p-1 text-white'>Steps</h2>
        </div>
        <div className='flex flex-col w-[65%] space-y-2'>
          <input name='step' type="text" value={formData.step} onChange={handleChange} placeholder='Eg. 3722' className='border border-gray-300 p-2 rounded-md' />
        </div>
      </div>
    </div>

    {/* Sleep Input */}
    <div className='d1 flex flex-col w-[20%] justify-center p-4'>
      <div className='flex flex-row w-full'>
        <div className='w-[35%]'>
          <h2 className='text-xl font-semibold mb-2 p-1 text-white'>Sleep</h2>
        </div>
        <div className='flex flex-col w-[65%] space-y-2'>
          <input name='sleep' type="text" value={formData.sleep} onChange={handleChange} placeholder='Eg. 7 hours' className='border border-gray-300 p-2 rounded-md' />
        </div>
      </div>
    </div>

    {/* Calories Input */}
    <div className='d1 flex flex-col w-[20%] justify-center p-4'>
      <div className='flex flex-row w-full'>
        <div className='w-[35%]'>
          <h2 className='text-xl font-semibold mb-2 p-1 text-white'>Calories</h2>
        </div>
        <div className='flex flex-col w-[65%] space-y-2 mx-4'>
          <input name='calories' type="text" value={formData.calories} onChange={handleChange} placeholder='Eg. 3722' className='border border-gray-300 p-2 rounded-md' />
        </div>
      </div>
    </div>

    {/* Submit Button */}
    <div className='submit w-[20%] flex items-center justify-center'>
      <button className='bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg'>
      {editMode ? 'Update' : 'Submit'}
      </button>
    </div>

  </form>
</div>


        <div className='customerData flex flex-col m-3 text-white'>
            <div className='customerDataHeading flex flex-row items-center justify-center rounded-t-xl p-2 font-bold text-lg'>
                <div className='t1 flex w-[20%] justify-center'>Date</div>
                <div className='t2 flex w-[20%] justify-center'>Steps</div>
                <div className='t3 flex w-[20%] justify-center'>Sleep</div>
                <div className='t4 flex w-[20%] justify-center'>Calories</div>
                <div className='t4 flex w-[20%] justify-center'></div>
            </div>
            {allRecords.map((record, index) => (
      <div key={index} className='customerDataEntry1 flex flex-row border-slate-700 border-b-2 h-9 bg-my-red'>
        <div className='e1 flex w-[20%] justify-center items-center font-medium'>
          {record.date} {/* Format the date */}
        </div>
        <div className='e2 flex w-[20%] justify-center items-center font-medium'>
          {record.healthData[0]?.step || 'N/A'} {/* Display steps */}
        </div>
        <div className='e3 flex w-[20%] justify-center items-center font-medium'>
          {record.healthData[0]?.sleep || 'N/A'} {/* Display sleep */}
        </div>
        <div className='e4 flex w-[20%] justify-center items-center font-medium'>
          {record.healthData[0]?.calories || 'N/A'} {/* Display calories */}
        </div>
        <div className='e5 flex w-[20%] flex-row justify-center items-center space-x-6'>
          <div>
            <button onClick={()=>{handleEdit(index)}} className='flex justify-center items-center bg-gray-700 hover:bg-gray-800 text-white text-lg font-semibold rounded-sm h-6 w-11'>
              <MdEdit /> {/* Edit button */}
            </button>
          </div>
          <div>
            <button onClick={()=>{handleDelete(index)}} className='flex justify-center items-center bg-gray-700 hover:bg-gray-800 text-white text-lg font-semibold rounded-sm h-6 w-10'>
              <MdDelete /> {/* Delete button */}
            </button>
          </div>
        </div>
      </div>
    ))}
        </div>
      </div>
    </>
  )
}

export default CustomerHealth
