export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular?: boolean;
  files: Record<string, string>;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Empty canvas - Let AI build your stack',
    icon: '✨',
    files: {
      'README.md': '# New Codexia Project\n\nStart coding or ask AI to set up your environment.'
    }
  }
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(t => t.id === id) || PROJECT_TEMPLATES[0];
}
