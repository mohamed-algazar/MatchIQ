import apiClient from './apiClient';

export interface Match {
    id: number;
    title: string;
    description: string;
    video_path: string;
    processed_video_path: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
}

export interface MatchStatistics {
    id: number;
    match_id: number;
    possession_team_1: number;
    possession_team_2: number;
    total_distance_team_1: number;
    total_distance_team_2: number;
    top_speed: number;
    total_passes: number;
}

export interface PlayerTelemetry {
    id: number;
    x: number;
    y: number;
    team: number;
    has_ball: boolean;
    speed: number;
    distance: number;
}

export interface BallTelemetry {
    x: number;
    y: number;
}

export interface TelemetryFrame {
    id: number;
    match_id: number;
    frame_number: number;
    timestamp: number;
    data: {
        players: PlayerTelemetry[];
        ball: BallTelemetry | null;
    };
}

export const matchService = {
    getAll: async () => {
        const response = await apiClient.get<Match[]>('/matches/');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<Match>(`/matches/${id}`);
        return response.data;
    },

    create: async (title: string, description: string) => {
        const response = await apiClient.post<Match>('/matches/', { title, description });
        return response.data;
    },

    uploadVideo: async (matchId: number, file: File, onProgress?: (progress: number) => void) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<Match>(`/uploads/${matchId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                onProgress?.(percentCompleted);
            },
        });
        return response.data;
    },

    getTelemetry: async (matchId: number) => {
        const response = await apiClient.get<TelemetryFrame[]>(`/analytics/${matchId}`);
        return response.data;
    },

    getStatistics: async (matchId: number) => {
        const response = await apiClient.get<MatchStatistics>(`/analytics/${matchId}/stats`);
        return response.data;
    },

    downloadReport: async (matchId: number) => {
        const response = await apiClient.get(`/analytics/${matchId}/report`, {
            responseType: 'blob',
        });

        // Create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Match_Report_${matchId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
