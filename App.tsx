import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureSection from './components/FeatureSection';
import IdeDemo from './components/IdeDemo';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import WebIde from './components/WebIde';
import ProjectSetup from './components/ProjectSetup';
import ProjectDashboard, { type Project } from './components/ProjectDashboard';
import PageTransition from './components/PageTransition';
import { getTemplateById } from './templates';

const PROJECTS_KEY = 'codexia_projects';

type View = 'landing' | 'project-setup' | 'project-dashboard' | 'ide';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (stored) {
      try {
        setProjects(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load projects:', e);
      }
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  const handleCreateProject = (config: { name: string; description: string; template: string }) => {
    const template = getTemplateById(config.template);
    if (!template) return;

    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      description: config.description,
      template: config.template,
      files: { ...template.files },
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    setView('ide'); // Go directly to IDE
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    setView('ide');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const handleUpdateProject = (updatedFiles: Record<string, string>) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      lastModified: Date.now()
    };

    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
  };

  const handleExitIde = () => {
    setView('project-dashboard');
    setCurrentProject(null);
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'ide' && currentProject ? (
        <PageTransition key="ide">
          <WebIde project={currentProject} onExit={handleExitIde} onUpdateFiles={handleUpdateProject} />
        </PageTransition>
      ) : view === 'project-setup' ? (
        <PageTransition key="project-setup">
          <ProjectSetup
            onCreateProject={handleCreateProject}
            onCancel={() => setView(projects.length > 0 ? 'project-dashboard' : 'landing')}
          />
        </PageTransition>
      ) : view === 'project-dashboard' ? (
        <PageTransition key="project-dashboard">
          <ProjectDashboard
            projects={projects}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            onNewProject={() => setView('project-setup')}
            onBackToHome={() => setView('landing')}
          />
        </PageTransition>
      ) : (
        <PageTransition key="landing">
          <div className="min-h-screen bg-background text-white selection:bg-purple-500/30 selection:text-purple-200">
            <Navbar onStartCoding={() => setView('project-setup')} />
            <main>
              <Hero onStartCoding={() => setView('project-setup')} />
              <FeatureSection />
              <IdeDemo />
              <Pricing />
            </main>
            <Footer />
          </div>
        </PageTransition>
      )}
    </AnimatePresence>
  );
};

export default App;