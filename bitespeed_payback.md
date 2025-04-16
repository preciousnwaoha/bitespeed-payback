# BiteSpeed Payback

## 🚀 Overview
BiteSpeed Payback is a powerful identity reconciliation service designed to **link multiple contact details** (email & phone numbers) of a customer across different orders, ensuring a seamless personalized experience.

This service helps e-commerce platforms **merge fragmented customer identities** and reward loyal customers effectively.

## 📌 Features
- ✅ **Identify & Merge Customer Data** (`POST /identify`)
- ✅ **Retrieve Customer Contact Records** (`GET /identify`)
- ✅ **Delete Customer Contact Records** (`DELETE /identify`)

## 🏗️ Tech Stack
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Deployment:** Docker, Railway/Vercel/Heroku

---

## 📍 API Documentation
### **1️⃣ Identify & Merge Customer Data**
#### `POST /identify`
**Description:** Links email & phone number records to unify customer identity.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```
**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com", "alt@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": [2, 3]
  }
}
```

---

### **2️⃣ Retrieve Customer Contact Records**
#### `GET /identify`
**Description:** Fetch all contact records matching given parameters.

**Query Params:**
- `email` (optional) – Filter by email
- `phoneNumber` (optional) – Filter by phone number

**Example:**
```sh
GET /identify?email=user@example.com
```

**Response:**
```json
[
  {
    "id": 1,
    "phoneNumber": "1234567890",
    "email": "user@example.com",
    "linkedId": null,
    "linkPrecedence": "primary"
  }
]
```

---

### **3️⃣ Delete Customer Contact Records**
#### `DELETE /identify`
**Description:** Deletes all contacts that match the given query parameters.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```
**Response:**
```json
{
  "message": "Contacts deleted successfully"
}
```

---

## 🚀 Setup & Deployment
### **Local Setup**
1. **Clone the Repository**
```sh
git clone https://github.com/yourusername/bitespeed-payback.git && cd bitespeed-payback
```
2. **Install Dependencies**
```sh
npm install =
```
3. **Setup Environment Variables (`.env`)**
```sh
DATABASE_URL=postgres://user:password@localhost:5432/bitespeed
PORT=3000
```
4. **Run Migrations**
```sh
npx prisma generate
npx prisma migrate dev
```
5. **Start the Server**
```sh
npm run dev
```

### **Deployment (Docker)**
1. **Build & Run Docker Container**
```sh
docker build -t bitespeed-payback .
docker run -p 3000:3000 bitespeed-payback
```
2. **Deploy to Railway/Heroku**
```sh
git push heroku main
```

---
## Usage
Link: https://bitespeed-payback.onrender.com

---
## 📜 Code Structure
```
📂 bitespeed-payback/
 ├── 📁 src/
 │   ├── 📄 server.ts      # Express server setup
 │   ├── 📄 *routes.ts      # API Routes
 │   ├── 📄 *controllers.ts # Business logic
 │   ├── 📄 *utils.ts       # Helper functions
 ├── 📄 prisma/schema.prisma # Database Schema
 ├── 📄 package.json       # Project Dependencies
 ├── 📄 README.md          # Project Documentation
```
