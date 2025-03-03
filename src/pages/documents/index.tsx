
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DocumentsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Documents</h1>
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Document management content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;
