const express = require("express");
const { Customer, CustomerHealth, Admin } = require("./db");  // Assuming you have this defined in your db.js
const cors = require('cors');
const nodeMailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const jwtSecretKey = 'mySuperSecretKey';  // Replace with a secure key in production
require('dotenv').config();
const port = process.env.PORT;
const app = express();
app.use(express.json());  // Apply middleware for parsing JSON
app.use(cors())
app.use(bodyParser.json());
// console.log(port);
// console.log(process.env);
console.log(process.env.SMTP_HOST , process.env.SMTP_PORT, process.env.SMTP_SERVICE , process.env.SMTP_MAIL , process.env.SMTP_PASSWORD)
const sendEmail = async (options) => {
  console.log(options);
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    html: options.message_Content,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});

};

// const sendEmail = async (options) => {
//   console.log(options);
//   const transporter = nodeMailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     service: process.env.EMAIL_SERVICE,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: options.email,
//     subject: options.subject,
//     html: options.message_Content,
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// };

// const sendEmail = async (options) => {
//   console.log(options);
//   const transporter = nodeMailer.createTransport({
//     host: process.env.SMTP_HOST,  // SMTP host (e.g., smtp.gmail.com)
//     port: process.env.SMTP_PORT,  // SMTP port (e.g., 465 or 587)
//     secure: process.env.SMTP_SECURE === 'true',  // Use TLS (true for port 465, false for port 587)
//     auth: {
//       user: process.env.SMTP_USER,  // SMTP username (your email)
//       pass: process.env.SMTP_PASS,  // SMTP password (your email password or app password)
//     },
//   });

//   const mailOptions = {
//     from: process.env.SMTP_USER,  // Sender's email address
//     to: options.email,            // Recipient's email address
//     subject: options.subject,     // Email subject
//     html: options.message_Content, // HTML content for the email body
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// };

app.post('/api/auth', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the admin by username
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    // Generate a JWT if authentication is successful
    const token = jwt.sign({ username }, jwtSecretKey, { expiresIn: '1h' });

    return res.status(200).json({ message: 'success', token });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Route to register a new admin
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if admin username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new admin instance
    const newAdmin = new Admin({
      username,
      password // The password will be hashed by the pre-save hook
    });

    // Save the new admin to the database
    await newAdmin.save();

    return res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Define the POST route for /api/customer
app.post('/api/customer', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, dob, dailyStepGoal } = req.body;

    // Create a new customer object
    const newCustomer = new Customer({
      firstName,
      lastName,
      phone,
      email,
      dob,
      dailyStepGoal: parseInt(dailyStepGoal),
      avgSteps: 0,  // Set default values
      avgSleep: 0,
      avgCalories: 0,
      // customerID: `CUST-${Date.now()}`,  // Create unique customerID
    });
    newCustomer.dob instanceof Date;

    // Save the new customer to the database
    await newCustomer.save();

    // Respond with success message
    res.status(201).json({ message: 'Customer created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Route to add health data for a specific customer using the email from the request body
app.post('/api/customerHealth/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { date, step, sleep, calories } = req.body;

    // Check if a customer with this email exists
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Create new health data for the customer
    const newHealthData = new CustomerHealth({
      customerEmail: email,  // Automatically associate with customer's email
      date: new Date(date),  // Convert date string to Date object
      healthData: [{
        step: parseInt(step),
        sleep: parseFloat(sleep),  // Sleep might be in hours with decimal
        calories: parseInt(calories)
      }]
    });

    // Save the health data to the database
    await newHealthData.save();

    // Respond with success message
    res.status(201).json({ message: 'Health data added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add health data' });
  }
});


app.post('/api/send-email', async (req, res) => {
  const { email, steps, goal, sleep, calories } = req.body;
  console.log(req.body);

  const message_Content = `
    <h1>Congratulations!</h1>
    <p>You've reached your daily step goal of ${goal} steps.</p>
    <p>Steps taken today: ${steps}</p>
    <p>Sleep: ${sleep} hours</p>
    <p>Calories burned: ${calories} cal</p>
  `;  

  const emailOptions = {
    email: email,  // Email from the request body
    subject: 'Congratulations on reaching your step goal!',
    message_Content: message_Content,  // HTML content
  };
  console.log(emailOptions);

  try {
    console.log('Trying to send email...');
    await sendEmail(emailOptions);  // Calling the sendEmail function
    console.log('Email sent successfully!');

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.log('Failed to send email:', error);
    res.status(500).json({ message: 'Failed to send email', error });
  }
});


app.get('/api/customerGet/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Find the customer by UUID (_id in your schema)
    const customer = await Customer.findOne({email: email});

    // If customer is not found, return a 404 status
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // If customer is found, return the customer data
    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving customer' });
  }
});

