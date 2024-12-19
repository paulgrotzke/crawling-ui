"use client";

import { useState } from "react";
import { UrlInput } from "./url-input";
import { CrawlerOptions } from "./crawler-options";
import { PageOptions } from "./page-options";
import {
  crawlUrl,
  pollJobResults,
  downloadResults,
} from "../services/firecrawl";
import type { CrawlResult } from "../services/firecrawl";
import { storeFirecrawlResults } from "../services/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";

export function CrawlUrl() {
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crawlerOptions, setCrawlerOptions] = useState({
    limit: 10,
    ignoreSitemap: false,
    allowBackwardLinks: true,
  });
  const [pageOptions, setPageOptions] = useState({
    onlyMainContent: true,
  });
  const [results, setResults] = useState<CrawlResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await crawlUrl(url, {
        ...crawlerOptions,
        ...pageOptions,
      });

      if (response.success && response.id) {
        setJobId(response.id);
        const crawlResults = await pollJobResults(response.id);
        setResults(crawlResults);
      }
    } catch (err) {
      console.error("Error during crawl:", err);
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrawlerOptionsChange = (newOptions: any) => {
    setCrawlerOptions((prev) => ({
      ...prev,
      ...newOptions,
    }));
  };

  const handlePageOptionsChange = (newOptions: any) => {
    setPageOptions((prev) => ({
      ...prev,
      ...newOptions,
    }));
  };

  const handleSaveToDatabase = async () => {
    if (!results.length) return;

    setIsSaving(true);
    try {
      await storeFirecrawlResults(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Speichern in der Datenbank"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!results.length) return;
    downloadResults(results, results[0]?.metadata?.sourceURL);
  };

  return (
    <div className="space-y-4 py-4">
      <UrlInput onSubmit={handleSubmit} isLoading={isLoading} />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {jobId && (
        <div className="text-sm text-muted-foreground">Job ID: {jobId}</div>
      )}

      <div className="space-y-4">
        <button
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className="flex items-center text-sm font-medium"
        >
          Options {isOptionsOpen ? "▼" : "▶"}
        </button>

        {isOptionsOpen && (
          <div className="space-y-8">
            <CrawlerOptions onChange={handleCrawlerOptionsChange} />
            <PageOptions onChange={handlePageOptionsChange} />
          </div>
        )}
      </div>

      {results.length > 0 && !isLoading && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Download JSON
              </Button>
              <Button
                onClick={handleSaveToDatabase}
                disabled={isSaving}
                className="bg-green-500 hover:bg-green-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save to Database"
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded">
                <h3 className="font-bold">{result.metadata.title}</h3>
                <p className="text-sm text-gray-600">
                  {result.metadata.description}
                </p>
                <pre className="whitespace-pre-wrap mt-2 text-sm">
                  {result.markdown}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
