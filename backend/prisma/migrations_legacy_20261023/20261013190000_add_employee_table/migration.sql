-- CreateTable
CREATE TABLE "Employee" (
    "id" UUID NOT NULL,
    "employeeCode" VARCHAR(50) NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "avatarUrl" VARCHAR(1000),
    "dateOfBirth" DATE,
    "gender" "Gender",
    "citizenId" VARCHAR(50),
    "address" VARCHAR(500),
    "department" VARCHAR(100) NOT NULL,
    "position" VARCHAR(100) NOT NULL,
    "salary" DECIMAL(12, 2) NOT NULL,
    "hireDate" DATE NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "assignedOrderScope" VARCHAR(100) NOT NULL DEFAULT 'assigned_orders',
    "permissions" JSONB,
    "adminId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_adminId_idx" ON "Employee"("adminId");

-- CreateIndex
CREATE INDEX "Employee_status_idx" ON "Employee"("status");

-- CreateIndex
CREATE INDEX "Employee_department_idx" ON "Employee"("department");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
