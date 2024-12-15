"use client";

import { useState } from "react";
import { UrlInput } from "./url-input";
import { CrawlerOptions } from "./crawler-options";
import { PageOptions } from "./page-options";
import { crawlUrl, pollJobResults } from "../services/firecrawl";
import type { CrawlResult } from "../services/firecrawl";

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

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
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
