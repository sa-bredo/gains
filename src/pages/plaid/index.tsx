
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PlaidPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Plaid Integration</h1>
      <Card>
        <CardHeader>
          <CardTitle>Banking Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Plaid integration content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaidPage;
