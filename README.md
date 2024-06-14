# CUSTOMER TRACKER

Customer Tracker is a project that provides all the related data entries of a customer.

## Requirements

Node
MongoDB

## Dependencies

express
dotenv
mongoose
validator

## Dev-Dependencies

nodemon

## .env

PORT
MONGO_URI

## Endpoints

POST method: https://customer-tracker-xi.vercel.app/api/v1/contact/identify
body: (raw JSON):{ "email": "abc@example.com", "phoneNumber": "9876543210" }
