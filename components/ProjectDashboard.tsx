import React from 'react';
import { FolderOpen, Trash2, Plus, Home, Calendar, Code } from 'lucide-react';
import Button from './Button';
import { getTemplateById } from '../templates';

export interface Project {
    id: string;
    name: string;
    description: string;
    template: string;
    files: Record<string, string>;
    createdAt: number;
    lastModified: number;
}

interface ProjectDashboardProps {
    projects: Project[];
    onOpenProject: (project: Project) => void;
    onDeleteProject: (projectId: string) => void;
    onNewProject: () => void;
    onBackToHome: () => void;
}

export default function ProjectDashboard({
    projects,
    onOpenProject,
    onDeleteProject,
    onNewProject,
    onBackToHome
}: ProjectDashboardProps) {
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">My Projects</h1>
                            <p className="text-zinc-500">
                                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onBackToHome} className="gap-2">
                                <Home className="w-4 h-4" />
                                Home
                            </Button>
                            <Button variant="primary" onClick={onNewProject} className="gap-2">
                                <Plus className="w-5 h-5" />
                                New Project
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                            <FolderOpen className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No projects yet</h2>
                        <p className="text-zinc-500 mb-8">Create your first project to get started</p>
                        <Button variant="primary" size="lg" onClick={onNewProject} className="gap-2">
                            <Plus className="w-5 h-5" />
                            Create Your First Project
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => {
                            const template = getTemplateById(project.template);
                            return (
                                <div
                                    key={project.id}
                                    className="group relative p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-red-500/10"
                                >
                                    {/* Template Icon */}
                                    <div className="text-4xl mb-4">{template?.icon || '📁'}</div>

                                    {/* Project Info */}
                                    <h3 className="text-xl font-bold mb-2 truncate">{project.name}</h3>
                                    {project.description && (
                                        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}

                                    {/* Metadata */}
                                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6">
                                        <div className="flex items-center gap-1">
                                            <Code className="w-3 h-3" />
                                            {template?.name || 'Unknown'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(project.createdAt)}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => onOpenProject(project)}
                                            className="flex-1"
                                        >
                                            Open
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
                                                    onDeleteProject(project.id);
                                                }
                                            }}
                                            className="!text-red-500 hover:!bg-red-950/30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
