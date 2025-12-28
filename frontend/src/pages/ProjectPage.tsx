import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery<{
    id: string;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    documents?: Array<{
      id: string;
      type: string;
      fileName?: string;
      source: string;
      status: string;
    }>;
    outputs?: Array<{ id: string; type: string; status: string; notionPageUrl?: string }>;
  }>({
    queryKey: ['project', id],
    queryFn: async () => {
      const result = await apiClient.getProject(id!);
      return result.data as any;
    },
    enabled: !!id,
    refetchInterval: query => {
      // Poll if project is still processing
      const data = query.state.data;
      return data?.status === 'PROCESSING' ? 3000 : false;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Project not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
        {project.description && <p className="text-muted-foreground">{project.description}</p>}
        <div className="mt-4 flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}
          >
            {project.status}
          </span>
          <span className="text-sm text-muted-foreground">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {project.status === 'PROCESSING' && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>This may take a few minutes</span>
              </div>
              <Progress value={50} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>{project.documents?.length || 0} documents added</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.documents?.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex justify-between items-center p-2 bg-muted rounded"
                >
                  <div>
                    <p className="text-sm font-medium">{doc.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.fileName || doc.source.substring(0, 40)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Outputs</CardTitle>
            <CardDescription>{project.outputs?.length || 0} outputs generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.outputs?.map((output: any) => (
                <div
                  key={output.id}
                  className="flex justify-between items-center p-2 bg-muted rounded"
                >
                  <div>
                    <p className="text-sm font-medium">{output.type}</p>
                    {output.notionPageUrl && (
                      <a
                        href={output.notionPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View in Notion <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(output.status)}`}>
                    {output.status}
                  </span>
                </div>
              ))}
              {(!project.outputs || project.outputs.length === 0) && (
                <p className="text-sm text-muted-foreground">No outputs generated yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
