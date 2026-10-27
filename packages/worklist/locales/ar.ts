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
    worklist: 'قائمة العمل:',
    exploreIdc: 'استكشف NCI Imaging Data Commons:',
    viewers: 'العارضات:',
    reportingClients: 'منشئو التقارير:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'المقرر:',
    anatomicalPlanes: 'Classroom',
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
    saveWorklist: 'حفظ',
    loadWorklist: 'تحميل',
    saveWorklistTitle: 'حفظ قائمة عملي كـ JSON',
    loadWorklistTitle: 'تحميل قائمة عملي من JSON',
  },
  conference: CONFERENCE_BY_LOCALE.ar,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'حول هذا التطبيق',
    aboutLinkLabel: 'حول',
    aboutLinkSuffix: '— التراخيص والإقرارات والعلامات التجارية.',
    quickStartTitle: 'بداية سريعة:',
    quickStartBody:
      'انقر أحد أزرار {{open}} على اليمين لفتح CR واستخدام أيقونة العصا السحرية {{magicWand}} لتشغيل FleXray.',
    introHtml: `
        <p>
          الغرض الأصلي من هذا التطبيق أن يكون ممثلاً «worklist client» في نظام مفتوح المصدر لـ
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>
          و
          <a href="https://wiki.ihe.net/index.php/AI_Results" target="_blank" rel="noopener">IHE AI Results</a>
          موجود في امتداد 3D Slicer يُدعى
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>.
          يوفّر Slicer Hub بنية المراسلة ويهدف إلى تعزيز وتدريب وتطوير
          وإظهار قابلية التشغيل البيني في تطبيقات التصوير الطبي.
        </p>
        <p>لذلك يُعد التطبيق مكوّناً (<strong>WORKLIST_CLIENT actor</strong>) من نظام يشمل:</p>
        <ul class="wl-help-steps">
          <li>محور WebSub (<strong>HUB actor</strong>) للتواصل بين التطبيقات والمستخدمين</li>
          <li>عارضات تصوير طبي مفتوحة المصدر (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>نماذج استدلال للتصوير الطبي مفتوحة المصدر (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>مثالاً لتقارير DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> وقاعدة DICOM لـ <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> كأرشيفات للقراءة فقط (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>موفّر مصادقة / هوية مع تكامل لنقاط OIDC الخاصة بالمحور أو المصادقة المجهولة/الوهمية المدمجة</li>
        </ul>
        <p>
          تتضمن الإضافة أيضاً ميزات تعليمية مستقلة عن سير عمل IHE
          Integrated Reporting:
        </p>
        <ul class="wl-help-steps">
          <li>إنشاء ملفات تعليمية ومجموعات وحفظها ورفعها لتحضير الدروس</li>
          <li>مؤتمر للعرض والتدريس التعاوني</li>
          <li>أداة فرشاة متلاشية للتوضيحات المؤقتة أثناء المؤتمر</li>
          <li>تصدير STL للطباعة ثلاثية الأبعاد</li>
        </ul>
        <p>
          كما تُوفَّر وظائف بحث و3D Slicer مستقلة عن IHE:
        </p>
        <ul class="wl-help-steps">
          <li>نقل الملفات بين التطبيقات</li>
          <li>مشاهد وواقع طبي واتصالات</li>
          <li>عميل Slicer Qt Image Display</li>
          <li>الوصول إلى قاعدة DICOM في Slicer</li>
        </ul>
        <p>
          يتيح نقل الملفات لخوادم الاستدلال إرسال نتائجها مباشرة إلى العارضات
          دون تخزينها أولاً في PACS. ويدعم أيضاً تنسيقات بحث مثل NIfTI وNRRD وZarr.
        </p>
    `,
    howto0Title: 'كيفية ربط Worklist بـ 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist مع العارضات (SlicerDesktop محدّد) والذكاء الاصطناعي عن بُعد وقائمة الدراسات" width="870" height="498" />
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
        <li>افتح قائمة العمل وانقر <strong>المؤتمر</strong> في أعلى اليمين.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="رأس SlicerLive مع تمييز المؤتمر" width="477" height="117" />
        </li>
        <li>كمضيف، انقر <strong>المؤتمر</strong> (رأس قائمة العمل أو شريط SlicerLive). اختر عنواناً وأنشئه — تصبح المكان <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="إنشاء مؤتمر: حقل العنوان وزر إنشاء مؤتمر" width="167" height="192" />
        </li>
        <li>أثناء القيادة، تُبث تغييرات SlicerLive (التخطيط، النافذة/المستوى، رؤية الشرائح، الكاميرا، تمرير/تحريك/تكبير MPR، الحبر المتلاشي وتحديثات المشهد المشابهة) إلى المتابعين.</li>
        <li>يمكنك <strong>إنهاء المؤتمر</strong> للجميع. أثناء القيادة استخدم مفتاح <strong>B</strong> لتبديل الحبر المتلاشي.</li>
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
