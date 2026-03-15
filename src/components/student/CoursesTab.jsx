import React from 'react';
import { BookOpen, ExternalLink, Clock } from 'lucide-react';

const COURSES = [
  { title: 'Machine Learning A-Z', provider: 'Coursera', duration: '11 weeks', level: 'Intermediate', tags: ['Python', 'ML', 'scikit-learn'], url: 'https://www.coursera.org/learn/machine-learning' },
  { title: 'Full Stack Web Development', provider: 'freeCodeCamp', duration: 'Self-paced', level: 'Beginner', tags: ['HTML', 'CSS', 'JavaScript', 'React'], url: 'https://www.freecodecamp.org/learn' },
  { title: 'Data Structures & Algorithms', provider: 'LeetCode', duration: 'Self-paced', level: 'All levels', tags: ['DSA', 'Interviews', 'Problem Solving'], url: 'https://leetcode.com/explore' },
  { title: 'Deep Learning Specialization', provider: 'Coursera', duration: '5 months', level: 'Advanced', tags: ['Neural Networks', 'TensorFlow', 'CNN'], url: 'https://www.coursera.org/specializations/deep-learning' },
  { title: 'System Design Interview', provider: 'educative.io', duration: '6 weeks', level: 'Intermediate', tags: ['Architecture', 'Scalability', 'Backend'], url: 'https://www.educative.io/courses/grokking-the-system-design-interview' },
  { title: 'SQL for Data Analysis', provider: 'Mode Analytics', duration: 'Self-paced', level: 'Beginner', tags: ['SQL', 'Data', 'Analytics'], url: 'https://mode.com/sql-tutorial' },
];

const LEVEL_COLORS = {
  Beginner: '#4ade80',
  Intermediate: '#facc15',
  Advanced: '#f87171',
  'All levels': '#a78bfa',
};

const CoursesTab = ({ isFullscreen, TopBar }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TopBar title="Recommended Courses" icon={BookOpen} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        <p style={{ margin: '0 0 1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
          Curated courses based on popular career paths. Update your Profile & chat with Career Bot for personalized picks.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {COURSES.map((course, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: '0.97rem', fontWeight: 700, color: 'white', lineHeight: 1.35 }}>{course.title}</h4>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, background: `${LEVEL_COLORS[course.level]}18`, color: LEVEL_COLORS[course.level], border: `1px solid ${LEVEL_COLORS[course.level]}40`, whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600 }}>
                  {course.level}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{course.provider}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                  <Clock size={12} /> {course.duration}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {course.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.7rem', padding: '2px 9px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={course.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '0.83rem', fontWeight: 600, textDecoration: 'none', marginTop: 4 }}
              >
                <ExternalLink size={13} /> View Course
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesTab;
