#!/bin/bash

# Navigate to src/views (adjust path if needed)
cd src/views || exit

echo "📁 Creating missing view directories and templates..."

# ===== ADMIN =====
mkdir -p admin/classes admin/reports admin/scores admin/subjects admin/users

# Admin templates
touch admin/classes/{list.ejs,add.ejs,details.ejs}
touch admin/reports/send.ejs
touch admin/scores/list.ejs
touch admin/subjects/{list.ejs,add.ejs}
touch admin/users/{list.ejs,add.ejs,edit.ejs}

# ===== TEACHER =====
mkdir -p teacher/classes teacher/scores teacher/reports

# Teacher templates
touch teacher/classes/{list.ejs,students.ejs}
touch teacher/scores/{entry.ejs,my-classes.ejs}
touch teacher/reports/student.ejs

echo "All missing template folders and files created successfully!"
