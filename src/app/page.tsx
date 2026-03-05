'use client';

import { Sidebar, Header, DashboardView, ProjectsView, TasksView } from '@/components';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function TaskFlowDashboard() {
  const {
    projects,
    tasks,
    enrichedProjects,
    stats,
    filteredTasks,
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
  } = useDashboardData();

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        onlyMyTasks={onlyMyTasks}
        onTabChange={handleTabChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeTab={activeTab} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          {activeTab === 'dashboard' && (
            <DashboardView
              projects={enrichedProjects}
              stats={stats}
              selectedProjectId={selectedProjectId}
              onProjectClick={handleDrillDown}
              onClearFilter={clearProjectFilter}
              onViewTasks={() => handleTabChange('tasks', false)}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={enrichedProjects}
              selectedProjectId={selectedProjectId}
              onProjectClick={handleDrillDown}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={filteredTasks}
              projects={projects}
              selectedProjectId={selectedProjectId}
              onlyMyTasks={onlyMyTasks}
              searchQuery={searchQuery}
              currentPage={currentPage}
              onSearchChange={setSearchQuery}
              onPageChange={setCurrentPage}
              onClearFilter={clearProjectFilter}
            />
          )}
        </main>
      </div>
    </div>
  );
}
