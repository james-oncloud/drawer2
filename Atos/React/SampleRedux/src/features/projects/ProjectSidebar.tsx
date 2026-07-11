import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createProject, selectProject } from './projectsSlice';
import type { CreateProjectPayload } from '../../types';

const PROJECT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function ProjectSidebar() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.projects.items);
  const selectedId = useAppSelector((state) => state.projects.selectedId);
  const status = useAppSelector((state) => state.projects.status);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const payload: CreateProjectPayload = {
      name: name.trim(),
      description: description.trim(),
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
    };

    dispatch(createProject(payload));
    setName('');
    setDescription('');
  };

  return (
    <aside className="sidebar">
      <h2>Projects</h2>
      {status === 'loading' && <p className="muted">Loading projects…</p>}

      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              type="button"
              className={`project-btn ${selectedId === project.id ? 'active' : ''}`}
              onClick={() => dispatch(selectProject(project.id))}
            >
              <span className="project-dot" style={{ background: project.color }} />
              <span>{project.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <form className="project-form" onSubmit={handleCreate}>
        <h3>New project</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          aria-label="Project name"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          rows={2}
          aria-label="Project description"
        />
        <button type="submit" disabled={!name.trim()}>
          Add project
        </button>
      </form>
    </aside>
  );
}
