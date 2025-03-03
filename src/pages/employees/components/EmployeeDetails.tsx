
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EmployeeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Employee Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Employee ID: {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Employee details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDetailsPage;
