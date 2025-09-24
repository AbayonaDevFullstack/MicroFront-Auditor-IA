declare module 'xlsx' {
  export interface WorkBook {
    Sheets: { [sheet: string]: WorkSheet }
    SheetNames: string[]
  }

  export interface WorkSheet {
    [address: string]: CellObject | any
    '!ref'?: string
    '!cols'?: ColInfo[]
  }

  export interface CellObject {
    v?: any
    t?: string
    f?: string
    r?: string
  }

  export interface ColInfo {
    wch?: number
    width?: number
  }

  export const utils: {
    book_new(): WorkBook
    book_append_sheet(workbook: WorkBook, worksheet: WorkSheet, name?: string): void
    aoa_to_sheet(data: any[][]): WorkSheet
    decode_range(range: string): any
  }

  export function writeFile(workbook: WorkBook, filename: string): void
}