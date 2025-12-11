package com.example.Backend.util;

import com.example.Backend.model.Treatment;
import com.example.Backend.model.UserDetails;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class PdfGenerator {

    private static final float MARGIN = 50;
    private static final float LEADING = 16; // line height


    public static byte[] generatePdf(UserDetails user, List<Treatment> prescriptions) throws IOException {
        PDDocument doc = new PDDocument();
        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        PDPageContentStream cs = new PDPageContentStream(doc, page);

        float y = page.getMediaBox().getHeight() - MARGIN;


        y = drawText(cs, "Patient Report", 20, y, true);
        y -= 20;


        y = drawText(cs, "Name: " + (user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : ""), 12, y, false);
        y = drawText(cs, "Sex: " + (user.getSex() != null ? user.getSex() : "N/A"), 12, y, false);
        y = drawText(cs, "Height: " + (user.getHeight() > 0 ? user.getHeight() : "N/A"), 12, y, false);
        y -= 20;

        y = drawText(cs, "Prescriptions:", 16, y, true);
        y -= 10;

        for (Treatment p : prescriptions) {
            String startDateStr = p.getStartDate() != null ? p.getStartDate().toString() : "N/A";
            String endDateStr = p.getEndDate() != null ? p.getEndDate().toString() : "N/A";

            String line =
                    (p.getMedicationName() != null ? p.getMedicationName() : "Unknown") + " | " +
                            (p.getDosage() != null ? p.getDosage() : "N/A") + " | " +
                            p.getFrequency() + " per day | " +
                            startDateStr + " -> " +
                            endDateStr;

            y = drawWrappedText(doc, page, cs, line, 12, y);
            y -= 10;

            if (y < MARGIN) {
                cs.close();
                page = new PDPage(PDRectangle.A4);
                doc.addPage(page);
                cs = new PDPageContentStream(doc, page);
                y = page.getMediaBox().getHeight() - MARGIN;
            }
        }

        cs.close();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        doc.save(baos);
        doc.close();
        return baos.toByteArray();
    }


    private static float drawText(PDPageContentStream cs, String text, int size, float y, boolean bold) throws IOException {
        cs.beginText();
        cs.setFont(bold ? PDType1Font.HELVETICA_BOLD : PDType1Font.HELVETICA, size);
        cs.newLineAtOffset(MARGIN, y);
        cs.showText(text);
        cs.endText();
        return y - LEADING;
    }

    private static float drawWrappedText(PDDocument doc, PDPage page, PDPageContentStream cs, String text, int size, float y) throws IOException {
        cs.setFont(PDType1Font.HELVETICA, size);
        float maxWidth = page.getMediaBox().getWidth() - 2 * MARGIN;
        String[] words = text.split(" ");
        StringBuilder line = new StringBuilder();

        for (String w : words) {
            String testLine = line + w + " ";
            float width = (PDType1Font.HELVETICA.getStringWidth(testLine) / 1000) * size;

            if (width > maxWidth) {
                y = drawText(cs, line.toString(), size, y, false);
                line = new StringBuilder(w + " ");
            } else {
                line = new StringBuilder(testLine);
            }
        }

        if (line.length() > 0) {
            y = drawText(cs, line.toString(), size, y, false);
        }
        return y;
    }
}