#### Guides

# Using Collections via API

This guide walks you through managing collections programmatically using the xAI SDK and REST API.

## Creating a Management Key

To use the Collections API, you need to create a Management API Key with the `AddFileToCollection` permission. This permission is required for uploading documents to collections.

1. Navigate to the **Management Keys** section in the [xAI Console](https://console.x.ai)
2. Click on **Create Management Key**
3. Select the `AddFileToCollection` permission along with any other permissions you need
4. If you need to perform operations other than uploading documents (such as creating, updating, or deleting collections), enable the corresponding permissions in the **Collections Endpoint** group
5. Copy and securely store your Management API Key

Make sure to copy your Management API Key immediately after creation. You won't be able to see it again.

## Creating a collection

## Listing collections

## Viewing collection configuration

## Updating collection configuration

## Uploading documents

Uploading a document to a collection is a two-step process:

1. Upload the file to the xAI API
2. Add the uploaded file to your collection

### Uploading with metadata fields

If your collection has [metadata fields](/docs/guides/using-collections/metadata) defined, include them using the `fields` parameter:

## Searching documents

You can also search documents using the Responses API with the `file_search` tool. See the [Collections Search Tool](/docs/guides/tools/collections-search-tool) guide for more details.

### Search modes

There are three search methods available:

* **Keyword search**
* **Semantic search**
* **Hybrid search** (combines both keyword and semantic methods)

By default, the system uses hybrid search, which generally delivers the best and most comprehensive results.

| Mode | Description | Best for | Drawbacks |
|------|-------------|----------|-----------|
| Keyword | Searches for exact matches of specified words, phrases, or numbers | Precise terms (e.g., account numbers, dates, specific financial figures) | May miss contextually relevant content |
| Semantic | Understands meaning and context to find conceptually related content | Discovering general ideas, topics, or intent even when exact words differ | Less precise for specific terms |
| Hybrid | Combines keyword and semantic search for broader and more accurate results | Most real-world use cases | Slightly higher latency |

The hybrid approach balances precision and recall, making it the recommended default for the majority of queries.

An example to set hybrid mode:

You can set `"retrieval_mode": {"type": "keyword"}` for keyword search and `"retrieval_mode": {"type": "semantic"}` for semantic search.

## Deleting a document

## Deleting a collection

## Next Steps

[Metadata Fields →](/docs/guides/using-collections/metadata) - Learn how to attach structured attributes to documents for filtering and contextual embeddings
