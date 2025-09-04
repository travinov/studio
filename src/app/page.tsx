'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  Download,
  Loader2,
  Plus,
  Trash2,
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
  FormMessage,
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
  textOverlayAlignment: z.enum(['left', 'center', 'right']).default('center'),
  textOverlayPositionX: z.number().min(0).max(100).default(50),
  textOverlayPositionY: z.number().min(0).max(100).default(50),
  textOverlayShadow: z.boolean().default(true),
  textOverlayOutline: z.boolean().default(false),
  exportAspectRatio: z.string().default('1:1'),
  exportFitMode: z.string().default('fill'),
});

type FormValues = z.infer<typeof formSchema>;

export default function InstaCraftPage() {
  const [image, setImage] = React.useState<{ url: string; dataUri: string } | null>(null);
  const [hashtags, setHashtags] = React.useState<string[]>([]);
  const [loadingStates, setLoadingStates] = React.useState({
    caption: false,
    hashtags: false,
    contrast: false,
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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
      textOverlayAlignment: 'center',
      textOverlayPositionX: 50,
      textOverlayPositionY: 50,
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
      return `0px 0px 1px ${color === '#FFFFFF' ? '#000000' : '#FFFFFF'}, 0px 0px 1px ${color === '#FFFFFF' ? '#000000' : '#FFFFFF'}, 0px 0px 1px ${color === '#FFFFFF' ? '#000000' : '#FFFFFF'}, 0px 0px 1px ${color === '#FFFFFF' ? '#000000' : '#FFFFFF'}`;
    }
    if (hasShadow) {
      return '2px 2px 4px rgba(0, 0, 0, 0.5)';
    }
    return 'none';
  };

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
                <div className="relative w-full aspect-square bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed">
                  {image ? (
                    <>
                      <Image 
                        src={image.url} 
                        alt="Preview" 
                        fill 
                        className={`object-${watchedValues.exportFitMode === 'fill' ? 'cover' : 'contain'} rounded-md`}
                      />
                      {watchedValues.textOverlayContent && (
                        <div
                          className="absolute inset-0 p-4 flex pointer-events-none"
                          style={{
                            justifyContent: watchedValues.textOverlayPositionX < 33 ? 'flex-start' : watchedValues.textOverlayPositionX > 66 ? 'flex-end' : 'center',
                            alignItems: watchedValues.textOverlayPositionY < 33 ? 'flex-start' : watchedValues.textOverlayPositionY > 66 ? 'flex-end' : 'center',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: watchedValues.textOverlayFont,
                              fontSize: `${watchedValues.textOverlaySize}px`,
                              color: watchedValues.textOverlayColor,
                              textShadow: getTextShadow(!!watchedValues.textOverlayShadow, !!watchedValues.textOverlayOutline, watchedValues.textOverlayColor === '#FFFFFF' ? '#000000' : '#FFFFFF'),
                              textAlign: watchedValues.textOverlayAlignment,
                            }}
                          >
                            {watchedValues.textOverlayContent}
                          </span>
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
                      
                      <FormField
                        control={form.control}
                        name="textOverlayPositionX"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horizontal Position: {field.value}%</FormLabel>
                            <FormControl>
                                <Slider
                                    min={0} max={100} step={1}
                                    onValueChange={(v) => field.onChange(v[0])}
                                    defaultValue={[field.value]}
                                />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="textOverlayPositionY"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vertical Position: {field.value}%</FormLabel>
                            <FormControl>
                                <Slider
                                    min={0} max={100} step={1}
                                    onValueChange={(v) => field.onChange(v[0])}
                                    defaultValue={[field.value]}
                                />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                       <FormField
                        control={form.control}
                        name="textOverlayAlignment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Align</FormLabel>
                            <FormControl>
                               <div className="flex justify-around items-center p-1 rounded-md bg-muted">
                                <Button type="button" variant={field.value === 'left' ? 'secondary' : 'ghost'} size="icon" onClick={() => field.onChange('left')}><AlignLeft /></Button>
                                <Button type="button" variant={field.value === 'center' ? 'secondary' : 'ghost'} size="icon" onClick={() => field.onChange('center')}><AlignCenter /></Button>
                                <Button type="button" variant={field.value === 'right' ? 'secondary' : 'ghost'} size="icon" onClick={() => field.onChange('right')}><AlignRight /></Button>
                               </div>
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
                                    <SelectItem value="fill">Fill</SelectItem>
                                    <SelectItem value="fit">Fit</SelectItem>
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
