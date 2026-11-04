/*
  Warnings:

  - The `years_of_experience` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "years_of_experience",
ADD COLUMN     "years_of_experience" INTEGER;
