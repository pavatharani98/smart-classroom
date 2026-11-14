# Smart Classroom Information System Using QR Code

A web-based application to register classrooms and generate unique QR codes for each one.

## Features
- Register classroom details (basic info, facilities, student counts)
- Automatically generates a unique QR code per classroom
- Download & print the QR code
- Scan the QR code → opens a beautiful mobile-friendly classroom info page
- View all registered classrooms in a list

## Tech Stack
- **Backend**: Node.js + Express
- **Database**: SQLite (via sqlite3)
- **QR Code**: qrcode npm package
- **Template Engine**: EJS
- **Frontend**: HTML5 + CSS3 + Font Awesome icons

## Setup & Run

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser at:
   ```
   http://localhost:3000
   ```

## Project Structure
```
smart-classroom/
├── server.js              # Express backend
├── package.json
├── classrooms.db          # SQLite database (auto-created)
├── public/
│   ├── index.html         # Classroom entry form
│   ├── 404.html
│   ├── css/style.css
│   └── js/form.js
└── views/
    ├── success.ejs        # QR code display after submission
    ├── classroom.ejs      # Info page opened when QR is scanned
    └── classrooms.ejs     # All classrooms list
```

## Usage Flow
1. Fill in the classroom form at `http://localhost:3000`
2. Click **Save & Generate QR Code**
3. Download/print the QR code
4. Put it on the classroom wall
5. Anyone scans it → sees the classroom info page
