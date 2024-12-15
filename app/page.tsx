"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleUrlScrape } from "./components/single-url-scrape";
import { CrawlUrl } from "./components/crawl-url";

export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <Tabs defaultValue="single-url" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger
            value="single-url"
            className="data-[state=active]:bg-background"
          >
            Single URL{" "}
            <span className="ml-1.5 text-muted-foreground">/scrape</span>
          </TabsTrigger>
          <TabsTrigger
            value="crawl"
            className="data-[state=active]:bg-background"
          >
            Crawl <span className="ml-1.5 text-muted-foreground">/crawl</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single-url">
          <SingleUrlScrape />
        </TabsContent>

        <TabsContent value="crawl">
          <CrawlUrl />
        </TabsContent>

        <TabsContent value="map">
          <div className="text-center py-12 text-muted-foreground">
            Map functionality coming soon
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}