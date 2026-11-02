/** Classroom About modal copy (EN/FR/DE). Independent of Worklist help:introHtml. */

import { resolveCourseLocale } from './course/types';

export type ClassroomAbout = {
  title: string;
  bodyHtml: string;
};

const IDC_URL = 'https://imaging.datacommons.cancer.gov/';
const OHIF_URL = 'https://ohif.org/';
const SLIM_URL = 'https://github.com/ImagingDataCommons/slim';
const SLICER_URL = 'https://www.slicer.org/';
const HUB_URL = 'https://github.com/mbellehumeur/SlicerHub';
const OPEN_ANATOMY_URL = 'https://www.openanatomy.org/';
const EDUCATIONAL_ATLAS_URL = 'https://bonehub.github.io/Educational-Atlas/';
const BONEHUB_DATASET_URL =
  'https://huggingface.co/datasets/BoneHub/visible-human-3d-models';
const MVIEW_FU_URL = 'https://it.vetmed.fu-berlin.de/#teaching';
const MVIEW_FACHSOFTWARE_URL =
  'https://www.vetmed.fu-berlin.de/service/fachbereichsverwaltung/it/Fachsoftware/index.html';

const en: ClassroomAbout = {
  title: 'About Classroom',
  bodyHtml: `
        <p>
          This application uses the
          <a href="${IDC_URL}" target="_blank" rel="noopener">Imaging Data Commons</a>
          (IDC) together with
          <a href="${HUB_URL}" target="_blank" rel="noopener">WebSub integration</a>
          and open-source viewers to provide a collaborative conferencing
          environment for education. Educators can extend activities by adding folders
          under the courses folder.
        </p>
        <p>
          The IDC is part of the NCI Cancer Research Data Commons. It hosts large,
          publicly available collections of cancer imaging data in the cloud so
          researchers, clinicians, and educators can explore real clinical-grade
          studies without setting up their own archive. IDC invests in education and open tooling so students and teachers can
          learn medical imaging with authentic data, reproducible workflows, and
          freely available viewers—not only research pipelines.
        </p>
        <p>
          Viewing is powered by open-source platforms that share IDC’s commitment
          to accessible medical imaging:
        </p>
        <ul class="wl-help-steps">
          <li>
            <a href="${OHIF_URL}" target="_blank" rel="noopener">OHIF</a>
            — a web-based medical image viewer built on open standards (including
            DICOMweb). It is widely used in research and education, and is designed
            so modes and extensions can grow with teaching and clinical workflows.
          </li>
          <li>
            <a href="${SLIM_URL}" target="_blank" rel="noopener">Slim</a>
            — an interoperable slide microscopy viewer from the Imaging Data
            Commons (National Cancer Institute), for teaching and research with
            whole-slide imaging.
          </li>
          <li>
            <a href="${SLICER_URL}" target="_blank" rel="noopener">3D Slicer</a>
            — a desktop platform for visualization, analysis, and research.
            <a href="${HUB_URL}" target="_blank" rel="noopener">Slicer Hub</a>
            runs as a Slicer extension so Classroom, conferencing, and image
            display can share one open messaging stack with the same data and tools.
          </li>
          <li>
            <a href="${MVIEW_FU_URL}" target="_blank" rel="noopener">MView Teaching</a>
            (Freie Universität Berlin, Fachbereich Veterinärmedizin · IT) —
            embeddable teaching demos with 3D volumes, anatomical labels, and
            quiz mode on CT and radiograph examples. Public demos and imaging
            services are described on
            <a href="${MVIEW_FU_URL}" target="_blank" rel="noopener">IT Vetmed FU-Berlin</a>;
            see also
            <a href="${MVIEW_FACHSOFTWARE_URL}" target="_blank" rel="noopener">Fachsoftware · MView</a>.
          </li>
        </ul>
        <p>
          For open anatomy education, see the
          <a href="${OPEN_ANATOMY_URL}" target="_blank" rel="noopener">Open Anatomy Project</a>
          at Brigham and Women’s Hospital. It distributes high-quality anatomy
          atlases and open-source software worldwide—democratizing medical
          knowledge for students, clinicians, researchers, and the public,
          wherever they live and in many languages. Atlases are viewed in the
          web-based Open Anatomy Browser; the group also created
          <a href="${SLICER_URL}" target="_blank" rel="noopener">3D Slicer</a>,
          which was used to build the atlases.
        </p>
        <p>
          The University of Twente
          <a href="${EDUCATIONAL_ATLAS_URL}" target="_blank" rel="noopener">BoneHub Educational Atlas</a>
          offers interactive full-skeleton 3D models of the Visible Human Male
          and Female for teaching, visualization, and 3D printing. Free STL
          meshes and IGES/STEP CAD files (CC BY 4.0) are available from the
          <a href="${BONEHUB_DATASET_URL}" target="_blank" rel="noopener">visible-human-3d-models</a>
          dataset on Hugging Face.
        </p>
      `,
};

