-- DropIndex
DROP INDEX "Booking_businessId_startsAt_key";

-- Um horário só pode ter um agendamento ativo; cancelados liberam o slot.
CREATE UNIQUE INDEX "Booking_businessId_startsAt_active_key"
ON "Booking" ("businessId", "startsAt")
WHERE "status" <> 'CANCELLED';
