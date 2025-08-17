import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Plus, Image, Type, Layout, Settings } from "lucide-react";
import type { ContentSection, PropertyImage } from "@shared/schema";

interface EditableContentProps {
  section: ContentSection;
  onSave: (sectionKey: string, updates: { title: string; content: string }) => void;
  isLoading: boolean;
}

function EditableContent({ section, onSave, isLoading }: EditableContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);

  const handleSave = () => {
    onSave(section.sectionKey, { title, content });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(section.title);
    setContent(section.content);
    setIsEditing(false);
  };

  const metadata = section.metadata ? JSON.parse(section.metadata) : {};
  const inputType = metadata.type || "text";

  return (
    <Card className="mb-4" data-testid={`content-card-${section.sectionKey}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Type className="w-4 h-4" />
          {section.title}
          <Badge variant="outline" className="text-xs">
            {section.sectionKey}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                data-testid={`button-save-${section.sectionKey}`}
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
                data-testid={`button-cancel-${section.sectionKey}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              data-testid={`button-edit-${section.sectionKey}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${section.sectionKey}`}>Title</Label>
              <Input
                id={`title-${section.sectionKey}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid={`input-title-${section.sectionKey}`}
              />
            </div>
            <div>
              <Label htmlFor={`content-${section.sectionKey}`}>Content</Label>
              {inputType === "textarea" ? (
                <Textarea
                  id={`content-${section.sectionKey}`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  data-testid={`textarea-content-${section.sectionKey}`}
                />
              ) : (
                <Input
                  id={`content-${section.sectionKey}`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  data-testid={`input-content-${section.sectionKey}`}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {inputType === "textarea" ? (
                content.split('\n').map((line, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {line || '\u00A0'}
                  </p>
                ))
              ) : (
                <p>{content}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ImageManagerProps {
  category: "exterior" | "interior" | "amenity";
  images: PropertyImage[];
  onAdd: (image: Omit<PropertyImage, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<PropertyImage>) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

function ImageManager({ category, images, onAdd, onUpdate, onDelete, isLoading }: ImageManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newImage, setNewImage] = useState({
    url: "",
    title: "",
    description: "",
    sortOrder: 0
  });

  const handleAddImage = () => {
    if (newImage.url) {
      onAdd({
        ...newImage,
        category,
        isActive: "true"
      });
      setNewImage({ url: "", title: "", description: "", sortOrder: 0 });
      setIsAdding(false);
    }
  };

  const handleUpdateImage = (id: string, updates: Partial<PropertyImage>) => {
    onUpdate(id, updates);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
          <Image className="w-5 h-5" />
          {category} Images ({images.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          data-testid={`button-add-${category}-image`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add New {category} Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`new-${category}-url`}>Image URL</Label>
              <Input
                id={`new-${category}-url`}
                placeholder="https://example.com/image.jpg"
                value={newImage.url}
                onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                data-testid={`input-new-${category}-url`}
              />
            </div>
            <div>
              <Label htmlFor={`new-${category}-title`}>Title</Label>
              <Input
                id={`new-${category}-title`}
                placeholder="Image title"
                value={newImage.title}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                data-testid={`input-new-${category}-title`}
              />
            </div>
            <div>
              <Label htmlFor={`new-${category}-description`}>Description</Label>
              <Textarea
                id={`new-${category}-description`}
                placeholder="Image description"
                value={newImage.description}
                onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                data-testid={`textarea-new-${category}-description`}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddImage} disabled={isLoading || !newImage.url}>
                <Save className="w-4 h-4 mr-2" />
                Add Image
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={image.url}
                alt={image.title || "Property image"}
                className="w-full h-full object-cover"
                data-testid={`img-${category}-${image.id}`}
              />
            </div>
            <CardContent className="p-4">
              {editingId === image.id ? (
                <EditImageForm
                  image={image}
                  onSave={(updates) => handleUpdateImage(image.id, updates)}
                  onCancel={() => setEditingId(null)}
                  isLoading={isLoading}
                />
              ) : (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{image.title || "Untitled"}</h4>
                  <p className="text-xs text-muted-foreground">{image.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(image.id)}
                      data-testid={`button-edit-image-${image.id}`}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(image.id)}
                      disabled={isLoading}
                      data-testid={`button-delete-image-${image.id}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface EditImageFormProps {
  image: PropertyImage;
  onSave: (updates: Partial<PropertyImage>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function EditImageForm({ image, onSave, onCancel, isLoading }: EditImageFormProps) {
  const [title, setTitle] = useState(image.title || "");
  const [description, setDescription] = useState(image.description || "");
  const [url, setUrl] = useState(image.url);

  const handleSave = () => {
    onSave({ title, description, url });
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-sm"
      />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="text-sm"
      />
      <Input
        placeholder="Image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={isLoading}>
          <Save className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export default function Editor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch content sections
  const { data: contentSections = [], isLoading: loadingContent } = useQuery<ContentSection[]>({
    queryKey: ["/api/content"],
  });

  // Fetch images by category
  const { data: exteriorImages = [], isLoading: loadingExterior } = useQuery<PropertyImage[]>({
    queryKey: ["/api/images", "exterior"],
    queryFn: async () => {
      const response = await fetch("/api/images?category=exterior");
      if (!response.ok) throw new Error("Failed to fetch images");
      return response.json();
    },
  });

  const { data: interiorImages = [], isLoading: loadingInterior } = useQuery<PropertyImage[]>({
    queryKey: ["/api/images", "interior"],
    queryFn: async () => {
      const response = await fetch("/api/images?category=interior");
      if (!response.ok) throw new Error("Failed to fetch images");
      return response.json();
    },
  });

  const { data: amenityImages = [], isLoading: loadingAmenity } = useQuery<PropertyImage[]>({
    queryKey: ["/api/images", "amenity"],
    queryFn: async () => {
      const response = await fetch("/api/images?category=amenity");
      if (!response.ok) throw new Error("Failed to fetch images");
      return response.json();
    },
  });

  // Content mutations
  const updateContentMutation = useMutation({
    mutationFn: async ({ sectionKey, updates }: { sectionKey: string; updates: { title: string; content: string } }) => {
      const response = await fetch(`/api/content/${sectionKey}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Content Updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Image mutations
  const addImageMutation = useMutation({
    mutationFn: async (image: Omit<PropertyImage, 'id'>) => {
      const response = await fetch("/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(image),
      });
      if (!response.ok) throw new Error("Failed to add image");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/images", variables.category] });
      toast({
        title: "Image Added",
        description: "New image has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PropertyImage> }) => {
      const response = await fetch(`/api/images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update image");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      toast({
        title: "Image Updated",
        description: "Image has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/images/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete image");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      toast({
        title: "Image Deleted",
        description: "Image has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleContentUpdate = (sectionKey: string, updates: { title: string; content: string }) => {
    updateContentMutation.mutate({ sectionKey, updates });
  };

  const handleAddImage = (image: Omit<PropertyImage, 'id'>) => {
    addImageMutation.mutate(image);
  };

  const handleUpdateImage = (id: string, updates: Partial<PropertyImage>) => {
    updateImageMutation.mutate({ id, updates });
  };

  const handleDeleteImage = (id: string) => {
    deleteImageMutation.mutate(id);
  };

  const isLoading = updateContentMutation.isPending || addImageMutation.isPending || 
                   updateImageMutation.isPending || deleteImageMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary">Visual Editor</h1>
                <p className="text-sm text-muted-foreground">Manage your rental property content</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Settings className="w-3 h-3" />
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text Content
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Images
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Content Management</h2>
                <p className="text-muted-foreground">
                  Edit text content that appears on your rental property website
                </p>
              </div>
            </div>

            <Separator />

            {loadingContent ? (
              <div className="text-center py-8">Loading content...</div>
            ) : (
              <div className="space-y-4">
                {(contentSections as ContentSection[]).map((section) => (
                  <EditableContent
                    key={section.sectionKey}
                    section={section}
                    onSave={handleContentUpdate}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Image Management</h2>
                <p className="text-muted-foreground">
                  Manage images for exterior, interior, and amenity sections
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-8">
              <ImageManager
                category="exterior"
                images={exteriorImages}
                onAdd={handleAddImage}
                onUpdate={handleUpdateImage}
                onDelete={handleDeleteImage}
                isLoading={isLoading}
              />

              <Separator />

              <ImageManager
                category="interior"
                images={interiorImages}
                onAdd={handleAddImage}
                onUpdate={handleUpdateImage}
                onDelete={handleDeleteImage}
                isLoading={isLoading}
              />

              <Separator />

              <ImageManager
                category="amenity"
                images={amenityImages}
                onAdd={handleAddImage}
                onUpdate={handleUpdateImage}
                onDelete={handleDeleteImage}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}