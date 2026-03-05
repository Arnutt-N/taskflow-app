// hooks/useDashboardData.ts
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Project, Task, Stats, TabType } from '@/types';
import { generateMockData } from '@/data/mockData';

export const useDashboardData = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/data');
        
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await res.json();
        
        if (data.success) {
          // If no data, use mock data as fallback
          if (data.projects.length === 0 && data.tasks.length === 0) {
            const mock = generateMockData();
            setProjects(mock.projects);
            setTasks(mock.tasks);
          } else {
            setProjects(data.projects);
            setTasks(data.tasks);
          }
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError((err as Error).message);
        // Fallback to mock data
        const mock = generateMockData();
        setProjects(mock.projects);
        setTasks(mock.tasks);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh data function (call after import)
  const refreshData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data');
      const data = await res.json();
      
      if (data.success) {
        setProjects(data.projects);
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  const enrichedProjects = useMemo(() => {
    return projects.map(p => {
      const pTasks = tasks.filter(t => t.projectId === p.id);
      const profit = (p.revenue || 0) - (p.budget || 0);
      const margin = p.revenue ? Math.round((profit / p.revenue) * 100) : 0;
      const totalTasks = pTasks.length;
      const doneTasks = pTasks.filter(t => ['Done', 'Completed'].includes(t.status)).length;
      const taskProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : p.progress;

      return { 
        ...p, 
        profit, 
        margin, 
        calculatedProgress: taskProgress, 
        taskCount: totalTasks, 
        doneTasks 
      };
    });
  }, [projects, tasks]);

  const stats: Stats = useMemo(() => {
    const scopedProjects = selectedProjectId
      ? enrichedProjects.filter(p => p.id === selectedProjectId)
      : enrichedProjects;

    const scopedTasks = selectedProjectId
      ? tasks.filter(t => t.projectId === selectedProjectId)
      : tasks;

    return {
      totalCost: scopedProjects.reduce((acc, curr) => acc + (curr.budget || 0), 0),
      totalRevenue: scopedProjects.reduce((acc, curr) => acc + (curr.revenue || 0), 0),
      totalProfit: scopedProjects.reduce((acc, curr) => acc + (curr.profit || 0), 0),
      tasks: {
        total: scopedTasks.length,
        done: scopedTasks.filter(t => ['Done', 'Completed'].includes(t.status)).length,
        inProgress: scopedTasks.filter(t => t.status === 'In Progress').length,
        todo: scopedTasks.filter(t => t.status === 'Todo').length,
      }
    };
  }, [enrichedProjects, tasks, selectedProjectId]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (selectedProjectId) result = result.filter(t => t.projectId === selectedProjectId);
    if (onlyMyTasks) result = result.filter(t => t.assignee === 'Wichai');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tasks, selectedProjectId, onlyMyTasks, searchQuery]);

  const handleTabChange = (tab: TabType, myTasks?: boolean) => {
    setActiveTab(tab);
    if (myTasks !== undefined) setOnlyMyTasks(myTasks);
    setCurrentPage(1);
  };

  const handleDrillDown = (projectId: string) => {
    setSelectedProjectId(projectId);
    setOnlyMyTasks(false);
    setActiveTab('tasks');
  };

  const clearProjectFilter = () => {
    setSelectedProjectId(null);
  };

  return {
    projects,
    tasks,
    enrichedProjects,
    stats,
    filteredTasks,
    loading,
    error,
    activeTab,
    selectedProjectId,
    searchQuery,
    onlyMyTasks,
    currentPage,
    setSearchQuery,
    setCurrentPage,
    handleTabChange,
    handleDrillDown,
    clearProjectFilter,
    refreshData,
  };
};
