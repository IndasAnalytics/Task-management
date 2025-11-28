import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Task, User, TaskStatus } from '../types';

interface TasksPerEmployeeChartProps {
  tasks: Task[];
  users: User[];
  isDark?: boolean;
}

export const TasksPerEmployeeChart: React.FC<TasksPerEmployeeChartProps> = ({ tasks, users, isDark }) => {
  const data = users
    .filter(u => u.role === 'Employee')
    .map(user => ({
      name: user.fullName.split(' ')[0],
      tasks: tasks.filter(task => task.assignedTo.includes(user.id)).length,
    }));

  const axisColor = isDark ? '#9CA3AF' : '#6B7280';
  const gridColor = isDark ? '#374151' : '#E5E7EB';
  const tooltipStyle = {
      backgroundColor: isDark ? '#1F2937' : '#fff',
      borderColor: isDark ? '#374151' : '#E5E7EB',
      color: isDark ? '#F9FAFB' : '#111827',
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
        <XAxis dataKey="name" tick={{fill: axisColor}} fontSize={12} />
        <YAxis allowDecimals={false} tick={{fill: axisColor}} fontSize={12} />
        <Tooltip 
            cursor={{fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(26, 115, 232, 0.1)'}} 
            contentStyle={tooltipStyle}
        />
        <Legend wrapperStyle={{fontSize: '14px'}}/>
        <Bar dataKey="tasks" fill="#1A73E8" name="Assigned Tasks" barSize={30} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface TaskStatusPieChartProps {
    tasks: Task[];
    isDark?: boolean;
}

const COLORS = {
    [TaskStatus.New]: '#1A73E8', // Primary Blue
    [TaskStatus.InProgress]: '#FFA726', // Warning Orange
    [TaskStatus.OnHold]: '#a855f7', // Purple
    [TaskStatus.AwaitingApproval]: '#eab308', // Yellow
    [TaskStatus.Done]: '#2ECC71', // Success Green
    [TaskStatus.Overdue]: '#E53935', // Danger Red
    [TaskStatus.Rejected]: '#6B7280', // Gray
};

export const TaskStatusPieChart: React.FC<TaskStatusPieChartProps> = ({ tasks, isDark }) => {
    const data = Object.values(TaskStatus).map(status => ({
        name: status,
        value: tasks.filter(task => task.status === status).length,
    })).filter(item => item.value > 0);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={5}
                    cornerRadius={8}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as TaskStatus]} stroke={isDark ? '#1F2937' : '#fff'} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{
                     backgroundColor: isDark ? '#1F2937' : '#fff',
                     borderColor: isDark ? '#374151' : '#E5E7EB',
                     color: isDark ? '#F9FAFB' : '#111827',
                }}/>
                <Legend iconType="circle" wrapperStyle={{fontSize: '14px'}}/>
            </PieChart>
        </ResponsiveContainer>
    );
};