'use client';

import { useEffect } from 'react';

interface PerformanceLoggerProps {
    timings?: {
        db: number;
        query: number;
        serialize: number;
    };
    success: boolean;
    error?: any;
}

export default function PerformanceLogger({ timings, success, error }: PerformanceLoggerProps) {
    useEffect(() => {
        if (!success) {
            console.error('Server Action Failed:', error);
            return;
        }

        if (timings) {
            console.group('📊 Server Performance Metrics');
            console.log(`Database Connection: ${timings.db}ms`);
            console.log(`Query Execution: ${timings.query}ms`);
            console.log(`Serialization: ${timings.serialize}ms`);
            console.groupEnd();
        }
    }, [timings, success, error]);

    return null;
}
