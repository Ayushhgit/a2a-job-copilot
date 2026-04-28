import React, { useState } from 'react';
import { Send, CheckCircle, User, Loader2, AlertCircle } from 'lucide-react';
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
      id: "exp_1", company: "TechNova", title: "Senior Software Engineer",
      startDate: "2021", endDate: "Present",
      description: ["Architected microservices using Python and FastAPI.", "Reduced latency by 40% using Redis caching."]
    },
    {
      id: "exp_2", company: "DataFlow", title: "Data Engineer",
      startDate: "2018", endDate: "2021",
      description: ["Built ETL pipelines processing 1TB of data daily.", "Implemented vector embeddings for recommendation system."]
    }
  ],
  projects: [
    {
      id: "proj_1", name: "AI Resume Builder",
      technologies: ["React", "FastAPI", "LLMs"],
      description: ["Developed a multi-agent AI system for dynamic resume generation."]
    }
  ],
  education: [
    { id: "edu_1", institution: "State University", degree: "B.S. Computer Science", startDate: "2014", endDate: "2018", gpa: "3.8" }
  ]
};

const PROFILE_STATS = [
  { label: 'Experience', value: `${mockProfile.experience.length} roles` },
  { label: 'Projects', value: `${mockProfile.projects.length} listed` },
  { label: 'Skills', value: `${mockProfile.skills.length} tags` },
];

export function TaskInput() {
  const [jd, setJd] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const isLoading = useA2AStore((s) => s.isLoading);
  const resetStore = useA2AStore((s) => s.resetStore);

  const profileMutation = useMutation({
    mutationFn: saveProfile,
    onSuccess: () => setProfileSaved(true),
  });

  const generateMutation = useMutation({
    mutationFn: generateResume,
    onMutate: () => resetStore(),
    onError: () => useA2AStore.getState().setLoading(false),
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim() || isLoading || !profileSaved) return;
    generateMutation.mutate({ user_id: mockProfile.id, job_description: jd });
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Step 1: Profile ── */}
      <section>
        <div className="step-num">Step 1 — Profile</div>
        <div style={{ marginTop: 8 }}>
          {profileSaved ? (
            <div style={{
              background: '#052e16', border: '1px solid #14532d',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CheckCircle size={14} color="#4ade80" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#4ade80' }}>
                  {mockProfile.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {PROFILE_STATS.map(s => (
                  <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: 10, color: '#4ade8066', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</span>
                    <span style={{ fontSize: 11, color: '#86efac', fontWeight: 500 }}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {mockProfile.skills.slice(0, 6).map(s => (
                  <span key={s} style={{
                    fontSize: 10, background: '#14532d55', color: '#86efac',
                    border: '1px solid #166534', padding: '1px 6px', borderRadius: 3,
                  }}>{s}</span>
                ))}
                {mockProfile.skills.length > 6 && (
                  <span style={{ fontSize: 10, color: '#4ade8066' }}>+{mockProfile.skills.length - 6} more</span>
                )}
              </div>
            </div>
          ) : (
            <button
              className="btn"
              onClick={() => !isLoading && profileMutation.mutate(mockProfile)}
              disabled={profileMutation.isPending}
              style={{ width: '100%', justifyContent: 'center', padding: '9px 12px' }}
            >
              {profileMutation.isPending
                ? <><Loader2 size={13} className="animate-spin" /> Loading embeddings…</>
                : <><User size={13} /> Load mock profile & build index</>
              }
            </button>
          )}
          {profileMutation.isError && (
            <div style={{ marginTop: 6, fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={11} /> Failed — is backend running?
            </div>
          )}
        </div>
      </section>

      <div className="divider" />

      {/* ── Step 2: JD ── */}
      <section>
        <div className="step-num">Step 2 — Job Description</div>
        <form onSubmit={handleGenerate} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            className="jd-textarea"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the target job description…"
            disabled={isLoading || !profileSaved}
            rows={10}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: '#3f3f46' }}>
              {jd.length > 0 ? `${jd.length} chars` : ''}
            </span>
            <button
              type="submit"
              className="btn-primary btn"
              disabled={isLoading || !jd.trim() || !profileSaved}
            >
              {isLoading
                ? <><Loader2 size={13} className="animate-spin" /> Running pipeline…</>
                : <><Send size={13} /> Generate Resume</>
              }
            </button>
          </div>
          {generateMutation.isError && (
            <div style={{ fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={11} /> Submit failed — check console
            </div>
          )}
        </form>
      </section>

      <div className="divider" />

      {/* ── Pipeline legend ── */}
      <section>
        <div className="step-num">Agents</div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {AGENT_META.map(a => (
            <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#71717a', flex: 1 }}>{a.name}</span>
              <span style={{ fontSize: 10, color: '#3f3f46' }}>{a.role}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export const AGENT_META = [
  { name: 'JDAnalyzer',       color: '#8b5cf6', role: 'Extract skills'   },
  { name: 'Matcher',          color: '#f59e0b', role: 'Vector search'    },
  { name: 'ResumeGenerator',  color: '#10b981', role: 'Build JSON'       },
  { name: 'Optimizer',        color: '#f43f5e', role: 'ATS + LaTeX'      },
  { name: 'Router',           color: '#06b6d4', role: 'Route traffic'    },
];
