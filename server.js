const dotenv= require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
require('./db');



const app = express();

app.use(cors());
app.use(express.json());

const uri ="mongodb+srv://masi:38JGfngzzwXbJi5Z@carbon-compass-server.0kmfcxs.mongodb.net/test"
//server to be run on port 8000
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port: ${port}, waiting for client requests`);
});

// Function to connect to the above database base uri
async function connect(){
    try {
        await mongoose.connect(uri);
        console.log("connected to databse on MongoDB Atlas");
    } catch (error) {
        console.log("error");
    }
}
connect();

// Function to create a new user
//Define a schema schema
const Schema = mongoose.Schema; // make sure to always use mongoose.Schema before defining a schema

const userSchema = new Schema({ //define the schema
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }

});
const User = mongoose.model('User', userSchema);

// Handle the Post request to /signup
app.post('/signup', async (req, res)=>{
    const{ name, email, password} = req.body;
    try {
        //check if email exists or same email is typed in
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        //Creat a new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({message:'User created successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Something went wrong, please try again later'});
    }
});

// Handle the Post request to /login
app.post('/login', async (req, res)=>{
    const{ email, password} = req.body;
    try { 
        //check if user exists
        const existingUser = await User.findOne({email});
        if(!existingUser){
            return res.status(400).json({message:"User does not exist"});
        }
        //check if password matches
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if(!passwordMatch){
            return res.status(400).json({message:"Password incorrect"});
        }
        res.status(200).json({message:'Login successful'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Something went wrong, please try again later'});
    }
});

// Handle Get request to /users to show in the header for the frontend
app.get('/users', async (req, res_) =>{
    const userId = req.user.id; // retrieve the user ID from the session or auth token
    try {
        // get user name from mongoDB
        const user = await User.findById(userId);
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        res.status(200).json({name:user.name})
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Something went wrong, please try again later'})
    }
});
