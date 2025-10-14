import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="text-6xl mb-4">404</div>
          <CardTitle>Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
            <Link href="/books">
              <Button variant="outline">Browse Books</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: "404 - Page Not Found | Dynasty Built Academy",
  description: "The page you are looking for could not be found.",
};
