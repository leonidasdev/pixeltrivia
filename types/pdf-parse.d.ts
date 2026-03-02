declare module 'pdf-parse-new' {
  interface PDFData {
    text: string
    numpages: number
    info: Record<string, unknown>
  }

  function pdfParse(buffer: Buffer): Promise<PDFData>
  export default pdfParse
}