const fr: ClassroomAbout = {
  title: 'À propos de Classroom',
  bodyHtml: `
        <p>
          Cette application s’appuie sur l’
          <a href="${IDC_URL}" target="_blank" rel="noopener">Imaging Data Commons</a>
          (IDC), l’
          <a href="${HUB_URL}" target="_blank" rel="noopener">intégration WebSub</a>
          et des visionneuses open source pour offrir un environnement de
          conférence collaborative dédié à l’enseignement. Les enseignants peuvent
          étendre les activités en ajoutant des dossiers sous le dossier des cours.
        </p>
        <p>
          L’IDC fait partie du Cancer Research Data Commons du NCI. Il héberge dans
          le cloud de vastes collections d’imagerie oncologique en accès libre, afin
          que chercheurs, cliniciens et enseignants puissent explorer de vraies
          études de qualité clinique sans déployer leur propre archive. L’IDC
          s’investit dans l’éducation et les outils ouverts pour que étudiants et
          enseignants puissent apprendre l’imagerie médicale avec des données
          authentiques, des flux reproductibles et des visionneuses libres — pas
          seulement des pipelines de recherche.
        </p>
        <p>
          L’affichage s’appuie sur des plateformes open source qui partagent
          l’engagement de l’IDC pour une imagerie médicale accessible&nbsp;:
        </p>
        <ul class="wl-help-steps">
          <li>
            <a href="${OHIF_URL}" target="_blank" rel="noopener">OHIF</a>
            — visionneuse web d’images médicales fondée sur des normes ouvertes
            (dont DICOMweb). Très utilisée en recherche et en enseignement, elle
            est conçue pour que modes et extensions évoluent avec les flux
            pédagogiques et cliniques.
          </li>
          <li>
            <a href="${SLIM_URL}" target="_blank" rel="noopener">Slim</a>
            — visionneuse interopérable de microscopie sur lames issue de
            l’Imaging Data Commons (National Cancer Institute), pour
            l’enseignement et la recherche en imagerie sur lames entières.
          </li>
          <li>
            <a href="${SLICER_URL}" target="_blank" rel="noopener">3D Slicer</a>
            — plateforme de bureau pour la visualisation, l’analyse et la
            recherche.
            <a href="${HUB_URL}" target="_blank" rel="noopener">Slicer Hub</a>
            s’exécute comme extension Slicer afin que Classroom, la conférence et
            l’affichage d’images partagent une même pile de messagerie ouverte,
            avec les mêmes données et outils.
          </li>
          <li>
            <a href="${MVIEW_FU_URL}" target="_blank" rel="noopener">MView Teaching</a>
            (Freie Universität Berlin, Fachbereich Veterinärmedizin · IT) —
            démos pédagogiques intégrables avec volumes 3D, annotations anatomiques et
            mode quiz sur des exemples CT et radiographiques. Les démos publiques
            et services d’imagerie sont décrits sur
            <a href="${MVIEW_FU_URL}" target="_blank" rel="noopener">IT Vetmed FU-Berlin</a>&nbsp;;
            voir aussi
            <a href="${MVIEW_FACHSOFTWARE_URL}" target="_blank" rel="noopener">Fachsoftware · MView</a>.
          </li>
        </ul>
        <p>
          Pour une anatomie libre et ouverte, consultez le
          <a href="${OPEN_ANATOMY_URL}" target="_blank" rel="noopener">Open Anatomy Project</a>
          du Brigham and Women’s Hospital. Il diffuse des atlas anatomiques de
          haute qualité et des logiciels open source dans le monde entier, afin
          de démocratiser le savoir médical pour étudiants, cliniciens,
          chercheurs et grand public, où qu’ils vivent et dans de nombreuses
          langues. Les atlas s’explorent dans le navigateur Open Anatomy
          Browser&nbsp;; le groupe a aussi créé
          <a href="${SLICER_URL}" target="_blank" rel="noopener">3D Slicer</a>,
          utilisé pour produire ces atlas.
        </p>
        <p>
          L’
          <a href="${EDUCATIONAL_ATLAS_URL}" target="_blank" rel="noopener">atlas pédagogique BoneHub</a>
          de l’Université de Twente propose des modèles 3D interactifs du
          squelette complet de l’homme et de la femme Visible Human pour
          l’enseignement, la visualisation et l’impression 3D. Des maillages
          STL et des fichiers CAO IGES/STEP libres (CC BY 4.0) sont disponibles
          dans le jeu de données
          <a href="${BONEHUB_DATASET_URL}" target="_blank" rel="noopener">visible-human-3d-models</a>
          sur Hugging Face.
        </p>
      `,
};

