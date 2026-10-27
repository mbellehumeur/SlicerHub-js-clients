import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const uk: LocaleBundle = {
  chrome: {
    conferencing: 'Конференція',
    open: 'Відкрити',
    close: 'Закрити',
    searchPortal: 'Портал пошуку',
    searchPortalTitle: 'Відкрити портал пошуку IDC',
    worklist: 'Робочий список:',
    exploreIdc: 'Огляд NCI Imaging Data Commons:',
    viewers: 'Переглядачі:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Курс:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Поточний контекст:',
    none: 'немає',
    colStudy: 'Дослідження',
    colModalities: 'Модальності',
    colFormat: 'Формат',
    colSize: 'Розмір',
    language: 'Мова',
    openStudy: 'Відкрити дослідження',
    closeStudy: 'Закрити відкрите дослідження',
    closeContext: 'Закрити поточний контекст',
    cannotOpen: 'Неможливо відкрити',
    saveWorklist: 'Зберегти',
    loadWorklist: 'Завантажити',
    saveWorklistTitle: 'Зберегти мій робочий список як JSON',
    loadWorklistTitle: 'Завантажити мій робочий список з JSON',
  },
  conference: CONFERENCE_BY_LOCALE.uk,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Про цю програму',
    aboutLinkLabel: 'Про програму',
    aboutLinkSuffix: '— ліцензії, подяки та торговельні марки.',
    quickStartTitle: 'Швидкий старт:',
    quickStartBody:
      'Натисніть одну з кнопок {{open}} праворуч, щоб відкрити CR і використати значок чарівної палички {{magicWand}} для запуску FleXray.',
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
    howto0Title: 'Як підключити Worklist до 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Установіть розширення Slicer Hub Interface</li>
        <li>У <strong>3D Slicer</strong> відкрийте модуль <strong>Hub Interface</strong>, потім розділ <strong>Image Display Client</strong>.</li>
        <li>Виберіть хаб <strong>SLICER-HUB-CLOUD</strong> (той самий хмарний хаб, що й у цієї worklist). Використовуйте <strong>SLICER-HUB</strong> лише якщо запускаєте локальний хаб на порту 2018.</li>
        <li>Без OIDC установіть <strong>User</strong> на того самого користувача, що й у хмарній worklist (зліва вгорі), потім натисніть <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Після підключення кнопка переглядача <strong>SlicerDesktop</strong> активується, селектор змінюється на «3D Slicer», а список показує вміст DICOM-бази Slicer. Відкрийте дослідження — воно завантажиться в настільний Slicer.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist з переглядачами (обрано SlicerDesktop), віддаленим ШІ та списком досліджень" width="870" height="498" />
        </li>
        <li>Для конференції / живого перегляду в браузері використовуйте <strong>SlicerLive</strong> і <strong>Конференцію</strong>, коли інші стежать за змінами вузлів і камери/презентації.</li>
      </ol>
    `,
    howto1Title: 'Як приєднатися до конференції.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Відкрийте worklist і натисніть <strong>Конференція</strong> справа вгори.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Заголовок SlicerLive з виділеною конференцією" width="477" height="117" />
        </li>
        <li>Якщо на вашому екземплярі hub уже триває конференція, вона з’явиться у випадаючому списку.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Приєднатися до конференції: список активних конференцій і кнопка Приєднатися" width="322" height="175" />
        </li>
        <li>Якщо конференція ще не почалася, зачекайте на запрошення приєднатися:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Запрошення: Приєднатися й стежити, Приєднатися без стеження або Не приєднуватися" width="190" height="141" />
        </li>
        <li>Якщо ви обрали стеження, ви відстежуєте дослідження та презентацію ведучого. Вийдіть будь-коли через <strong>Залишити конференцію</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Заголовок із Залишити конференцію, вашим місцем і учасником, що стежить" width="397" height="80" />
        </li>
        <li>Якщо ви зупините стеження, потім можете відновити стеження або перейняти конференцію.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Заголовок із Відновити стеження та Перейняти після зупинки стеження" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Як створити конференцію.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Відкрийте worklist і натисніть <strong>Конференція</strong> праворуч угорі.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Заголовок SlicerLive з виділеною Конференцією" width="477" height="117" />
        </li>
        <li>Як організатор натисніть <strong>Конференція</strong> (заголовок worklist або панель SlicerLive). Оберіть назву й створіть — ви стаєте місцем <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Створити конференцію: поле назви та кнопка Створити конференцію" width="167" height="192" />
        </li>
        <li>Під час ведення зміни в SlicerLive (макет, вікно/рівень, видимість сегментів, камера, прокручування/pan/zoom MPR, зникаюче чорнило та подібні оновлення сцени) розсилаються підписникам.</li>
        <li>Ви можете <strong>Завершити конференцію</strong> для всіх. Під час ведення використовуйте клавішу <strong>B</strong>, щоб увімкнути/вимкнути зникаюче чорнило.</li>
        <li>Ви можете перевірити конференцію на одному комп’ютері кнопкою <strong>Open another user</strong>. Дивіться демонстраційне відео: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Як шукати в IDC і додавати до особистого списку.',
    howto4Title: 'Як завантажити локальне дослідження у переглядач.',
    howto5Title: 'Як користуватися віддаленим ШІ',
    howto6Title: 'Як експортувати сегмент у STL для 3D-друку.',
    howto7Title: 'Як користуватися Reporting / DICOM SR.',
  },
};
