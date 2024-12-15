import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted"); // Debug log
    
    const form = e.target as HTMLFormElement;
    const url = new FormData(form).get("url") as string;

    if (url) {
      console.log("Submitting URL:", url); // Debug log
      onSubmit(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="text-sm font-medium">URL</label>
      <div className="flex gap-2">
        <Input
          name="url"
          placeholder="https://mendable.ai"
          className="flex-1"
          required
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="bg-orange-500 hover:bg-orange-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            'Run'
          )}
        </Button>
      </div>
    </form>
  );
}
