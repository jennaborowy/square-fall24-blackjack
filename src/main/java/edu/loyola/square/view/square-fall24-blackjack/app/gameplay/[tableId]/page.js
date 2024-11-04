'use client';
import { useParams } from 'next/navigation';
import CardDisplay from '../components/CardDisplay';
import '../card.css';

export default function GamePage() {
    const params = useParams();
    console.log("Params in GamePage:", params);

    if (!params?.tableId) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <CardDisplay tableId={params.tableId}/>
        </div>
    );
}