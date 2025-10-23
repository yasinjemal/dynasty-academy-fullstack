-- CreateTable
CREATE TABLE "community_narrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_narrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_narrations_bookId_pageNumber_idx" ON "community_narrations"("bookId", "pageNumber");

-- CreateIndex
CREATE INDEX "community_narrations_userId_idx" ON "community_narrations"("userId");

-- CreateIndex
CREATE INDEX "community_narrations_likes_idx" ON "community_narrations"("likes");

-- AddForeignKey
ALTER TABLE "community_narrations" ADD CONSTRAINT "community_narrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_narrations" ADD CONSTRAINT "community_narrations_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
