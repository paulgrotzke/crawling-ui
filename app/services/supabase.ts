import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FirecrawlResult {
  markdown?: string;
  html?: string;
  metadata: {
    title?: string;
    description?: string;
    language?: string;
    sourceURL?: string;
    statusCode?: number;
    [key: string]: any;
  };
}

export async function storeFirecrawlResults(results: FirecrawlResult[]) {
  const processedResults = [];

  for (const result of results) {
    try {
      const { data: document, error: documentError } = await supabase
        .from("documents")
        .upsert(
          {
            url: result.metadata.sourceURL,
            title: result.metadata.title,
            description: result.metadata.description,
            language: result.metadata.language,
            source_url: result.metadata.sourceURL,
            status_code: result.metadata.statusCode,
          },
          { onConflict: "url" }
        )
        .select()
        .single();

      if (documentError) throw documentError;

      await Promise.all([
        supabase
          .from("document_contents")
          .delete()
          .eq("document_id", document.id),
        supabase
          .from("document_metadata")
          .delete()
          .eq("document_id", document.id),
      ]);

      const contentsToInsert = [];
      if (result.markdown) {
        contentsToInsert.push({
          document_id: document.id,
          format: "markdown",
          content: result.markdown,
        });
      }
      if (result.html) {
        contentsToInsert.push({
          document_id: document.id,
          format: "html",
          content: result.html,
        });
      }

      const metadataToInsert = Object.entries(result.metadata)
        .filter(
          ([key]) =>
            ![
              "title",
              "description",
              "language",
              "sourceURL",
              "statusCode",
            ].includes(key)
        )
        .map(([key, value]) => ({
          document_id: document.id,
          key,
          value: typeof value === "string" ? value : JSON.stringify(value),
        }));

      await Promise.all([
        contentsToInsert.length > 0
          ? supabase.from("document_contents").insert(contentsToInsert)
          : Promise.resolve(),
        metadataToInsert.length > 0
          ? supabase.from("document_metadata").insert(metadataToInsert)
          : Promise.resolve(),
      ]);

      processedResults.push({
        success: true,
        documentId: document.id,
        url: result.metadata.sourceURL,
      });
    } catch (error) {
      console.error("Error processing result:", error);
      processedResults.push({
        success: false,
        error,
        url: result.metadata.sourceURL,
      });
    }
  }

  return processedResults;
}