app.get('/api/allCustomers', async (req, res) => {
  try {
    // Find all customers in the database
    const customers = await Customer.find();

    // If no customers are found, return a 404 status
    if (customers.length === 0) {
      return res.status(404).json({ message: 'No customers found' });
    }

    // Return all customers data
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error retrieving customers:', error);
    res.status(500).json({ error: 'Error retrieving customers' });
  }
});

app.get('/api/allCustomers/name', async (req, res) => {
  try {
    // Find all customers, but only select the firstName and lastName fields
    const customers = await Customer.find({}, { firstName: 1, lastName: 1, email: 1, _id: 0 });

    // If no customers are found, return a 404 status
    if (customers.length === 0) {
      return res.status(404).json({ message: 'No customers found' });
    }

    // Return only the names of customers
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error retrieving customers:', error);
    res.status(500).json({ error: 'Error retrieving customers' });
  }
});


app.get('/api/customerHealth/:email', async (req, res) => {
  try {
    // Find all customers in the database
    const { email } = req.params;
    const customersRecords = await CustomerHealth.find({customerEmail: email});

    // If no customers are found, return a 404 status
    if (customersRecords.length === 0) {
      return res.status(404).json({ message: 'No customers data was found' });
    }

    // Return all customers data
    res.status(200).json(customersRecords);
  } catch (error) {
    console.error('Error retrieving customers data:', error);
    res.status(500).json({ error: 'Error retrieving customers data' });
  }
});

app.delete('/api/customerDelete/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Find the customer by UUID (_id in your schema)
    const customer = await Customer.deleteOne({email: email});

    // If customer is not found, return a 404 status
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // If customer is found, return the customer data
    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving customer' });
  }
});

app.delete('/api/customerHealth/:date', async (req, res) => {
  try {
    const { date } = req.params;

    // Find the customer by UUID (_id in your schema)
    const customerData = await CustomerHealth.deleteOne({date: date});

    // If customer is not found, return a 404 status
    if (!customerData) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // If customer is found, return the customer data
    res.status(200).json(customerData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving customer' });
  }
});


app.put('/api/customerEdit/:email', async (req, res) => {
  try {
    const { email } = req.params; // Current email from query parameter
    const { firstName, lastName, phone, dob, dailyStepGoal, newEmail } = req.body; // newEmail to update

    // Find the customer by current email and update fields, including email if provided
    const updatedCustomer = await Customer.findOneAndUpdate(
      { email: email }, // Find customer by current email
      {
        $set: {
          firstName,
          lastName,
          phone,
          dob,
          dailyStepGoal: parseInt(dailyStepGoal),
          email: newEmail || email, // Update email if newEmail is provided, otherwise keep the same
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error });
  }
});

// Mount the router to the /api path

app.put('/api/customerHealth/:date', async (req, res) => {
  try {
    const { date } = req.params;  // Date to identify the health record
    const { newDate, step, sleep, calories } = req.body;  // Data to be updated

    // Convert date from params to a valid Date object
    const formattedDate = new Date(date);
    const updatedDate = new Date(newDate);

    // Validate the dates
    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format in URL params" });
    }

    if (newDate && isNaN(updatedDate.getTime())) {
      return res.status(400).json({ message: "Invalid newDate format in body" });
    }

    // Fallback to original date if newDate is invalid or not provided
    const finalDate = !isNaN(updatedDate.getTime()) ? updatedDate : formattedDate;

    // Find and update the health record for the given date
    const updatedHealthData = await CustomerHealth.findOneAndUpdate(
      { date: formattedDate },  // Find the record by the date
      {
        $set: {
          'healthData.0.step': parseInt(step),  // Update step
          'healthData.0.sleep': parseFloat(sleep),  // Update sleep
          'healthData.0.calories': parseInt(calories),  // Update calories
          date: finalDate,
        }
      },
      { new: true }  // Return the updated document
    );

    // If no matching health data is found for the date
    if (!updatedHealthData) {
      return res.status(404).json({ message: 'Health data not found for the specified date' });
    }

    // Respond with the updated health data
    res.status(200).json(updatedHealthData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating health data', error });
  }
});


app.use((req, res) => {
    res.status(404).send('Route not found'); // Return 404 for invalid routes
  });

// Default root route for basic response
app.get('/', (req, res) => {
    console.log('Received a GET request at /');
    res.send('Server is running');
  });

// Start the server on port 3000
app.listen({port}, () => {
  console.log(`Server is running on port ${port}`);
});
