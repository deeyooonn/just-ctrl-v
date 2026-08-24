import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, BorderStyle, WidthType, ShadingType } from 'docx';

export const exportToPng = async (element, filename) => {
  if (!element) return;
  try {
    const dataUrl = await toPng(element, { 
      pixelRatio: 2, 
      backgroundColor: '#ffffff',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    });
    saveAs(dataUrl, `${filename}.png`);
  } catch (err) {
    console.error("Failed to export PNG:", err);
    throw err;
  }
};

export const exportFlashcardsToDocx = async (flashcards, filename) => {
  if (!flashcards || flashcards.length === 0) return;

  const rows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Question", bold: true, color: "FFFFFF" })] })],
          shading: { fill: "3f3f46", type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Answer", bold: true, color: "FFFFFF" })] })],
          shading: { fill: "3f3f46", type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
        }),
      ],
    }),
    ...flashcards.map((card, idx) => 
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: card.question || "" })],
            shading: { fill: idx % 2 === 0 ? "ffffff" : "f4f4f5", type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            children: [new Paragraph({ text: card.answer || "" })],
            shading: { fill: idx % 2 === 0 ? "ffffff" : "f4f4f5", type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
        ]
      })
    )
  ];

  const table = new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
    },
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Flashcards Export",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: "" }),
        table,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};

export const exportTableToDocx = async (tableData, filename) => {
  if (!tableData || tableData.length === 0) return;

  const headers = Object.keys(tableData[0]);

  const rows = [
    new TableRow({
      children: headers.map(header => 
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: header, bold: true, color: "FFFFFF" })] })],
          shading: { fill: "3f3f46", type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
        })
      ),
    }),
    ...tableData.map((row, idx) => 
      new TableRow({
        children: headers.map(header => 
          new TableCell({
            children: [new Paragraph({ text: String(row[header] || "") })],
            shading: { fill: idx % 2 === 0 ? "ffffff" : "f4f4f5", type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          })
        )
      })
    )
  ];

  const table = new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "e4e4e7" },
    },
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Interactive Table Export",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: "" }),
        table,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};
