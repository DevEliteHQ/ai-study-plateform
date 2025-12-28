import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Plus, LogOut, User } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await apiClient.getProjects();
      return (result.data || []) as any[];
    },
  });

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Study Platform</h1>
          <p className="text-muted-foreground">
            Transform your learning materials into structured study outputs
          </p>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.name || user.email}</span>
            </div>
          )}
          <Link to="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading projects...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data && data.length > 0 ? (
            data.map((project: any) => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          project.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-800'
                              : project.status === 'FAILED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {project.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {project._count?.documents || 0} documents
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No projects yet. Create your first project to get started!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
