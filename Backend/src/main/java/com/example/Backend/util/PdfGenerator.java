package com.example.Backend.util;

import com.example.Backend.model.Treatment;
import com.example.Backend.model.UserDetails;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

public class PdfGenerator {

    private static final float MARGIN = 50;
    private static final float Y_START = 750;
    private static final float TABLE_Y_START = 550;
    private static final float ROW_HEIGHT = 20;
    private static final float CELL_MARGIN = 5;


    public static byte[] generatePdf(UserDetails user, List<Treatment> prescriptions) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float yPosition = Y_START;


                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 22);
                cs.setNonStrokingColor(0, 102, 204);
                cs.newLineAtOffset(MARGIN, yPosition);
                cs.showText("FISA TRATAMENT PACIENT");
                cs.endText();

                yPosition -= 30;

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 10);
                cs.setNonStrokingColor(Color.GRAY);
                cs.newLineAtOffset(MARGIN, yPosition);
                cs.showText("Generat la data: " + new SimpleDateFormat("dd/MM/yyyy HH:mm").format(new Date()));
                cs.endText();

                yPosition -= 40;

                cs.setStrokingColor(Color.LIGHT_GRAY);
                cs.setLineWidth(1);
                cs.moveTo(MARGIN, yPosition + 10);
                cs.lineTo(page.getMediaBox().getWidth() - MARGIN, yPosition + 10);
                cs.stroke();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
                cs.setNonStrokingColor(Color.BLACK);
                cs.newLineAtOffset(MARGIN, yPosition);
                cs.showText("Detalii Pacient");
                cs.endText();

                yPosition -= 20;


                String name = (user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : "");
                String infoLine1 = "Nume: " + name;
                String infoLine2 = "Varsta: " + (user.getBirthDate()) + " ani  |  Sex: " + (user.getSex() != null ? user.getSex() : "N/A");
                String infoLine3 = "Greutate: " + (user.getWeight() > 0 ? user.getWeight() + " kg" : "N/A") + "  |  Inaltime: " + (user.getHeight() > 0 ? user.getHeight() + " cm" : "N/A");

                drawSimpleText(cs, infoLine1, MARGIN, yPosition);
                yPosition -= 15;
                drawSimpleText(cs, infoLine2, MARGIN, yPosition);
                yPosition -= 15;
                drawSimpleText(cs, infoLine3, MARGIN, yPosition);

                yPosition -= 40;


                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
                cs.newLineAtOffset(MARGIN, yPosition);
                cs.showText("Lista Prescriptii");
                cs.endText();

                yPosition -= 10;


                float[] colWidths = {160, 80, 80, 85, 85};
                String[] headers = {"Medicament", "Dozaj", "Frecv.", "Start", "Final"};
                float tableWidth = page.getMediaBox().getWidth() - 2 * MARGIN;


                drawTableHeader(cs, yPosition, colWidths, headers);
                yPosition -= ROW_HEIGHT;

                cs.setFont(PDType1Font.HELVETICA, 10);
                cs.setNonStrokingColor(Color.BLACK);

                SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

                for (Treatment t : prescriptions) {

                    if (yPosition < MARGIN + ROW_HEIGHT) {
                        cs.endText();
                        cs.close();

                        PDPage newPage = new PDPage(PDRectangle.A4);
                        doc.addPage(newPage);
                        PDPageContentStream newCs = new PDPageContentStream(doc, newPage);


                        yPosition = newPage.getMediaBox().getHeight() - MARGIN;
                        drawTableHeader(newCs, yPosition, colWidths, headers);
                        yPosition -= ROW_HEIGHT;


                        break;
                    }


                    String start = t.getStartDate() != null ? sdf.format(t.getStartDate())  : "-";


                    String end = t.getEndDate() != null ? sdf.format(t.getEndDate()) : "-";
                    String medName = t.getMedicationName() != null ? t.getMedicationName() : "";
                    String dosage = t.getDosage() != null ? t.getDosage() : "";
                    String freq = t.getFrequency() + "/zi";


                    cs.setStrokingColor(Color.LIGHT_GRAY);
                    cs.moveTo(MARGIN, yPosition);
                    cs.lineTo(MARGIN + tableWidth, yPosition);
                    cs.stroke();


                    float xTemp = MARGIN + CELL_MARGIN;

                    drawCellText(cs, medName, xTemp, yPosition + 5, colWidths[0]);
                    xTemp += colWidths[0];

                    drawCellText(cs, dosage, xTemp, yPosition + 5, colWidths[1]);
                    xTemp += colWidths[1];

                    drawCellText(cs, freq, xTemp, yPosition + 5, colWidths[2]);
                    xTemp += colWidths[2];

                    if(start.length() > 10) start = start.substring(0, 10);
                    drawCellText(cs, start, xTemp, yPosition + 5, colWidths[3]);
                    xTemp += colWidths[3];

                    if(end.length() > 10) end = end.substring(0, 10);
                    drawCellText(cs, end, xTemp, yPosition + 5, colWidths[4]);

                    yPosition -= ROW_HEIGHT;
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        }
    }

    private static void drawSimpleText(PDPageContentStream cs, String text, float x, float y) throws IOException {
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 12);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
    }

    private static void drawTableHeader(PDPageContentStream cs, float y, float[] colWidths, String[] headers) throws IOException {
        float tableWidth = 0;
        for(float w : colWidths) tableWidth += w;

        cs.setNonStrokingColor(230, 230, 230);
        cs.addRect(MARGIN, y - ROW_HEIGHT + 5, tableWidth, ROW_HEIGHT);
        cs.fill();


        cs.setNonStrokingColor(Color.BLACK);
        cs.setFont(PDType1Font.HELVETICA_BOLD, 12);

        float xTemp = MARGIN + CELL_MARGIN;
        for (int i = 0; i < headers.length; i++) {
            cs.beginText();
            cs.newLineAtOffset(xTemp, y);
            cs.showText(headers[i]);
            cs.endText();
            xTemp += colWidths[i];
        }
    }


    private static void drawCellText(PDPageContentStream cs, String text, float x, float y, float maxWidth) throws IOException {
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 10);
        cs.newLineAtOffset(x, y);
        if (text.length() * 5 > maxWidth) {
            text = text.substring(0, Math.min(text.length(), (int)(maxWidth / 5))) + "...";
        }
        cs.showText(text);
        cs.endText();
    }
}