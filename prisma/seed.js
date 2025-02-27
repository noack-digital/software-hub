const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Kategorien definieren
const categoriesData = [
  {
    name: "E-Learning & Medien",
    description: "Software für E-Learning, Medienproduktion und -bearbeitung"
  },
  {
    name: "Webkonferenzen",
    description: "Tools für Online-Meetings und Webkonferenzen"
  },
  {
    name: "Office & Zusammenarbeit",
    description: "Office-Anwendungen und Kollaborationstools"
  },
  {
    name: "Programmierung & Entwicklung",
    description: "Entwicklungsumgebungen und Programmiertools"
  },
  {
    name: "Datenanalyse & Statistik",
    description: "Software für Datenanalyse und statistische Auswertungen"
  }
];

const softwareData = [
  {
    name: "Adobe Premiere Pro",
    url: "https://www.adobe.com/de/products/premiere.html",
    shortDescription: "Premiere Pro ist die führende Software für professionelle Videoproduktion für Film, TV und Web.",
    description: "Premiere Pro ist die führende Software für professionelle Videoproduktion für Film, TV und Web. Kreativwerkzeuge, die Integration mit anderen Applikationen und Diensten von Adobe und die Power von Adobe Sensei bieten Ihnen einen lückenlosen Workflow zur Erstellung filmischer Meisterwerke.",
    categoryNames: ["E-Learning & Medien"],
    types: ["Desktop"],
    costs: "Kostenpflichtig",
    available: true
  },
  {
    name: "Audacity",
    url: "https://www.audacityteam.org/",
    shortDescription: "Mit Audacity können Sie Stimmen, Töne oder Musik über ein Mikrofon aufzeichnen.",
    description: "Mit Audacity können Sie Stimmen, Töne oder Musik über ein Mikrofon aufzeichnen oder bereits vorhandene Tonspuren bearbeiten.",
    categoryNames: ["E-Learning & Medien"],
    types: ["Desktop"],
    costs: "Kostenlos",
    available: false
  },
  {
    name: "BigBlueButton",
    url: "https://bigbluebutton.org/",
    shortDescription: "BigBlueButton ist eine Open-Source-Webkonferenzlösung für das Online-Lernen.",
    description: "BigBlueButton ist eine Open-Source-Webkonferenzlösung für das Online-Lernen, die die gemeinsame Nutzung von Audio, Video, Folien, Whiteboard, Chat und Bildschirm in Echtzeit ermöglicht.",
    categoryNames: ["Webkonferenzen"],
    types: ["Web"],
    costs: "Kostenlos",
    available: true
  },
  {
    name: "CampusWorks",
    url: "https://campus.hnee.de/SitePages/Hochschulportal-(integration).aspx",
    shortDescription: "Gruppenarbeitsraum: Gemeinsames Arbeiten in einer privaten Umgebung",
    description: "Gruppenarbeitsraum: Gemeinsames Arbeiten in einer privaten Umgebung (Office: Word, Excel, Powerpoint, OneNote); Intranet",
    categoryNames: ["Office & Zusammenarbeit"],
    types: ["Web"],
    costs: "Kostenpflichtig",
    available: true
  },
  {
    name: "Camtasia Studio",
    url: "https://www.techsmith.de/camtasia.html",
    shortDescription: "Videoeditor und Screen-Recorder.",
    description: "Camtasia Studio ist ein Videoeditor und Screen-Recorder. Bildschirmaufnahmen, Videoerstellung, Zuschauer aktiv einbeziehen.",
    categoryNames: ["E-Learning & Medien"],
    types: ["Desktop"],
    costs: "Kostenpflichtig",
    available: true
  },
  {
    name: "DaVinci Resolve",
    url: "https://www.blackmagicdesign.com/de/products/davinciresolve",
    shortDescription: "DaVinci Resolve vereint Schnitt, Colorgrading, visuelle Effekte, Motion Graphics und Audiopostproduktion.",
    description: "DaVinci Resolve vereint Schnitt, Colorgrading, visuelle Effekte, Motion Graphics und Audiopostproduktion in einer Anwendung und ist schnell erlernbar. Sie ist einfach genug für Einsteiger und bringt doch genügend Leistung für Profis.",
    categoryNames: ["E-Learning & Medien"],
    types: ["Desktop"],
    costs: "Kostenlos",
    available: true
  },
  {
    name: "DFNconf",
    url: "https://www.conf.dfn.de/",
    shortDescription: "Der Dienst DFNconf wurde im Oktober 2018 als Regeldienst für alle deutschen Forschungseinrichtungen eingeführt.",
    description: "Der Dienst DFNconf wurde im Oktober 2018 als Regeldienst für alle deutschen Forschungseinrichtungen eingeführt. Er umfasst als gemeinsamer Nachfolger aller vorherigen audiovisuellen Dienste die beiden Plattformen Pexip und Adobe Connect.",
    categoryNames: ["Webkonferenzen"],
    types: ["Web"],
    costs: "Kostenlos",
    available: true
  },
  {
    name: "IrfanView",
    url: "https://www.irfanview.com",
    shortDescription: "IrfanView ist ein schneller und leichter Bildbetrachter, der zahlreiche Formate unterstützt. Er bietet grundlegende Bearbeitungsfunktionen und eine benutzerfreundliche Oberfläche.",
    description: "IrfanView ist ein leistungsstarker, schneller und vielseitiger Bildbetrachter für Windows. Die Software unterstützt eine Vielzahl von Bildformaten, darunter JPEG, PNG, GIF und TIFF, sowie Audio- und Video-Dateien. Mit Funktionen wie Batch-Konvertierung, einfachem Bildbearbeitungstools und einem benutzerfreundlichen Interface ermöglicht IrfanView effizientes Arbeiten. Nutzer können Bilder direkt drucken, Diashows erstellen und Screenshots anfertigen. Zusätzlich bietet die Software eine umfangreiche Plugin-Unterstützung für erweiterte Funktionen. Dank ihrer geringen Systemanforderungen läuft IrfanView auch auf älteren Rechnern problemlos. Die Software ist kostenlos für private Nutzung, was sie zu einer idealen Wahl für Heim- und Berufsanwender macht.",
    categoryNames: ["E-Learning & Medien"],
    types: ["Desktop"],
    costs: "Kostenlos",
    available: false
  },
  {
    name: "Libre Office",
    url: "https://de.libreoffice.org/",
    shortDescription: "LibreOffice ist eine freie Bürosoftware mit Textverarbeitung, Tabellenkalkulation, Präsentation, Zeichenprogramm, Datenbank und Formeleditor.",
    description: "LibreOffice ist eine freie Bürosoftware mit Textverarbeitung, Tabellenkalkulation, Präsentation, Zeichenprogramm, Datenbank und Formeleditor. Es ist kompatibel mit anderen Office-Paketen, wie Microsoft Office, und unterstützt zahlreiche Dateiformate.",
    categoryNames: ["Office & Zusammenarbeit"],
    types: ["Desktop"],
    costs: "Kostenlos",
    available: true
  },
  {
    name: "Moodle",
    url: "https://moodle.org/",
    shortDescription: "Moodle ist eine Lernplattform, die weltweit von Hunderten von Millionen Nutzern für Online-Lernen verwendet wird.",
    description: "Moodle ist eine Lernplattform, die weltweit von Hunderten von Millionen Nutzern für Online-Lernen verwendet wird. Moodle ist ein Open-Source-Lernmanagementsystem, das Pädagogen, Administratoren und Lernenden ein robustes, sicheres und integriertes System zur Schaffung personalisierter Lernumgebungen bietet.",
    categoryNames: ["E-Learning & Medien"],
    types: ["Web"],
    costs: "Kostenlos",
    available: true
  },
  {
    name: "Particify",
    url: "https://particify.de/",
    shortDescription: "Mit Particify aktivieren Sie Ihre Studierenden, testen das Wissen und erhalten ehrliches Feedback zu Ihren Vorlesungen.",
    description: "Mit Particify aktivieren Sie Ihre Studierenden, testen das Wissen und erhalten ehrliches Feedback zu Ihren Vorlesungen. Aktivieren Sie Ihre Studierenden mit Brainstormings, Umfragen oder Quiz.",
    categoryNames: ["E-Learning & Medien"],
    types: ["Web"],
    costs: "Kostenlos",
    available: true
  },
  {
    name: "Visual Studio Code",
    url: "https://code.visualstudio.com/",
    shortDescription: "Visual Studio Code ist ein leichtgewichtiger, aber leistungsstarker Quellcode-Editor, der auf Ihrem Desktop läuft und für Windows, macOS und Linux verfügbar ist.",
    description: "Visual Studio Code ist ein leichtgewichtiger, aber leistungsstarker Quellcode-Editor, der auf Ihrem Desktop läuft und für Windows, macOS und Linux verfügbar ist. Es verfügt über eine integrierte Unterstützung für JavaScript, TypeScript und Node.js und bietet ein umfangreiches Ökosystem von Erweiterungen für andere Sprachen (wie C++, C#, Java, Python, PHP, Go) und Laufzeiten (wie .NET und Unity).",
    categoryNames: ["Programmierung & Entwicklung"],
    types: ["Desktop"],
    costs: "Kostenlos",
    available: true
  },
  {
    name: "Zammad",
    url: "https://zammad.org/",
    shortDescription: "Zammad ist eine webbasierte Helpdesk-/Customer-Support-Plattform mit vielen Funktionen zur Verwaltung von Kundenanfragen über verschiedene Kanäle wie E-Mail oder soziale Netzwerke.",
    description: "Zammad ist eine leistungsstarke Open-Source-Helpdesk-Software, die Unternehmen bei der Verwaltung von Kundenanfragen unterstützt. Mit einer benutzerfreundlichen Oberfläche ermöglicht sie das einfache Verfolgen von Tickets, die Zuweisung an Mitarbeiter und die Verwaltung von Kundendaten. Zammad integriert sich nahtlos in gängige Kommunikationskanäle wie E-Mail, Telefon und soziale Medien, was eine zentrale Verwaltung aller Anfragen ermöglicht. Die Software bietet umfangreiche Reporting- und Analysefunktionen, um die Leistung des Support-Teams zu optimieren. Zudem sind Anpassungen und Erweiterungen durch ein offenes API-Design möglich. Zammad unterstützt mehrere Sprachen und ermöglicht so den Einsatz in internationalen Teams. Durch die cloudbasierte oder lokale Installation ist die Software flexibel einsetzbar.",
    categoryNames: ["Office & Zusammenarbeit"],
    types: ["Web"],
    costs: "Kostenlos",
    available: true
  }
];

async function main() {
  try {
    console.log('Starte Seed-Prozess...');

    // Admin-Benutzer erstellen
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@software-hub.local',
        name: 'Administrator',
        password: adminPassword,
        role: 'ADMIN',
      },
    });

    console.log('Admin-Benutzer erstellt');

    // Kategorien erstellen
    const categoryMap = {};
    for (const category of categoriesData) {
      const createdCategory = await prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
        },
      });
      categoryMap[category.name] = createdCategory.id;
      console.log(`Kategorie erstellt: ${category.name}`);
    }

    // Software-Einträge erstellen
    for (const software of softwareData) {
      const { categoryNames, ...softwareData } = software;
      
      // Software erstellen
      const createdSoftware = await prisma.software.create({
        data: {
          ...softwareData,
          userId: admin.id,
          // Kategorien verknüpfen
          categories: {
            create: categoryNames.map(categoryName => ({
              category: {
                connect: {
                  id: categoryMap[categoryName]
                }
              }
            }))
          }
        },
      });
      console.log(`Software erstellt: ${software.name}`);
    }

    console.log('Seed erfolgreich abgeschlossen');
  } catch (error) {
    console.error('Fehler beim Seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
