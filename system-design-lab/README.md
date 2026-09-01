Phase 1
Node.js + Express + Database
        ↓
Phase 2
Load Balancer
        ↓
Phase 3
Horizontal Scaling
        ↓
Phase 4
Redis
        ↓
Phase 5
Queue + Async
        ↓
Phase 6
Notification
        ↓
Phase 7
DB Replica
        ↓
Phase 8
Sharding
        ↓
...
        ↓
Docker



// simple setup

Mac
│
├── Node.js
│   ├── Backend 1 :3001
│   ├── Backend 2 :3002
│   └── Backend 3 :3003
│
├── Nginx
│   └── Load Balancer
│
├── PostgreSQL
│
├── Redis
│
└── Queue / Workers


// abhi in concepts par focus karte hai

Node.js
   ↓
Basic Backend
   ↓
Nginx + Multiple Node Processes
   ↓
Load Balancing
   ↓
Redis
   ↓
Queue
   ↓
Replication
   ↓
Sharding
   ↓
Testing



// folder structure

Mac
│
├── project1/
│   └── backend/
│       └── Node.js code
│
└── PostgreSQL Server
        │
        └── system_design_lab

// connecting 
Node.js
   ↓
Connection Pool
   ↓
PostgreSQL



//Ab Node.js actually PostgreSQL se communicate kar raha hai.

Client
  │
  │ GET /db-test
  ↓
Express
  │
  ↓
db-test route
  │
  ↓
pool.query("SELECT NOW()")
  │
  ↓
PostgreSQL
  │
  ↓
SELECT NOW()
  │
  ↓
Result
  │
  ↓
Node.js
  │
  ↓
JSON Response


// system design architecture

                       Users
                         ↓
                        CDN
                         ↓
                  Load Balancer
                  /     |     \
                 ↓      ↓      ↓
              Server Server Server
                 \      |      /
                      Redis
                         ↓
                       Queue
                         ↓
                 Background Workers
                         ↓
                Database Cluster
                  /            \
             Primary          Replicas
                  ↓
               Sharding


// mini e-commerce

Hum ek mini e-commerce/order management system bana rahe hain.

1. Application actually karegi kya?

Imagine ek simple online shopping website:

User
 ↓
Products dekhta hai
 ↓
Product select karta hai
 ↓
Order place karta hai
 ↓
System order process karta hai
 ↓
Stock decrease hota hai
 ↓
User ko confirmation milta hai


2. Is application mein 3 main entities hain
👤 User

Application mein users honge.

Example:

User
----------------
id: 1
name: Abhinav
email: abhinav@gmail.com

User:

create ho sakta hai
retrieve ho sakta hai
order place kar sakta hai

2. Is application mein 3 main entities hain
👤 User

Application mein users honge.

Example:

User
----------------
id: 1
name: Abhinav
email: abhinav@gmail.com

User:

create ho sakta hai
retrieve ho sakta hai
order place kar sakta hai



// Phase 1 — Application Architecture

Abhi intentionally:

                Client
                  │
                  ▼
           Node.js + Express
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
      Users    Products    Orders
                  │
                  ▼
             PostgreSQL

orders.user_id batata hai ki ye order kis user ka hai.
orders.product_id batata hai ki order mein kaunsa product hai.


// Transaction ensure karta hai:

        Transaction
             │
      ┌──────┼──────┐
      ↓      ↓      ↓
   Create  Reduce  Update
   Order   Stock   Status
      │      │      │
      └──────┼──────┘
             ↓
         ALL SUCCESS
             ↓
           COMMIT ✅


// Agar koi operation fail ho:

Create Order ✅
Reduce Stock ❌
       ↓
    ROLLBACK
       ↓
Sab changes undo ❌


// Yaani tumhara current single-server setup around ~2K requests/sec ke aas-paas plateau kar raha hai is particular localhost test aur endpoint ke liye.


7. Lekin pehle ek small modification

Abhi tumhara server fixed hai:

const PORT = 3000;

Isko environment variable se configurable karenge:

const PORT = process.env.PORT || 3000;

Then:

PORT=3001 node src/server.js
PORT=3002 node src/server.js
PORT=3003 node src/server.js

same code ke 3 instances run kar sakte hain.


Abhi hamara server:

localhost:3000

par run ho raha hai.

Hum same machine par multiple Node.js instances run kar sakte hain:

Node Server 1 → :3001
Node Server 2 → :3002
Node Server 3 → :3003

                Client
                  │
                  │
          ┌───────▼────────┐
          │ Load Balancer  │
          │    :3000       │
          └───────┬────────┘
                  │
          ┌───────┼────────┐
          ↓       ↓        ↓
       :3001   :3002    :3003
       Node 1  Node 2   Node 3
          │       │        │
          └───────┼────────┘
                  ↓
             PostgreSQL


Step 1 → Make PORT configurable
Step 2 → Run 3 Node instances
Step 3 → Verify each independently
Step 4 → Install Nginx
Step 5 → Configure Nginx as Load Balancer
Step 6 → Test request distribution
Step 7 → Run autocannon again
Step 8 → Compare with today's baseline


Current commit mein basically Phase 1 ka working backend capture ho raha hai:

Users API
Products API
Orders API
PostgreSQL connection
Order transaction / stock update
Basic project structure
Baseline load testing completed


phase 1 completed , now moving towards phase 2

