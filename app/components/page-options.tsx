import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface PageOptionsProps {
  onChange: (options: {
    excludeTags?: string;
    includeTags?: string;
    waitFor?: number;
    onlyMainContent?: boolean;
    includeHtml?: boolean;
    includeLinks?: boolean;
  }) => void;
}

export function PageOptions({ onChange }: PageOptionsProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onChange({
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm">Exclude Tags</label>
          <Input 
            name="excludeTags"
            placeholder="script, .ad, #footer" 
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Include Only Tags</label>
          <Input 
            name="includeTags"
            placeholder="script, .ad, #footer" 
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm">Wait for (in ms)</label>
        <Input 
          type="number" 
          name="waitFor"
          placeholder="1000" 
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="main-content" 
            name="onlyMainContent"
            defaultChecked 
            onCheckedChange={(checked) => 
              onChange({ onlyMainContent: checked as boolean })
            }
          />
          <label htmlFor="main-content" className="text-sm">
            Extract only main content (no headers, navs, footers, etc.)
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="html-content" 
            name="includeHtml"
            onCheckedChange={(checked) => 
              onChange({ includeHtml: checked as boolean })
            }
          />
          <label htmlFor="html-content" className="text-sm">
            Include HTML content
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="page-links" 
            name="includeLinks"
            onCheckedChange={(checked) => 
              onChange({ includeLinks: checked as boolean })
            }
          />
          <label htmlFor="page-links" className="text-sm">
            Include page links
          </label>
        </div>
      </div>
    </div>
  );
}
