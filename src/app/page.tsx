'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Copy,
  Download,
  Loader2,
  UploadCloud,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  getCaption,
  getHashtags,
  getTextColor,
} from '@/app/actions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { InstaCraftLogo } from '@/components/icons';

const formSchema = z.object({
  imageDescription: z.string().optional(),
  caption: z.string().optional(),
  textOverlayContent: z.string().optional(),
  textOverlayFont: z.string().default('Poppins'),
  textOverlayColor: z.string().default('#FFFFFF'),
  textOverlaySize: z.number().min(10).max(100).default(32),
  textOverlayShadow: z.boolean().default(true),
  textOverlayOutline: z.boolean().default(false),
  exportAspectRatio: z.string().default('1:1'),
  exportFitMode: z.string().default('fill'),
});

type FormValues = z.infer<typeof formSchema>;

type TextOverlayBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function InstaCraftPage() {
  const [image, setImage] = React.useState<{ url: string; dataUri: string } | null>(null);
  const [hashtags, setHashtags] = React.useState<string[]>([]);
  const [loadingStates, setLoadingStates] = React.useState({
    caption: false,
    hashtags: false,
    contrast: false,
  });

  const [textOverlayBox, setTextOverlayBox] = React.useState<TextOverlayBox>({
    x: 25,
    y: 40,
    width: 50,
    height: 20,
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState<string | null>(null);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imagePreviewRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageDescription: '',
      caption: '',
      textOverlayContent: 'Your Text Here',
      textOverlayFont: 'Poppins',
      textOverlayColor: '#FFFFFF',
      textOverlaySize: 32,
      textOverlayShadow: true,
      textOverlayOutline: false,
      exportAspectRatio: '1:1',
      exportFitMode: 'fill',
    },
  });

  const watchedValues = form.watch();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setImage({ url, dataUri });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCaption = async () => {
    setLoadingStates((s) => ({ ...s, caption: true }));
    const result = await getCaption(watchedValues.imageDescription || 'A beautiful picture.');
    if (result.caption) {
      form.setValue('caption', result.caption);
      toast({ title: 'Caption Generated!', description: 'The AI has generated a new caption for your image.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoadingStates((s) => ({ ...s, caption: false }));
  };

  const handleGenerateHashtags = async () => {
    if (!image) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please upload an image first.' });
      return;
    }
    setLoadingStates((s) => ({ ...s, hashtags: true }));
    const result = await getHashtags(image.dataUri, watchedValues.caption || '');
    if (result.hashtags) {
      setHashtags(result.hashtags);
      toast({ title: 'Hashtags Generated!', description: 'AI-powered hashtags are ready.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoadingStates((s) => ({ ...s, hashtags: false }));
  };

  const handleAdjustContrast = async () => {
    if (!image) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please upload an image first.' });
      return;
    }
    setLoadingStates((s) => ({ ...s, contrast: true }));
    const result = await getTextColor(image.dataUri, watchedValues.textOverlayColor || '#FFFFFF');
    if (result.adjustedTextColor) {
      form.setValue('textOverlayColor', result.adjustedTextColor);
      toast({ title: 'Color Adjusted!', description: 'AI has picked a new color for better contrast.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoadingStates((s) => ({ ...s, contrast: false }));
  };

  const copyHashtags = () => {
    if (hashtags.length > 0) {
      navigator.clipboard.writeText(hashtags.join(' '));
      toast({ title: 'Copied!', description: 'Hashtags copied to clipboard.' });
    }
  };

  const getTextShadow = (hasShadow: boolean, hasOutline: boolean, color: string) => {
    if (hasOutline) {
      const outlineColor = color === '#FFFFFF' ? '#000000' : '#FFFFFF';
      return `
        -1px -1px 0 ${outlineColor},  
         1px -1px 0 ${outlineColor},
        -1px  1px 0 ${outlineColor},
         1px  1px 0 ${outlineColor}
      `;
    }
    if (hasShadow) {
      return '2px 2px 4px rgba(0, 0, 0, 0.7)';
    }
    return 'none';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: 'drag' | 'resize', cursor?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'drag') setIsDragging(true);
    if (type === 'resize' && cursor) setIsResizing(cursor);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging && !isResizing) return;
    if (!imagePreviewRef.current) return;

    const rect = imagePreviewRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.y) / rect.height) * 100;

    setTextOverlayBox(prev => {
      let { x, y, width, height } = prev;

      if (isDragging) {
        x += dx;
        y += dy;
      }

      if (isResizing) {
        if (isResizing.includes('right')) {
          width += dx;
        }
        if (isResizing.includes('left')) {
          width -= dx;
          x += dx;
        }
        if (isResizing.includes('bottom')) {
          height += dy;
        }
        if (isResizing.includes('top')) {
          height -= dy;
          y += dy;
        }
      }
      
      // Clamp values to be within the container
      width = Math.max(10, Math.min(width, 100));
      height = Math.max(10, Math.min(height, 100));
      x = Math.max(0, Math.min(x, 100 - width));
      y = Math.max(0, Math.min(y, 100 - height));

      return { x, y, width, height };
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [dragStart, isDragging, isResizing]);

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);


  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <InstaCraftLogo className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-xl font-bold font-headline">InstaCraft</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Image Preview</CardTitle>
                <CardDescription>Upload an image to start crafting your post.</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  ref={imagePreviewRef}
                  className="relative w-full aspect-square bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden"
                >
                  {image ? (
                    <>
                      <Image 
                        src={image.url} 
                        alt="Preview" 
                        fill 
                        className={`object-${watchedValues.exportFitMode === 'cover' ? 'cover' : 'contain'} rounded-md`}
                      />
                      {watchedValues.textOverlayContent && (
                        <div
                          className="absolute p-2 border-2 border-dashed border-white/50 cursor-move hover:border-white"
                          style={{
                            left: `${textOverlayBox.x}%`,
                            top: `${textOverlayBox.y}%`,
                            width: `${textOverlayBox.width}%`,
                            height: `${textOverlayBox.height}%`,
                            boxSizing: 'border-box',
                          }}
                          onMouseDown={(e) => handleMouseDown(e, 'drag')}
                        >
                           <div className="w-full h-full flex items-center justify-center">
                              <span
                                style={{
                                  fontFamily: watchedValues.textOverlayFont,
                                  fontSize: `${watchedValues.textOverlaySize}px`,
                                  color: watchedValues.textOverlayColor,
                                  textShadow: getTextShadow(!!watchedValues.textOverlayShadow, !!watchedValues.textOverlayOutline, watchedValues.textOverlayColor),
                                  textAlign: 'center',
                                  lineHeight: 1.2,
                                }}
                              >
                                {watchedValues.textOverlayContent}
                              </span>
                           </div>

                          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(handle => (
                            <div
                              key={handle}
                              className="absolute w-3 h-3 bg-white border border-gray-800 rounded-full"
                              style={{
                                top: handle.includes('top') ? -6 : undefined,
                                bottom: handle.includes('bottom') ? -6 : undefined,
                                left: handle.includes('left') ? -6 : undefined,
                                right: handle.includes('right') ? -6 : undefined,
                                cursor: `${handle.split('-')[0][0]}${handle.split('-')[1][0]}-resize`,
                              }}
                              onMouseDown={(e) => handleMouseDown(e, 'resize', `${handle.split('-')[0][0]}${handle.split('-')[1][0]}-resize`)}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">Upload your image</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Click the button below to select a photo</p>
                      <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="mr-2" />
                        Upload Image
                      </Button>
                    </div>
                  )}
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Form {...form}>
              <form className="space-y-6">
                <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">
                      Caption & Hashtags
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="imageDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image Context</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. A happy dog playing in the park" {...field} />
                            </FormControl>
                            <FormDescription>Give the AI some context for a better caption.</FormDescription>
                          </FormItem>
                        )}
                      />

                      <Button type="button" className="w-full" onClick={handleGenerateCaption} disabled={loadingStates.caption}>
                        {loadingStates.caption ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                        Generate Caption with AI
                      </Button>

                      <FormField
                        control={form.control}
                        name="caption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Caption</FormLabel>
                            <FormControl>
                              <Textarea rows={5} placeholder="Your amazing caption..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-2">
                        <Label>Hashtags</Label>
                        <div className="p-3 bg-muted/50 rounded-lg min-h-[60px] flex flex-wrap gap-2">
                          {hashtags.length > 0 ? (
                            hashtags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)
                          ) : (
                            <p className="text-sm text-muted-foreground">Generate hashtags based on your image and caption.</p>
                          )}
                        </div>
                         <div className="flex gap-2">
                           <Button type="button" variant="outline" className="w-full" onClick={handleGenerateHashtags} disabled={loadingStates.hashtags || !image}>
                            {loadingStates.hashtags ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                            Generate Hashtags
                          </Button>
                          <Button type="button" size="icon" variant="ghost" onClick={copyHashtags} disabled={hashtags.length === 0}>
                            <Copy />
                          </Button>
                         </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-semibold">Text Overlay</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                       <FormField
                        control={form.control}
                        name="textOverlayContent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Content</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter your text..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="textOverlayFont"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Font</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select a font" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Poppins">Poppins</SelectItem>
                                    <SelectItem value="Arial">Arial</SelectItem>
                                    <SelectItem value="Georgia">Georgia</SelectItem>
                                    <SelectItem value="'Source Code Pro', monospace" className="font-code">Source Code Pro</SelectItem>
                                </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        <FormField
                          control={form.control}
                          name="textOverlayColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color</FormLabel>
                              <div className="flex gap-2 items-center">
                                <FormControl>
                                  <Input type="color" className="p-1 h-10 w-14" {...field} />
                                </FormControl>
                                 <Button type="button" variant="ghost" size="icon" onClick={handleAdjustContrast} disabled={loadingStates.contrast || !image}>
                                   <Wand2 />
                                 </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                       <FormField
                        control={form.control}
                        name="textOverlaySize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Font Size: {field.value}px</FormLabel>
                            <FormControl>
                                <Slider
                                    min={10} max={100} step={1}
                                    onValueChange={(v) => field.onChange(v[0])}
                                    defaultValue={[field.value]}
                                />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                       <div className="flex justify-between items-center">
                          <FormField control={form.control} name="textOverlayShadow" render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel>Shadow</FormLabel>
                              </FormItem>
                            )}
                          />
                           <FormField control={form.control} name="textOverlayOutline" render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel>Outline</FormLabel>
                              </FormItem>
                            )}
                          />
                       </div>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-semibold">Export Options</AccordionTrigger>
                     <AccordionContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="exportAspectRatio" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Aspect Ratio</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select ratio" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                                    <SelectItem value="4:5">Portrait (4:5)</SelectItem>
                                    <SelectItem value="1.91:1">Landscape (1.91:1)</SelectItem>
                                    <SelectItem value="9:16">Story/Reel (9:16)</SelectItem>
                                </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField control={form.control} name="exportFitMode" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fit Mode</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select fit mode" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="cover">Fill</SelectItem>
                                    <SelectItem value="contain">Fit</SelectItem>
                                </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                              <Download className="mr-2" />
                              Export Image
                          </Button>
                     </AccordionContent>
                   </AccordionItem>
                </Accordion>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
