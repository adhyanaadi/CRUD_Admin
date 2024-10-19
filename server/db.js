  const mongoose = require('mongoose');
// const { default: CustomerHealthComponent } = require('../src/pages/CustomerHealth');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');


mongoose.connect('mongodb+srv://aadiadhyan:Adhyan@revfin.vyqwe.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

const customerSchema = new mongoose.Schema({
    _id: {
      type: String,
      default: uuidv4,  // Automatically generate UUID as the _id
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          // Basic email regex pattern for validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`,
      },
    },
    dob: Date,
    dailyStepGoal: Number,
    avgSteps: Number,
    avgSleep: Number,
    avgCalories: Number,
    
  });
  
const customerHealthSchema = new mongoose.Schema({
    customerEmail: {
      type: String,
      ref: 'Customer',
      required: true, //No need for validation as it is automatically done in the customer Schema.
    },
    date: Date,
    healthData: [{
        'step':Number,
        'sleep':Number,
        'calories':Number
    }]
})
// Hash the password before saving it
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
// Method to compare provided password with the stored hashed password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
// Pre-save middlewares to update average steps, sleep, and calories
customerHealthSchema.post('deleteOne', async function () {
  console.log('Post deletion hook');
  
  // Fetching the document filter used in deleteOne to get the customerEmail
  const filter = this.getFilter();
  const healthRecord = await this.model.findOne(filter);
  
  if (healthRecord) {
    console.log('Customer email found for deletion:', healthRecord.customerEmail);
    await updateCustomerAverages(healthRecord.customerEmail);
  } else {
    console.log('No customer health record found for the filter:', filter);
  }

  console.log('Post deletion hook end');
});

const updateCustomerAverages = async (customerEmail) => {
  console.log('Updating customer averages for email:', customerEmail);

  try {
    // Fetch all health data related to the customer
    const healthData = await CustomerHealth.find({ customerEmail });
    console.log('Health data fetched for customer:', healthData);

    // If no health data is left, set averages to 0
    if (healthData.length === 0) {
      console.log('No health data left for customer. Setting averages to 0.');
      await Customer.updateOne(
        { email: customerEmail },
        { avgSteps: 0, avgSleep: 0, avgCalories: 0 }
      );
      console.log('Customer averages updated to 0.');
      return;
    }

    console.log('Health data count:', healthData.length);
    
    // Initialize accumulators
    let totalSteps = 0, totalSleep = 0, totalCalories = 0, count = 0;
    
    // Loop through health data and calculate total values
    healthData.forEach(healthRecord => {
      healthRecord.healthData.forEach(data => {
        totalSteps += data.step || 0;
        totalSleep += data.sleep || 0;
        totalCalories += data.calories || 0;
        count++;
        console.log(`Steps: ${totalSteps}, Sleep: ${totalSleep}, Calories: ${totalCalories}, Count: ${count}`);
      });
    });

    // Calculate averages
    const avgSteps = count ? totalSteps / count : 0;
    const avgSleep = count ? totalSleep / count : 0;
    const avgCalories = count ? totalCalories / count : 0;
    
    console.log(`Averages calculated - Steps: ${avgSteps}, Sleep: ${avgSleep}, Calories: ${avgCalories}`);
    
    // Update the customer document with the new averages
    await Customer.updateOne(
      { email: customerEmail },
      { avgSteps, avgSleep, avgCalories }
    );
    console.log('Customer averages updated.');
  } catch (error) {
    console.error(`Error updating customer averages: ${error.message}`);
  }
};


// Post hooks for save, update, delete
customerHealthSchema.pre('save', async function () {
  await updateCustomerAverages(this.customerEmail);
});

customerHealthSchema.pre('findOneAndUpdate', async function (doc) {
  if (doc) {
    await updateCustomerAverages(doc.customerEmail);
  }
});

customerHealthSchema.pre('deleteOne', { document: false, query: true }, async function (next) {
  const filter = this.getFilter();
  console.log('Pre deletion hook filter:', filter);

  try {
    // Find the health record that's about to be deleted
    const healthRecord = await this.model.findOne(filter);
    
    if (healthRecord) {
      console.log('Customer health record found:', healthRecord);

      const customerEmail = healthRecord.customerEmail;

      // Check how many entries are left for this customer
      const remainingEntries = await CustomerHealth.countDocuments({ customerEmail });
      console.log('Remaining entries for customer:', remainingEntries);

      if (remainingEntries === 1) {
        // If only one entry is left, we update the averages to 0 before deletion
        console.log('Only one entry left. Setting averages to 0.');
        await Customer.updateOne(
          { email: customerEmail },
          { avgSteps: 0, avgSleep: 0, avgCalories: 0 }
        );
        console.log('Customer averages updated to 0.');
      }
    } else {
      console.log('No customer health record found for deletion.');
    }
  } catch (error) {
    console.error(`Error in pre-deleteOne hook: ${error.message}`);
  }

  next(); // Proceed with the deletion
});



customerHealthSchema.post('save', async function () {
  await updateCustomerAverages(this.customerEmail);
});

customerHealthSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await updateCustomerAverages(doc.customerEmail);
  }
});

const Customer = mongoose.model('Customer', customerSchema);
const CustomerHealth = mongoose.model('CustomerHealth', customerHealthSchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports ={
    Customer,
    CustomerHealth, 
    Admin
}



// JSON DATA TO SEND
// {
//     "firstName":"Aditya",
//     "lastName":"Adhyan",
//     "phone":"8102091322",
//     "email":"aadiadhyan@gmail.com",
//     "dob":"22102002",
//     "dailyStepGoal":6000,
//     "avgSteps":4000,
//     "avgSleep":8,
//     "avgCalories":3000,
//     "customerID":"something"
// }