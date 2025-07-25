import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Download, 
  Search, 
  Filter, 
  FileText, 
  Video, 
  Headphones, 
  BookOpen,
  Star,
  Eye,
  Calendar,
  HardDrive
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description?: string;
  category: string;
  resource_type: string;
  file_url?: string;
  file_size_mb?: number;
  download_count: number;
  is_premium: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    'Anxiety & Stress',
    'Depression Support',
    'Mindfulness & Meditation',
    'Sleep & Relaxation',
    'Therapy Tools',
    'Self-Help Guides',
    'Coping Strategies',
    'Wellness Activities'
  ];

  const resourceTypes = [
    { value: 'pdf', label: 'PDF Documents', icon: FileText },
    { value: 'audio', label: 'Audio Files', icon: Headphones },
    { value: 'video', label: 'Video Content', icon: Video },
    { value: 'worksheet', label: 'Worksheets', icon: BookOpen },
    { value: 'guide', label: 'Guides', icon: BookOpen }
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedCategory, selectedType]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.resource_type === selectedType);
    }

    setFilteredResources(filtered);
  };

  const getResourceIcon = (type: string) => {
    const resourceType = resourceTypes.find(rt => rt.value === type);
    const IconComponent = resourceType?.icon || FileText;
    return <IconComponent className="w-6 h-6" />;
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'audio':
        return 'bg-purple-100 text-purple-800';
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'worksheet':
        return 'bg-green-100 text-green-800';
      case 'guide':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${Math.round(sizeInMB * 1024)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const handleDownload = async (resource: Resource) => {
    if (!resource.file_url) return;

    try {
      // Increment download count
      await supabase
        .from('resources')
        .update({ download_count: resource.download_count + 1 })
        .eq('id', resource.id);

      // Trigger download
      const link = document.createElement('a');
      link.href = resource.file_url;
      link.download = resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update local state
      setResources(prev => 
        prev.map(r => 
          r.id === resource.id 
            ? { ...r, download_count: r.download_count + 1 }
            : r
        )
      );
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-u-recover-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Mental Health Resources
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Access our comprehensive library of mental health resources including guides, worksheets, 
            audio content, and tools to support your wellness journey.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {resources.filter(r => r.resource_type === 'pdf').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">PDF Guides</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Headphones className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {resources.filter(r => r.resource_type === 'audio').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Audio Files</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {resources.filter(r => r.resource_type === 'worksheet').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Worksheets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Download className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {resources.reduce((sum, r) => sum + r.download_count, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search resources by title, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-u-recover-green dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-u-recover-green dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="all">All Types</option>
                  {resourceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-u-recover-green bg-opacity-10 rounded-lg">
                      {getResourceIcon(resource.resource_type)}
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getResourceTypeColor(resource.resource_type)}`}>
                        {resourceTypes.find(rt => rt.value === resource.resource_type)?.label || resource.resource_type}
                      </span>
                    </div>
                  </div>
                  {resource.is_premium && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {resource.title}
                </h3>

                {resource.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {resource.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="px-2 py-1 bg-u-recover-green bg-opacity-10 text-u-recover-green text-xs rounded-full">
                    {resource.category}
                  </span>
                  <div className="flex items-center space-x-3">
                    {resource.file_size_mb && (
                      <div className="flex items-center space-x-1">
                        <HardDrive className="w-3 h-3" />
                        <span>{formatFileSize(resource.file_size_mb)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>{resource.download_count}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Added {new Date(resource.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    onClick={() => handleDownload(resource)}
                    disabled={!resource.file_url}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && !loading && (
          <div className="text-center py-12">
            <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No resources found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or browse all resources.
            </p>
          </div>
        )}

        {/* Resource Categories */}
        {searchTerm === '' && selectedCategory === 'all' && selectedType === 'all' && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-center"
                >
                  <BookOpen className="w-6 h-6 text-u-recover-green mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {category}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {resources.filter(r => r.category === category).length} resources
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-16 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Need Help Finding Resources?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Our mental health professionals have curated these resources to support your wellness journey. 
              If you need personalized recommendations, consider speaking with one of our counsellors.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Talk to a Counsellor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};