const de: ClassroomAbout = {
  title: 'Über Classroom',
  bodyHtml: `
        <p>
          Diese Anwendung nutzt die
          <a href="${IDC_URL}" target="_blank" rel="noopener">Imaging Data Commons</a>
          (IDC) zusammen mit der
          <a href="${HUB_URL}" target="_blank" rel="noopener">WebSub-Integration</a>
          und Open-Source-Viewern, um eine kollaborative Konferenzumgebung für die
          Lehre bereitzustellen. Lehrende können Aktivitäten erweitern, indem sie
          Ordner unter dem Kursordner hinzufügen.
        </p>
        <p>
          Die IDC ist Teil der NCI Cancer Research Data Commons. Sie hostet große,
          öffentlich verfügbare Sammlungen von Krebsbilddaten in der Cloud, sodass
          Forschende, Kliniker und Lehrende echte klinische Studien erkunden können,
          ohne ein eigenes Archiv aufzubauen. Die IDC investiert in Bildung und offene
          Werkzeuge, damit Studierende und Lehrende medizinische Bildgebung mit
          authentischen Daten, reproduzierbaren Workflows und frei verfügbaren
          Viewern lernen können — nicht nur Forschungspipelines.
        </p>
        <p>
          Die Darstellung basiert auf Open-Source-Plattformen, die das Engagement
          der IDC für zugängliche medizinische Bildgebung teilen:
        </p>
        <ul class="wl-help-steps">
          <li>
            <a href="${OHIF_URL}" target="_blank" rel="noopener">OHIF</a>
            — ein webbasierter medizinischer Bildviewer auf offenen Standards
            (einschließlich DICOMweb). Weit verbreitet in Forschung und Lehre und
            so gestaltet, dass Modi und Erweiterungen mit pädagogischen und
            klinischen Workflows wachsen können.
          </li>
          <li>
            <a href="${SLIM_URL}" target="_blank" rel="noopener">Slim</a>
            — ein interoperabler Viewer für Schnittmikroskopie aus den Imaging Data
            Commons (National Cancer Institute) für Lehre und Forschung mit
            Whole-Slide-Imaging.
          </li>
          <li>
            <a href="${SLICER_URL}" target="_blank" rel="noopener">3D Slicer</a>
            — eine Desktop-Plattform für Visualisierung, Analyse und Forschung.
            <a href="${HUB_URL}" target="_blank" rel="noopener">Slicer Hub</a>
            läuft als Slicer-Erweiterung, sodass Classroom, Konferenz und
            Bildanzeige denselben offenen Messaging-Stack mit denselben Daten und
            Werkzeugen nutzen.
          </li>
          <li>
            <a href="${MVIEW_FU_URL}" target="_blank" rel="noopener">MView Teaching</a>
            (Freie Universität Berlin, Fachbereich Veterinärmedizin · IT) —
            einbettbare Lehrdemos mit 3D-Volumina, anatomischen Beschriftungen und
            Quizmodus an CT- und Röntgenbeispielen. Öffentliche Demos und
            Bildgebungsdienste sind beschrieben unter
            <a href="${MVIEW_FU_URL}" target="_blank" rel="noopener">IT Vetmed FU-Berlin</a>;
            siehe auch
            <a href="${MVIEW_FACHSOFTWARE_URL}" target="_blank" rel="noopener">Fachsoftware · MView</a>.
          </li>
        </ul>
        <p>
          Für offene Anatomielehre siehe das
          <a href="${OPEN_ANATOMY_URL}" target="_blank" rel="noopener">Open Anatomy Project</a>
          am Brigham and Women’s Hospital. Es vertreibt weltweit hochwertige
          Anatomieatlanten und Open-Source-Software — und demokratisiert medizinisches
          Wissen für Studierende, Kliniker, Forschende und die Öffentlichkeit,
          überall und in vielen Sprachen. Atlanten werden im webbasierten Open Anatomy
          Browser betrachtet; die Gruppe hat auch
          <a href="${SLICER_URL}" target="_blank" rel="noopener">3D Slicer</a>
          geschaffen, mit dem die Atlanten erstellt wurden.
        </p>
        <p>
          Der
          <a href="${EDUCATIONAL_ATLAS_URL}" target="_blank" rel="noopener">BoneHub Educational Atlas</a>
          der Universität Twente bietet interaktive 3D-Gesamtskelettmodelle des
          Visible Human Male und Female für Lehre, Visualisierung und 3D-Druck.
          Freie STL-Meshes und IGES/STEP-CAD-Dateien (CC BY 4.0) sind im Datensatz
          <a href="${BONEHUB_DATASET_URL}" target="_blank" rel="noopener">visible-human-3d-models</a>
          auf Hugging Face verfügbar.
        </p>
      `,
};

/** Resolve About copy for the active app locale (FR / DE when matched; else English). */
export function classroomAboutFor(locale?: string): ClassroomAbout {
  const code = resolveCourseLocale(locale);
  if (code === 'fr') return fr;
  if (code === 'de') return de;
  return en;
}
