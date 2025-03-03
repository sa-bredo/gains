
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RotaPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Rota Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Shifts and Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Rota content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RotaPage;
