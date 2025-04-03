import React from 'react';
// Use relative paths due to potential alias issue after move
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { LandingHeader } from '../../components/landing-header';

export default function AboutPage() {
  return (
    // Add padding-top to account for absolute positioned header
    <div className="mx-auto max-w-3xl space-y-6 px-4 pt-20 pb-10 md:pt-24">
      <LandingHeader /> {/* Add the header */}
      <Card>
        <CardHeader>
          <CardTitle>About Knot Dashboard</CardTitle>
          <CardDescription>Information about this application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Knot Dashboard provides a unified interface for managing various tasks,
            including accessing a web-based terminal and managing your user profile.
          </p>
          <h3 className="font-semibold pt-4 border-t">Key Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>Persistent Web Terminal (PowerShell)</li>
            <li>User Authentication (Signup/Login)</li>
            <li>Profile Management (Email, Display Name)</li>
            <li>Password Change Functionality</li>
            <li>Login History Tracking (IP & Location)</li>
            <li>IP-Based Weather Widget</li>
            <li>Theme Toggle (Light/Dark/System)</li>
            <li>Inactivity Timeout</li>
            <li>Responsive Design</li>
            <li>UI Animations</li>
          </ul>
           <h3 className="font-semibold pt-4 border-t">Technology Stack:</h3>
           <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
             <li>Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, xterm.js</li>
             <li>Backend: Node.js, Express, Mongoose, JWT, bcryptjs, WebSockets (ws)</li>
             <li>Database: MongoDB</li>
             <li>APIs: OpenWeatherMap, ip-api.com</li>
           </ul>
        </CardContent>
      </Card>
    </div>
  );
}
