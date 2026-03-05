import React from 'react';
import { Card } from '../components/ui/card';
import { MessageSquare } from 'lucide-react';

const Posts = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Publicaciones</h1>
                </div>

                <Card className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                        La funcionalidad de publicaciones estara disponible proximamente.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default Posts;
