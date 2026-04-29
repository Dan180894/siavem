-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('VEHICLE', 'MOTORCYCLE', 'BUS');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "trip_requests" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "requestedById" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "vehicleId" INTEGER,
    "objective" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "destination" TEXT NOT NULL,
    "departureAt" TIMESTAMP(3) NOT NULL,
    "returnAt" TIMESTAMP(3) NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'PENDING',
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trip_requests" ADD CONSTRAINT "trip_requests_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_requests" ADD CONSTRAINT "trip_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_requests" ADD CONSTRAINT "trip_requests_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_requests" ADD CONSTRAINT "trip_requests_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
