import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { OutputType } from '@/types';
import { ArrowLeft, Upload, Link as LinkIcon, FileText } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  outputType: z.enum([
    'SUMMARY',
    'QUESTION_BANK',
    'MOCK_EXAM',
    'CRASH_COURSE',
    'REVISION_NOTES',
    'INTERVIEW_PREP',
    'CUSTOM',
  ]),
  promptId: z.string().optional(),
  promptContent: z.string().optional(),
  blueprintId: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<
    Array<{ type: 'PDF' | 'URL' | 'TEXT'; source: string; fileName?: string }>
  >([]);
  const [activeTab, setActiveTab] = useState<'pdf' | 'url' | 'text'>('pdf');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const { data: prompts } = useQuery<any[]>({
    queryKey: ['prompts'],
    queryFn: async () => {
      const result = await apiClient.getPrompts();
      return (result.data || []) as any[];
    },
  });

  const { data: blueprints } = useQuery<any[]>({
    queryKey: ['blueprints'],
    queryFn: async () => {
      const result = await apiClient.getBlueprints();
      return (result.data || []) as any[];
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const result = await apiClient.uploadFile(selectedFile);
      if (result.success && result.data) {
        const data = result.data as any;
        setDocuments([
          ...documents,
          {
            type: 'PDF',
            source: data.path,
            fileName: data.fileName,
          },
        ]);
      }
    }
  };

  const handleAddUrl = () => {
    if (url.trim()) {
      setDocuments([...documents, { type: 'URL', source: url.trim() }]);
      setUrl('');
    }
  };

  const handleAddText = () => {
    if (text.trim()) {
      setDocuments([...documents, { type: 'TEXT', source: text.trim() }]);
      setText('');
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (documents.length === 0) {
      alert('Please add at least one document');
      return;
    }

    const result = await apiClient.createProject({
      ...data,
      documents,
    });

    if (result.success && result.data) {
      navigate(`/projects/${(result.data as any).projectId}`);
    } else {
      alert(result.error || 'Failed to create project');
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Upload your learning materials and configure the transformation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" {...register('name')} placeholder="e.g., JEE Physics Prep" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outputType">Output Type *</Label>
              <Select
                value={watch('outputType')}
                onValueChange={value => setValue('outputType', value as OutputType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select output type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUMMARY">Summary</SelectItem>
                  <SelectItem value="QUESTION_BANK">Question Bank</SelectItem>
                  <SelectItem value="MOCK_EXAM">Mock Exam</SelectItem>
                  <SelectItem value="CRASH_COURSE">Crash Course</SelectItem>
                  <SelectItem value="REVISION_NOTES">Revision Notes</SelectItem>
                  <SelectItem value="INTERVIEW_PREP">Interview Prep</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.outputType && (
                <p className="text-sm text-red-500">{errors.outputType.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Add Documents *</Label>
              <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pdf">
                    <Upload className="mr-2 h-4 w-4" />
                    PDF
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <FileText className="mr-2 h-4 w-4" />
                    Text
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pdf" className="space-y-2">
                  <Input type="file" accept=".pdf" onChange={handleFileUpload} />
                </TabsContent>
                <TabsContent value="url" className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/article"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddUrl}>
                      Add
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="text" className="space-y-2">
                  <Textarea
                    placeholder="Paste your text content here"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={5}
                  />
                  <Button type="button" onClick={handleAddText}>
                    Add Text
                  </Button>
                </TabsContent>
              </Tabs>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Added Documents ({documents.length})</Label>
                  <div className="space-y-1">
                    {documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <span className="text-sm">
                          {doc.type}: {doc.fileName || doc.source.substring(0, 50)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="promptId">Prompt (Optional)</Label>
              <Select
                value={watch('promptId') || ''}
                onValueChange={value => setValue('promptId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a saved prompt" />
                </SelectTrigger>
                <SelectContent>
                  {prompts?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                {...register('promptContent')}
                placeholder="Or enter custom prompt content"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blueprintId">Context Blueprint (Optional)</Label>
              <Select
                value={watch('blueprintId') || ''}
                onValueChange={value => setValue('blueprintId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a blueprint" />
                </SelectTrigger>
                <SelectContent>
                  {blueprints?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
