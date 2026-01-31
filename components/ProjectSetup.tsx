import React, { useState } from 'react';
import { Rocket, Code, ArrowLeft } from 'lucide-react';
import Button from './Button';

interface ProjectSetupProps {
    onCreateProject: (project: {
        name: string;
        description: string;
        template: string;
    }) => void;
    onCancel: () => void;
}

export default function ProjectSetup({ onCreateProject, onCancel }: ProjectSetupProps) {
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');

    const handleCreateProject = () => {
        if (!projectName.trim()) {
            alert('Please enter a project name');
            return;
        }

        onCreateProject({
            name: projectName.trim(),
            description: projectDescription.trim(),
            template: 'blank' // Always use blank template
        });
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Create New Project</h1>
                                <p className="text-sm text-zinc-500">
                                    Start with a clean slate
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-6 py-12 flex justify-center">
                <div className="w-full max-w-2xl">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Project Details</h2>
                        <p className="text-zinc-400">Give your project a name to get started. The AI will help you build the rest.</p>
                    </div>

                    <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur">
                        {/* Project Name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Project Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="my-awesome-app"
                                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                                maxLength={50}
                                autoFocus
                            />
                            <div className="mt-2 text-xs text-zinc-500 flex justify-between">
                                <span>Use dashes for spaces (recommended)</span>
                                <span>{projectName.length}/50</span>
                            </div>
                        </div>

                        {/* Project Description */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="What are we building today?"
                                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                                rows={4}
                                maxLength={200}
                            />
                            <div className="mt-2 text-xs text-zinc-500 text-right">
                                {projectDescription.length}/200
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="mb-8 p-4 rounded-lg bg-red-950/20 border border-red-900/30 flex gap-3 text-red-200/80 text-sm">
                            <Sparkles className="w-5 h-5 flex-shrink-0 text-red-400" />
                            <p>
                                Your project will start with empty files. Use the <strong>Voice Assistant</strong> inside the IDE to generate your initial code (e.g., "Set up a Next.js project").
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t border-zinc-800">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={onCancel}
                                className="flex-1"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleCreateProject}
                                className="flex-1 gap-2 shadow-lg shadow-red-900/20 hover:shadow-red-900/40"
                                disabled={!projectName.trim()}
                            >
                                <Code className="w-5 h-5" />
                                Create Workspace
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}
