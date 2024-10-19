
// export default Sidebar;
import React, { useState, useEffect } from 'react';
import Logo from '../../assets/revfin_light.png';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { MdOutlineDashboard, MdHealthAndSafety, MdKeyboardArrowRight } from 'react-icons/md';
import { MdLogin } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { useHandleView } from '../../util/navigationUtil';
import { useNavigate } from 'react-router-dom'; 
import { CLIENT_URL, REACT_PORT, SERVER_URL } from '../../config';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState(0); // Track the active tab
  const [isToggleSubmenu, setisToggleSubmenu] = useState(false); // Track submenu toggle state
  const navigate = useNavigate();
  const handleView = useHandleView();
  
  const [customers, setCustomers] = useState([]); // Store customer objects with name and email

  useEffect(() => {
    fetchAllCustomers(); // Fetch customers when the component mounts
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (index === 2) { // Toggle submenu only for 'Customer Health'
      setisToggleSubmenu(!isToggleSubmenu);
    } else {
      setisToggleSubmenu(false); // Close submenu when switching tabs
    }
  };

  const fetchAllCustomers = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/allCustomers/name`);
      
      if (!response.ok) {
        throw new Error('Error fetching customer names');
      }
      
      const data = await response.json();
      setCustomers(data); // Store both name and email in state
    } catch (error) {
      console.error('Error fetching customer names:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt-token'); // Clear the JWT token from localStorage
    navigate('/'); // Redirect to the login page
  };

  return (
    <div className='sidebar fixed top-0 left-0 z-[100] w-[20%]'>
      <Link to="/dashboard">
        <div className='logoWrapper py-2 px-2'>
          <img src={Logo} className='w-100' alt="Logo" />
        </div>
      </Link>

      <div className='sidebarTabs'>
        <ul className='flex gap-2 flex-col'>
          <li>
            <Button
              className={`w-100 ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => {
                handleTabClick(1);
                handleBack();
              }}
            >
              <span className='icon w-[25px] h-[25px] flex items-center justify-center rounded-md'>
                <MdOutlineDashboard />
              </span>
              Customer Dashboard
            </Button>
          </li>

          <li className={`${activeTab === 2 && isToggleSubmenu ? 'colapse' : ''}`}>
            <Button
              className={`w-100 ${activeTab === 2 ? 'active' : ''}`}
              onClick={() => handleTabClick(2)}
            >
              <span className='icon w-[25px] h-[25px] flex items-center justify-center rounded-md'>
                <MdHealthAndSafety />
              </span>
              Customer Health
              <span className='arrow ml-auto w-[25px] h-[25px] flex items-center right-0 justify-center rounded-md'>
                <MdKeyboardArrowRight />
              </span>
            </Button>

            {isToggleSubmenu && (
              <div className='submenu'>
                {customers.map((customer, index) => (
                  <Button
                    key={index}
                    className='w-100'
                    onClick={() => handleView(customer.email)} // Pass email when clicked
                  >
                    <span className='icon w-[25px] h-[25px] flex items-center justify-center rounded-md mx-1'><FaUser /></span>
                    {customer.firstName} {customer.lastName}
                  </Button>
                ))}
              </div>
            )}
          </li>
        </ul>
      </div>

      {/* Logout Button */}
      <div className='logoutbutton absolute bottom-0 w-full'>
        <Button
          className='w-100'
          onClick={handleLogout}
        >
          <span className='icon w-[25px] h-[25px] flex items-center justify-center rounded-md'>
            {/* Optional icon can be added here */}
            <MdLogin />
          </span>
          Logout Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
