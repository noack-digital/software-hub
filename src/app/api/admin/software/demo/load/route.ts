import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const demoData = [
  {
    name: 'Adobe Premiere Pro',
    url: 'https://www.adobe.com/de/products/premiere.html',
    shortDescription: 'Premiere Pro ist die führende Software für professionelle Videoproduktion für Film, TV und Web.',
    longDescription: 'Premiere Pro ist die führende Software für professionelle Videoproduktion für Film, TV und Web. Kreativwerkzeuge, die Integration mit anderen Applikationen und Diensten von Adobe und die Power von Adobe Sensei bieten Ihnen einen lückenlosen Workflow zur Erstellung filmischer Meisterwerke.',
    category: 'E-Learning & Medien',
    platform: ['Desktop'],
    license: 'paid',
    isActive: true,
  },
  {
    name: 'Audacity',
    url: 'https://www.audacityteam.org/',
    shortDescription: 'Mit Audacity können Sie Stimmen, Töne oder Musik über ein Mikrofon aufzeichnen.',
    longDescription: 'Mit Audacity können Sie Stimmen, Töne oder Musik über ein Mikrofon aufzeichnen oder bereits vorhandene Tonspuren bearbeiten.',
    category: 'E-Learning & Medien',
    platform: ['Desktop'],
    license: 'free',
    isActive: false,
  },
  {
    name: 'BigBlueButton',
    url: 'https://bigbluebutton.org/',
    shortDescription: 'BigBlueButton ist eine Open-Source-Webkonferenzlösung für das Online-Lernen.',
    longDescription: 'BigBlueButton ist eine Open-Source-Webkonferenzlösung für das Online-Lernen, die die gemeinsame Nutzung von Audio, Video, Folien, Whiteboard, Chat und Bildschirm in Echtzeit ermöglicht.',
    category: 'Webkonferenzen',
    platform: ['Web'],
    license: 'free',
    isActive: true,
  },
  {
    name: 'CampusWorks',
    url: 'https://campus.hnee.de/SitePages/Hochschulportal-(integration).aspx',
    shortDescription: 'Gruppenarbeitsraum: Gemeinsames Arbeiten in einer privaten Umgebung',
    longDescription: 'Gruppenarbeitsraum: Gemeinsames Arbeiten in einer privaten Umgebung (Office: Word, Excel, Powerpoint, OneNote); Intranet',
    category: 'Office & Zusammenarbeit',
    platform: ['Web'],
    license: 'paid',
    isActive: true,
  },
  {
    name: 'Camtasia Studio',
    url: 'https://www.techsmith.de/camtasia.html',
    shortDescription: 'Videoeditor und Screen-Recorder.',
    longDescription: 'Camtasia Studio ist ein Videoeditor und Screen-Recorder. Bildschirmaufnahmen, Videoerstellung, Zuschauer aktiv einbeziehen.',
    category: 'E-Learning & Medien',
    platform: ['Desktop'],
    license: 'paid',
    isActive: true,
  },
  {
    name: 'DaVinci Resolve',
    url: 'https://www.blackmagicdesign.com/de/products/davinciresolve',
    shortDescription: 'DaVinci Resolve vereint Schnitt, Colorgrading, visuelle Effekte, Motion Graphics und Audiopostproduktion.',
    longDescription: 'DaVinci Resolve vereint Schnitt, Colorgrading, visuelle Effekte, Motion Graphics und Audiopostproduktion in einer Anwendung und ist schnell erlernbar. Sie ist einfach genug für Einsteiger und bringt doch genügend Leistung für Profis.',
    category: 'E-Learning & Medien',
    platform: ['Desktop'],
    license: 'free',
    isActive: true,
  },
  {
    name: 'DFNconf',
    url: 'https://www.conf.dfn.de/',
    shortDescription: 'Der Dienst DFNconf wurde im Oktober 2018 als Regeldienst für alle deutschen Forschungseinrichtungen eingeführt.',
    longDescription: 'Der Dienst DFNconf wurde im Oktober 2018 als Regeldienst für alle deutschen Forschungseinrichtungen eingeführt. Er umfasst als gemeinsamer Nachfolger aller vorherigen audiovisuellen Dienste die beiden Plattformen Pexip und Adobe Connect.',
    category: 'Webkonferenzen',
    platform: ['Web'],
    license: 'free',
    isActive: true,
  },
  {
    name: 'IrfanView',
    url: 'https://www.irfanview.com',
    shortDescription: 'IrfanView ist ein schneller und leichter Bildbetrachter, der zahlreiche Formate unterstützt.',
    longDescription: 'IrfanView ist ein leistungsstarker, schneller und vielseitiger Bildbetrachter für Windows. Die Software unterstützt eine Vielzahl von Bildformaten, darunter JPEG, PNG, GIF und TIFF, sowie Audio- und Video-Dateien. Mit Funktionen wie Batch-Konvertierung, einfachem Bildbearbeitungstools und einem benutzerfreundlichen Interface ermöglicht IrfanView effizientes Arbeiten.',
    category: 'E-Learning & Medien',
    platform: ['Desktop'],
    license: 'free',
    isActive: false,
  },
  {
    name: 'Libre Office',
    url: 'https://de.libreoffice.org/',
    shortDescription: 'LibreOffice ist ein leistungsstarkes Office-Paket mit klarer Oberfläche und mächtigen Werkzeugen.',
    longDescription: 'LibreOffice ist ein leistungsstarkes Office-Paket. Die klare Oberfläche und mächtigen Werkzeuge lassen Sie Ihre Kreativität entfalten und Ihre Produktivität steigern. LibreOffice vereint verschiedene Anwendungen.',
    category: 'Office & Zusammenarbeit',
    platform: ['Desktop'],
    license: 'free',
    isActive: true,
  },
  {
    name: 'LimeSurvey',
    url: 'https://www.limesurvey.org/de/',
    shortDescription: 'LimeSurvey - das meistgenutzte Open Source Umfragetool im Netz.',
    longDescription: 'LimeSurvey ist das meistgenutzte Open Source Umfragetool im Netz. International verfügbar in über 80 Sprachen. Unbegrenzt: Exportiere & importiere Umfragen, Beschriftungssets und Antwortdaten in zahlreichen Formaten.',
    category: 'Umfragen',
    platform: ['Web'],
    license: 'free',
    isActive: true,
  },
  {
    name: 'Mentimeter',
    url: 'https://www.mentimeter.com/',
    shortDescription: 'Kollaboratons-, Meeting- und Teaching-Platform mit einfacher und intuitiver Bedienung.',
    longDescription: 'Kollaboratons-, Meeting- und Teaching-Platform mit einfacher und intuitiver Bedienung für Dozierende und Studierende. Als freie Lizenz eingeschränkt nutzbar (begrenzte Fragenzahl / Session bei kostenfreier Version).',
    category: 'Live-Feedback',
    platform: ['Web'],
    license: 'free',
    isActive: false,
  },
  {
    name: 'Miro',
    url: 'https://miro.com/',
    shortDescription: 'Auf dem virtuellen Whiteboard Miro arbeiten Sie ortsunabhängig, interaktiv und synchron mit Ihren Studierenden zusammen.',
    longDescription: 'Miro ist ein endloses digitales Whiteboard, auf dem Sie ortsunabhängig und interaktiv mit Ihren Studierenden zusammenarbeiten können. Beliebig viele Teilnehmende können dabei an der gleichen Aufgabe arbeiten, ihre Ideen sammeln und visualisieren.',
    category: 'Office & Zusammenarbeit',
    platform: ['Web'],
    license: 'free',
    isActive: false,
  },
  {
    name: 'Moodle',
    url: 'https://moodle.org',
    shortDescription: 'Moodle ist eine Open-Source-Lernplattform, die Bildungseinrichtungen ermöglicht, Online-Kurse zu erstellen und zu verwalten.',
    longDescription: 'Moodle ist eine Open-Source-Lernplattform, die speziell für die Erstellung von Online-Kursen und Lernumgebungen entwickelt wurde. Sie bietet eine benutzerfreundliche Oberfläche, die es Lehrenden ermöglicht, Inhalte einfach zu organisieren und zu verwalten.',
    category: 'Lerntools',
    platform: ['Web'],
    license: 'free',
    isActive: true,
  },
  {
    name: 'Nextcloud',
    url: 'https://nextcloud.hnee.de',
    shortDescription: 'Als Alternative zu den umstrittenen Clouddiensten im Internet, die Inhalte größtenteils auf ausländischen Servern speichern.',
    longDescription: 'Als Alternative zu den umstrittenen Clouddiensten im Internet, die Inhalte größtenteils auf ausländischen Servern speichern (z.B. Dropbox) bieten wir Ihnen einen eigenen Speicherbereich für Ihre Daten an, den Sie ortsunabhängig nutzen können.',
    category: 'Office & Zusammenarbeit, Projektmanagement',
    platform: ['Web'],
    license: 'free',
    isActive: true,
  },
  {
    name: 'Office 365',
    url: 'https://www.office.com',
    shortDescription: 'Office 365 bietet allen Studierenden und Mitarbeitenden kostenfreien Zugang zu Microsoft Office-Anwendungen.',
    longDescription: 'Die Hochschule bietet allen Studierenden und Mitarbeitenden die Möglichkeit, Office 365 (2019) kostenfrei zu beziehen. Microsoft Office 365 und MS Teams können auf PC/Mac, Tablet und Smartphone (je 5 Stück) installiert werden.',
    category: 'Office & Zusammenarbeit, Projektmanagement, Webkonferenzen',
    platform: ['Web'],
    license: 'paid',
    isActive: true,
  },
  {
    name: 'Particify',
    url: 'https://particify.de/',
    shortDescription: 'Mit Particify aktivieren Sie Ihre Studierenden, testen das Wissen und erhalten ehrliches Feedback zu Ihren Vorlesungen.',
    longDescription: 'Mit Particify aktivieren Sie Ihre Studierenden, testen das Wissen und erhalten ehrliches Feedback zu Ihren Vorlesungen. Aktivieren Sie Ihre Studierenden mit Brainstormings, Umfragen oder Quiz.',
    category: 'Live-Feedback',
    platform: ['Web'],
    license: 'free',
    isActive: false,
  },
  {
    name: 'Taskcard',
    url: 'https://www.taskcards.de/#/home/start',
    shortDescription: 'Online-Metaplan-System. Taskcard ist eine digitale Pinnwand, die sehr einfach gestaltbar und vielfältig einsetzbar ist.',
    longDescription: 'Taskcard ist eine digitale Pinnwand, die sehr einfach gestaltbar und vielfältig einsetzbar ist. Stellen Sie Informationen aus unterschiedlichen Quellen zusammen, bündeln Sie Medien verschiedenster Art an einem Ort oder nutzen Sie Taskcard als Memoboard.',
    category: 'Office & Zusammenarbeit',
    platform: ['Web'],
    license: 'free',
    isActive: false,
  },
  {
    name: 'Zammad',
    url: 'https://zammad.com',
    shortDescription: 'Zammad ist eine Open-Source-Helpdesk-Software, die eine benutzerfreundliche Oberfläche für Ticketverwaltung, Kundenkommunikation und Reporting bietet.',
    longDescription: 'Zammad ist eine leistungsstarke Open-Source-Helpdesk-Software, die Unternehmen bei der Verwaltung von Kundenanfragen unterstützt. Mit einer benutzerfreundlichen Oberfläche ermöglicht sie das einfache Verfolgen von Tickets, die Zuweisung an Mitarbeiter und die Verwaltung von Kundendaten.',
    category: 'Office & Zusammenarbeit',
    platform: ['Web'],
    license: 'free',
    isActive: true,
  },
];

export async function POST() {
  try {
    // Lösche alle vorhandenen Software-Einträge
    await prisma.software.deleteMany();

    // Füge die Demo-Daten ein
    const createdSoftware = await prisma.software.createMany({
      data: demoData.map(item => ({
        name: item.name,
        url: item.url,
        shortDescription: item.shortDescription,
        longDescription: item.longDescription,
        category: item.category,
        platform: item.platform,
        license: item.license,
        isActive: item.isActive,
      })),
    });

    return NextResponse.json({ 
      message: 'Demo-Daten wurden erfolgreich geladen',
      count: createdSoftware.count 
    });
  } catch (error) {
    console.error('Error loading demo data:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Demo-Daten: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler') },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
