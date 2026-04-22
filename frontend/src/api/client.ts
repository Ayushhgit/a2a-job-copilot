const BASE_URL = 'http://localhost:8000/api';

export const saveProfile = async (profileData: any) => {
    const res = await fetch(`${BASE_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    });
    if (!res.ok) throw new Error('Failed to save profile');
    return res.json();
};

export const generateResume = async (data: { user_id: string, job_description: string }) => {
    const res = await fetch(`${BASE_URL}/generate_resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to generate resume');
    return res.json();
};
