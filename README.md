# 🧾 ReporTube - Academic Reporting Platform

**ReporTube** is a comprehensive web-based academic reporting platform that streamlines how schools manage, calculate, and deliver student performance reports. It empowers admins to organize classes and student data, while teachers efficiently update scores and assessments — with automated report generation and email delivery for parents.

---

## 🎯 Core Features

### 👨‍🏫 Teacher Portal

* View assigned classes and students
* Input and update **Continuous Assessment (CA)** and **Exam** scores
* Automatic computation of total marks and grades
* Access generated report sheets for students
* Real-time grade calculation (A+ to F)

### 🧑‍💼 Admin Panel

* Add students and create class structures
* Assign teachers to classes and manage access rights
* Review and approve final scores submitted by teachers
* Trigger email notifications to parents with report sheets attached
* Maintain a centralized, secure database of all academic records
* Manage users (teachers and admins)
* Subject management

### ✉️ Parent Communication

* Automated or admin-triggered emails deliver each student's finalized report sheet directly to the parent's inbox
* Professional PDF reports with school branding
* Promotes transparency and instant communication between school and home

---

## ⚙️ Technology Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| **Frontend**     | HTML, CSS, EJS (templating engine)  |
| **Backend**      | Node.js (Express.js)                |
| **Database**     | PostgreSQL                          |
| **Email System** | SMTP (Nodemailer)                   |
| **PDF Generation** | PDFKit                            |
| **Testing**      | Jest, Supertest                     |
| **Security**     | Helmet, bcryptjs, express-session   |
| **Architecture** | Role-based access (Admin / Teacher) |

---

## 📁 Project Structure

```
reportube/
├── src/
│   ├── config/           # Database config, migrations, seeds
│   ├── controllers/      # Request handlers (admin, teacher, auth)
│   ├── models/           # Database models (User, Student, Class, etc.)
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth, validation, error handling
│   ├── services/         # Business logic (grades, email, reports)
│   ├── utils/            # Helper functions
│   └── views/            # EJS templates
├── public/               # Static assets (CSS, JS, images)
├── tests/                # Unit and integration tests
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── server.js             # Application entry point
└── README.md             # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v14 or higher)
* **PostgreSQL** (v12 or higher)
* **npm** or **yarn**

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd ReporTube
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reportube
DB_USER=postgres
DB_PASSWORD=your_password

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_change_this_in_production

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@reportube.com

# Application Configuration
APP_NAME=ReporTube
APP_URL=http://localhost:3000

# Admin Default Credentials
ADMIN_EMAIL=admin@reportube.com
ADMIN_PASSWORD=Admin@123
```

4. **Create PostgreSQL database**

```bash
createdb reportube
```

Or using psql:

```sql
CREATE DATABASE reportube;
```

5. **Run database migrations**

```bash
npm run migrate
```

6. **Seed the database with initial data**

```bash
npm run seed
```

This will create:
- Admin user (credentials from .env)
- Sample subjects (Math, English, Science, etc.)
- Sample classes

7. **Start the application**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

8. **Access the application**

Open your browser and navigate to: `http://localhost:3000`

**Default Login Credentials:**
- Email: `admin@reportube.com`
- Password: `Admin@123`

---

## 📧 Email Configuration

### Using Gmail

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_digit_app_password
```

### Using Other SMTP Providers

Update the SMTP settings in `.env` according to your provider's documentation.

---

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

---

## 💡 How It Works

1. **Admin Setup**
   - Admin logs in and creates classes
   - Adds students with parent information
   - Creates teacher accounts
   - Assigns teachers to specific classes and subjects

2. **Teacher Workflow**
   - Teacher logs in and views assigned classes
   - Selects a class and subject
   - Enters CA scores (0-40) and Exam scores (0-60)
   - System automatically calculates total and assigns grade
   - Scores are saved and awaiting approval

3. **Admin Review**
   - Admin reviews submitted scores
   - Approves scores for report generation
   - Generates and sends reports to parents via email

4. **Report Generation**
   - System generates professional PDF reports
   - Reports include all subjects, grades, and remarks
   - Emails are sent to parent email addresses
   - Reports can also be downloaded manually

---

## 📊 Grading System

| Grade | Score Range | Remark       |
|-------|-------------|--------------|
| A+    | 90-100      | Outstanding  |
| A     | 80-89       | Excellent    |
| B     | 70-79       | Very Good    |
| C     | 60-69       | Good         |
| D     | 50-59       | Fair         |
| E     | 40-49       | Pass         |
| F     | 0-39        | Fail         |

**Score Distribution:**
- CA (Continuous Assessment): 0-40 marks
- Exam: 0-60 marks
- Total: 0-100 marks

---

## 🔐 Security Features

* **Password Hashing**: bcryptjs with salt rounds
* **Session Management**: Secure session storage in PostgreSQL
* **Role-Based Access Control**: Admin and Teacher roles with different permissions
* **Input Validation**: express-validator for form validation
* **SQL Injection Protection**: Parameterized queries
* **XSS Protection**: Helmet middleware
* **CSRF Protection**: Built-in Express session security

---

## 🛠️ Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
```

---

## 📝 API Endpoints

### Authentication
- `GET /auth/login` - Display login page
- `POST /auth/login` - Process login
- `GET /auth/logout` - Logout user
- `GET /auth/change-password` - Change password page
- `POST /auth/change-password` - Update password

### Admin Routes
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/users` - Manage users
- `GET /admin/classes` - Manage classes
- `GET /admin/students` - Manage students
- `GET /admin/subjects` - Manage subjects
- `GET /admin/scores` - View and approve scores
- `POST /admin/reports/send` - Send reports to parents

### Teacher Routes
- `GET /teacher/dashboard` - Teacher dashboard
- `GET /teacher/classes` - View assigned classes
- `GET /teacher/scores/entry` - Score entry form
- `POST /teacher/scores/save` - Save student scores
- `GET /teacher/reports/download` - Download student report

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check connection details in .env
# Ensure database exists
psql -l | grep reportube
```

### Email Sending Issues

* Verify SMTP credentials
* Check firewall/antivirus blocking SMTP port
* For Gmail, ensure App Password is used (not regular password)
* Test email configuration in development

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3001
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Support

For support, please contact the development team or open an issue in the repository.

---

## 🎉 Acknowledgments

* Express.js for the robust web framework
* PostgreSQL for reliable data storage
* PDFKit for professional report generation
* Nodemailer for email functionality
* Bootstrap for responsive UI components

---

**Built with ❤️ for better academic reporting**
