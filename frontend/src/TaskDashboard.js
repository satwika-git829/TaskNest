// src/TaskDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    axios.get('http://localhost:5000/api/tasks').then(res => setTasks(res.data));
  }, [tasks.length]); // Refresh when tasks change

  return (
    <div className="bg-gradient-to-br from-violet-100 to-indigo-100 shadow-lg rounded-xl w-80 p-6">
      <h2 className="font-bold text-indigo-700 text-2xl mb-2">Dashboard</h2>
      {tasks.length === 0 ? (
        <div className="text-indigo-500">No tasks yet.</div>
      ) : (
        <ul className="divide-y divide-indigo-200">
          {tasks.map(task => (
            <li key={task._id || task.title} className="py-2 flex flex-col">
              <span className="font-semibold text-indigo-800">{task.title}</span>
              <span className="text-indigo-600 text-sm">{task.description}</span>
              <span className="text-xs">
                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                {" • "}{task.priority}{" • "}{task.tag}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
