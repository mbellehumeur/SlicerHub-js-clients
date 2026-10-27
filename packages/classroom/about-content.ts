/** Classroom About modal copy (EN/FR). Independent of Worklist help:introHtml. */

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

const en: ClassroomAbout = {
  title: 'About Classroom',
  bodyHtml: `
        <p>
          This application uses the
          <a href="${IDC_URL}" target="_blank" rel="noopener">Imaging Data Commons</a>
          (IDC) together with
          <a href="${HUB_URL}" target="_blank" rel="noopener">WebSub integration</a>
          and open-source viewers to provide a collaborative conferencing
          environment for education. Lessons are organized as
          <strong>courses</strong> that educators can extend by adding folders
          under the courses folder.
        </p>
        <p>
          The IDC is part of the NCI Cancer Research Data Commons. It hosts large,
          publicly available collections of cancer imaging data in the cloud so
          researchers, clinicians, and educators can explore real clinical-grade
          studies without setting up their own archive.
        </p>
        <p>
          IDC invests in education and open tooling so students and teachers can
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
        </ul>
        <p>
          For free, open anatomy education, see the
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
          L’
          <a href="${IDC_URL}" target="_blank" rel="noopener">Imaging Data Commons</a>
          (IDC) fait partie du Cancer Research Data Commons du NCI. Il héberge dans
          le cloud de vastes collections d’imagerie oncologique en accès libre, afin
          que chercheurs, cliniciens et enseignants puissent explorer de vraies
          études de qualité clinique sans déployer leur propre archive.
        </p>
        <p>
          L’IDC s’investit dans l’éducation et les outils ouverts pour que
          étudiants et enseignants puissent apprendre l’imagerie médicale avec des
          données authentiques, des flux reproductibles et des visionneuses libres
          — pas seulement des pipelines de recherche.
        </p>
        <p>
          Cette application <strong>Classroom</strong> est un client pédagogique
          hébergé par le Hub. Elle s’appuie sur l’IDC (et d’autres archives
          ouvertes) avec des affichages d’images en direct pour glossaires,
          examens d’exemple et conférences collaboratives. Les leçons sont
          organisées en <strong>cours</strong> que les enseignants peuvent
          étendre dans le paquet Classroom.
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

/** Resolve About copy for the active app locale (FR when French; else English). */
export function classroomAboutFor(locale?: string): ClassroomAbout {
  const code = String(locale || '')
    .toLowerCase()
    .startsWith('fr')
    ? 'fr'
    : 'en';
  return code === 'fr' ? fr : en;
}
