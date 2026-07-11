import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addTask } from './tasksSlice';
import type { CreateTaskPayload, TaskPriority } from '../../types';

export function TaskForm() {
  const dispatch = useAppDispatch();
  const selectedProjectId = useAppSelector((state) => state.projects.selectedId);
  const mutationStatus = useAppSelector((state) => state.tasks.mutationStatus);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !selectedProjectId) return;

    const payload: CreateTaskPayload = {
      projectId: selectedProjectId,
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
    };

    dispatch(addTask(payload));
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
  };

  if (!selectedProjectId) {
    return <p className="muted">Select a project to add tasks.</p>;
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>Add task</h3>
      <div className="form-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          aria-label="Task title"
          required
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          aria-label="Priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due date"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        aria-label="Task description"
      />
      <button type="submit" disabled={!title.trim() || mutationStatus === 'loading'}>
        {mutationStatus === 'loading' ? 'Saving…' : 'Create task'}
      </button>
    </form>
  );
}
