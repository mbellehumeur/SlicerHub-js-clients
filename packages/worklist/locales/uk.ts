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
    worklist: 'Робочий список',
    exploreIdc: 'Огляд NCI Imaging Data Commons:',
    viewers: 'Переглядачі:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Курс:',
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
  },
  conference: CONFERENCE_BY_LOCALE.uk,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Про цю програму',
    aboutLinkLabel: 'Про програму',
    aboutLinkSuffix: '— ліцензії, подяки та торговельні марки.',
    quickStartTitle: 'Швидкий старт:',
    quickStartBody:
      'Натисніть одну з кнопок {{open}} праворуч, щоб переглянути дослідження в 3D і MPR.',
    introHtml: `
        <p>
          Початкова мета цієї програми — бути актором «worklist client» у системі з відкритим кодом
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>.
          Система призначена підтримувати просування, навчання, розробку та демонстрацію сумісності в застосунках медичної візуалізації.
        </p>
        <p>Застосунок є компонентом (<strong>WORKLIST_CLIENT actor</strong>) системи, яка включає:</p>
        <ul class="wl-help-steps">
          <li>WebSub-хаб (<strong>HUB actor</strong>) для зв’язку між програмами та користувачами</li>
          <li>переглядачі медичної візуалізації з відкритим кодом (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>моделі висновку з відкритим кодом (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>приклад звітування DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> та DICOM БД <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> як архіви лише для читання (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>постачальника автентифікації / ідентичності з інтеграцією до OIDC-ендпоінтів хаба або вбудованою анонімною/mock автентифікацією хаба</li>
        </ul>
        <p>
          Програма також містить функції навчання анатомії та патології, незалежні від робочого процесу IHE:
        </p>
        <ul class="wl-help-steps">
          <li>створення, збереження та завантаження навчальних файлів і когорт</li>
          <li>конференція для спільного перегляду та викладання</li>
          <li>тимчасовий пензель для короткочасних анотацій під час конференції</li>
          <li>експорт STL для 3D-друку</li>
        </ul>
    `,
    howto0Title: 'Як підключити SlicerWorklist до 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist з переглядачами (обрано SlicerDesktop), віддаленим ШІ та списком досліджень" width="870" height="498" />
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
        <li>Відкрийте worklist і натисніть <strong>Конференція</strong> справа вгори.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Заголовок SlicerLive з виділеною конференцією" width="477" height="117" />
        </li>
        <li>Як ведучий натисніть <strong>Конференція</strong> (заголовок worklist або панель SlicerLive). Виберіть назву та створіть — ви станете місцем <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Створити конференцію: поле назви та кнопка Створити конференцію" width="167" height="192" />
        </li>
        <li>Під час ведення зміни в SlicerLive (розкладка, вікно/рівень, видимість сегментів, камера, MPR, тимчасовий маркер тощо) розсилаються тим, хто стежить.</li>
        <li>Під час ведення використовуйте клавішу <strong>B</strong>, щоб увімкнути/вимкнути тимчасовий маркер.</li>
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
