import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const es: LocaleBundle = {
  chrome: {
    conferencing: 'Conferencia',
    open: 'Abrir',
    close: 'Cerrar',
    searchPortal: 'Portal de búsqueda',
    searchPortalTitle: 'Abrir el portal de búsqueda IDC',
    worklist: 'Lista de trabajo:',
    exploreIdc: 'Explorar el NCI Imaging Data Commons:',
    viewers: 'Visores:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Curso:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Contexto actual:',
    none: 'ninguno',
    colStudy: 'Estudio',
    colModalities: 'Modalidades',
    colFormat: 'Formato',
    colSize: 'Tamaño',
    language: 'Idioma',
    openStudy: 'Abrir estudio',
    closeStudy: 'Cerrar el estudio abierto',
    closeContext: 'Cerrar el contexto actual',
    cannotOpen: 'No se puede abrir',
    saveWorklist: 'Guardar',
    loadWorklist: 'Cargar',
    saveWorklistTitle: 'Guardar mi lista de trabajo como JSON',
    loadWorklistTitle: 'Cargar mi lista de trabajo desde JSON',
  },
  conference: CONFERENCE_BY_LOCALE.es,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Acerca de esta aplicación',
    aboutLinkLabel: 'Acerca de',
    aboutLinkSuffix: '— licencias, agradecimientos y marcas.',
    quickStartTitle: 'Inicio rápido:',
    quickStartBody:
      'Haz clic en uno de los botones {{open}} a la derecha para abrir un CR y usar el icono de varita mágica {{magicWand}} para ejecutar FleXray.',
    introHtml: `
        <p>
          This application uses the
          <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a>
          (IDC) together with
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">WebSub integration</a>
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
            <a href="https://ohif.org/" target="_blank" rel="noopener">OHIF</a>
            — a web-based medical image viewer built on open standards (including
            DICOMweb). It is widely used in research and education, and is designed
            so modes and extensions can grow with teaching and clinical workflows.
          </li>
          <li>
            <a href="https://github.com/ImagingDataCommons/slim" target="_blank" rel="noopener">Slim</a>
            — an interoperable slide microscopy viewer from the Imaging Data
            Commons (National Cancer Institute), for teaching and research with
            whole-slide imaging.
          </li>
          <li>
            <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a>
            — a desktop platform for visualization, analysis, and research.
            <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>
            runs as a Slicer extension so Classroom, conferencing, and image
            display can share one open messaging stack with the same data and tools.
          </li>
        </ul>
        <p>
          For free, open anatomy education, see the
          <a href="https://www.openanatomy.org/" target="_blank" rel="noopener">Open Anatomy Project</a>
          at Brigham and Women’s Hospital. It distributes high-quality anatomy
          atlases and open-source software worldwide—democratizing medical
          knowledge for students, clinicians, researchers, and the public,
          wherever they live and in many languages. Atlases are viewed in the
          web-based Open Anatomy Browser; the group also created
          <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a>,
          which was used to build the atlases.
        </p>
        <p>
          The University of Twente
          <a href="https://bonehub.github.io/Educational-Atlas/" target="_blank" rel="noopener">BoneHub Educational Atlas</a>
          offers interactive full-skeleton 3D models of the Visible Human Male
          and Female for teaching, visualization, and 3D printing. Free STL
          meshes and IGES/STEP CAD files (CC BY 4.0) are available from the
          <a href="https://huggingface.co/datasets/BoneHub/visible-human-3d-models" target="_blank" rel="noopener">visible-human-3d-models</a>
          dataset on Hugging Face.
        </p>
    `,
    howto0Title: 'Cómo conectar Worklist a 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Instala la extensión Slicer Hub Interface</li>
        <li>En <strong>3D Slicer</strong>, abre el módulo <strong>Hub Interface</strong> y la sección <strong>Image Display Client</strong>.</li>
        <li>Elige el hub <strong>SLICER-HUB-CLOUD</strong> (el mismo hub en la nube que esta lista). Usa <strong>SLICER-HUB</strong> solo si ejecutas un hub local en el puerto 2018.</li>
        <li>Sin OIDC, pon <strong>User</strong> igual que el usuario de tu lista en la nube (arriba a la izquierda) y pulsa <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Al conectar, el botón <strong>SlicerDesktop</strong> se activa, el selector pasa a «3D Slicer» y la lista muestra la base DICOM de Slicer. Abre un estudio — se carga en Slicer de escritorio.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist con visores, IA remota y lista de estudios" width="870" height="498" />
        </li>
        <li>Para conferencia / vista en vivo en el navegador, usa <strong>SlicerLive</strong> y <strong>Conferencia</strong> cuando otros sigan tus cambios de nodos y cámara/presentación.</li>
      </ol>
    `,
    howto1Title: 'Cómo unirse a una conferencia.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Abre la worklist y pulsa <strong>Conferencia</strong> arriba a la derecha.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Cabecera SlicerLive con Conferencia resaltada" width="477" height="117" />
        </li>
        <li>Si hay una conferencia en curso en tu instancia del hub, aparecerá en un desplegable.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Unirse a una conferencia: desplegable de conferencias activas y botón Unirse" width="322" height="175" />
        </li>
        <li>Si la conferencia aún no ha empezado, espera la invitación para unirte:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Invitación a la conferencia" width="190" height="141" />
        </li>
        <li>Si elegiste seguir, sigues el estudio y la presentación del anfitrión. Sal en cualquier momento con <strong>Salir de la conferencia</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Cabecera con Salir de la conferencia, tu lugar y un participante que sigue" width="397" height="80" />
        </li>
        <li>Si dejas de seguir, puedes reanudar el seguimiento o tomar el control de la conferencia.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Cabecera con Reanudar seguimiento y Tomar el control tras dejar de seguir" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Cómo crear una conferencia.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Abre la worklist y pulsa <strong>Conferencia</strong> arriba a la derecha.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Cabecera SlicerLive con Conferencia resaltada" width="477" height="117" />
        </li>
        <li>Como anfitrión, pulsa <strong>Conferencia</strong> (cabecera o barra de SlicerLive). Elige un título y créala — te conviertes en el lugar <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Crear conferencia: campo de título y botón Crear conferencia" width="167" height="192" />
        </li>
        <li>Mientras lideras, los cambios en SlicerLive (diseño, ventana/nivel, visibilidad de segmentos, cámara, desplazamiento/pan/zoom MPR, tinta efímera y actualizaciones de escena similares) se propagan a quienes siguen.</li>
        <li>Puedes <strong>Finalizar la conferencia</strong> para todos. Mientras lideras, usa la tecla <strong>B</strong> para activar/desactivar la tinta efímera.</li>
        <li>Puedes probar la conferencia en un solo escritorio con el botón <strong>Open another user</strong>. Vea el siguiente vídeo de demostración: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Cómo buscar en IDC y añadir a una lista personal.',
    howto4Title: 'Cómo cargar un estudio local en un visor.',
    howto5Title: 'Cómo usar la IA remota',
    howto6Title: 'Cómo exportar un segmento a STL para impresión 3D.',
    howto7Title: 'Cómo usar Reporting / DICOM SR.',
  },
};
