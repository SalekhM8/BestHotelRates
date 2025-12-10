-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingReference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL DEFAULT 'HOTEL',
    "serviceSubtype" TEXT,
    "hotelName" TEXT NOT NULL,
    "hotelLocation" TEXT NOT NULL,
    "hotelStarRating" INTEGER,
    "hotelImage" TEXT,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "roomType" TEXT NOT NULL,
    "numberOfRooms" INTEGER NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "adults" INTEGER NOT NULL,
    "children" INTEGER NOT NULL DEFAULT 0,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "specialRequests" TEXT,
    "roomRate" REAL NOT NULL,
    "taxes" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "etgBookingId" TEXT,
    "cancellationPolicy" TEXT,
    "paymentDueDate" DATETIME,
    "automaticCancelAt" DATETIME,
    "isFreeCancellation" BOOLEAN NOT NULL DEFAULT false,
    "isUnpaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "metadata" JSONB,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("adults", "bookingReference", "cancellationPolicy", "checkIn", "checkOut", "children", "createdAt", "currency", "etgBookingId", "guestEmail", "guestName", "guestPhone", "hotelId", "hotelImage", "hotelLocation", "hotelName", "hotelStarRating", "id", "metadata", "numberOfGuests", "numberOfRooms", "paymentStatus", "roomRate", "roomType", "specialRequests", "status", "stripePaymentId", "stripeSessionId", "taxes", "totalAmount", "updatedAt", "userId") SELECT "adults", "bookingReference", "cancellationPolicy", "checkIn", "checkOut", "children", "createdAt", "currency", "etgBookingId", "guestEmail", "guestName", "guestPhone", "hotelId", "hotelImage", "hotelLocation", "hotelName", "hotelStarRating", "id", "metadata", "numberOfGuests", "numberOfRooms", "paymentStatus", "roomRate", "roomType", "specialRequests", "status", "stripePaymentId", "stripeSessionId", "taxes", "totalAmount", "updatedAt", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_bookingReference_key" ON "Booking"("bookingReference");
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_bookingReference_idx" ON "Booking"("bookingReference");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_hotelId_idx" ON "Booking"("hotelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
