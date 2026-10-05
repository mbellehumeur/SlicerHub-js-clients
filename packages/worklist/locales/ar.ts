import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const ar: LocaleBundle = {
  chrome: {
    conferencing: 'المؤتمرات',
    open: 'فتح',
    close: 'إغلاق',
    searchPortal: 'بوابة البحث',
    searchPortalTitle: 'فتح بوابة بحث IDC',
    worklist: 'قائمة العمل',
    exploreIdc: 'استكشف NCI Imaging Data Commons:',
    viewers: 'العارضات:',
    reportingClients: 'منشئو التقارير:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'المقرر:',
    currentContext: 'السياق الحالي:',
    none: 'لا شيء',
    colStudy: 'دراسة',
    colModalities: 'الطرائق',
    colFormat: 'التنسيق',
    colSize: 'الحجم',
    language: 'اللغة',
    openStudy: 'فتح الدراسة',
    closeStudy: 'إغلاق الدراسة المفتوحة',
    closeContext: 'إغلاق السياق الحالي',
    cannotOpen: 'تعذّر الفتح',
  },
  conference: CONFERENCE_BY_LOCALE.ar,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'حول هذا التطبيق',
    aboutLinkLabel: 'حول',
    aboutLinkSuffix: '— التراخيص والإقرارات والعلامات التجارية.',
    quickStartTitle: 'بداية سريعة:',
    quickStartBody:
      'انقر أحد أزرار {{open}} على اليمين لعرض دراسة بتقنية 3D وMPR.',
    introHtml: `
        <p>
          الغرض الأصلي من هذا التطبيق أن يكون ممثلاً «عميل قائمة العمل» في نظام مفتوح المصدر لـ
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>.
          يهدف النظام إلى دعم الترويج والتدريب والتطوير وإظهار قابلية التشغيل البيني في تطبيقات التصوير الطبي.
        </p>
        <p>لذلك يعد التطبيق مكوّناً (<strong>WORKLIST_CLIENT actor</strong>) من نظام يشمل:</p>
        <ul class="wl-help-steps">
          <li>مركزاً WebSub (<strong>HUB actor</strong>) للتواصل بين التطبيقات والمستخدمين</li>
          <li>عارضات تصوير طبي مفتوحة المصدر (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>نماذج استدلال مفتوحة المصدر (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>مثالاً لتقارير DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> وقاعدة DICOM في <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> كأرشيفات للقراءة فقط (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>موفّر مصادقة / هوية مع تكامل نقاط OIDC للمركز أو مصادقة مجهولة/وهمية مدمجة في المركز</li>
        </ul>
        <p>
          يتضمن التطبيق أيضاً ميزات لتعليم التشريح والأمراض مستقلة عن سير عمل IHE:
        </p>
        <ul class="wl-help-steps">
          <li>إنشاء ملفات و مجموعات تعليمية وحفظها ورفعها</li>
          <li>مؤتمرات للعرض والتعليم التعاوني</li>
          <li>أداة فرشاة مؤقتة للتعليقات أثناء المؤتمر</li>
          <li>تصدير إلى STL للطباعة ثلاثية الأبعاد</li>
        </ul>
    `,
    howto0Title: 'كيفية ربط SlicerWorklist بـ 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>ثبّت امتداد Slicer Hub Interface</li>
        <li>في <strong>3D Slicer</strong>، افتح وحدة <strong>Hub Interface</strong> ثم قسم <strong>Image Display Client</strong>.</li>
        <li>اختر المركز <strong>SLICER-HUB-CLOUD</strong> (نفس مركز السحابة لهذه قائمة العمل). استخدم <strong>SLICER-HUB</strong> فقط عند تشغيل مركز محلي على المنفذ 2018.</li>
        <li>بدون OIDC، عيّن <strong>User</strong> إلى نفس مستخدم قائمة العمل السحابية (أعلى اليسار)، ثم انقر <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: مركز SLICER-HUB-CLOUD، موضوع معيّن، Connect، حالة Connected" width="585" height="127" />
        </li>
        <li>عند الاتصال، يضيء زر العارض <strong>SlicerDesktop</strong>، ويتغيّر محدد القائمة إلى «3D Slicer» وتعرض القائمة محتوى قاعدة DICOM في Slicer. افتح دراسة من القائمة — تُحمَّل في Slicer لسطح المكتب.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist مع العارضات (SlicerDesktop محدّد) والذكاء الاصطناعي عن بُعد وقائمة الدراسات" width="870" height="498" />
        </li>
        <li>للمؤتمرات / العرض المباشر في المتصفح، استخدم <strong>SlicerLive</strong> و<strong>المؤتمرات</strong> عندما يتابع الآخرون تغييرات العقدة والكاميرا/العرض.</li>
      </ol>
    `,
    howto1Title: 'كيفية الانضمام إلى مؤتمر.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>افتح قائمة العمل وانقر <strong>المؤتمرات</strong> أعلى اليمين.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="شريط SlicerLive مع تمييز المؤتمرات" width="477" height="117" />
        </li>
        <li>إذا كان مؤتمر جارياً على مثيل المركز لديك، يظهر في قائمة منسدلة.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="الانضمام إلى مؤتمر: قائمة المؤتمرات النشطة وزر الانضمام" width="322" height="175" />
        </li>
        <li>إذا لم يبدأ المؤتمر بعد، انتظر الدعوة للانضمام:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="دعوة مؤتمر: انضم واتبع، انضم دون متابعة، أو عدم الانضمام" width="190" height="141" />
        </li>
        <li>إذا اخترت المتابعة، تتابع دراسة المضيف وعرضه. غادر في أي وقت عبر <strong>مغادرة المؤتمر</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="الشريط مع مغادرة المؤتمر ومكانك ومشارك يتابع" width="397" height="80" />
        </li>
        <li>إذا أوقفت المتابعة، يمكنك بعدها استئناف المتابعة أو تولي قيادة المؤتمر.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="الشريط مع استئناف المتابعة وتولي القيادة بعد إيقاف المتابعة" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'كيفية إنشاء مؤتمر.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>افتح قائمة العمل وانقر <strong>المؤتمرات</strong> أعلى اليمين.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="شريط SlicerLive مع تمييز المؤتمرات" width="477" height="117" />
        </li>
        <li>كمضيف، انقر <strong>المؤتمرات</strong> (شريط قائمة العمل أو شريط SlicerLive). اختر عنواناً وأنشئ — تصبح المكان <strong>القائد</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="إنشاء مؤتمر: حقل العنوان وزر إنشاء مؤتمر" width="167" height="192" />
        </li>
        <li>أثناء القيادة، تُبث تغييراتك في SlicerLive (التخطيط، النافذة/المستوى، الأجزاء، الكاميرا، MPR، الحبر المؤقت، إلخ) إلى المتابعين.</li>
        <li>أثناء القيادة، استخدم المفتاح <strong>B</strong> لتبديل الحبر المؤقت.</li>
        <li>يمكنك اختبار المؤتمر على جهاز واحد عبر زر <strong>Open another user</strong>. شاهد فيديو العرض: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'كيفية البحث في IDC والإضافة إلى قائمة شخصية.',
    howto4Title: 'كيفية تحميل دراسة محلية إلى عارض.',
    howto5Title: 'كيفية استخدام الذكاء الاصطناعي عن بُعد',
    howto6Title: 'كيفية تصدير مقطع إلى ملف STL للطباعة ثلاثية الأبعاد.',
    howto7Title: 'كيفية استخدام التقارير / DICOM SR.',
  },
};
