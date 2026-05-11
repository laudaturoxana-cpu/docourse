import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Image as ImageIcon, Info, BookOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CourseData {
  title: string;
  description: string;
  is_published: boolean;
}

interface CourseStepProps {
  data: CourseData;
  imageFile: File | null;
  imagePreview: string | null;
  onChange: (field: keyof CourseData, value: string | boolean) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
}

const CourseStep = ({
  data,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  imageFile: _imageFile,
  imagePreview,
  onChange,
  onImageChange,
  onImageRemove
}: CourseStepProps) => {
  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-navy/5 rounded-xl">
        <BookOpen className="w-5 h-5 text-navy mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-navy mb-1">Curs standalone</p>
          <p className="text-muted-foreground">
            Curs vândut o singură dată, acces fără abonament lunar. Poate fi gratuit, cu plată unică,
            sau ca Tripwire (49-99 lei) pentru a atrage clienți în funnel.
            În pașii următori poți adăuga o comunitate dedicată cursului.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="title">Titlul cursului *</Label>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Alege un titlu clar și ușor de înțeles de către cursanți. Va fi afișat peste tot în platformă.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="title"
          placeholder="Ex: Introducere în psihologia comportamentală"
          value={data.title}
          onChange={(e) => onChange('title', e.target.value)}
          className="h-12"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="description">Descriere</Label>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Descrierea ajută studentul să înțeleagă ce va învăța și ce valoare primește.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          id="description"
          placeholder="Descrie pe scurt ce vor învăța cursanții, ce probleme rezolvă cursul, ce rezultate pot obține..."
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label>Imagine de copertă</Label>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-gold/50 transition-colors">
          {imagePreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={onImageRemove}
                className="mt-4 text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                Elimină imaginea
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-xl bg-beige flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-charcoal font-medium mb-1">
                Click pentru a încărca
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG până la 5MB
              </p>
            </label>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-beige/50 rounded-xl">
        <div className="space-y-0.5">
          <Label htmlFor="visibility" className="font-medium">Vizibilitate publică</Label>
          <p className="text-sm text-muted-foreground">
            Activează pentru a face cursul vizibil studenților
          </p>
        </div>
        <Switch
          id="visibility"
          checked={data.is_published}
          onCheckedChange={(checked) => onChange('is_published', checked)}
        />
      </div>
    </div>
  );
};

export default CourseStep;
