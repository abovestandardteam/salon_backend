📦 Prisma Setup & Usage Guide

# -------------------------------------------------------------------------

🧱 1. Install Prisma CLI & Client
npm install prisma --save-dev
npm install @prisma/client

# -------------------------------------------------------------------------

📁 2. Initialize Prisma
npx prisma init

# -------------------------------------------------------------------------

🛠 3. Configure Your Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mydb"

Then in prisma/schema.prisma, define your models. Example:
model User {
id Int @id @default(autoincrement())
name String
email String @unique
createdAt DateTime @default(now())
}

# -------------------------------------------------------------------------

🚀 4. Create Database & Migrate Schema
npx prisma migrate dev user-table init

This will:
Create the DB schema
Generate Prisma Client
Apply migrations

# -------------------------------------------------------------------------

🔄 5. Generate Prisma Client
npx prisma generate

# -------------------------------------------------------------------------

📦 6. Use Prisma in Your App
