run:
  description: Run an end-to-end GTFS ingestion on the bundled sample feed
  steps:
    - description: Compile the backend
      run: cd apps/backend && npm run build
    - description: Run the ingestion CLI against sample fixtures
      run: cd apps/backend && npx ts-node-dev src/modules/transit/ingestion/cli/ingest.ts \
        --source transjakarta \
        --version v1.0.0 \
        --fetch-dir test/fixtures/transjakarta \
        --url https://gtfs.transjakarta.co.id/files/file_gtfs.zip \
        --license "CC BY 4.0"
