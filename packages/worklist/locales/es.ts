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
    worklist: 'Lista de trabajo',
    exploreIdc: 'Explorar el NCI Imaging Data Commons:',
    viewers: 'Visores:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Curso:',
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
  },
  conference: CONFERENCE_BY_LOCALE.es,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Acerca de esta aplicación',
    aboutLinkLabel: 'Acerca de',
    aboutLinkSuffix: '— licencias, agradecimientos y marcas.',
    quickStartTitle: 'Inicio rápido:',
    quickStartBody:
      'Haz clic en uno de los botones {{open}} a la derecha para ver un estudio en 3D y MPR.',
    introHtml: `
        <p>
          El propósito original de esta aplicación es ser un actor «worklist client» en un sistema de código abierto
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>.
          El sistema pretende apoyar la promoción, formación, desarrollo y demostración de la interoperabilidad en aplicaciones de imagen médica.
        </p>
        <p>La aplicación es por tanto un componente (<strong>WORKLIST_CLIENT actor</strong>) de un sistema que incluye:</p>
        <ul class="wl-help-steps">
          <li>un hub WebSub (<strong>HUB actor</strong>) para la comunicación entre aplicaciones y usuarios</li>
          <li>visores de imagen médica de código abierto (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>modelos de inferencia de código abierto (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>un ejemplo de reporting DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>el <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> y la BD DICOM de <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> como archivos de solo lectura (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>un proveedor de autenticación / identidad con integración a los endpoints OIDC del hub o autenticación anónima/mock integrada en el hub</li>
        </ul>
        <p>
          La aplicación también incluye funciones de enseñanza de anatomía y patología independientes del flujo IHE:
        </p>
        <ul class="wl-help-steps">
          <li>crear, guardar y subir ficheros docentes y cohortes</li>
          <li>conferencia para visualización y enseñanza colaborativa</li>
          <li>un pincel efímero para anotaciones temporales en conferencia</li>
          <li>exportación STL para impresión 3D</li>
        </ul>
    `,
    howto0Title: 'Cómo conectar SlicerWorklist a 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist con visores, IA remota y lista de estudios" width="870" height="498" />
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
        <li>Mientras lideras, los cambios en SlicerLive se propagan a quienes siguen.</li>
        <li>Mientras lideras, usa la tecla <strong>B</strong> para activar/desactivar la tinta efímera.</li>
        <li>Puede probar la conferencia en un solo escritorio con el botón <strong>Open another user</strong>. Vea el siguiente vídeo de demostración: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Cómo buscar en IDC y añadir a una lista personal.',
    howto4Title: 'Cómo cargar un estudio local en un visor.',
    howto5Title: 'Cómo usar la IA remota',
    howto6Title: 'Cómo exportar un segmento a STL para impresión 3D.',
    howto7Title: 'Cómo usar Reporting / DICOM SR.',
  },
};
