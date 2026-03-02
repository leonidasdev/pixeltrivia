declare module 'unpdf' {
  interface DocumentProxy {
    numPages: number
  }

  interface ExtractTextResult {
    totalPages: number
    text: string
  }

  interface ExtractTextOptions {
    mergePages?: boolean
  }

  export function getDocumentProxy(data: Uint8Array | ArrayBuffer): Promise<DocumentProxy>
  export function extractText(
    pdf: DocumentProxy,
    options?: ExtractTextOptions
  ): Promise<ExtractTextResult>
}
