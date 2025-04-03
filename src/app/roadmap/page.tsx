import React from 'react';
import { LandingHeader } from '@/components/landing-header'; // Assuming same header
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // For styling

export default function RoadmapPage() {
  // Placeholder roadmap data
  const roadmapItems = [
    {
      quarter: 'Q2 2025',
      status: 'In Progress',
      items: [
        'Refine Landing Page UI/UX',
        'Implement Basic Contact Form',
        'Add Roadmap Page',
      ],
    },
    {
      quarter: 'Q3 2025',
      status: 'Planned',
      items: [
        'Enhanced Terminal Features (e.g., history, themes)',
        'User Profile Picture Uploads',
        'Integration with [Example Service]',
      ],
    },
    {
      quarter: 'Q4 2025',
      status: 'Planned',
      items: [
        'Team Collaboration Features',
        'Advanced Settings Options',
        'Mobile App (Exploratory)',
      ],
    },
     {
      quarter: 'Future',
      status: 'Ideas',
      items: [
        'Plugin System',
        'Customizable Widgets',
        'Public API',
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-blue-600 dark:text-blue-400';
      case 'Planned': return 'text-green-600 dark:text-green-400';
      case 'Ideas': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <>
      <LandingHeader />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-6 md:p-12">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-center">
            Project Roadmap
          </h1>
          <p className="text-lg leading-8 text-muted-foreground mb-10 text-center">
            Our plans for the future development of Knot Dashboard. Subject to change.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmapItems.map((section) => (
              <Card key={section.quarter}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {section.quarter}
                    <span className={`text-sm font-medium ${getStatusColor(section.status)}`}>
                      {section.status}
                    </span>
                  </CardTitle>
                  {/* <CardDescription>Planned features for this period.</CardDescription> */}
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {section.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
