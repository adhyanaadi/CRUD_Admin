# 1. Backend
## Create a token-based CRUD API
### a. Customer
● FirstName
● LastName
● Mobile
● Email
● DOB
● Avg. Step ( this field should get updated automatically when entries in
“CustomerHealthData” table get added/updated/deleted)
● Avg. Sleep (inn hours)
● Avg. Calories
● Daily step goal ( 5000, 10000 etc) as soon as user reaches the daily
goal they should get an appreciation email
### b. CustomerHealthData
i. CustomerID
ii. Date
iii. Type(Step, Sleep, Calories)

# 2. FrontEnd
## Create a simple front end module using html/reach/angular/vue (any frontend library
you are comfortable) to consume the backend api created in step 1
1. Create screen for listing/creating/updating/deleting records
2. Create screen to plot time series graph for customer health data for selected
customer for a given date range
