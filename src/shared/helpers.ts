import { Prisma } from '@prisma/client';
import { randomInt } from 'crypto';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
export function isUniqueConstraintError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

export function isNotFoundPrismaError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
}
export const generateOTP = () => {
  return randomInt(100000, 1000000).toString();
};

export function isForekeyConstraintPrismaError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  );
}

export const generateRandomFilename = (filename: string) => {
  const extension = path.extname(filename);
  return `${uuidv4()}${extension}`;
};
