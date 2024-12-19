import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface CrawlerOptionsProps {
  onChange: (options: {
    limit?: number;
    maxDepth?: number;
    exclude?: string;
    includes?: string;
    ignoreSitemap?: boolean;
    allowBackwardLinks?: boolean;
  }) => void;
}

export function CrawlerOptions({ onChange }: CrawlerOptionsProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === "number") {
      onChange({
        [name]: value ? parseInt(value, 10) : undefined,
      });
    } else {
      onChange({
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm">Limit</label>
          <Input
            type="number"
            name="limit"
            placeholder="10"
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Max depth</label>
          <Input
            type="number"
            name="maxDepth"
            placeholder="Enter max depth"
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm">Exclude Paths</label>
          <Input
            name="exclude"
            placeholder="blog/*, /about/*"
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Include Only Paths</label>
          <Input
            name="includes"
            placeholder="articles/*"
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="ignore-sitemap"
            name="ignoreSitemap"
            onCheckedChange={(checked) =>
              onChange({ ignoreSitemap: checked as boolean })
            }
          />
          <label htmlFor="ignore-sitemap" className="text-sm">
            Ignore sitemap
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allow-backwards"
            name="allowBackwardLinks"
            onCheckedChange={(checked) =>
              onChange({ allowBackwardLinks: checked as boolean })
            }
          />
          <label htmlFor="allow-backwards" className="text-sm">
            Allow backwards links
          </label>
        </div>
      </div>
    </div>
  );
}
