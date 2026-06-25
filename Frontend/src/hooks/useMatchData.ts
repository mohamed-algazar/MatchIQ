import { useState, useEffect } from 'react';

export interface PlayerStat {
    id: string;
    name: string;
    distance: number;
    topSpeed: number;
    touches: number;
    position: { x: number; y: number };
}

export interface MatchData {
    id: string;
    teams: {
        home: string;
        away: string;
    };
    possession: {
        home: number;
        away: number;
    };
    playerStats: PlayerStat[];
    timeline: { time: string; intensity: number }[];
}

export const useMatchData = () => {
    const [data, setData] = useState<MatchData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking API fetch
        setTimeout(() => {
            setData({
                id: 'match_001',
                teams: { home: 'Team Alpha', away: 'Team Beta' },
                possession: { home: 58, away: 42 },
                playerStats: [
                    { id: '1', name: 'J. Smith', distance: 11.2, topSpeed: 33.1, touches: 64, position: { x: 45, y: 30 } },
                    { id: '2', name: 'L. Messi', distance: 8.5, topSpeed: 31.4, touches: 112, position: { x: 80, y: 55 } },
                    { id: '3', name: 'K. Mbappe', distance: 10.1, topSpeed: 37.2, touches: 45, position: { x: 75, y: 20 } },
                    { id: '4', name: 'V. Junior', distance: 9.8, topSpeed: 35.5, touches: 52, position: { x: 70, y: 80 } },
                    { id: '5', name: 'R. Rodri', distance: 12.4, topSpeed: 29.8, touches: 88, position: { x: 50, y: 50 } },
                ],
                timeline: Array.from({ length: 20 }).map((_, i) => ({
                    time: `${i * 5}'`,
                    intensity: Math.floor(Math.random() * 60) + 40
                }))
            });
            setLoading(false);
        }, 1200);
    }, []);

    return { data, loading };
};
