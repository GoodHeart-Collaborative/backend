"use strict";

import { Workbook, Worksheet } from "exceljs";

interface Column {
	header: string;
	key: string;
	width?: number;
	outlineLevel?: number;
}

export class ExcelJs {
	private Workbook;

	constructor(createdBy: string) {
		this.Workbook = new Workbook();
		this.Workbook.creator = createdBy;
		this.Workbook.created = new Date();
	}

	/**
     * @name addWorksheet
     * @description Adds a new worksheet to the workbook
     * @param sheetName - name of the sheet
     * @param options - worksheet options
    */
	public addWorksheet(sheetName: string, options?: any) {
		return this.Workbook.addWorksheet(sheetName, options);
	}

	/**
     * @name getWorksheet
     * @description get the content of the worksheet
     * @param sheetReference {string | number} - sheet name or sheet id
    */
	public getWorksheet(sheetReference: string | number) {
		return this.Workbook.getWorksheet(sheetReference);
	}

	/**
     * @name addColumns
     * @description adds columns to worksheet
     * @param columns {object} - key value combination
    */
	public addColumns(worksheet: Worksheet, columns: Column[]) {
		worksheet.columns = columns;
	}

	/**
     * @name addRow
     * @description Adds a new row to worksheet
     * @param data {object} - data to write
    */
	public addRows(worksheet: Worksheet, data: any) {
		worksheet.addRows(data);
	}

	/**
     * @name writeFile
     * @description To write File on response
     * @param response {stream} - data to write
    */
	public async writeFile(fileName) {
		return await this.Workbook.xlsx.writeFile(fileName);
	}

	/**
     * @name write
     * @description To write Stream on response
     * @param response {stream} - data to write
    */
	public async write(response) {
		return await this.Workbook.xlsx.write(response);
	}

	/**
     * @name writeBuffer
     * @description To write buffer on response
     * @param response {stream} - data to write
    */
	public async writeBuffer() {
		return await this.Workbook.xlsx.writeBuffer();
	}
}