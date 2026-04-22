import React, { useState } from 'react';
import { Send, Upload, Loader2, UserCheck } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { saveProfile, generateResume } from '../api/client';
import { useA2AStore } from '../store/a2aStore';

const mockProfile = {
  id: "user_123",
  name: "Jane Doe",
  email: "jane.doe@example.com",
  phone: "+1 555-0100",
  linkedin: "linkedin.com/in/janedoe",
  skills: ["Python", "FastAPI", "React", "TypeScript", "SQL", "Docker", "Machine Learning"],
  experience: [
    {
      id: "exp_1", company: "TechNova", title: "Senior Software Engineer", startDate: "2021", endDate: "Present",
      description: ["Architected microservices using Python and FastAPI.", "Reduced latency by 40% using Redis caching."]
    },
    {
        id: "exp_2", company: "DataFlow", title: "Data Engineer", startDate: "2018", endDate: "2021",
        description: ["Built ETL pipelines processing 1TB of data daily.", "Implemented vector embeddings for recommendation system."]
      }
  ],
  projects: [
    {
      id: "proj_1", name: "AI Resume Builder", technologies: ["React", "FastAPI", "LLMs"],
      description: ["Developed a multi-agent AI system for dynamic resume generation."]
    }
  ],
  education: [
    { id: "edu_1", institution: "State University", degree: "B.S. Computer Science", startDate: "2014", endDate: "2018", gpa: "3.8" }
  ]
};

export function TaskInput() {
    const [jd, setJd] = useState('');
    const [profileSaved, setProfileSaved] = useState(false);
    const isLoading = useA2AStore((s) => s.isLoading);
    const resetStore = useA2AStore((s) => s.resetStore);

    const profileMutation = useMutation({
        mutationFn: saveProfile,
        onSuccess: () => setProfileSaved(true)
    });

    const generateMutation = useMutation({
        mutationFn: generateResume,
        onMutate: () => resetStore(),
        onError: (err) => {
            console.error(err);
            useA2AStore.getState().setLoading(false);
        }
    });

    const handleSaveProfile = () => {
        if (!isLoading) profileMutation.mutate(mockProfile);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jd.trim() || isLoading || !profileSaved) return;
        generateMutation.mutate({ user_id: mockProfile.id, job_description: jd });
        setJd('');
    }

    return (
        <div className="glass-panel rounded-xl p-6 shadow-xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
                    Job Application Copilot
                </h2>
                <button
                    onClick={handleSaveProfile}
                    className={`px-4 py-2 rounded border text-sm flex items-center gap-2 transition-all ${
                        profileSaved 
                        ? "bg-emerald-900/50 border-emerald-500 text-emerald-400 cursor-default" 
                        : "bg-blue-900/50 border-blue-500 hover:bg-blue-800 text-blue-200"
                    }`}
                >
                    {profileSaved ? <UserCheck className="w-4 h-4"/> : <Upload className="w-4 h-4"/>}
                    {profileSaved ? "Profile Loaded & Embeddings Ready" : "1. Load Mock User Profile"}
                </button>
            </div>
            
            <form onSubmit={handleGenerate} className="flex flex-col gap-3">
                <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="2. Paste the target Job Description here..."
                    disabled={isLoading || !profileSaved}
                    rows={4}
                    className="w-full bg-gray-900/50 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-gray-500 resize-none"
                />
                <div className="flex justify-end">
                     <button
                        type="submit"
                        disabled={isLoading || !jd.trim() || !profileSaved}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        <span>3. Generate Optimized Resume</span>
                    </button>
                </div>
            </form>
            
            {generateMutation.isError && (
                <div className="text-sm text-red-400">Failed to submit task. Ensure backend is running.</div>
            )}
        </div>
    );
}
