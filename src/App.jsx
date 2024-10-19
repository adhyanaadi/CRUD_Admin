
// import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import { createContext, useState } from 'react';
// import Sidebar from './components/Sidebar';
// import Dashboard from './pages/Dashboard';
// import CustomerHealth from './pages/CustomerHealth';

// const MyContext = createContext();

// function App() {
//   return (
//     <>
//       <BrowserRouter>
//         <MyContext.Provider value={{}}>
//           <section className='main flex'>
//             <div className='sideBarWrapper w-[20%]'>
//               <Sidebar />
//             </div>

//             <div className='content_Right w-[80%] px-3'>
//               <Routes>
//                 <Route path="/" exact={true} element={<Dashboard />} />
//                 <Route path="/customer-health" exact={true} element={<CustomerHealth />} />
//               </Routes>
//             </div>
//           </section>
//         </MyContext.Provider>
//       </BrowserRouter>
//     </>
//   );
// }

// export default App;



import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { createContext, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CustomerHealth from './pages/CustomerHealth';
import Home from './pages/Auth';  // Import your login component

const MyContext = createContext();

function App() {
  // Function to check if the user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('jwt-token');
    return !!token; // Returns true if token exists, false otherwise
  };

  // Create a PrivateRoute component to protect routes
  const PrivateRoute = ({ element }) => {
    return isAuthenticated() ? element : <Navigate to="/" />;  // Redirect to login if not authenticated
  };

  return (
    <>
      <BrowserRouter>
        <MyContext.Provider value={{}}>
          <section className='main flex'>
            <div className='sideBarWrapper w-[20%]'>
              <Sidebar />
            </div>

            <div className='content_Right w-[80%] px-3'>
              <Routes>
                <Route path="/" element={<Home />} />  {/* Public route for login */}
                {/* Protect Dashboard and CustomerHealth with PrivateRoute */}
                <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                <Route path="/customer-health" element={<PrivateRoute element={<CustomerHealth />} />} />
              </Routes>
            </div>
          </section>
        </MyContext.Provider>
      </BrowserRouter>
    </>
  );
}

export default App;
