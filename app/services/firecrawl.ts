const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type ScrapeResult = {
  success: boolean;
  data: {
    markdown: string;
    content: string;
    html: string;
    rawHtml: string;
    metadata: {
      title: string;
      description: string;
      language: string;
      sourceURL: string;
      pageStatusCode: number;
      pageError?: string;
    };
    llm_extraction: Record<string, unknown>;
  };
};

export type CrawlResult = {
  success: boolean;
  markdown: string;
  metadata: {
    title: string;
    description: string;
    sourceURL: string;
  };
};

interface PageOptions {
  onlyMainContent?: boolean;
  excludeTags?: string[];
  includeTags?: string[];
  formats?: string[];
}

interface CrawlOptions extends PageOptions {
  limit?: number;
  maxDepth?: number;
  exclude?: string[];
  includes?: string[];
  ignoreSitemap?: boolean;
  allowBackwardLinks?: boolean;
}

function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, "");
    const pathname = urlObj.pathname.replace(/\/$/, "");
    const sanitizedName = `${hostname}${pathname}`.replace(
      /[^a-zA-Z0-9]/g,
      "-"
    );
    return sanitizedName || "firecrawl-result";
  } catch {
    return "firecrawl-result";
  }
}

export async function downloadResults(data: any, url?: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  const filename = url ? getFilenameFromUrl(url) : "firecrawl-result";
  a.download = `${filename}-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
}

export async function scrapeUrl(
  url: string,
  options: PageOptions = {}
): Promise<ScrapeResult> {
  const response = await fetch(`${BASE_URL}/v1/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      ...options,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function crawlUrl(
  url: string,
  options: CrawlOptions = {}
): Promise<{ success: boolean; id: string }> {
  const requestBody = {
    url,
    limit: options.limit || 10,
    ignoreSitemap: options.ignoreSitemap || false,
    allowBackwardLinks: options.allowBackwardLinks || true,
    origin: "website",
    scrapeOptions: {
      formats: options.formats || ["markdown"],
      onlyMainContent: options.onlyMainContent || true,
      excludeTags: options.excludeTags || [""],
      includeTags: options.includeTags || [""],
    },
  };

  const response = await fetch(`${BASE_URL}/v1/crawl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function pollJobResults(jobId: string): Promise<CrawlResult[]> {
  const maxAttempts = 30;
  const delay = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${BASE_URL}/v1/crawl/${jobId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "completed" && Array.isArray(data.data)) {
      return data.data;
    }

    if (data.status === "failed") {
      throw new Error(`Job failed: ${data.error || "Unknown error"}`);
    }

    if (data.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
  }

  throw new Error("Timeout while waiting for crawl results");
}
