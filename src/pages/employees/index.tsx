
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Define and export the Employee type
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  mobile_number?: string | null;
  invited: boolean;
}

// Define and export the EmployeeFormValues type
export interface EmployeeFormValues {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  mobile_number?: string;
}

const EmployeesPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link to="/employees/invite">
          <Button>Invite Employee</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Employee list will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeesPage;
