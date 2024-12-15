"use client";

import { useState } from "react";
import { UrlInput } from "./url-input";
import { PageOptions } from "./page-options";
import { scrapeUrl } from "../services/firecrawl";
import type { ScrapeResult } from "../services/firecrawl";

export function SingleUrlScrape() {
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageOptions, setPageOptions] = useState({
    onlyMainContent: true,
    formats: ["markdown", "html", "rawHtml"],
  });
  const [result, setResult] = useState<ScrapeResult | null>(null);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await scrapeUrl(url, pageOptions);
      setResult(data);
    } catch (err) {
      console.error("Error during scrape:", err);
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setIsLoading(false);
    }
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

      <div className="space-y-4">
        <button
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className="flex items-center text-sm font-medium"
        >
          Options {isOptionsOpen ? "▼" : "▶"}
        </button>

        {isOptionsOpen && <PageOptions onChange={handlePageOptionsChange} />}
      </div>

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <div className="bg-gray-100 p-4 rounded space-y-4">
            <h3 className="font-bold">{result.data.metadata.title}</h3>
            <p className="text-sm text-gray-600">
              {result.data.metadata.description}
            </p>
            <div className="text-sm">
              <div>Language: {result.data.metadata.language}</div>
              <div>Status: {result.data.metadata.pageStatusCode}</div>
              <div>Source: {result.data.metadata.sourceURL}</div>
            </div>
            <pre className="whitespace-pre-wrap mt-2 text-sm">
              {result.data.markdown}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
