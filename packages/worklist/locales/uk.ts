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
          Початкова мета цієї програми — бути актором «worklist client» у системі з відкритим кодом
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>
          та
          <a href="https://wiki.ihe.net/index.php/AI_Results" target="_blank" rel="noopener">IHE AI Results</a>,
          що міститься в розширенні 3D Slicer під назвою
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>.
          Slicer Hub забезпечує інфраструктуру обміну повідомленнями та має на меті сприяти, навчати, розвивати й
          демонструвати сумісність у застосунках медичної візуалізації.
        </p>
        <p>Тому програма є компонентом (<strong>WORKLIST_CLIENT actor</strong>) системи, що включає:</p>
        <ul class="wl-help-steps">
          <li>WebSub-хаб (<strong>HUB actor</strong>) для зв’язку між застосунками та користувачами</li>
          <li>переглядачі медичної візуалізації з відкритим кодом (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>моделі висновку медичної візуалізації з відкритим кодом (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>приклад звітування DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> і DICOM БД <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> як архіви лише для читання (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>постачальника автентифікації / ідентичності з інтеграцією до OIDC кінцевих точок хаба або вбудованою анонімною/mock автентифікацією</li>
        </ul>
        <p>
          Розширення також включає освітні функції, незалежні від робочого процесу IHE
          Integrated Reporting:
        </p>
        <ul class="wl-help-steps">
          <li>створення, збереження та завантаження навчальних файлів і когорт для підготовки занять</li>
          <li>конференцію для спільного перегляду та навчання</li>
          <li>інструмент зникаючого пензля для тимчасових анотацій під час конференції</li>
          <li>експорт STL для 3D-друку</li>
        </ul>
        <p>
          Також надаються дослідницькі та 3D Slicer функції, незалежні від IHE:
        </p>
        <ul class="wl-help-steps">
          <li>передавання файлів між застосунками</li>
          <li>сцени медичної реальності та комунікація</li>
          <li>клієнт Slicer Qt Image Display</li>
          <li>доступ до DICOM БД Slicer</li>
        </ul>
        <p>
          Передавання файлів дозволяє серверам висновку надсилати результати безпосередньо переглядачам
          без попереднього збереження в PACS. Також підтримуються дослідницькі формати на кшталт NIfTI, NRRD і Zarr.
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
