import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      content: true,
    },
  });

  console.log("📚 Total books:", books.length);

  const withContent = books.filter((b) => b.content && b.content.length > 100);
  console.log("📖 Books with content (>100 chars):", withContent.length);

  withContent.forEach((b) => {
    console.log(
      `  - ${b.title} (${b.content?.length.toLocaleString()} characters)`
    );
  });

  await prisma.$disconnect();
}

main();
