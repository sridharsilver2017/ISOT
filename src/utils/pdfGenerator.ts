import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Session, getSessionItems } from '../types/programme';

export interface PdfExportOptions {
  scope: 'all' | 'day' | 'saved';
  selectedDate?: string;
  selectedHall?: string;
  savedItemIds?: string[];
  title?: string;
}

const VENUE_COLORS: Record<string, [number, number, number]> = {
  'Hall A': [128, 0, 32], // Burgundy
  'Hall B – Screen 1': [30, 64, 175], // Deep Blue
  'Hall B – Screen 2': [6, 95, 70], // Emerald
  'Hall B – Screen 3': [88, 28, 135], // Purple
  'Hall C': [15, 118, 110], // Teal
  'Hall D': [67, 56, 202], // Indigo
  'Hall F': [159, 18, 57], // Rose
};

const getVenueColor = (venue: string): [number, number, number] => {
  for (const [key, color] of Object.entries(VENUE_COLORS)) {
    if (venue.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  return [128, 0, 32];
};

export const generateProgrammePdf = async (
  allSessions: Session[],
  options: PdfExportOptions
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Filter sessions based on options
  let filteredSessions = [...allSessions];

  if (options.scope === 'day' && options.selectedDate) {
    filteredSessions = filteredSessions.filter((s) => s.date === options.selectedDate);
  }

  if (options.selectedHall && options.selectedHall !== 'All Halls') {
    filteredSessions = filteredSessions.filter((s) =>
      s.venue.toLowerCase().includes(options.selectedHall!.toLowerCase())
    );
  }

  if (options.scope === 'saved' && options.savedItemIds) {
    const savedSet = new Set(options.savedItemIds);
    filteredSessions = filteredSessions
      .map((s) => {
        const items = getSessionItems(s).filter((item) => savedSet.has(item.id));
        if (items.length === 0) return null;
        return {
          ...s,
          sections: [{ id: `${s.id}-saved`, title: 'Selected Sessions', items }],
        };
      })
      .filter(Boolean) as Session[];
  }

  if (filteredSessions.length === 0) {
    alert('No sessions found for the selected export filter.');
    return;
  }

  // Cover / Header Banner Function
  const drawHeader = (isFirstPage: boolean) => {
    // Header background banner
    doc.setFillColor(103, 0, 26); // ISOT Deep Burgundy
    doc.rect(0, 0, pageWidth, isFirstPage ? 38 : 22, 'F');

    // Decorative Gold Accent Line
    doc.setFillColor(212, 175, 55);
    doc.rect(0, isFirstPage ? 37 : 21, pageWidth, 1.2, 'F');

    if (isFirstPage) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('ISOT 2026 — SCIENTIFIC PROGRAMME', margin, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(245, 230, 211);
      doc.text('36th Annual Conference of Indian Society of Organ Transplantation', margin, 21);
      doc.text('09 – 11 October 2026 • HITEX Exhibition Centre, Hyderabad • Official V23 Schedule', margin, 27);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 215, 0);
      const scopeLabel =
        options.scope === 'all'
          ? 'COMPLETE 3-DAY PROGRAMME'
          : options.scope === 'day'
          ? `DAY SCHEDULE (${options.selectedDate === '2026-10-09' ? 'Friday 09 Oct' : options.selectedDate === '2026-10-10' ? 'Saturday 10 Oct' : 'Sunday 11 Oct'})`
          : 'PERSONALIZED BOOKMARKED SCHEDULE';
      doc.text(scopeLabel, pageWidth - margin, 14, { align: 'right' });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('ISOT 2026 • Scientific Programme (V23 Official)', margin, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(240, 240, 240);
      doc.text('09–11 Oct 2026, HITEX Hyderabad', pageWidth - margin, 12, { align: 'right' });
    }
  };

  let startY = 44;
  let currentDay = '';

  // Sort sessions chronologically
  filteredSessions.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  drawHeader(true);

  // Group by date
  for (let sIdx = 0; sIdx < filteredSessions.length; sIdx++) {
    const session = filteredSessions[sIdx];
    const items = getSessionItems(session);
    if (items.length === 0) continue;

    // Day Section Heading if day changed
    if (session.date !== currentDay) {
      currentDay = session.date;

      // Check space for Day header
      if (startY > pageHeight - 40) {
        doc.addPage();
        drawHeader(false);
        startY = 28;
      }

      // Draw Day Header Banner
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin, startY, pageWidth - margin * 2, 9, 2, 2, 'F');

      doc.setFillColor(128, 0, 32);
      doc.rect(margin, startY, 4, 9, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(31, 41, 55);
      doc.text(
        `${session.dayName.toUpperCase()}, ${session.dayDisplay.toUpperCase()} 2026`,
        margin + 8,
        startY + 6.2
      );
      startY += 13;
    }

    // Session Card Banner
    if (startY > pageHeight - 40) {
      doc.addPage();
      drawHeader(false);
      startY = 28;
    }

    const venueRgb = getVenueColor(session.venue);

    // Session Header Box
    doc.setFillColor(venueRgb[0], venueRgb[1], venueRgb[2]);
    doc.roundedRect(margin, startY, pageWidth - margin * 2, 12, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${session.title} — ${session.venue}`, margin + 4, startY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(240, 240, 240);
    const inChargeText = session.sessionInCharge?.length
      ? ` • In-Charge: ${session.sessionInCharge.join(', ')}`
      : '';
    const trackText = session.track ? `Track: ${session.track} • ` : '';
    doc.text(
      `${trackText}Time: ${session.startTime} - ${session.endTime}${inChargeText}`,
      margin + 4,
      startY + 9.5
    );

    startY += 14;

    // Build Table Rows for items in this session
    const tableRows = items.map((item) => {
      const timeStr = `${item.startTime} - ${item.endTime}`;

      // Build details string
      let details = item.title;
      if (item.type === 'oration') details = `[ORATION] ${details}`;
      if (item.type === 'panel') details = `[PANEL] ${details}`;
      if (item.type === 'workshop') details = `[WORKSHOP] ${details}`;

      if (item.description && item.description.length > 0) {
        details += `\n• ${item.description.join('\n• ')}`;
      }

      // Build Faculty string
      const facultyParts: string[] = [];
      if (item.speakers?.length) {
        facultyParts.push(`Speaker(s): ${item.speakers.join(', ')}`);
      }
      if (item.chairpersons?.length) {
        facultyParts.push(`Chairpersons: ${item.chairpersons.join(', ')}`);
      }
      if (item.moderator) {
        facultyParts.push(`Moderator: ${item.moderator}`);
      }
      if (item.panelists?.length) {
        facultyParts.push(`Panelists: ${item.panelists.join(', ')}`);
      }

      const facultyStr = facultyParts.join('\n');

      return [timeStr, details, facultyStr];
    });

    // AutoTable for items
    autoTable(doc, {
      startY: startY,
      head: [['Time', 'Programme Item / Topic', 'Faculty / Chairpersons']],
      body: tableRows,
      theme: 'grid',
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [240, 243, 246],
        textColor: [55, 65, 81],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 2,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        valign: 'top',
        textColor: [30, 41, 59],
        lineColor: [229, 231, 235],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 24, fontStyle: 'bold', textColor: [128, 0, 32] },
        1: { cellWidth: 90 },
        2: { cellWidth: 'auto', textColor: [71, 85, 105] },
      },
      didDrawPage: () => {
        // Draw recurring header if autoTable spawned a new page
        if (doc.getCurrentPageInfo().pageNumber > 1) {
          drawHeader(false);
        }
      },
    });

    // @ts-ignore
    startY = doc.lastAutoTable.finalY + 8;
  }

  // Running Footers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(245, 245, 245);
    doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'ISOT 2026 Conference App • Official V23 Brochure Programme • www.isot2026.com',
      margin,
      pageHeight - 4
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 4, {
      align: 'right',
    });
  }

  // Save the generated PDF
  const filename =
    options.scope === 'day'
      ? `ISOT-2026-Programme-${options.selectedDate}.pdf`
      : options.scope === 'saved'
      ? 'ISOT-2026-My-Schedule.pdf'
      : 'ISOT-2026-Official-Scientific-Programme.pdf';

  doc.save(filename);
};
