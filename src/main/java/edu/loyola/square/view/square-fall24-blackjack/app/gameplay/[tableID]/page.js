'use client';
import { useParams } from 'next/navigation';
import CardDisplay from '@/app/gameplay/page';

export default function GamePage() {
    const params = useParams();
    const {tableId} = params;

    return (
        <div>
            <CardDisplay tableId={tableId}/>
        </div>
    )
}