import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  // This component renders the content for the exact /dashboard path
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Overview</CardTitle>
          <CardDescription>Welcome to your Knot Dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main dashboard page.</p>
          <p className="mt-4 text-muted-foreground">Future widgets or quick links can be added here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
